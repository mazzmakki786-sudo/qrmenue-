import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { csrfGuard } from "@/lib/csrf"
import { safeRoute } from "@/lib/api-error"
import { sendPushNotification } from "@/lib/push-server"
import { formatPrice } from "@/lib/utils"

export const POST = safeRoute(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const ip = getClientIp(request)
  const allowed = await rateLimit(`ready-check:${ip}`, 10, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const { id } = await params
  const supabase = await createClient()

  // Must be the restaurant owner
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("*, restaurants(name, owner_id)")
    .eq("id", id)
    .single()

  if (fetchError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  if (order.restaurants?.owner_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Only auto-transition if order is still in "preparing" status
  if (order.order_status !== "preparing") {
    return NextResponse.json({ order_status: order.order_status, already_updated: true })
  }

  if (!order.ready_at) {
    return NextResponse.json({ order_status: "preparing", ready_at: null, message: "No ready_at set" })
  }

  const now = new Date()
  const readyAt = new Date(order.ready_at)

  if (now < readyAt) {
    const remaining = Math.ceil((readyAt.getTime() - now.getTime()) / 1000)
    return NextResponse.json({ order_status: "preparing", remaining_seconds: remaining })
  }

  const { data: updated, error: updateError } = await supabase
    .from("orders")
    .update({
      order_status: "ready",
      updated_at: now.toISOString(),
    })
    .eq("id", id)
    .eq("order_status", "preparing")
    .select()
    .single()

  if (updateError || !updated) {
    return NextResponse.json({ order_status: "preparing" })
  }

  const restaurantId = order.restaurant_id
  sendPushNotification(restaurantId, {
    title: `Order #${order.order_number} Ready`,
    body: `${formatPrice(order.total_price)} order is now ready for pickup`,
    url: `/dashboard/orders/${id}`,
    tag: `order-${id}`,
  }).catch((err: any) => console.error("[ready-check] Push send failed:", err))

  return NextResponse.json({ order_status: "ready" })
})
