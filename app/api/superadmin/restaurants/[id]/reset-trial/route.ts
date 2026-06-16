import { NextResponse } from "next/server"
import { safeRoute } from "@/lib/api-error"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { csrfGuard } from "@/lib/csrf"

export const POST = safeRoute(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const csrfResponse = csrfGuard(request); if (csrfResponse) return csrfResponse
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== process.env.SUPER_ADMIN_EMAIL?.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const supabaseAdmin = createAdminClient()

  const { data: existing } = await supabaseAdmin
    .from("restaurants")
    .select("id, name, plan")
    .eq("id", id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  const { data: trialEnd } = await supabaseAdmin
    .from("restaurants")
    .select("trial_end")
    .eq("id", id)
    .single()

  const now = new Date().toISOString()
  const newTrialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabaseAdmin
    .from("restaurants")
    .update({
      plan: "trial",
      trial_start: now,
      trial_end: newTrialEnd,
      plan_start_date: now,
      plan_end_date: null,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await supabaseAdmin
    .from("trial_reminder_emails")
    .delete()
    .eq("restaurant_id", id)

  return NextResponse.json({
    success: true,
    message: `Trial reset for ${existing.name}. New trial ends ${new Date(newTrialEnd).toLocaleDateString()}.`,
    restaurant: data,
  })
})
