import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { safeRoute } from "@/lib/api-error"
import { getEffectiveLimits, type Plan } from "@/lib/subscription"

export const GET = safeRoute(async (request) => {
  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 30, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, plan, plan_limits_override, is_active, is_suspended")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

  const limits = getEffectiveLimits(restaurant.plan as Plan, restaurant.plan_limits_override as any)
  const monthlyLimit = limits.aiPostsPerMonth

  if (monthlyLimit === 0) {
    return NextResponse.json({
      allowed: false,
      remaining: 0,
      limit: 0,
      message: "AI posts are not available on your current plan. Upgrade to Growth or Premium.",
    })
  }

  const month = new Date().toISOString().slice(0, 7)

  const admin = createAdminClient()
  const { data: usage } = await admin
    .from("ai_usage")
    .select("count")
    .eq("restaurant_id", restaurant.id)
    .eq("month", month)
    .maybeSingle()

  const used = usage?.count ?? 0
  const remaining = Math.max(0, monthlyLimit - used)

  return NextResponse.json({
    allowed: remaining > 0 && restaurant.is_active && !restaurant.is_suspended,
    remaining,
    limit: monthlyLimit,
    used,
    month,
  })
})
