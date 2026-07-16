import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { csrfGuard } from "@/lib/csrf"
import { checkRateLimit, getIp } from "@/lib/superadmin-security"

export const POST = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request); if (csrfResponse) return csrfResponse

  const ip = getIp(request)
  if (!await checkRateLimit(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

  const body = await request.json()
  const { name, email, message } = body

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 })
  }

  if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from("contact_inquiries").insert({
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  })

  if (error) {
    console.error("[Contact] Insert error:", error)
    return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
})
