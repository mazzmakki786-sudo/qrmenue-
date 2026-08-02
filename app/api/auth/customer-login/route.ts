import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { createAdminClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { csrfGuard } from "@/lib/csrf"
import { getClientIp, rateLimit } from "@/lib/rate-limiter"
import { customerLoginSchema, logValidationFailure } from "@/lib/auth-validation"
import {
  checkLockout,
  getProgressiveDelay,
  recordLoginAttempt,
  clearLoginAttempts,
} from "@/lib/account-lockout"
import { sendLockoutAlert } from "@/lib/email"
import type { NextRequest } from "next/server"

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

  const parsed = customerLoginSchema.safeParse(body)
  if (!parsed.success) {
    logValidationFailure("POST /api/auth/customer-login", parsed.error.issues, body)
    return NextResponse.json(
      { error: "Incorrect phone or password" },
      { status: 400 }
    )
  }

  const { phone, password } = parsed.data
  // phoneSchema normalizes to canonical 11-digit form — use it for lookup.
  const normalizedPhone = phone

  // Look up the customer's internal email by phone number
  const admin = createAdminClient()
  const { data: customer, error: customerError } = await admin
    .from("customers")
    .select("email, id")
    .eq("phone", normalizedPhone)
    .maybeSingle()

  if (customerError || !customer?.email) {
    console.warn("[Auth Customer Login] customer not found", {
      phone: normalizedPhone,
      ip,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json(
      { error: "Incorrect phone or password" },
      { status: 401 }
    )
  }

  const email = customer.email

  const lockoutState = await checkLockout(email)

  if (lockoutState.locked) {
    console.warn("[Auth Customer Login] locked account attempt", {
      email,
      ip,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json(
      { error: "Incorrect phone or password" },
      { status: 401 }
    )
  }

  const delayMs = getProgressiveDelay(lockoutState.attemptNumber)
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  let authCookies: { name: string; value: string; options?: any }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return (request as NextRequest).cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            (request as NextRequest).cookies.set(name, value)
          )
          authCookies = cookiesToSet
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    console.warn("[Auth Customer Login] auth failure", {
      email,
      ip,
      code: error?.code,
      attemptNumber: lockoutState.attemptNumber,
      timestamp: new Date().toISOString(),
    })

    await recordLoginAttempt(request, email, false)

    const afterFailure = await checkLockout(email)
    if (afterFailure.locked) {
      sendLockoutAlert(email, ip, afterFailure.remainingMinutes ?? 15)
    }

    return NextResponse.json(
      { error: "Incorrect phone or password" },
      { status: 401 }
    )
  }

  await clearLoginAttempts(email)

  const jsonResponse = NextResponse.json({
    user: { id: data.user.id },
  })

  authCookies.forEach(({ name, value, options }) => {
    jsonResponse.cookies.set(name, value, options)
  })

  return jsonResponse
})
