import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { isSuperAdmin, checkRateLimit, logAudit, getIp } from "@/lib/superadmin-security"
import { csrfGuard } from "@/lib/csrf"

export const POST = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request); if (csrfResponse) return csrfResponse
  const ip = getIp(request)
  if (!await checkRateLimit(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isSuperAdmin(user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await request.json()
  const { restaurant_id, plan_type, price } = body

  if (!restaurant_id || !plan_type) {
    return NextResponse.json({ error: "restaurant_id and plan_type are required" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from("subscriptions").insert({
    restaurant_id,
    plan: plan_type,
    amount_pkr: price ?? 0,
    start_date: new Date().toISOString(),
    end_date: null,
  })

  if (error) return NextResponse.json({ error: "Failed to create subscription" }, { status: 400 })

  await logAudit(user.email || "", "subscription_created", { restaurant_id, plan_type, price })

  return NextResponse.json({ success: true })
})
