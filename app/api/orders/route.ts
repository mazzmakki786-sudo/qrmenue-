import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { generateOrderNumber, formatPrice } from "@/lib/utils"
import { z } from "zod"
import { loadTrialLimitsFromDB } from "@/lib/subscription-server"
import { DEFAULT_TRIAL_LIMITS, GRACE_PERIOD_DAYS, type Plan } from "@/lib/subscription"
import { getEffectiveLimitsFromDB } from "@/lib/subscription-db"
import { checkAndSendOrderLimitAlert } from "@/lib/email/orderLimitAlert"
import { sendPushNotification } from "@/lib/push-server"
import { sendCustomerPushNotification, createCustomerNotification } from "@/lib/customer-notifications"
import { safeRoute } from "@/lib/api-error"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { csrfGuard } from "@/lib/csrf"
import { normalizePhone } from "@/lib/auth-validation"
import { buildWhatsAppURL } from "@/lib/whatsapp"
import { isRestaurantOpen } from "@/lib/restaurant-hours"
import { logCustomerAction, getIpSimple } from "@/lib/owner-audit"
import { restaurantCache, dishPriceCache } from "@/lib/cache"
import { getOrderCountFromDB, invalidateOrderCount } from "@/lib/subscription-usage"
import { createLogger } from "@/lib/logger"

const log = createLogger("orders")

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
  payment_method: z.enum(["cod", "bank_transfer", "easypaisa"]).optional(),
  deal_id: z.string().uuid().nullable().optional(),
  discount_amount: z.number().int().nonnegative().optional(),
  delivery_fee: z.number().int().nonnegative().optional(),
}).refine(
  (data) => {
    if (data.order_type === "takeaway" || data.order_type === "delivery") {
      return !!data.customer_phone
    }
    return true
  },
  { message: "Phone number is required for takeaway and delivery orders", path: ["customer_phone"] }
).refine(
  (data) => {
    if (data.order_type === "dine_in") {
      return !!data.table_number
    }
    return true
  },
  { message: "Table number is required for dine-in", path: ["table_number"] }
).refine(
  (data) => {
    if (data.order_type === "delivery") {
      return !!data.delivery_address
    }
    return true
  },
  { message: "Delivery address is required", path: ["delivery_address"] }
)

// ── Per-restaurant request queue ──
// Serializes order writes per restaurant_id to reduce DB contention.
// Each restaurant gets its own Promise chain: orders are processed one at a time
// in FIFO order. This prevents thundering-herd writes on the same restaurant's data.
const orderQueues = new Map<string, Promise<any>>()

function enqueueOrder<T>(restaurantId: string, fn: () => Promise<T>): Promise<T> {
  const prev = orderQueues.get(restaurantId) || Promise.resolve()
  const next = prev.then(fn, fn) // Run even if previous failed (don't block the queue)
  orderQueues.set(restaurantId, next)
  // Cleanup: remove resolved promise from map to prevent memory leak
  next.finally(() => {
    if (orderQueues.get(restaurantId) === next) {
      orderQueues.delete(restaurantId)
    }
  })
  return next
}

export const POST = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const ip = getClientIp(request)
  const allowed = await rateLimit(`orders:${ip}`, 20, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment and try again." }, { status: 429 })
  }

  const body = await request.json()

  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const supabase = await createClient()
  const restaurantId = parsed.data.restaurant_id

  // ── Step 1: Restaurant lookup (cached) ──
  const cacheKey = `restaurant:${restaurantId}`
  let restaurant: Record<string, any> | undefined = restaurantCache.get(cacheKey) as any

  if (!restaurant) {
    const { data } = await supabase
      .from("restaurants")
      .select("id, phone, is_active, is_suspended, is_open, plan, plan_end_date, trial_end, trial_start, plan_start_date, opening_time, closing_time, opening_hours, plan_limits_override")
      .eq("id", restaurantId)
      .single()

    if (data) {
      restaurant = data
      restaurantCache.set(cacheKey, data, 5_000) // 5 second TTL
    }
  }

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

  // ── Step 2: Dish price & availability verification (cached) ──
  const dishIds = parsed.data.items.map(item => item.id)

  // Build cache key from sorted dish IDs for cacheability
  const sortedDishIds = [...dishIds].sort()
  const dishCacheKey = `dishes:${restaurantId}:${sortedDishIds.join(",")}`

  let dishPriceMap: Map<string, number> | undefined
  let dishAvailabilityMap: Map<string, boolean> | undefined
  const cachedPrices = dishPriceCache.get(dishCacheKey) as Record<string, number> | undefined
  if (cachedPrices) {
    dishPriceMap = new Map(Object.entries(cachedPrices))
  } else {
    const { data: dishes, error: dishesError } = await supabase
      .from("dishes")
      .select("id, price, is_available")
      .in("id", dishIds)
      .eq("restaurant_id", restaurantId)

    if (dishesError || !dishes || dishes.length !== dishIds.length) {
      return NextResponse.json({ error: "Invalid dish data in order" }, { status: 400 })
    }

    dishPriceMap = new Map(dishes.map(d => [d.id, d.price]))
    dishAvailabilityMap = new Map(dishes.map(d => [d.id, d.is_available ?? true]))

    // Cache as plain object for serialization
    const priceObj: Record<string, number> = {}
    for (const [id, price] of dishPriceMap) priceObj[id] = price
    dishPriceCache.set(dishCacheKey, priceObj, 15_000) // 15 second TTL
  }

  // Verify each item's price matches the database, check availability, and recalculate subtotals
  const recalculatedItems: Array<{
    id: string
    name_en: string
    quantity: number
    price: number
    subtotal: number
  }> = []
  for (const item of parsed.data.items) {
    const dbPrice = dishPriceMap!.get(item.id)
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
    // Check dish availability (only if we queried for it, i.e. cache miss)
    if (dishAvailabilityMap) {
      const isAvailable = dishAvailabilityMap.get(item.id)
      if (isAvailable === false) {
        return NextResponse.json(
          { error: `"${item.name_en}" is currently unavailable` },
          { status: 400 }
        )
      }
    }
    recalculatedItems.push({
      ...item,
      price: dbPrice,
      subtotal: dbPrice * item.quantity,
    })
  }

  const recalculatedSubtotal = recalculatedItems.reduce((sum, item) => sum + item.subtotal, 0)
  const deliveryFee = parsed.data.delivery_fee ?? 0
  const recalculatedTotal = recalculatedSubtotal - (parsed.data.discount_amount || 0) + deliveryFee
  if (recalculatedTotal <= 0) {
    return NextResponse.json({ error: "Invalid total price after discount" }, { status: 400 })
  }

  // ── Step 3: Order count check (cached, 10s TTL) ──
  // Counts non-cancelled orders since the current plan's start (trial_start for
  // trial, plan_start_date for paid) so usage resets on plan change.
  const orderCount = await getOrderCountFromDB(
    {
      id: restaurantId,
      plan: restaurant.plan,
      trial_start: restaurant.trial_start ?? null,
      plan_start_date: restaurant.plan_start_date ?? null,
    },
    supabase
  )

  const orderLimit = restaurant.plan === "trial"
    ? (await loadTrialLimitsFromDB()).maxOrders ?? DEFAULT_TRIAL_LIMITS.maxOrders
    : (await getEffectiveLimitsFromDB(restaurant.plan as Plan, restaurant.plan_limits_override)).maxOrders

  if (orderCount >= orderLimit) {
    return NextResponse.json({
      error: "ORDER_LIMIT_REACHED",
      message: `Your plan allows ${orderLimit} orders. Upgrade to accept more.`,
    }, { status: 403 })
  }

  // ── Heavy work: enqueue per-restaurant to serialize DB writes ──
  return enqueueOrder(restaurantId, async () => {
    const orderNumber = generateOrderNumber()
    const adminSupabase = createAdminClient()

    // ── Table occupancy validation for dine-in ──
    if (parsed.data.order_type === "dine_in" && parsed.data.table_number) {
      const { data: table } = await adminSupabase
        .from("restaurant_tables")
        .select("id, is_active, is_occupied")
        .eq("restaurant_id", restaurantId)
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

    // ── Customer upsert — only when customer_id is provided (optimization) ──
    if (parsed.data.customer_id) {
      const customerData: Record<string, any> = { id: parsed.data.customer_id }
      if (parsed.data.customer_name) customerData.name = parsed.data.customer_name
      if (parsed.data.customer_phone) customerData.phone = normalizePhone(parsed.data.customer_phone)
      await adminSupabase.from("customers").upsert(
        customerData,
        { onConflict: "id", ignoreDuplicates: false }
      )
    }

    // ── Validate deal_id exists before INSERT (prevents FK violation) ──
    if (parsed.data.deal_id) {
      const { data: deal } = await adminSupabase
        .from("deals")
        .select("id")
        .eq("id", parsed.data.deal_id)
        .eq("restaurant_id", restaurantId)
        .maybeSingle()

      if (!deal) {
        log.warn("Stale deal_id cleared", { deal_id: parsed.data.deal_id, restaurant_id: restaurantId })
        // Clear the stale deal silently instead of failing the whole order
        parsed.data.deal_id = null
      }
    }

    // ── Order INSERT ──
    const { data, error } = await adminSupabase
      .from("orders")
      .insert({
        restaurant_id: restaurantId,
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
        delivery_fee: deliveryFee,
        whatsapp_sent: true,
      })
      .select()
      .single()

    if (error) {
      log.error("INSERT failed", { code: error.code, message: error.message, details: error.details, restaurant_id: restaurantId })

      // Return a more descriptive error based on the Postgres error code
      if (error.code === "23503") {
        return NextResponse.json({ error: "Invalid reference in order. Please try again." }, { status: 400 })
      }
      if (error.code === "23505") {
        return NextResponse.json({ error: "Order number conflict. Please try again." }, { status: 409 })
      }
      if (error.code === "23514" || error.code === "23502") {
        return NextResponse.json({ error: "Invalid order data. Please check your input." }, { status: 400 })
      }
      if (error.code === "42P01" || error.code === "42703") {
        return NextResponse.json({ error: "System configuration error. Please contact support." }, { status: 500 })
      }
      return NextResponse.json({ error: "Failed to create order. Please try again." }, { status: 400 })
    }

    // Invalidate order count cache so the next request reflects the new order
    invalidateOrderCount(restaurantId)

    // ── Mark table occupied (dine-in only) ──
    if (parsed.data.order_type === "dine_in" && parsed.data.table_number && data.table_number) {
      await adminSupabase
        .from("restaurant_tables")
        .update({ is_occupied: true })
        .eq("restaurant_id", restaurantId)
        .eq("table_number", parsed.data.table_number)
        .then(({ error: occupyErr }) => {
          if (occupyErr) log.error("Failed to mark table occupied", { message: occupyErr.message, restaurant_id: restaurantId, table: parsed.data.table_number })
        })
    }

    // ── Build WhatsApp URL ──
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
      deliveryFee,
    })

    // ── Notification log (fire-and-forget, non-critical) ──
    // Use Promise.resolve to handle supabase's PromiseLike return type
    Promise.resolve(adminSupabase.from("notification_logs").insert({
      restaurant_id: restaurantId,
      order_id: data.id,
      type: "order_email",
      status: "sent",
    })).catch((err: any) => log.error("Notification log insert failed", { message: err?.message }))

    // ── Fire-and-forget: more non-critical side effects ──
    checkAndSendOrderLimitAlert(restaurantId).catch((err: any) => log.warn("Order limit alert failed", { message: err?.message }))
    sendPushNotification(restaurantId, {
      title: `New Order #${orderNumber}`,
      body: `${parsed.data.customer_name} — ${formatPrice(recalculatedTotal)}`,
      url: `/dashboard/orders/${data.id}`,
      tag: `order-${data.id}`,
    }).catch((err: any) => log.error("Push send failed", { message: err?.message }))

    // ── Customer notification on order creation ──
    if (parsed.data.customer_id) {
      sendCustomerPushNotification(parsed.data.customer_id, {
        title: "Order Confirmed!",
        body: `Your order #${orderNumber} of ${formatPrice(recalculatedTotal)} has been placed successfully at ${parsed.data.customer_name}`,
        url: `/order-confirm/${data.id}`,
        tag: `order-${data.id}`,
        icon: "/og-image.png",
      }).catch((err: any) => log.error("Customer push on create failed", { message: err?.message }))

      createCustomerNotification({
        customer_id: parsed.data.customer_id,
        order_id: data.id,
        type: "order_confirmed",
        title_en: "Order Confirmed!",
        title_ur: "رڈرآ رایت!",
        body_en: `Your order #${orderNumber} of ${formatPrice(recalculatedTotal)} has been placed successfully.`,
        body_ur: `ےہ لےک ےہ رایت رڈرآ #${orderNumber}`,
        data: { total_price: recalculatedTotal, order_type: parsed.data.order_type },
      }).catch((err: any) => log.error("Create notification failed", { message: err?.message }))
    }

    logCustomerAction(
      parsed.data.customer_id || null,
      "order_created",
      {
        order_id: data.id,
        restaurant_id: restaurantId,
        total_price: recalculatedTotal,
        order_type: parsed.data.order_type,
      },
      getIpSimple(request)
    ).catch((err: any) => log.warn("logCustomerAction failed", { message: err?.message }))

    return NextResponse.json({
      order: data,
      whatsapp_url: whatsappUrl,
    })
  })
})
