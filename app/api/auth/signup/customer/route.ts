import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { csrfGuard } from "@/lib/csrf"
import { checkRateLimit } from "@/lib/rate-limiter"
import { customerSignupSchema, sanitize, logValidationFailure } from "@/lib/auth-validation"

export const POST = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  await checkRateLimit(request, "orders:create")

  const body: unknown = await request.json()

  const parsed = customerSignupSchema.safeParse(body)
  if (!parsed.success) {
    logValidationFailure("POST /api/auth/signup/customer", parsed.error.issues, body)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 400 }
    )
  }

  const { name, email, password } = parsed.data
  const admin = createAdminClient()

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: sanitize(email),
    password,
    email_confirm: true,
    user_metadata: { full_name: sanitize(name) },
  })

  if (authError) {
    console.warn("[Auth Customer Signup] auth failure", {
      email,
      code: authError.code,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 400 }
    )
  }

  const { error: insertError } = await admin.from("customers").insert({
    id: authData.user.id,
    name: sanitize(name),
    email: sanitize(email),
  })

  if (insertError) {
    console.warn("[Auth Customer Signup] db insert failure", {
      email,
      code: insertError.code,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
})
