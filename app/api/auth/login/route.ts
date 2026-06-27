import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { csrfGuard } from "@/lib/csrf"
import { getClientIp, rateLimit } from "@/lib/rate-limiter"
import { loginSchema, sanitize, logValidationFailure } from "@/lib/auth-validation"
import {
  checkLockout,
  getProgressiveDelay,
  recordLoginAttempt,
  clearLoginAttempts,
} from "@/lib/account-lockout"
import { sendLockoutAlert } from "@/lib/email"

const LOGIN_RATE_LIMIT_MAX = 10
const LOGIN_RATE_LIMIT_WINDOW = 60

export const POST = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const ip = getClientIp(request)

  const allowed = await rateLimit(ip, LOGIN_RATE_LIMIT_MAX, LOGIN_RATE_LIMIT_WINDOW)
  if (!allowed) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 429 }
    )
  }

  const body: unknown = await request.json()

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    logValidationFailure("POST /api/auth/login", parsed.error.issues, body)
    return NextResponse.json(
      { error: "Incorrect email or password" },
      { status: 400 }
    )
  }

  const { email, password } = parsed.data
  const sanitizedEmail = sanitize(email)

  const lockoutState = await checkLockout(sanitizedEmail)

  if (lockoutState.locked) {
    console.warn("[Auth Login] locked account attempt", {
      email: sanitizedEmail,
      ip,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json(
      { error: "Incorrect email or password" },
      { status: 401 }
    )
  }

  const delayMs = getProgressiveDelay(lockoutState.attemptNumber)
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: sanitizedEmail,
    password,
  })

  if (error || !data.user) {
    console.warn("[Auth Login] failure", {
      email: sanitizedEmail,
      ip,
      code: error?.code,
      attemptNumber: lockoutState.attemptNumber,
      timestamp: new Date().toISOString(),
    })

    await recordLoginAttempt(request, sanitizedEmail, false)

    const afterFailure = await checkLockout(sanitizedEmail)
    if (afterFailure.locked) {
      sendLockoutAlert(sanitizedEmail, ip, afterFailure.remainingMinutes ?? 15)
    }

    return NextResponse.json(
      { error: "Incorrect email or password" },
      { status: 401 }
    )
  }

  await clearLoginAttempts(sanitizedEmail)

  return NextResponse.json({
    user: { id: data.user.id, email: data.user.email },
  })
})
