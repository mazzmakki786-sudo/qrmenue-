import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getEffectiveLimitsFromDB } from "@/lib/subscription-db"
import { getOrderCountFromDB } from "@/lib/subscription-usage"
import { safeRoute } from "@/lib/api-error"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"

export const GET = safeRoute(async (
  request,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 15, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const { slug } = await params
  const supabase = await createClient()

  const { data: restaurant, error: rErr } = await supabase
    .from("restaurants")
    .select("id, plan, trial_end, trial_start, plan_start_date, is_active, plan_limits_override")
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

  const plan = restaurant.plan
  const limits = await getEffectiveLimitsFromDB(plan, restaurant.plan_limits_override)

  if (limits.maxOrders === Infinity) {
    return NextResponse.json({
      canAccept: true,
      reason: "unlimited",
      orderCount: 0,
      maxOrders: Infinity,
      message: "Unlimited orders",
    })
  }

  const orderCount = await getOrderCountFromDB(
    {
      id: restaurant.id,
      plan: restaurant.plan,
      trial_start: restaurant.trial_start ?? null,
      plan_start_date: restaurant.plan_start_date ?? null,
    },
    supabase
  )
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
})
