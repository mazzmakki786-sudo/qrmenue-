import { NextResponse } from "next/server"
import { safeRoute } from "@/lib/api-error"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { csrfGuard } from "@/lib/csrf"

async function checkAuth(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== process.env.SUPER_ADMIN_EMAIL?.toLowerCase()) {
    return false
  }
  return true
}

export const GET = safeRoute(async (
  _request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const supabase = await createClient()

  if (!(await checkAuth(supabase))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("restaurants")
    .select("*, dishes(*), categories(*)")
    .eq("id", id)
    .single()

  if (error) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  return NextResponse.json({ restaurant: data })
})

export const PATCH = safeRoute(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const csrfResponse = csrfGuard(request); if (csrfResponse) return csrfResponse
  const { id } = await params
  const supabase = await createClient()

  if (!(await checkAuth(supabase))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const admin = createAdminClient()
  const body = await request.json()

  const allowedFields = ["name", "slug", "phone", "city", "logo_url", "is_active", "is_suspended", "language"]
  const updates: Record<string, any> = {}
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  const { data, error } = await admin
    .from("restaurants")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ restaurant: data })
})
