import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkAndSendOrderLimitAlert } from "@/lib/email/orderLimitAlert"
import { checkAndSendPlanEndingAlert } from "@/lib/email/planEndingAlert"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { safeRoute } from "@/lib/api-error"
import { csrfGuard } from "@/lib/csrf"

export const POST = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 5, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, plan")
    .eq("owner_id", user.id)
    .single()

  if (!restaurant) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const results: Record<string, string> = {}

  try {
    await checkAndSendOrderLimitAlert(restaurant.id)
    results.orderLimit = "ok"
  } catch (e) {
    results.orderLimit = "error"
    console.error("Order limit alert error:", e)
  }

  try {
    await checkAndSendPlanEndingAlert(restaurant.id)
    results.planEnding = "ok"
  } catch (e) {
    results.planEnding = "error"
    console.error("Plan ending alert error:", e)
  }

  return NextResponse.json({ results })
})
