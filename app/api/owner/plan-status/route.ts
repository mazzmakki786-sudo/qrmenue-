import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getEffectiveLimits, type Plan } from "@/lib/subscription"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"

export async function GET(request: Request) {
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
    .select("id, plan, plan_limits_override, is_active, is_suspended")
    .eq("owner_id", user.id)
    .single()

  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

  const plan = restaurant.plan as Plan
  const limits = getEffectiveLimits(plan, restaurant.plan_limits_override)

  const [dishRes, catRes] = await Promise.all([
    supabase.from("dishes").select("id, image_url").eq("restaurant_id", restaurant.id),
    supabase.from("categories").select("id", { count: "exact", head: true }).eq("restaurant_id", restaurant.id),
  ])

  const dishes = dishRes.data || []
  const dishCount = dishes.length
  const imageCount = dishes.filter((d: any) => !!d.image_url).length
  const categoryCount = catRes.count ?? 0

  return NextResponse.json({
    plan,
    limits,
    is_active: restaurant.is_active,
    is_suspended: restaurant.is_suspended,
    usage: {
      dishes: dishCount,
      images: imageCount,
      categories: categoryCount,
    },
    canAddDish: dishCount < limits.maxDishes,
    canAddImage: imageCount < limits.maxImages,
    canAddCategory: categoryCount < limits.maxCategories,
  })
}
