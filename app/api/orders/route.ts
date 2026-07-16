import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { generateOrderNumber, formatPrice } from "@/lib/utils"
import { z } from "zod"
import { loadTrialLimitsFromDB } from "@/lib/subscription-server"
import { DEFAULT_TRIAL_LIMITS, GRACE_PERIOD_DAYS, type Plan } from "@/lib/subscription"
import { getEffectiveLimitsFromDB } from "@/lib/subscription-db"
import { checkAndSendOrderLimitAlert } from "@/lib/email/orderLimitAlert"
import { sendPushNotification } from "@/lib/push-server"
import { safeRoute } from "@/lib/api-error"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { csrfGuard } from "@/lib/csrf"
import { buildWhatsAppURL } from "@/lib/whatsapp"
import { isRestaurantOpen } from "@/lib/restaurant-hours"
import { logCustomerAction, getIpSimple } from "@/lib/owner-audit"

const orderItemSchema = z.object({
  id: z.string(),
  name_en: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().int().nonnegative(),
  subtotal: z.number().int().nonnegative(),
})

const createOrderSchema = z.object({
  restaurant_id: z.string().uuid(),
  customer_id: z.string().uuid().nullable().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  total_price: z.number().int().positive(),
  order_type: z.enum(["dine_in", "takeaway", "delivery"]),
  customer_name: z.string().min(1, "Customer name is required"),
  customer_phone: z.string().nullable().optional(),
  table_number: z.string().nullable().optional(),
  delivery_address: z.string().nullable().optional(),
  payment_method: z.enum(["cod", "bank_transfer", "jazzcash", "easypaisa"]).optional(),
  deal_id: z.string().uuid().nullable().optional(),
  discount_amount: z.number().int().nonnegative().optional(),
}).refine(
  (data) => {
    // Takeaway & Delivery: phone is required
    if (data.order_type === "takeaway" || data.order_type === "delivery") {
      return !!data.customer_phone
    }
    return true
  },
  { message: "Phone number is required for takeaway and delivery orders", path: ["customer_phone"] }
).refine(
  (data) => {
    // Dine In: table number is required
    if (data.order_type === "dine_in") {
      return !!data.table_number
    }
    return true
  },
  { message: "Table number is required for dine-in", path: ["table_number"] }
).refine(
  (data) => {
    // Delivery: address is required
    if (data.order_type === "delivery") {
      return !!data.delivery_address
    }
    return true
  },
  { message: "Delivery address is required", path: ["delivery_address"] }
)

export const POST = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const ip = getClientIp(request)
  // Dedicated rate limit bucket for orders (separate from other endpoints)
  const allowed = await rateLimit(`orders:${ip}`, 20, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment and try again." }, { status: 429 })
  }

  const supabase = await createClient()
  const body = await request.json()

  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, phone, is_active, is_suspended, is_open, plan, plan_end_date, trial_end, opening_time, closing_time, opening_hours")
    .eq("id", parsed.data.restaurant_id)
    .single()

  if (!restaurant || !restaurant.is_active) {
    return NextResponse.json({ error: "Restaurant not found or inactive" }, { status: 404 })
  }

  if (restaurant.is_suspended) {
    return NextResponse.json({ error: "Restaurant is suspended. Cannot accept orders." }, { status: 403 })
  }

  if (!restaurant.is_open) {
    return NextResponse.json({ error: "Restaurant is currently closed. Please try again later." }, { status: 403 })
  }

  if (!isRestaurantOpen(restaurant.opening_time, restaurant.closing_time, restaurant.opening_hours)) {
    return NextResponse.json({
      error: "RESTAURANT_CLOSED",
      message: "Restaurant is currently closed. Orders are accepted only during operating hours.",
    }, { status: 403 })
  }

  if (restaurant.plan === "trial" && restaurant.trial_end) {
    const trialEnd = new Date(restaurant.trial_end)
    const graceEnd = new Date(trialEnd.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000)
    if (new Date() > graceEnd) {
      return NextResponse.json({
        error: "TRIAL_EXPIRED",
        message: "This restaurant's trial has ended. Cannot accept orders.",
      }, { status: 403 })
    }
  } else if (restaurant.plan !== "trial" && restaurant.plan_end_date) {
    const planEnd = new Date(restaurant.plan_end_date)
    if (new Date() > planEnd) {
      return NextResponse.json({
        error: "PLAN_EXPIRED",
        message: "This restaurant's plan has expired. Please renew to accept orders.",
      }, { status: 403 })
    }
  }

  // Server-side price verification: fetch all dish prices from DB
  const dishIds = parsed.data.items.map(item => item.id)
  const { data: dishes, error: dishesError } = await supabase
    .from("dishes")
    .select("id, price")
    .in("id", dishIds)
    .eq("restaurant_id", parsed.data.restaurant_id)

  if (dishesError || !dishes || dishes.length !== dishIds.length) {
    return NextResponse.json({ error: "Invalid dish data in order" }, { status: 400 })
  }

  const dishPriceMap = new Map(dishes.map(d => [d.id, d.price]))

  // Verify each item's price matches the database and recalculate subtotals
  const recalculatedItems: Array<{
    id: string
    name_en: string
    quantity: number
    price: number
    subtotal: number
  }> = []
  for (const item of parsed.data.items) {
    const dbPrice = dishPriceMap.get(item.id)
    if (dbPrice === undefined) {
      return NextResponse.json(
        { error: `Dish with id ${item.id} not found in this restaurant` },
        { status: 400 }
      )
    }
    if (item.price !== dbPrice) {
      return NextResponse.json(
        { error: `Price mismatch for "${item.name_en}"` },
        { status: 400 }
      )
    }
    recalculatedItems.push({
      ...item,
      price: dbPrice,
      subtotal: dbPrice * item.quantity,
    })
  }

  const recalculatedSubtotal = recalculatedItems.reduce((sum, item) => sum + item.subtotal, 0)
  const recalculatedTotal = recalculatedSubtotal - (parsed.data.discount_amount || 0)
  if (recalculatedTotal <= 0) {
    return NextResponse.json({ error: "Invalid total price after discount" }, { status: 400 })
  }

  const { count: orderCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", parsed.data.restaurant_id)
    .neq("order_status", "cancelled")

  const orderLimit = restaurant.plan === "trial"
    ? (await loadTrialLimitsFromDB()).maxOrders ?? DEFAULT_TRIAL_LIMITS.maxOrders
    : (await getEffectiveLimitsFromDB(restaurant.plan as Plan, null)).maxOrders

  if ((orderCount ?? 0) >= orderLimit) {
    return NextResponse.json({
      error: "ORDER_LIMIT_REACHED",
      message: `Your plan allows ${orderLimit} orders. Upgrade to accept more.`,
    }, { status: 403 })
  }

  const orderNumber = generateOrderNumber()
  const adminSupabase = createAdminClient()

  // ── Table occupancy validation for dine-in ──
  if (parsed.data.order_type === "dine_in" && parsed.data.table_number) {
    const { data: table } = await adminSupabase
      .from("restaurant_tables")
      .select("id, is_active, is_occupied")
      .eq("restaurant_id", parsed.data.restaurant_id)
      .eq("table_number", parsed.data.table_number)
      .single()

    if (!table || !table.is_active) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 })
    }

    if (table.is_occupied) {
      return NextResponse.json({
        error: "TABLE_OCCUPIED",
        message: "This table is already occupied. Please choose a different table.",
      }, { status: 409 })
    }
  }

  let finalCustomerId = parsed.data.customer_id || null
  if (finalCustomerId) {
    await adminSupabase.from("customers").upsert({
      id: finalCustomerId,
      name: parsed.data.customer_name,
      phone: parsed.data.customer_phone || null,
    }, { onConflict: "id", ignoreDuplicates: false })
  }

  const { data, error } = await adminSupabase
    .from("orders")
    .insert({
      restaurant_id: parsed.data.restaurant_id,
      customer_id: parsed.data.customer_id || null,
      order_number: orderNumber,
      items: recalculatedItems,
      total_price: recalculatedTotal,
      order_type: parsed.data.order_type,
      customer_name: parsed.data.customer_name,
      customer_phone: parsed.data.customer_phone || null,
      table_number: parsed.data.table_number || null,
      delivery_address: parsed.data.delivery_address || null,
      payment_method: parsed.data.payment_method || "cod",
      order_status: "received",
      deal_id: parsed.data.deal_id || null,
      discount_amount: parsed.data.discount_amount || 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 400 })
  }

  // Mark the table as occupied after a successful dine-in order
  if (parsed.data.order_type === "dine_in" && parsed.data.table_number && data.table_number) {
    await adminSupabase
      .from("restaurant_tables")
      .update({ is_occupied: true })
      .eq("restaurant_id", parsed.data.restaurant_id)
      .eq("table_number", parsed.data.table_number)
      .then(({ error: occupyErr }) => {
        if (occupyErr) console.error("[orders] Failed to mark table occupied:", occupyErr.message)
      })
  }

  const whatsappUrl = buildWhatsAppURL({
    orderNumber: data.order_number,
    items: recalculatedItems,
    totalPrice: recalculatedTotal,
    paymentMethod: parsed.data.payment_method || "cod",
    customerName: parsed.data.customer_name,
    customerPhone: parsed.data.customer_phone ?? undefined,
    orderType: parsed.data.order_type,
    tableNumber: parsed.data.table_number ?? undefined,
    deliveryAddress: parsed.data.delivery_address ?? undefined,
    restaurantPhone: restaurant?.phone || "",
  })

  await adminSupabase.from("notification_logs").insert({
    restaurant_id: parsed.data.restaurant_id,
    order_id: data.id,
    type: "order_email",
    status: "sent",
  })

  checkAndSendOrderLimitAlert(parsed.data.restaurant_id).catch(console.error)

  // Send push notification to owner (fire-and-forget)
  sendPushNotification(parsed.data.restaurant_id, {
    title: `New Order #${orderNumber}`,
    body: `${parsed.data.customer_name} — ${formatPrice(recalculatedTotal)}`,
    url: `/dashboard/orders/${data.id}`,
    tag: `order-${data.id}`,
  }).catch((err: any) => console.error("[orders] Push send failed:", err))

  logCustomerAction(
    parsed.data.customer_id || null,
    "order_created",
    {
      order_id: data.id,
      restaurant_id: parsed.data.restaurant_id,
      total_price: recalculatedTotal,
      order_type: parsed.data.order_type,
    },
    getIpSimple(request)
  ).catch(console.error)

  return NextResponse.json({
    order: data,
    whatsapp_url: whatsappUrl,
  })
})
