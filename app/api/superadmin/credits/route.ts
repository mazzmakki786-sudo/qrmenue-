import { NextResponse } from "next/server"
import { safeRoute } from "@/lib/api-error"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { isSuperAdmin, logAudit } from "@/lib/superadmin-security"
import { csrfGuard } from "@/lib/csrf"

const LIMIT_KEYS = [
  "maxDishes",
  "maxImages",
  "maxOrders",
  "maxCategories",
  "aiGenerationsPerMonth",
] as const

/**
 * Superadmin credits & limits manager.
 *
 * GET  → list of restaurants with their effective plan limits + live usage
 *        (AI credits used this month, dishes, images, orders)
 * PATCH → change one or more limits (stored in restaurants.plan_limits_override)
 *         or reset all overrides back to plan defaults.
 */
export const GET = safeRoute(async (request) => {
  const supa = await createClient()
  const { data: { user } } = await supa.auth.getUser()
  if (!user || !(await isSuperAdmin(user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const admin = createAdminClient()

  const [
    restaurantsRes,
    dishesRes,
    ordersRes,
  ] = await Promise.all([
    admin
      .from("restaurants")
      .select("id, name, slug, owner_id, city, plan, plan_limits_override, ai_credits_used")
      .order("created_at", { ascending: false }),
    admin.from("dishes").select("restaurant_id, image_url"),
    admin
      .from("orders")
      .select("restaurant_id")
      .neq("order_status", "cancelled"),
  ])

  const dish_count: Record<string, number> = {}
  const image_count: Record<string, number> = {}
  for (const row of dishesRes?.data || []) {
    dish_count[row.restaurant_id] = (dish_count[row.restaurant_id] ?? 0) + 1
    if (row.image_url) image_count[row.restaurant_id] = (image_count[row.restaurant_id] ?? 0) + 1
  }

  const order_count: Record<string, number> = {}
  for (const row of ordersRes?.data || []) {
    order_count[row.restaurant_id] = (order_count[row.restaurant_id] ?? 0) + 1
  }

  const data = (restaurantsRes?.data || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    owner_id: r.owner_id,
    city: r.city,
    plan: r.plan,
    plan_limits_override: r.plan_limits_override,
    ai_usage: r.ai_credits_used ?? 0,
    dish_count: dish_count[r.id] ?? 0,
    image_count: image_count[r.id] ?? 0,
    order_count: order_count[r.id] ?? 0,
  }))

  return NextResponse.json({ data })
})

export const PATCH = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const admin = createAdminClient()
  const supa = await createClient()
  const { data: { user } } = await supa.auth.getUser()
  if (!user || !(await isSuperAdmin(user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  const restaurantId = typeof body.restaurantId === "string" ? body.restaurantId : ""
  const changes: Record<string, unknown> =
    body.changes && typeof body.changes === "object" ? body.changes : {}
  const reset = body.reset === true

  if (!restaurantId) {
    return NextResponse.json({ error: "restaurantId is required" }, { status: 400 })
  }

  const { data: current } = await admin
    .from("restaurants")
    .select("id, name, plan, plan_limits_override")
    .eq("id", restaurantId)
    .maybeSingle()

  if (!current) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  const before = current.plan_limits_override

  let nextOverride: Record<string, number> | null = null

  if (reset) {
    nextOverride = null
  } else {
    const overrides: Record<string, number> =
      before && typeof before === "object" ? { ...(before as Record<string, number>) } : {}

    const changeKeys = Object.keys(changes)
    if (changeKeys.length === 0) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 })
    }

    for (const key of changeKeys) {
      if (!(LIMIT_KEYS as readonly string[]).includes(key)) {
        return NextResponse.json({ error: `Unknown limit: ${key}` }, { status: 400 })
      }
      const value = changes[key]
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
        return NextResponse.json(
          { error: `${key} must be a non-negative number` },
          { status: 400 }
        )
      }
      overrides[key] = Math.round(value)
    }

    nextOverride = Object.keys(overrides).length > 0 ? overrides : null
  }

  const { data: updated, error } = await admin
    .from("restaurants")
    .update({ plan_limits_override: nextOverride })
    .eq("id", restaurantId)
    .select()
    .single()

  if (error || !updated) {
    return NextResponse.json({ error: "Failed to update limits" }, { status: 400 })
  }

  await logAudit(user.email ?? "unknown", reset ? "limits_reset" : "limits_credits_update", {
    restaurant_id: restaurantId,
    restaurant_name: current.name,
    plan: current.plan,
    reset: reset || undefined,
    changes: reset ? undefined : changes,
    before,
    after: nextOverride,
  })

  return NextResponse.json({ restaurant: updated })
})