import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { isSuperAdmin, checkRateLimit, getIp } from "@/lib/superadmin-security"
import { csrfGuard } from "@/lib/csrf"

async function checkAuth(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isSuperAdmin(user.email))) return false
  return true
}

export const GET = safeRoute(async (request) => {
  const ip = getIp(request)
  if (!await checkRateLimit(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

  const supabase = await createClient()
  if (!(await checkAuth(supabase))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("contact_inquiries")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 400 })

  return NextResponse.json({ inquiries: data })
})

export const PATCH = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request); if (csrfResponse) return csrfResponse
  const ip = getIp(request)
  if (!await checkRateLimit(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

  const supabase = await createClient()
  if (!(await checkAuth(supabase))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: "Missing inquiry id" }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin
    .from("contact_inquiries")
    .update({ is_read: true })
    .eq("id", id)

  if (error) return NextResponse.json({ error: "Failed to update inquiry" }, { status: 400 })

  return NextResponse.json({ success: true })
})
