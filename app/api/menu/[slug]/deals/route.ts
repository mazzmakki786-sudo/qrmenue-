import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"

export const GET = safeRoute(async (request, { params }) => {
  const { slug } = await params

  const supabase = await createClient()
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle()

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("deals")
    .select("*, dish:dishes!dish_id(id, name_en, name_ur, image_url, price)")
    .eq("restaurant_id", restaurant.id)
    .eq("is_active", true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 400 })
  }

  return NextResponse.json({ deals: data })
})
