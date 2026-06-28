import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { csrfGuard } from "@/lib/csrf"
import { safeRoute } from "@/lib/api-error"
import { logOwnerAction, getIpSimple } from "@/lib/owner-audit"

const dealUpdateSchema = z.object({
  title_en: z.string().min(1).optional(),
  title_ur: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  description_ur: z.string().nullable().optional(),
  dish_id: z.string().uuid().nullable().optional(),
  deal_type: z.enum(["percentage", "flat", "bundle"]).optional(),
  deal_value: z.coerce.number().positive().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
})

export const PATCH = safeRoute(async (request, { params }) => {
  const { id } = await params

  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 15, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, plan")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

  const { data: deal } = await supabase
    .from("deals")
    .select("restaurant_id")
    .eq("id", id)
    .single()

  if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 })
  if (deal.restaurant_id !== restaurant.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = dealUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const updateData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined) {
      updateData[key] = value
    }
  }

  const { data, error } = await supabase
    .from("deals")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: "Failed to update deal" }, { status: 400 })
  }

  logOwnerAction(restaurant.id, user.id, "deal_updated", {
    deal_id: id,
    changes: Object.keys(updateData),
  }, getIpSimple(request)).catch(() => {})

  return NextResponse.json({ deal: data })
})

export const DELETE = safeRoute(async (request, { params }) => {
  const { id } = await params

  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 15, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

  const { data: deal } = await supabase
    .from("deals")
    .select("restaurant_id")
    .eq("id", id)
    .single()

  if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 })
  if (deal.restaurant_id !== restaurant.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { error } = await supabase
    .from("deals")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: "Failed to delete deal" }, { status: 400 })
  }

  logOwnerAction(restaurant.id, user.id, "deal_deleted", {
    deal_id: id,
  }, getIpSimple(request)).catch(() => {})

  return NextResponse.json({ success: true })
})
