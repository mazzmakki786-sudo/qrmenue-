import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    const expectedToken = process.env.CRON_SECRET

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    const now = new Date().toISOString()
    const results: { expired: number; restored: number } = { expired: 0, restored: 0 }

    // Check active subscriptions that have passed their end_date
    const { data: expiredSubs } = await supabase
      .from("subscriptions")
      .select("restaurant_id, id")
      .eq("status", "active")
      .lt("end_date", now)

    if (expiredSubs && expiredSubs.length > 0) {
      const restaurantIds = [...new Set(expiredSubs.map((s) => s.restaurant_id))]

      // Mark subscriptions as expired
      for (const sub of expiredSubs) {
        const { error: subError } = await supabase
          .from("subscriptions")
          .update({ status: "expired" })
          .eq("id", sub.id)
          .eq("status", "active")

        if (!subError) results.expired++
      }

      // Suspend affected restaurants
      for (const rid of restaurantIds) {
        await supabase
          .from("restaurants")
          .update({ is_suspended: true, is_active: false })
          .eq("id", rid)
      }
    }

    // Check stale pending subscriptions older than 1 hour and mark as cancelled
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: stalePending } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("status", "pending")
      .lt("created_at", oneHourAgo)

    if (stalePending && stalePending.length > 0) {
      for (const sub of stalePending) {
        const { error: subError } = await supabase
          .from("subscriptions")
          .update({ status: "cancelled", notes: "Auto-cancelled: payment not completed within 1 hour" })
          .eq("id", sub.id)
          .eq("status", "pending")

        if (!subError) results.restored++
      }
    }

    console.log("[Cron] Subscription check complete", results)

    return NextResponse.json({
      status: "ok",
      ...results,
    })
  } catch (err) {
    console.error("[Cron] Subscription check error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
