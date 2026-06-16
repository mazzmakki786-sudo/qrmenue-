import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { generateOrderNumber } from "@/lib/utils"
import { z } from "zod"
import { loadTrialLimitsFromDB } from "@/lib/subscription-server"
import { DEFAULT_TRIAL_LIMITS, GRACE_PERIOD_DAYS } from "@/lib/subscription"
import { checkAndSendOrderLimitAlert } from "@/lib/email/orderLimitAlert"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"

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
})

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 5, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const supabase = await createClient()
  const body = await request.json()

  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, phone, is_active, is_suspended, plan, trial_end")
    .eq("id", parsed.data.restaurant_id)
    .single()

  if (!restaurant || !restaurant.is_active) {
    return NextResponse.json({ error: "Restaurant not found or inactive" }, { status: 404 })
  }

  if (restaurant.is_suspended) {
    return NextResponse.json({ error: "Restaurant is suspended. Cannot accept orders." }, { status: 403 })
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
  }

  if (restaurant.plan === "trial") {
    const trialLimits = await loadTrialLimitsFromDB()
    const maxOrders = trialLimits.maxOrders ?? DEFAULT_TRIAL_LIMITS.maxOrders

    const { count: orderCount } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", parsed.data.restaurant_id)
      .neq("order_status", "cancelled")

    if ((orderCount ?? 0) >= maxOrders) {
      return NextResponse.json({
        error: "ORDER_LIMIT_REACHED",
        message: `Trial plan allows ${maxOrders} orders. Upgrade to accept more.`,
      }, { status: 403 })
    }
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
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
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

  checkAndSendOrderLimitAlert(parsed.data.restaurant_id).catch(() => {})

  return NextResponse.json({
    order: data,
    whatsapp_url: whatsappUrl,
  })
}

function buildWhatsAppURL(order: {
  orderNumber: string
  items: any[]
  totalPrice: number
  paymentMethod: string
  customerName: string
  customerPhone?: string
  orderType: string
  tableNumber?: string
  deliveryAddress?: string
  restaurantPhone: string
}): string {
  const itemsList = order.items
    .map((i: any) => `• ${i.name_en} x${i.quantity} — Rs ${i.subtotal}`)
    .join("\n")

  const locationInfo =
    order.orderType === "dine_in"
      ? `Table: ${order.tableNumber}`
      : order.orderType === "delivery"
        ? `Address: ${order.deliveryAddress}`
        : "Takeaway"

  const message = [
    "New Order — QRMenu.pk",
    `Order #${order.orderNumber}`,
    "",
    "Items:",
    itemsList,
    "",
    `Total: Rs ${order.totalPrice}`,
    `Payment: ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}`,
    "",
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone || "Not provided"}`,
    locationInfo,
    `Type: ${order.orderType.replace("_", " ")}`,
  ].join("\n")

  const phone = order.restaurantPhone.replace(/[^0-9]/g, "")
  return `https://wa.me/92${phone.slice(1)}?text=${encodeURIComponent(message)}`
}
