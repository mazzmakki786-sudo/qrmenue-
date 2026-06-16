import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"

export async function GET(request: Request) {
  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 15, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const restaurantId = searchParams.get("restaurant_id")

  if (!restaurantId) {
    return NextResponse.json({ error: "Missing restaurant_id" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", restaurantId)
    .eq("is_active", true)
    .single()

  if (!data) {
    return NextResponse.json({ error: "Restaurant not found or inactive" }, { status: 404 })
  }

  return NextResponse.json({ valid: true })
}
