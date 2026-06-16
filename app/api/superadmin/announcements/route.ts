import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { SUPER_ADMIN_EMAIL, checkRateLimit, logAudit, getIp } from "@/lib/superadmin-security"

export const GET = safeRoute(async (request) => {
  const ip = getIp(request)
  if (!(await checkRateLimit(ip))) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("qr_announcements")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ announcements: data })
})

export const POST = safeRoute(async (request) => {
  const ip = getIp(request)
  if (!(await checkRateLimit(ip))) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.title || !body.title.trim() || !body.body || !body.body.trim()) {
    return NextResponse.json({ error: "title and body are required" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("qr_announcements")
    .insert({ title: body.title.trim(), body: body.body.trim(), created_by: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await logAudit(user.email || "", "announcement_created", { title: body.title })
  return NextResponse.json({ announcement: data })
})