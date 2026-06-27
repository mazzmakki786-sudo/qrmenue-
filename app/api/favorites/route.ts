import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
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
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to save favorites" },
      { status: 401 }
    )
  }

  const { restaurant_id } = await request.json()
  if (!restaurant_id) {
    return NextResponse.json(
      { error: "restaurant_id is required" },
      { status: 400 }
    )
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("restaurant_id", restaurant_id)
    .single()

  if (existing) {
    // Unfavorite
    await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id)

    return NextResponse.json({ favorited: false })
  } else {
    // Favorite
    await supabase
      .from("favorites")
      .insert({ user_id: user.id, restaurant_id })

    return NextResponse.json({ favorited: true })
  }
}
