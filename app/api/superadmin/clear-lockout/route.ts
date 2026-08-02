import { NextResponse } from "next/server"
import { safeRoute } from "@/lib/api-error"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/superadmin-security"

export const POST = safeRoute(async (request) => {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isSuperAdmin(user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const email = (user.email ?? "").toLowerCase()
  if (!email) {
    return NextResponse.json({ error: "Invalid user email" }, { status: 400 })
  }
  const admin = createAdminClient()

  // Clear superadmin login attempts
  await admin
    .from("superadmin_login_attempts")
    .delete()
    .eq("email", email)

  // Clear regular login attempts as well
  await admin
    .from("login_attempts")
    .delete()
    .eq("email", email)

  return NextResponse.json({
    success: true,
    message: "Lockout cleared for " + email,
  })
})
