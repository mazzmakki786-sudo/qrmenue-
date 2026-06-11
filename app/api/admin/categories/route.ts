import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { getEffectiveLimits, type Plan } from "@/lib/subscription"

const categorySchema = z.object({
  restaurant_id: z.string().uuid(),
  name_en: z.string().min(1, "Name is required"),
  name_ur: z.string().nullable().optional(),
  sort_order: z.number().int().optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const parsed = categorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, plan, is_active, is_suspended, plan_limits_override")
    .eq("id", parsed.data.restaurant_id)
    .eq("owner_id", user.id)
    .single()

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found or unauthorized" }, { status: 403 })
  }

  if (!restaurant.is_active) {
    return NextResponse.json({ error: "Restaurant is not active" }, { status: 403 })
  }

  if (restaurant.is_suspended) {
    return NextResponse.json({ error: "Restaurant is suspended" }, { status: 403 })
  }

  const plan = restaurant.plan as Plan
  const limits = getEffectiveLimits(plan, restaurant.plan_limits_override)

  const { count: categoryCount } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", parsed.data.restaurant_id)

  if ((categoryCount ?? 0) >= limits.maxCategories) {
    return NextResponse.json({
      error: "CATEGORY_LIMIT_REACHED",
      message: `Your ${plan} plan allows ${limits.maxCategories} categories.`,
      limit: limits.maxCategories,
      current: categoryCount ?? 0,
    }, { status: 403 })
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      restaurant_id: parsed.data.restaurant_id,
      name_en: parsed.data.name_en,
      name_ur: parsed.data.name_ur || null,
      sort_order: parsed.data.sort_order || 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ category: data })
}
