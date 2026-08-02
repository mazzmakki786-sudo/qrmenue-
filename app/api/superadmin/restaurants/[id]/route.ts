import { NextResponse } from "next/server"
import { safeRoute } from "@/lib/api-error"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { csrfGuard } from "@/lib/csrf"
import { isSuperAdmin, logAudit } from "@/lib/superadmin-security"

async function checkAuth(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isSuperAdmin(user.email))) {
    return false
  }
  return true
}

export const GET = safeRoute(async (
  _request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const supabase = await createClient()

  if (!(await checkAuth(supabase))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("restaurants")
    .select("*, dishes(*), categories(*)")
    .eq("id", id)
    .single()

  if (error) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  return NextResponse.json({ restaurant: data })
})

export const DELETE = safeRoute(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const csrfResponse = csrfGuard(request); if (csrfResponse) return csrfResponse
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isSuperAdmin(user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const admin = createAdminClient()

  // Load the restaurant row so we know the owner and name (for cleanup + audit)
  const { data: restaurant, error: fetchError } = await admin
    .from("restaurants")
    .select("id, owner_id, name, slug")
    .eq("id", id)
    .maybeSingle()

  if (fetchError || !restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  const restaurantId = restaurant.id

  // Delete notification_logs first (NO ACTION FK on both restaurant_id and
  // order_id) — must go before orders are deleted.
  // 1) rows linked to this restaurant's orders
  await admin
    .from("notification_logs")
    .delete()
    .or(`order_id.in.(select id from orders where restaurant_id.eq.${restaurantId})`)
  // 2) any remaining rows scoped to this restaurant (e.g. no order linked)
  await admin.from("notification_logs").delete().eq("restaurant_id", restaurantId)

  // Delete orders (NO ACTION FK). Cascades to customer_notifications.
  await admin.from("orders").delete().eq("restaurant_id", restaurantId)

  // Delete subscriptions (NO ACTION FK).
  await admin.from("subscriptions").delete().eq("restaurant_id", restaurantId)

  // Delete the restaurant row. CASCADEs to categories, dishes, deals, favorites,
  // restaurant_tables, push_subscriptions, owner_notifications, owner_audit_log.
  const { error: deleteError } = await admin.from("restaurants").delete().eq("id", id)

  if (deleteError) {
    return NextResponse.json({ error: "Failed to delete restaurant: " + deleteError.message }, { status: 500 })
  }

  // Best-effort cleanup of the owner's auth user — must not block the delete.
  if (restaurant.owner_id) {
    try {
      await admin.auth.admin.deleteUser(restaurant.owner_id)
    } catch (err) {
      console.error("[superadmin] failed to delete owner auth user", restaurant.owner_id, err)
    }
  }

  if (user.email) {
    await logAudit(user.email, "restaurant_deleted", {
      restaurant_id: restaurantId,
      restaurant_name: restaurant.name,
      slug: restaurant.slug,
      deleted_owner_id: restaurant.owner_id ?? null,
    })
  }

  return NextResponse.json({ success: true })
})

export const PATCH = safeRoute(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const csrfResponse = csrfGuard(request); if (csrfResponse) return csrfResponse
  const { id } = await params
  const supabase = await createClient()

  if (!(await checkAuth(supabase))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const admin = createAdminClient()
  const body = await request.json()

  const allowedFields = ["name", "slug", "phone", "city", "logo_url", "is_active", "is_suspended", "language"]
  const updates: Record<string, any> = {}
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  const { data, error } = await admin
    .from("restaurants")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: "Failed to update restaurant" }, { status: 400 })
  }

  return NextResponse.json({ restaurant: data })
})
