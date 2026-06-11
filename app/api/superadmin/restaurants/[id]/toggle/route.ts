import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== process.env.SUPER_ADMIN_EMAIL?.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await request.json()
  const allowed: Record<string, any> = {}
  if (typeof body.is_active === "boolean") allowed.is_active = body.is_active
  if (typeof body.is_suspended === "boolean") allowed.is_suspended = body.is_suspended
  if (body.plan && ["trial", "starter", "growth", "premium"].includes(body.plan)) {
    allowed.plan = body.plan
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
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ restaurant: data })
}
