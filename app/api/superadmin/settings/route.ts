import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { SUPER_ADMIN_EMAIL, checkRateLimit, logAudit, getIp } from "@/lib/superadmin-security"

async function checkAuth(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) return false
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
  const { data, error } = await admin.from("company_settings").select("*")

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const settings: Record<string, string> = {}
  data.forEach((s: any) => { settings[s.key] = s.value })
  return NextResponse.json({ settings })
})

export const PATCH = safeRoute(async (request) => {
  const ip = getIp(request)
  if (!await checkRateLimit(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

  const supabase = await createClient()
  if (!(await checkAuth(supabase))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await request.json()
  const admin = createAdminClient()

  for (const [key, value] of Object.entries(body)) {
    await admin.from("company_settings").upsert(
      { key, value: String(value) },
      { onConflict: "key" }
    )
  }

  const { data: { user } } = await supabase.auth.getUser()
  await logAudit(user?.email || "", "settings_updated", { keys: Object.keys(body) })

  return NextResponse.json({ success: true })
})
