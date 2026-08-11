import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { csrfGuard } from "@/lib/csrf"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import {
  emailSchema,
  nameSchema,
  citySchema,
  phoneSchema,
  sanitize,
  logValidationFailure,
} from "@/lib/auth-validation"
import { verifyCodeHash } from "@/lib/email-verification"
import { generateRestaurantSlug } from "@/lib/slug"
import { TRIAL_DURATION_DAYS } from "@/lib/subscription"
import { z } from "zod"

const VALID_PLANS = ["starter", "growth", "premium"]
const MAX_CODE_ATTEMPTS = 5

const verifySchema = z.object({
  email: emailSchema,
  code: z.string().min(6).max(6).regex(/^\d{6}$/),
  // Restaurant details submitted at signup, re-sent here so the restaurant
  // can be created once the email is confirmed (slug is server-generated).
  name: nameSchema.optional(),
  city: citySchema.optional(),
  phone: phoneSchema.optional().or(z.literal("")),
  plan: z.string().optional(),
})

export const POST = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 10, 60)
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    )
  }

  const body: unknown = await request.json()

  const parsed = verifySchema.safeParse(body)
  if (!parsed.success) {
    logValidationFailure("POST /api/auth/verify-email-code", parsed.error.issues, body)
    return NextResponse.json(
      { error: "Invalid verification code" },
      { status: 400 }
    )
  }

  const { email, code, name, city, phone, plan } = parsed.data
  const sanitizedEmail = sanitize(email)

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

  if (new Date(row.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "This code has expired. Please request a new one." },
      { status: 400 }
    )
  }

  if (row.attempts >= MAX_CODE_ATTEMPTS) {
    return NextResponse.json(
      { error: "Too many incorrect attempts. Please request a new code." },
      { status: 400 }
    )
  }

  if (!verifyCodeHash(code, row.code_hash)) {
    await admin
      .from("restaurant_signup_verification")
      .update({ attempts: row.attempts + 1 })
      .eq("id", row.id)
    return NextResponse.json(
      { error: "Incorrect verification code" },
      { status: 400 }
    )
  }

  // Code matches — mark the auth user's email as confirmed.
  const { error: confirmError } = await admin.auth.admin.updateUserById(row.user_id, {
    email_confirm: true,
  })
  if (confirmError) {
    console.warn("[Auth Verify Email Code] confirm failure", {
      email: sanitizedEmail,
      code: confirmError.code,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }

  // ── Create the restaurant now that the email is confirmed ──
  // ALWAYS trial — paid plans require superadmin activation (requested_plan).
  const hasPaidPlan = plan && VALID_PLANS.includes(plan)
  const restaurantName = name || "My Restaurant"

  const restaurantInsertData: Record<string, unknown> = {
    owner_id: row.user_id,
    name: restaurantName,
    slug: await generateRestaurantSlug(restaurantName, city || null),
    phone: phone || "",
    city: city || "",
    plan: "trial",
    requested_plan: hasPaidPlan ? plan : null,
    trial_start: new Date().toISOString(),
    trial_end: new Date(Date.now() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    image_upload_allowed: true,
    is_active: true,
    is_suspended: false,
    delivery_time_min: 30,
  }

  const { data: restaurantRow, error: restaurantError } = await admin
    .from("restaurants")
    .insert(restaurantInsertData)
    .select("id, slug")
    .maybeSingle()

  if (restaurantError) {
    console.warn("[Auth Verify Email Code] restaurant insert failure", {
      email: sanitizedEmail,
      code: restaurantError.code,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }

  // Clear the verification row — it has served its purpose.
  await admin.from("restaurant_signup_verification").delete().eq("email", sanitizedEmail)

  return NextResponse.json({
    success: true,
    slug: restaurantRow?.slug,
  })
})
