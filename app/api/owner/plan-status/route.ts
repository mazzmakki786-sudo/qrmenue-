import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PLAN_LIMITS, type Plan } from "@/lib/subscription"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, plan")
    .eq("owner_id", user.id)
    .single()

  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

  const plan = restaurant.plan as Plan
  const limits = PLAN_LIMITS[plan]

  const { count: dishCount } = await supabase
    .from("dishes")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id)

  const { data: dishes } = await supabase
    .from("dishes")
    .select("id, image_url")
    .eq("restaurant_id", restaurant.id)

  const imageCount = (dishes || []).filter((d: any) => !!d.image_url).length

  return NextResponse.json({
    plan,
    limits,
    usage: {
      dishes: dishCount ?? 0,
      images: imageCount,
    },
    canAddDish: (dishCount ?? 0) < limits.maxDishes,
    canAddImage: imageCount < limits.maxImages,
  })
}
