import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { csrfGuard } from "@/lib/csrf"
import { z } from "zod"

const retentionSchema = z.object({
  retention_days: z.number().int().min(7).max(30),
})

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
    .select("id, retention_days")
    .eq("owner_id", user.id)
    .single()

  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

  return NextResponse.json({ retention_days: restaurant.retention_days ?? 30 })
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

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, retention_days")
    .eq("owner_id", user.id)
    .single()

  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

  const body = await request.json()
  const parsed = retentionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "retention_days must be between 7 and 30" }, { status: 400 })
  }

  const { retention_days } = parsed.data

  const admin = createAdminClient()
  const { error } = await admin
    .from("restaurants")
    .update({ retention_days })
    .eq("id", restaurant.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true, retention_days })
})
