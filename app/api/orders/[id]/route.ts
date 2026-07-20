import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { csrfGuard } from "@/lib/csrf"
import { safeRoute } from "@/lib/api-error"
import { logOwnerAction, getIpSimple } from "@/lib/owner-audit"
import { sendPushNotification } from "@/lib/push-server"
import { formatPrice } from "@/lib/utils"
import { sendCustomerPushNotification, createCustomerNotification } from "@/lib/customer-notifications"

const VALID_STATUSES = ["received", "preparing", "ready", "completed", "cancelled"] as const
const VALID_PAYMENT_STATUSES = ["pending", "paid", "failed"] as const
const VALID_PAYMENT_METHODS = ["cod", "bank_transfer", "easypaisa"] as const

export const GET = safeRoute(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 30, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!restaurant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .single()

  if (error) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  return NextResponse.json({ order: data })
})

export const PATCH = safeRoute(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 10, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, delivery_time_min")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!restaurant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const safeBody: Record<string, unknown> = {}

  if (body.order_status !== undefined) {
    if (!VALID_STATUSES.includes(body.order_status)) {
      return NextResponse.json({ error: `Invalid order_status. Must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 })
    }
    safeBody.order_status = body.order_status

    if (body.order_status === "preparing") {
      safeBody.prepared_at = new Date().toISOString()
      if (restaurant.delivery_time_min != null && restaurant.delivery_time_min > 0) {
        const readyAt = new Date(Date.now() + restaurant.delivery_time_min * 60 * 1000)
        safeBody.ready_at = readyAt.toISOString()
      } else {
        // Default 30 min if delivery_time_min is not set
        const readyAt = new Date(Date.now() + 30 * 60 * 1000)
        safeBody.ready_at = readyAt.toISOString()
      }
    }
  }

  if (body.payment_status !== undefined) {
    if (!VALID_PAYMENT_STATUSES.includes(body.payment_status)) {
      return NextResponse.json({ error: `Invalid payment_status. Must be one of: ${VALID_PAYMENT_STATUSES.join(", ")}` }, { status: 400 })
    }
    safeBody.payment_status = body.payment_status
  }

  if (body.payment_method !== undefined) {
    if (!VALID_PAYMENT_METHODS.includes(body.payment_method)) {
      return NextResponse.json({ error: `Invalid payment_method. Must be one of: ${VALID_PAYMENT_METHODS.join(", ")}` }, { status: 400 })
    }
    safeBody.payment_method = body.payment_method
  }

  if (Object.keys(safeBody).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  // Fetch current order before updating (for status validation, notifications, and audit)
  const { data: currentOrder } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .single()

  if (!currentOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  // Optimistic concurrency for cancellation — only cancel if status is still cancelable
  if (safeBody.order_status === "cancelled") {
    if (!["received", "preparing"].includes(currentOrder.order_status)) {
      return NextResponse.json({ error: "Order cannot be cancelled in its current state" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("orders")
      .update(safeBody)
      .eq("id", id)
      .eq("restaurant_id", restaurant.id)
      .eq("order_status", currentOrder.order_status)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Failed to cancel order. It may have been updated already." }, { status: 409 })
    }

    logOwnerAction(restaurant.id, user.id, "order_cancelled", {
      order_id: id,
      changes: safeBody,
    }, getIpSimple(request)).catch(console.error)

    sendPushNotification(restaurant.id, {
      title: `Order #${currentOrder.order_number} Cancelled`,
      body: `Order of ${formatPrice(currentOrder.total_price)} was cancelled by restaurant`,
      url: `/dashboard/orders/${id}`,
      tag: `order-${id}`,
    }).catch((err: any) => console.error("[orders] Push send failed:", err))

    // Free table if dine-in order is cancelled
    if (currentOrder.table_number) {
      const admin = createAdminClient()
      admin.from("restaurant_tables").update({ is_occupied: false })
        .eq("restaurant_id", restaurant.id)
        .eq("table_number", currentOrder.table_number)
        .then(({ error: freeErr }) => { if (freeErr) console.error("[orders] Failed to free table:", freeErr.message) })
    }

    return NextResponse.json({ order: data })
  }

  const { data, error } = await supabase
    .from("orders")
    .update(safeBody)
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 400 })
  }

  logOwnerAction(restaurant.id, user.id, "order_updated", {
    order_id: id,
    changes: safeBody,
  }, getIpSimple(request)).catch(console.error)

  const newStatus = safeBody.order_status
  if (newStatus && typeof newStatus === "string") {
    const statusEmoji = newStatus === "preparing" ? "👨‍🍳" : newStatus === "ready" ? "✅" : "📋"

    sendPushNotification(restaurant.id, {
      title: `Order #${currentOrder.order_number} ${statusEmoji}`,
      body: `Status changed to: ${newStatus}`,
      url: `/dashboard/orders/${id}`,
      tag: `order-${id}`,
    }).catch((err: any) => console.error("[orders] Push send failed:", err))

    if ((newStatus === "preparing" || newStatus === "ready") && currentOrder.customer_id) {
      const isPreparing = newStatus === "preparing"
      const pushTitle = isPreparing ? "Order Being Prepared" : "Order Ready!"
      const pushBody = isPreparing
        ? `Your order #${currentOrder.order_number} is now being prepared`
        : `Your order #${currentOrder.order_number} is ready for pickup/delivery`

      sendCustomerPushNotification(currentOrder.customer_id, {
        title: pushTitle,
        body: pushBody,
        url: `/order-confirm/${id}`,
        tag: `order-${id}`,
        icon: "/og-image.png",
      }).catch((err: any) => console.error("[orders] Customer push failed:", err))

      createCustomerNotification({
        customer_id: currentOrder.customer_id,
        order_id: id,
        type: "status_update",
        title_en: isPreparing ? "Order Being Prepared" : "Order Ready!",
        title_ur: isPreparing ? "ےہ اہر وہ رایت رڈرآ" : "ےہ رایت رڈرآ!",
        body_en: isPreparing
          ? `Your order #${currentOrder.order_number} is now being prepared`
          : `Your order #${currentOrder.order_number} is ready!`,
        body_ur: isPreparing
          ? `رڈرآ اک پآ #${currentOrder.order_number} ےہ اہر وہ رایت`
          : `رڈرآ اک پآ #${currentOrder.order_number} ےہ رایت!`,
      }).catch((err: any) => console.error("[orders] Create notification failed:", err))
    }
  }

  // Free table when dine-in order is completed
  if (newStatus && newStatus === "completed" && currentOrder.table_number) {
    const admin = createAdminClient()
    admin.from("restaurant_tables").update({ is_occupied: false })
      .eq("restaurant_id", restaurant.id)
      .eq("table_number", currentOrder.table_number)
      .then(({ error: freeErr }) => { if (freeErr) console.error("[orders] Failed to free table:", freeErr.message) })
  }

  return NextResponse.json({ order: data })
})