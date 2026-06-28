import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"

export const POST = safeRoute(async (request) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { favorite_ids } = await request.json()
  if (!Array.isArray(favorite_ids)) {
    return NextResponse.json({ error: "favorite_ids must be an array" }, { status: 400 })
  }

  const admin = createAdminClient()

  // Get current DB favorites
  const { data: existing } = await admin
    .from("favorites")
    .select("id, restaurant_id")
    .eq("user_id", user.id)

  const existingIds = new Set((existing ?? []).map((f) => f.restaurant_id))
  const incomingIds = new Set(favorite_ids)

  // IDs to add: in incoming but not in existing
  const toAdd = favorite_ids.filter((id) => !existingIds.has(id))
  // IDs to remove: in existing but not in incoming
  const toRemove = (existing ?? []).filter((f) => !incomingIds.has(f.restaurant_id))

  // Batch insert
  if (toAdd.length > 0) {
    const inserts = toAdd.map((restaurant_id: string) => ({
      user_id: user.id,
      restaurant_id,
    }))
    const { error: insertError } = await admin.from("favorites").insert(inserts)
    if (insertError) {
      console.error("Favorites sync insert error:", insertError)
      return NextResponse.json({ error: "Failed to sync favorites" }, { status: 500 })
    }
  }

  // Batch delete
  if (toRemove.length > 0) {
    const removeIds = toRemove.map((f) => f.id)
    const { error: deleteError } = await admin
      .from("favorites")
      .delete()
      .in("id", removeIds)
    if (deleteError) {
      console.error("Favorites sync delete error:", deleteError)
      return NextResponse.json({ error: "Failed to sync favorites" }, { status: 500 })
    }
  }

  return NextResponse.json({ synced: true, added: toAdd.length, removed: toRemove.length })
})
