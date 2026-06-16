import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { csrfGuard } from "@/lib/csrf"
import { logOwnerAction, getIpSimple } from "@/lib/owner-audit"

export async function PATCH(request: Request) {
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

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  const validPlans = ["trial", "starter", "growth", "premium"]
  if (!validPlans.includes(body.plan)) {
    return NextResponse.json({ error: "Invalid plan value" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("restaurants")
    .update({
      plan: body.plan,
      plan_end_date: body.plan_end_date || null,
    })
    .eq("id", restaurant.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  logOwnerAction(restaurant.id, user.id, "plan_updated", {
    plan: body.plan,
    plan_end_date: body.plan_end_date,
  }, getIpSimple(request)).catch(() => {})

  return NextResponse.json({ restaurant: data })
}
