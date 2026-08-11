import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { csrfGuard } from "@/lib/csrf"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { restaurantSignupSchema, sanitize, logValidationFailure } from "@/lib/auth-validation"
import { generateEmailVerificationCode, sendVerificationEmail } from "@/lib/email-verification"
import { TRIAL_DURATION_DAYS } from "@/lib/subscription"

const VALID_PLANS = ["starter", "growth", "premium"]
const CODE_EXPIRY_MINUTES = 15
const SIGNUP_RATE_LIMIT_MAX = 5
const SIGNUP_RATE_LIMIT_WINDOW = 60

export const POST = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, SIGNUP_RATE_LIMIT_MAX, SIGNUP_RATE_LIMIT_WINDOW)
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again later." },
      { status: 429 }
    )
  }

  const body: unknown = await request.json()

  const parsed = restaurantSignupSchema.safeParse(body)
  if (!parsed.success) {
    logValidationFailure("POST /api/auth/signup/restaurant", parsed.error.issues, body)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 400 }
    )
  }

  const { name, city, phone, email, password } = parsed.data
  const bodyRecord = body as Record<string, unknown>
  const selectedPlan = bodyRecord.plan as string | undefined
  const hasPaidPlan = selectedPlan && VALID_PLANS.includes(selectedPlan)

  const admin = createAdminClient()

  const sanitizedEmail = sanitize(email)

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: sanitizedEmail,
    password,
    email_confirm: false, // must verify via 6-digit code before the account activates
    user_metadata: { full_name: sanitize(name), role: "owner" },
  })

  if (authError) {
    console.warn("[Auth Restaurant Signup] auth failure", {
      email: sanitizedEmail,
      code: authError.code,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 400 }
    )
  }

  const ownerId = authData.user.id

  // Generate the 6-digit code — only its hash is persisted.
  const { code, codeHash } = generateEmailVerificationCode()
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000)

  const { error: codeDbError } = await admin
    .from("restaurant_signup_verification")
    .insert({
      email: sanitizedEmail,
      user_id: ownerId,
      code_hash: codeHash,
      expires_at: expiresAt.toISOString(),
    })

  if (codeDbError) {
    // Roll back the auth user so the email isn't stuck half-registered.
    await admin.auth.admin.deleteUser(ownerId)
    console.warn("[Auth Restaurant Signup] verification insert failure", {
      email: sanitizedEmail,
      code: codeDbError.code,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }

  // Fire-and-forget — the signup already succeeded, the email is best-effort.
  void sendVerificationEmail(sanitizedEmail, code)

  return NextResponse.json({ success: true, code_sent: true, plan: selectedPlan || "trial" })
})
