import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { safeRoute } from "@/lib/api-error"
import { sendPushNotification } from "@/lib/push-server"
import { logCustomerAction, getIpSimple } from "@/lib/owner-audit"
import { formatPrice } from "@/lib/utils"

export const POST = safeRoute(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const ip = getClientIp(request)
  const allowed = await rateLimit(`cancel-order:${ip}`, 5, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment and try again." }, { status: 429 })
  }

  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "You must be signed in to cancel an order." }, { status: 401 })
  }

  // Use admin client for reading/writing — the API does its own authorization,
  // and RLS doesn't have an UPDATE policy for guest orders (customer_id IS NULL).
  const admin = createAdminClient()

  // Fetch the order to verify ownership and current status
  const { data: order, error: fetchError } = await admin
    .from("orders")
    .select("*, restaurants(name, owner_id)")
    .eq("id", id)
    .single()

  if (fetchError || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 })
  }

  // Verify the order belongs to this customer (or is a guest order with no customer_id)
  if (order.customer_id && order.customer_id !== user.id) {
    return NextResponse.json({ error: "You do not have permission to cancel this order." }, { status: 403 })
  }

  // Only allow cancellation when order is in "received" status
  if (order.order_status !== "received") {
    return NextResponse.json({
      error: `Cannot cancel order in "${order.order_status}" status. Only pending orders can be cancelled.`,
    }, { status: 400 })
  }

  // Update the order status to cancelled
  // Use admin client to bypass RLS (the API already authorizes above).
  // RLS has no UPDATE policy for guest orders (customer_id IS NULL), so the
  // anon-key client would fail on those.
  const { data: updated, error: updateError } = await admin
    .from("orders")
    .update({
      order_status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("order_status", "received") // Optimistic concurrency: only cancel if still received
    .select()
    .single()

  if (updateError || !updated) {
    return NextResponse.json({ error: "Failed to cancel order. It may have been updated already." }, { status: 400 })
  }

  // Notify the owner via push notification (fire-and-forget)
  const restaurantId = order.restaurant_id
  const restaurantName = order.restaurants?.name || "Restaurant"
  sendPushNotification(restaurantId, {
    title: `Order #${order.order_number} Cancelled`,
    body: `${order.customer_name} cancelled their ${formatPrice(order.total_price)} order`,
    url: `/dashboard/orders/${id}`,
    tag: `order-${id}`,
  }).catch((err: any) => console.error("[cancel] Push send failed:", err))

  logCustomerAction(
    user.id,
    "order_cancelled",
    {
      order_id: id,
      restaurant_id: restaurantId,
      total_price: order.total_price,
      reason: "customer_requested",
    },
    getIpSimple(request)
  ).catch(console.error)

  return NextResponse.json({ order: updated })
})
