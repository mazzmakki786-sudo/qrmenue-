import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { SUPER_ADMIN_EMAIL, checkRateLimit, logAudit, getIp } from "@/lib/superadmin-security"
import { csrfGuard } from "@/lib/csrf"

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
  const { data, error } = await admin
    .from("plans")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ plans: data })
})
