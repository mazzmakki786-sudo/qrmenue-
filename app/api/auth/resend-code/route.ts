import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { csrfGuard } from "@/lib/csrf"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { emailSchema, sanitize, logValidationFailure } from "@/lib/auth-validation"
import { generateEmailVerificationCode, sendVerificationEmail } from "@/lib/email-verification"

const CODE_EXPIRY_MINUTES = 15

export const POST = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 5, 60)
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    )
  }

  const body: unknown = await request.json()

  const parsed = emailSchema.safeParse((body as Record<string, unknown> | null)?.email)
  if (!parsed.success) {
    logValidationFailure("POST /api/auth/resend-code", parsed.error.issues, body)
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  const sanitizedEmail = sanitize(parsed.data)
  const admin = createAdminClient()

  const { data: row, error: rowError } = await admin
    .from("restaurant_signup_verification")
    .select("*")
    .eq("email", sanitizedEmail)
    .maybeSingle()

  if (rowError || !row) {
    return NextResponse.json(
      { error: "No verification request found. Please sign up again." },
      { status: 400 }
    )
  }

  // Regenerate the code and reset attempts/expiry.
  const { code, codeHash } = generateEmailVerificationCode()
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000)

  const { error: updateError } = await admin
    .from("restaurant_signup_verification")
    .update({ code_hash: codeHash, expires_at: expiresAt.toISOString(), attempts: 0 })
    .eq("id", row.id)

  if (updateError) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }

  void sendVerificationEmail(sanitizedEmail, code)

  return NextResponse.json({ success: true, code_sent: true })
})
