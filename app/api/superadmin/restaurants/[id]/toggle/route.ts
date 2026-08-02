import { NextResponse } from "next/server"
import { safeRoute } from "@/lib/api-error"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { csrfGuard } from "@/lib/csrf"
import { isSuperAdmin } from "@/lib/superadmin-security"
import { invalidateOrderCount } from "@/lib/subscription-usage"

export const PATCH = safeRoute(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const csrfResponse = csrfGuard(request); if (csrfResponse) return csrfResponse
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isSuperAdmin(user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await request.json()
  const allowed: Record<string, any> = {}
  if (typeof body.is_active === "boolean") allowed.is_active = body.is_active
  if (typeof body.is_suspended === "boolean") allowed.is_suspended = body.is_suspended
  if (body.plan && typeof body.plan === "string") {
    allowed.plan = body.plan
    allowed.plan_start_date = new Date().toISOString()
    // Old plan's custom caps must not keep overriding the new plan's limits.
    // Only clear when the request isn't providing a fresh override in the same call.
    if (body.plan_limits_override === undefined) {
      allowed.plan_limits_override = null
    }
  }
  if (body.plan_end_date !== undefined) {
    allowed.plan_end_date = body.plan_end_date ? new Date(body.plan_end_date).toISOString() : null
  }
  if (typeof body.image_upload_allowed === "boolean") {
    allowed.image_upload_allowed = body.image_upload_allowed
  }
  if (body.plan_limits_override !== undefined) {
    allowed.plan_limits_override = body.plan_limits_override
  }
  if (body.requested_plan !== undefined) {
    allowed.requested_plan = body.requested_plan
  }

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("restaurants")
    .update(allowed)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: "Failed to toggle restaurant" }, { status: 400 })
  }

  // Plan change → the order usage counter anchors to the new plan_start_date,
  // so drop any stale cached count from the previous plan period.
  if (allowed.plan) {
    invalidateOrderCount(id)
  }

  return NextResponse.json({ restaurant: data })
})
