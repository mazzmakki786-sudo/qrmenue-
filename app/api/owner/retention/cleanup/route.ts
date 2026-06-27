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

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, retention_days")
    .eq("owner_id", user.id)
    .single()

  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

  const admin = createAdminClient()
  const retentionDays = restaurant.retention_days ?? 30

  // Delete completed/cancelled orders older than retention_days
  const { data: deleted, error } = await admin
    .from("orders")
    .delete()
    .eq("restaurant_id", restaurant.id)
    .in("order_status", ["completed", "cancelled"])
    .lt("created_at", new Date(Date.now() - retentionDays * 86400000).toISOString())
    .select("id")

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const deletedCount = deleted?.length ?? 0

  // Log the cleanup
  if (deletedCount > 0) {
    await admin.from("cleanup_log").insert({
      restaurant_id: restaurant.id,
      orders_deleted: deletedCount,
      retention_days: retentionDays,
    })

    // Create notification for the owner
    await admin.from("owner_notifications").insert({
      restaurant_id: restaurant.id,
      type: "cleanup",
      title: "Manual Cleanup Completed",
      body: `${deletedCount} order(s) older than ${retentionDays} days have been manually removed.`,
      link_url: "/dashboard/orders",
    })
  }

  return NextResponse.json({ success: true, deleted: deletedCount })
})
