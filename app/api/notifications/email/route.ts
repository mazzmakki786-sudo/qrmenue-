import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { safeRoute } from "@/lib/api-error"
import { csrfGuard } from "@/lib/csrf"

export const POST = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 10, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }
  const supabase = await createClient()
  const body = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (body.order_id) {
    const { data: order } = await supabase
      .from("orders")
      .select("*, restaurants!inner(*)")
      .eq("id", body.order_id)
      .single()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("id", order.restaurant_id)
      .eq("owner_id", user.id)
      .single()

    if (!restaurant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await supabase.from("notification_logs").insert({
      restaurant_id: order.restaurant_id,
      order_id: order.id,
      type: "order_email",
      recipient_email: "",
      status: "sent",
    })
  }

  return NextResponse.json({ success: true })
})
