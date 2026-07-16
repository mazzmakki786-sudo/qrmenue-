import { NextResponse } from "next/server"
import { z } from "zod"
import { safeRoute } from "@/lib/api-error"
import { createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limiter"
import { logOwnerAction, getIpSimple } from "@/lib/owner-audit"

const updateTableSchema = z.object({
  table_number: z.string().min(1).max(10).optional(),
  capacity: z.number().int().positive().optional(),
  is_active: z.boolean().optional(),
})

export const PATCH = safeRoute(async (request, { params }) => {
  await checkRateLimit(request, "owner:write")

  const restaurantId = request.headers.get("x-restaurant-id")
  const ownerId = request.headers.get("x-owner-id")
  if (!restaurantId || !ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = updateTableSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: existing } = await admin
    .from("restaurant_tables")
    .select("id")
    .eq("id", id)
    .eq("restaurant_id", restaurantId)
    .single()

  if (!existing) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 })
  }

  const { data: table, error } = await admin
    .from("restaurant_tables")
    .update(parsed.data)
    .eq("id", id)
    .eq("restaurant_id", restaurantId)
    .select("id, table_number, capacity, is_active, created_at")
    .single()

  if (error) {
    return NextResponse.json({ error: "Failed to update table" }, { status: 400 })
  }

  logOwnerAction(restaurantId, ownerId, "table_updated", {
    table_id: id,
    changes: parsed.data,
  }, getIpSimple(request)).catch(() => {})

  return NextResponse.json({ table })
})

export const DELETE = safeRoute(async (request, { params }) => {
  await checkRateLimit(request, "owner:write")

  const restaurantId = request.headers.get("x-restaurant-id")
  const ownerId = request.headers.get("x-owner-id")
  if (!restaurantId || !ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const admin = createAdminClient()

  const { data: existing } = await admin
    .from("restaurant_tables")
    .select("id")
    .eq("id", id)
    .eq("restaurant_id", restaurantId)
    .single()

  if (!existing) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 })
  }

  const { error } = await admin.from("restaurant_tables").delete().eq("id", id).eq("restaurant_id", restaurantId)

  if (error) {
    return NextResponse.json({ error: "Failed to delete table" }, { status: 400 })
  }

  logOwnerAction(restaurantId, ownerId, "table_deleted", {
    table_id: id,
  }, getIpSimple(request)).catch(() => {})

  return NextResponse.json({ success: true })
})
