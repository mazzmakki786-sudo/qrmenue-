import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { PLAN_LIMITS, type Plan } from "@/lib/subscription"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { csrfGuard } from "@/lib/csrf"
import { safeRoute } from "@/lib/api-error"
import { logOwnerAction, getIpSimple } from "@/lib/owner-audit"

const dishSchema = z.object({
  name_en: z.string().min(1, "Name is required"),
  name_ur: z.string().optional(),
  description_en: z.string().optional(),
  description_ur: z.string().optional(),
  price: z.coerce.number().int().positive("Price must be greater than 0"),
  category_id: z.string().min(1, "Category is required"),
  image_url: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
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

  const plan = restaurant.plan as Plan
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.trial

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = dishSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { count: dishCount } = await supabase
    .from("dishes")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id)

  const currentDishes = dishCount ?? 0

  if (currentDishes >= limits.maxDishes) {
    return NextResponse.json(
      {
        error: "DISH_LIMIT_REACHED",
        message: `Your ${plan} plan allows ${limits.maxDishes} dishes. Upgrade to add more.`,
        limit: limits.maxDishes,
        current: currentDishes,
      },
      { status: 403 }
    )
  }

  if (parsed.data.image_url) {
    const { data: dishes } = await supabase
      .from("dishes")
      .select("image_url")
      .eq("restaurant_id", restaurant.id)
    const imageCount = (dishes || []).filter((d: any) => !!d.image_url).length

    if (imageCount >= limits.maxImages) {
      return NextResponse.json(
        {
          error: "IMAGE_LIMIT_REACHED",
          message: `Your ${plan} plan allows ${limits.maxImages} images. Upgrade to add more.`,
          limit: limits.maxImages,
          current: imageCount,
        },
        { status: 403 }
      )
    }
  }

  const { data, error } = await supabase
    .from("dishes")
    .insert({
      name_en: parsed.data.name_en,
      name_ur: parsed.data.name_ur || null,
      description_en: parsed.data.description_en || null,
      description_ur: parsed.data.description_ur || null,
      price: parsed.data.price,
      category_id: parsed.data.category_id,
      image_url: parsed.data.image_url || null,
      is_available: true,
      tags: parsed.data.tags || [],
      restaurant_id: restaurant.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  fetch(`${origin}/api/notifications/new-dish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ restaurant_id: restaurant.id, dish_id: data.id }),
  }).catch((e) => console.error("New dish notification error:", e))

  logOwnerAction(restaurant.id, user.id, "dish_created", {
    dish_id: data.id,
    name: parsed.data.name_en,
  }, getIpSimple(request)).catch(() => {})

  return NextResponse.json({ dish: data })
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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, plan")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

  const plan = restaurant.plan as Plan
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.trial

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { id, ...updateData } = body

  if (!id) return NextResponse.json({ error: "Dish id required" }, { status: 400 })

  if (updateData.image_url) {
    const { data: dishes } = await supabase
      .from("dishes")
      .select("id, image_url")
      .eq("restaurant_id", restaurant.id)
    const otherImages = (dishes || []).filter(
      (d: any) => d.id !== id && !!d.image_url
    ).length
    if (otherImages >= limits.maxImages) {
      return NextResponse.json(
        {
          error: "IMAGE_LIMIT_REACHED",
          message: `Your ${plan} plan allows ${limits.maxImages} images. Upgrade to add more.`,
        },
        { status: 403 }
      )
    }
  }

  const { data, error } = await supabase
    .from("dishes")
    .update({
      name_en: updateData.name_en,
      name_ur: updateData.name_ur || null,
      description_en: updateData.description_en || null,
      description_ur: updateData.description_ur || null,
      price: updateData.price,
      category_id: updateData.category_id,
      image_url: updateData.image_url,
      tags: updateData.tags || [],
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  logOwnerAction(restaurant.id, user.id, "dish_updated", {
    dish_id: id,
    changes: Object.keys(updateData),
  }, getIpSimple(request)).catch(() => {})

  return NextResponse.json({ dish: data })
})