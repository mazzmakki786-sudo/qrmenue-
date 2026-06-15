import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { SUPER_ADMIN_EMAIL, checkRateLimit, logAudit, getIp } from "@/lib/superadmin-security"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ip = getIp(request)
  if (!(await checkRateLimit(ip))) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id } = await params
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from("qr_announcements")
    .select("id")
    .eq("id", id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
  }

  const { error } = await admin.from("qr_announcements").delete().eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await logAudit(user.email || "", "announcement_deleted", { id })
  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ip = getIp(request)
  if (!(await checkRateLimit(ip))) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id } = await params

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: existing } = await admin
    .from("qr_announcements")
    .select("id")
    .eq("id", id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
  }

  const updates: any = {}
  if (body.title !== undefined) updates.title = body.title
  if (body.body !== undefined) updates.body = body.body
  if (body.is_published !== undefined) updates.is_published = body.is_published

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  const { data, error } = await admin
    .from("qr_announcements")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await logAudit(user.email || "", "announcement_updated", { id, ...updates })
  return NextResponse.json({ announcement: data })
}