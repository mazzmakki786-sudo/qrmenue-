import { NextResponse } from "next/server"
import { safeRoute } from "@/lib/api-error"
import { createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limiter"

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
