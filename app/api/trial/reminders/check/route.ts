import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkAndSendReminders } from "@/lib/email/trialReminders"
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
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("id, plan, owner_id")
    .eq("owner_id", user.id)
    .single()

  if (error || !restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  if (restaurant.plan !== "trial") {
    return NextResponse.json({ skipped: true, reason: "not_trial" })
  }

  try {
    await checkAndSendReminders(restaurant.id)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("Reminder check error", e)
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 })
  }
})

export const GET = safeRoute(async (request) => {
  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 5, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("id, plan, owner_id")
    .eq("owner_id", user.id)
    .single()

  if (error || !restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  if (restaurant.plan !== "trial") {
    return NextResponse.json({ skipped: true, reason: "not_trial" })
  }

  try {
    await checkAndSendReminders(restaurant.id)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("Reminder check error", e)
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 })
  }
})
