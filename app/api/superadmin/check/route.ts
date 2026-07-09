import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { checkRateLimit, isLockedOut, recordLoginAttempt, logAudit, getIp, isSuperAdmin, ensureSuperAdminEmail, seedFromEnvVar } from "@/lib/superadmin-security"

export const GET = safeRoute(async (request) => {
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
    })
  }

  await seedFromEnvVar()
  await ensureSuperAdminEmail(email)

  const isSA = await isSuperAdmin(email)
  await recordLoginAttempt(email, ip, isSA)
  await logAudit(email, isSA ? "login_success" : "login_failed", { ip })

  return NextResponse.json({ isSuperAdmin: isSA })
})
