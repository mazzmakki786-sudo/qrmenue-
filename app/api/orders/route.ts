import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { generateOrderNumber } from "@/lib/utils"
import { z } from "zod"
import { loadTrialLimitsFromDB } from "@/lib/subscription-server"
import { DEFAULT_TRIAL_LIMITS, GRACE_PERIOD_DAYS, type Plan } from "@/lib/subscription"
import { getEffectiveLimitsFromDB } from "@/lib/subscription-db"
import { checkAndSendOrderLimitAlert } from "@/lib/email/orderLimitAlert"
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
      items: parsed.data.items,
      total_price: parsed.data.total_price,
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

  const whatsappUrl = buildWhatsAppURL({
    orderNumber: data.order_number,
    items: parsed.data.items,
    totalPrice: parsed.data.total_price,
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

  logCustomerAction(
    parsed.data.customer_id || null,
    "order_created",
    {
      order_id: data.id,
      restaurant_id: parsed.data.restaurant_id,
      total_price: parsed.data.total_price,
      order_type: parsed.data.order_type,
    },
    getIpSimple(request)
  ).catch(console.error)

  return NextResponse.json({
    order: data,
    whatsapp_url: whatsappUrl,
  })
})
