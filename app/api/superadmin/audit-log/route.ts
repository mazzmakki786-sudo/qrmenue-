import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { SUPER_ADMIN_EMAIL, checkRateLimit, getIp } from "@/lib/superadmin-security"

export async function GET(request: Request) {
  const ip = getIp(request)
  if (!await checkRateLimit(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("superadmin_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ logs: data || [] })
}
