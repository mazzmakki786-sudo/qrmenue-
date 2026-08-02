import { NextResponse } from "next/server"
import { safeRoute } from "@/lib/api-error"
import { createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limiter"
import { invalidateOrderCount } from "@/lib/subscription-usage"

export const GET = safeRoute(async (request) => {
  await checkRateLimit(request, "superadmin:read")

  const supabase = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL
  if (!superAdminEmail || user.email !== superAdminEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const url = new URL(request.url)
  const restaurantId = url.searchParams.get("restaurant_id")
  const status = url.searchParams.get("status")
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 200)
  const offset = parseInt(url.searchParams.get("offset") || "0", 10)

  let query = supabase
    .from("subscriptions")
    .select("*, restaurants(name, slug)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (restaurantId) {
    query = query.eq("restaurant_id", restaurantId)
  }

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ subscriptions: data, total: count, offset, limit })
})

// POST: Create a new subscription record (superadmin manual activation)
export const POST = safeRoute(async (request) => {
  await checkRateLimit(request, "superadmin:write")

  const supabase = createAdminClient()
  const admin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL
  if (!superAdminEmail || user.email !== superAdminEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { restaurant_id, plan_type, price, start_date, end_date } = body

  if (!restaurant_id || !plan_type || !price) {
    return NextResponse.json({ error: "Missing required fields: restaurant_id, plan_type, price" }, { status: 400 })
  }

  // Create subscription record
  const { data: subscription, error: subError } = await admin
    .from("subscriptions")
    .insert({
      restaurant_id,
      plan: plan_type,
      amount_pkr: price,
      payment_method: "manual",
      payment_ref: `SUPERADMIN_${Date.now()}`,
      status: "active",
      billing_interval: "monthly",
      start_date: start_date || new Date().toISOString(),
      end_date: end_date || null,
      activated_by: user.id,
      notes: `Manually activated by superadmin (${user.email})`,
    })
    .select()
    .single()

  if (subError) {
    console.error("[Superadmin Subscriptions] Failed to create subscription:", subError)
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
  }

  // Also update the restaurant's plan fields
  // Clear any stale plan_limits_override so the new plan's real limits apply.
  const { error: updateError } = await admin
    .from("restaurants")
    .update({
      plan: plan_type,
      plan_start_date: start_date || new Date().toISOString(),
      plan_end_date: end_date || null,
      is_suspended: false,
      is_active: true,
      plan_limits_override: null,
    })
    .eq("id", restaurant_id)

  // Plan change → order usage counter anchors to the new plan_start_date,
  // drop any stale cached count from the previous plan period.
  invalidateOrderCount(restaurant_id)

  if (updateError) {
    console.error("[Superadmin Subscriptions] Failed to update restaurant plan:", updateError)
  }

  return NextResponse.json({ subscription })
})
