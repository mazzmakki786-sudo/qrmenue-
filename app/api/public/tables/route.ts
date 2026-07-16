import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"

/**
 * GET /api/public/tables?restaurant_id=xxx
 *
 * Public endpoint — no auth required.
 * Returns only active, un-occupied tables so customers can pick one at checkout.
 */
export const GET = safeRoute(async (request) => {
  const { searchParams } = new URL(request.url)
  const restaurantId = searchParams.get("restaurant_id")

  if (!restaurantId) {
    return NextResponse.json({ error: "restaurant_id query parameter is required" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: tables, error } = await supabase
    .from("restaurant_tables")
    .select("id, table_number, capacity, is_occupied")
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .eq("is_occupied", false)
    .order("table_number", { ascending: true })

  if (error) {
    console.error("[public/tables] Error fetching tables:", error.message)
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 })
  }

  return NextResponse.json({ tables })
})
