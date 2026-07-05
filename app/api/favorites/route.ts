import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { csrfGuard } from "@/lib/csrf"
import { checkRateLimit } from "@/lib/rate-limiter"
import { z } from "zod"

const favoritesPostSchema = z.object({
  restaurant_id: z.string().uuid(),
})

export const GET = safeRoute(async (request) => {
  await checkRateLimit(request, "favorites:write")

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ favorites: [] })
  }

  const { data: favorites } = await supabase
    .from("favorites")
    .select("restaurant_id")
    .eq("user_id", user.id)

  return NextResponse.json({
    favorites: (favorites ?? []).map((f) => f.restaurant_id),
  })
})

export const POST = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  await checkRateLimit(request, "favorites:write")

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to save favorites" },
      { status: 401 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = favoritesPostSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "restaurant_id is required" }, { status: 400 })
  }

  const { restaurant_id } = parsed.data

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("restaurant_id", restaurant_id)
    .single()

  if (existing) {
    await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id)

    return NextResponse.json({ favorited: false })
  } else {
    await supabase
      .from("favorites")
      .insert({ user_id: user.id, restaurant_id })

    return NextResponse.json({ favorited: true })
  }
})
