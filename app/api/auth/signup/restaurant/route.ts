import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { csrfGuard } from "@/lib/csrf"
import { checkRateLimit } from "@/lib/rate-limiter"
import { restaurantSignupSchema, sanitize, logValidationFailure } from "@/lib/auth-validation"
import { slugify } from "@/lib/utils"

export const POST = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  await checkRateLimit(request, "orders:create")

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
  const admin = createAdminClient()

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: sanitize(email),
    password,
    email_confirm: true,
    user_metadata: { full_name: sanitize(name), role: "owner" },
  })

  if (authError) {
    console.warn("[Auth Restaurant Signup] auth failure", {
      email,
      code: authError.code,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 400 }
    )
  }

  const ownerId = authData.user.id
  const slug = `${slugify(sanitize(name))}-${Date.now().toString(36)}`

  const { error: dbError } = await admin.from("restaurants").insert({
    owner_id: ownerId,
    name: sanitize(name),
    slug,
    phone: sanitize(phone),
    city: sanitize(city),
    plan: "trial",
    trial_start: new Date().toISOString(),
    trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    image_upload_allowed: true,
    is_active: true,
  })

  if (dbError) {
    console.warn("[Auth Restaurant Signup] db insert failure", {
      email,
      code: dbError.code,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, slug })
})
