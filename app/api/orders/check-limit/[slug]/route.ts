import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PLAN_LIMITS } from "@/lib/subscription"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 15, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const { slug } = await params
  const supabase = await createClient()

  const { data: restaurant, error: rErr } = await supabase
    .from("restaurants")
    .select("id, plan, trial_end, is_active")
    .eq("slug", slug)
    .single()

  if (rErr || !restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  if (!restaurant.is_active) {
    return NextResponse.json({
      canAccept: false,
      reason: "inactive",
      message: "Restaurant is not active",
    })
  }

  const plan = restaurant.plan as keyof typeof PLAN_LIMITS
  const limits = PLAN_LIMITS[plan]

  if (limits.maxOrders === Infinity) {
    return NextResponse.json({
      canAccept: true,
      reason: "unlimited",
      orderCount: 0,
      maxOrders: Infinity,
      message: "Unlimited orders",
    })
  }

  const { count, error: cErr } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id)
    .neq("order_status", "cancelled")

  if (cErr) {
    return NextResponse.json({ error: cErr.message }, { status: 500 })
  }

  const orderCount = count ?? 0
  const canAccept = orderCount < limits.maxOrders

  let message = "Restaurant is not accepting orders right now"
  if (!canAccept) {
    if (plan === "trial") {
      message =
        "This restaurant has reached their Free Trial order limit. Please contact them directly."
    } else {
      message = "Restaurant is not accepting orders right now"
    }
  }

  return NextResponse.json({
    canAccept,
    reason: canAccept ? "ok" : "limit_reached",
    orderCount,
    maxOrders: limits.maxOrders,
    plan,
    message,
  })
}
