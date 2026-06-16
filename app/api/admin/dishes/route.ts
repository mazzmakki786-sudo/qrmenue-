import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { csrfGuard } from "@/lib/csrf"
import { logOwnerAction, getIpSimple } from "@/lib/owner-audit"

const dishSchema = z.object({
  restaurant_id: z.string().uuid(),
  category_id: z.string().uuid().nullable().optional(),
  name_en: z.string().min(1, "Name is required"),
  name_ur: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  description_ur: z.string().nullable().optional(),
  price: z.number().int().positive("Price must be positive"),
  image_url: z.string().nullable().optional(),
  is_available: z.boolean().optional(),
  sort_order: z.number().int().optional(),
})

export async function POST(request: Request) {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 15, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const supabase = await createClient()
  const body = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const parsed = dishSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", parsed.data.restaurant_id)
    .eq("owner_id", user.id)
    .single()

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found or unauthorized" }, { status: 403 })
  }

  const { data, error } = await supabase
    .from("dishes")
    .insert({
      ...parsed.data,
      is_available: parsed.data.is_available ?? true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  logOwnerAction(parsed.data.restaurant_id, user.id, "dish_created", {
    dish_id: data.id,
    name: parsed.data.name_en,
  }, getIpSimple(request)).catch(() => {})

  return NextResponse.json({ dish: data })
}
