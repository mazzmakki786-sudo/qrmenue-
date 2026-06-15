import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { SUPER_ADMIN_EMAIL, checkRateLimit, isLockedOut, recordLoginAttempt, logAudit, getIp } from "@/lib/superadmin-security"

export async function GET(request: Request) {
  const ip = getIp(request)
  if (!await checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ isSuperAdmin: false })
  }

  const email = user.email?.toLowerCase() || ""

  if (await isLockedOut(email)) {
    await logAudit(email, "login_blocked_locked_out", { ip })
    return NextResponse.json({
      isSuperAdmin: false,
      locked: true,
      message: "Account temporarily locked due to multiple failed attempts.",
    })
  }

  const isSuperAdmin = email === SUPER_ADMIN_EMAIL
  await recordLoginAttempt(email, ip, isSuperAdmin)
  await logAudit(email, isSuperAdmin ? "login_success" : "login_failed", { ip })

  return NextResponse.json({ isSuperAdmin })
}
