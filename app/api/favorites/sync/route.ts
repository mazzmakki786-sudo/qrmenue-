import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { csrfGuard } from "@/lib/csrf"
import { checkRateLimit } from "@/lib/rate-limiter"
import { z } from "zod"

const syncSchema = z.object({
  favorite_ids: z.array(z.string().uuid()),
})

export const POST = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  await checkRateLimit(request, "favorites:write")

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = syncSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "favorite_ids must be an array of UUIDs" }, { status: 400 })
  }

  const { favorite_ids } = parsed.data
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from("favorites")
    .select("id, restaurant_id")
    .eq("user_id", user.id)

  const existingIds = new Set((existing ?? []).map((f) => f.restaurant_id))
  const incomingIds = new Set(favorite_ids)

  const toAdd = favorite_ids.filter((id) => !existingIds.has(id))
  const toRemove = (existing ?? []).filter((f) => !incomingIds.has(f.restaurant_id))

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
