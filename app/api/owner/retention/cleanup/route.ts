import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { csrfGuard } from "@/lib/csrf"

export const POST = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 5, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { data: restaurant, error: fetchError } = await supabase
    .from("restaurants")
    .select("id, retention_days")
    .eq("owner_id", user.id)
    .single()

  if (!restaurant || fetchError) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  const admin = createAdminClient()
  const retentionDays = restaurant.retention_days ?? 30

  // Use the RPC function which handles FK constraints (notification_logs) properly
  const { data, error } = await admin.rpc("cleanup_old_orders_for_restaurant", {
    p_restaurant_id: restaurant.id,
    p_retention_days: retentionDays,
  })

  if (error) {
    console.error("Cleanup RPC error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const deletedCount = data ?? 0

  return NextResponse.json({ success: true, deleted: deletedCount })
})
