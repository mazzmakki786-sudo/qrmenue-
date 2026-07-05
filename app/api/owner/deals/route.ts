import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { csrfGuard } from "@/lib/csrf"
import { safeRoute } from "@/lib/api-error"
import { logOwnerAction, getIpSimple } from "@/lib/owner-audit"

const dealSchema = z.object({
  title_en: z.string().min(1, "Title is required"),
  title_ur: z.string().optional(),
  description_en: z.string().optional(),
  description_ur: z.string().optional(),
  dish_id: z.string().uuid().nullable().optional(),
  deal_type: z.enum(["percentage", "flat", "bundle"]),
  deal_value: z.coerce.number().positive("Value must be greater than 0"),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
})

const dealUpdateSchema = z.object({
  id: z.string().uuid(),
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
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

  const { data, error } = await supabase
    .from("deals")
    .select("*, dish:dishes!dish_id(id, name_en, image_url)")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 400 })
  }

  return NextResponse.json({ deals: data })
})

export const POST = safeRoute(async (request) => {
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
    .select("id, plan, is_active, is_suspended")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  if (!restaurant.is_active) return NextResponse.json({ error: "Restaurant is not active" }, { status: 403 })
  if (restaurant.is_suspended) return NextResponse.json({ error: "Restaurant is suspended" }, { status: 403 })

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = dealSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("deals")
    .insert({
      restaurant_id: restaurant.id,
      title_en: parsed.data.title_en,
      title_ur: parsed.data.title_ur || null,
      description_en: parsed.data.description_en || null,
      description_ur: parsed.data.description_ur || null,
      dish_id: parsed.data.dish_id || null,
      deal_type: parsed.data.deal_type,
      deal_value: parsed.data.deal_value,
      start_date: parsed.data.start_date || null,
      end_date: parsed.data.end_date || null,
      is_active: parsed.data.is_active ?? true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: "Failed to create deal" }, { status: 400 })
  }

  logOwnerAction(restaurant.id, user.id, "deal_created", {
    deal_id: data.id,
    title: parsed.data.title_en,
  }, getIpSimple(request)).catch(console.error)

  return NextResponse.json({ deal: data })
})
