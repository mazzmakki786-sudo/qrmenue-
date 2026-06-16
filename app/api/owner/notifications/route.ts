import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { csrfGuard } from "@/lib/csrf"

export const GET = safeRoute(async (request) => {
  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 30, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("owner_notifications")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ notifications: data })
})

export const PATCH = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 15, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const body = await request.json()
  if (!body.notification_id) return NextResponse.json({ error: "notification_id required" }, { status: 400 })

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

  const admin = createAdminClient()
  const { error } = await admin
    .from("owner_notifications")
    .update({ is_read: true })
    .eq("id", body.notification_id)
    .eq("restaurant_id", restaurant.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
})
