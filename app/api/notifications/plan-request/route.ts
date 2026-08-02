import { NextResponse } from "next/server"
import { safeRoute } from "@/lib/api-error"
import { csrfGuard } from "@/lib/csrf"
import { checkRateLimit } from "@/lib/rate-limiter"
import { sendPlanRequestAlert } from "@/lib/email/planRequestAlert"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * POST /api/notifications/plan-request
 *
 * Sends a plan-request notification to the superadmin via email (Resend)
 * after a restaurant signs up with a paid plan (starter/growth/premium).
 *
 * Called client-side after the restaurant is created with requested_plan set.
 */
export const POST = safeRoute(async (req) => {
  const csrfResponse = csrfGuard(req)
  if (csrfResponse) return csrfResponse

  await checkRateLimit(req, "notifications:send")

  const body = await req.json()
  const { restaurant_id, restaurant_slug } = body

  if (!restaurant_id && !restaurant_slug) {
    return NextResponse.json({ error: "restaurant_id or restaurant_slug is required" }, { status: 400 })
  }

  const admin = createAdminClient()

  // Fetch restaurant + owner details
  const query = admin.from("restaurants").select("*, owner_id")
  if (restaurant_id) {
    query.eq("id", restaurant_id)
  } else {
    query.eq("slug", restaurant_slug)
  }
  const { data: restaurant, error: rErr } = await query.single()

  if (rErr || !restaurant) {
    console.error("[PlanRequest] Restaurant not found:", restaurant_id, rErr)
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  // Only notify if there's a requested plan
  if (!restaurant.requested_plan) {
    return NextResponse.json({ error: "No requested plan" }, { status: 400 })
  }

  // Get owner email
  const { data: ownerUser } = await admin.auth.admin.getUserById(restaurant.owner_id)
  const ownerEmail = ownerUser?.user?.email || "Not available"

  const planLabel =
    restaurant.requested_plan.charAt(0).toUpperCase() +
    restaurant.requested_plan.slice(1)

  // Send email to superadmin
  await sendPlanRequestAlert({
    restaurantName: restaurant.name,
    restaurantPhone: restaurant.phone || "Not provided",
    ownerEmail,
    plan: planLabel,
    slug: restaurant.slug,
    city: restaurant.city || "",
  })

  console.log("[PlanRequest] Notification sent for", restaurant.name, "-", planLabel)

  return NextResponse.json({ success: true })
})
