import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { safeRoute } from "@/lib/api-error"

export const GET = safeRoute(async (request) => {
  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 30, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

  const { data, error } = await supabase
    .from("ai_posts")
    .select("*, images:ai_post_images(*)")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 400 })
  }

  return NextResponse.json({ posts: data })
})

export const DELETE = safeRoute(async (request) => {
  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 15, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { id } = body
  if (!id) return NextResponse.json({ error: "Post id required" }, { status: 400 })

  // Verify ownership
  const { data: post } = await supabase
    .from("ai_posts")
    .select("restaurant_id")
    .eq("id", id)
    .single()

  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })
  if (post.restaurant_id !== restaurant.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { error } = await supabase
    .from("ai_posts")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 400 })
  }

  return NextResponse.json({ success: true })
})
