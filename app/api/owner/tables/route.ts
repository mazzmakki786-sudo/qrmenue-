import { NextResponse } from "next/server"
import { z } from "zod"
import { safeRoute } from "@/lib/api-error"
import { createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limiter"
import { logOwnerAction, getIpSimple } from "@/lib/owner-audit"

const TABLES_ENABLED_PLANS = ["growth", "growth-yearly", "premium", "premium-yearly"]

const createTableSchema = z.object({
  table_number: z.string().min(1, "Table number is required").max(10),
  capacity: z.number().int().positive().default(4),
})

export const GET = safeRoute(async (request) => {
  await checkRateLimit(request, "owner:read")

  const restaurantId = request.headers.get("x-restaurant-id")
  if (!restaurantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: tables, error } = await admin
    .from("restaurant_tables")
    .select("id, table_number, capacity, is_active, is_occupied, created_at")
    .eq("restaurant_id", restaurantId)
    .order("table_number", { ascending: true })

  if (error) {
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 400 })
  }

  return NextResponse.json({ tables: tables || [] })
})

export const POST = safeRoute(async (request) => {
  await checkRateLimit(request, "owner:write")

  const restaurantId = request.headers.get("x-restaurant-id")
  const ownerId = request.headers.get("x-owner-id")
  if (!restaurantId || !ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = createTableSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const admin = createAdminClient()

  // Check plan — tables only on growth+ plans
  const { data: restaurant } = await admin
    .from("restaurants")
    .select("plan")
    .eq("id", restaurantId)
    .single()

  if (restaurant && !TABLES_ENABLED_PLANS.includes(restaurant.plan)) {
    return NextResponse.json({ error: "Tables are not available on your current plan. Upgrade to Growth or Premium to use table management." }, { status: 403 })
  }

  const { data: existing } = await admin
    .from("restaurant_tables")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .eq("table_number", parsed.data.table_number)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: "Table number already exists" }, { status: 409 })
  }

  const { data: table, error } = await admin
    .from("restaurant_tables")
    .insert({
      restaurant_id: restaurantId,
      table_number: parsed.data.table_number,
      capacity: parsed.data.capacity,
    })
    .select("id, table_number, capacity, is_active, is_occupied, created_at")
    .single()

  if (error) {
    return NextResponse.json({ error: "Failed to create table" }, { status: 400 })
  }

  logOwnerAction(restaurantId, ownerId, "table_created", {
    table_id: table.id,
    table_number: parsed.data.table_number,
    capacity: parsed.data.capacity,
  }, getIpSimple(request)).catch(() => {})

  return NextResponse.json({ table: { ...table, is_occupied: table.is_occupied ?? false } }, { status: 201 })
})
