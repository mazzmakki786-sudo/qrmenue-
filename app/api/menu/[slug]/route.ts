import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"

export const GET = safeRoute(async (
  request,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 30, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const { slug } = await params
  const url = new URL(request.url)
  const categoryLimit = Math.min(Number(url.searchParams.get("category_limit")) || 50, 100)
  const categoryOffset = Math.max(Number(url.searchParams.get("category_offset")) || 0, 0)
  const dishLimit = Math.min(Number(url.searchParams.get("dish_limit")) || 100, 200)
  const dishOffset = Math.max(Number(url.searchParams.get("dish_offset")) || 0, 0)

  const supabase = await createClient()

  // ── Step 1: Get restaurant metadata (lightweight) ──
  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id, name, slug, city, logo_url, language, cuisine_type, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (restaurantError || !restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  // ── Step 2: Get paginated categories ──
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name_en, name_ur, sort_order")
    .eq("restaurant_id", restaurant.id)
    .order("sort_order", { ascending: true })
    .range(categoryOffset, categoryOffset + categoryLimit - 1)

  if (!categories || categories.length === 0) {
    return NextResponse.json({
      restaurant,
      categories: [],
      dishes: [],
    }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    })
  }

  // ── Step 3: Get dishes for those categories (paginated) ──
  const categoryIds = categories.map((c: any) => c.id)

  // Count total dishes for pagination metadata
  const { count: totalDishes } = await supabase
    .from("dishes")
    .select("id", { count: "exact", head: true })
    .in("category_id", categoryIds)
    .eq("is_available", true)

  const { data: dishes } = await supabase
    .from("dishes")
    .select("id, name_en, name_ur, description_en, description_ur, price, image_url, is_available, tags, category_id, sort_order")
    .in("category_id", categoryIds)
    .eq("is_available", true)
    .order("sort_order", { ascending: true })
    .range(dishOffset, dishOffset + dishLimit - 1)

  return NextResponse.json({
    restaurant,
    categories,
    dishes: dishes ?? [],
    pagination: {
      categories: { total: categories.length, limit: categoryLimit, offset: categoryOffset },
      dishes: { total: totalDishes ?? 0, limit: dishLimit, offset: dishOffset },
    },
  }, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  })
})
