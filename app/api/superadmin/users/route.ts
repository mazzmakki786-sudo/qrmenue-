import { NextResponse } from "next/server"
import { safeRoute } from "@/lib/api-error"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { csrfGuard } from "@/lib/csrf"
import { isSuperAdmin, logAudit } from "@/lib/superadmin-security"
import { superadminAddOwnerSchema } from "@/lib/auth-validation"
import { generateRestaurantSlug } from "@/lib/slug"

export const GET = safeRoute(async (request) => {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isSuperAdmin(user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "100", 10)))

  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.listUsers({ perPage: limit, page })

  if (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 400 })
  }

  const users = data.users.map((u) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
  }))

  return NextResponse.json({ data: users, page, limit, total: data.total ?? users.length })
})

export const POST = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request); if (csrfResponse) return csrfResponse

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isSuperAdmin(user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await request.json()
  const parsed = superadminAddOwnerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({
      error: "Validation failed",
      details: parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    }, { status: 400 })
  }

  const { name, email, password } = parsed.data
  const city = parsed.data.city || "Unknown"
  const phone = parsed.data.phone || null
  const admin = createAdminClient()

  try {
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        phone: phone || undefined,
        city,
      },
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    if (!newUser?.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Generate the slug BEFORE insert — restaurants.slug is NOT NULL
    const slug = await generateRestaurantSlug(name, city)

    // Create restaurant linked to this new user
    const { data: restaurant, error: restError } = await admin
      .from("restaurants")
      .insert({
        owner_id: newUser.user.id,
        name,
        city,
        phone,
        slug,
        plan: "trial",
      })
      .select()
      .single()

    if (restError) {
      // Rollback: delete the auth user since restaurant creation failed
      await admin.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json({ error: "Failed to create restaurant: " + restError.message }, { status: 500 })
    }

    // Audit log
    if (user.email) {
      await logAudit(user.email, "user_created", {
        created_user_id: newUser.user.id,
        created_user_email: email,
        restaurant_id: restaurant.id,
        restaurant_name: name,
      })
    }

    return NextResponse.json({
      success: true,
      user: { id: newUser.user.id, email: newUser.user.email },
      restaurant: { id: restaurant.id, name, slug },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create user" }, { status: 500 })
  }
})
