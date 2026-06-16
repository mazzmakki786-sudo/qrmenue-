import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"

export const GET = safeRoute(async (
  _request,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const ip = getClientIp(_request)
  const allowed = await rateLimit(ip, 30, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const { slug } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("restaurants")
    .select("*, categories(*, dishes(*))")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  return NextResponse.json({
    restaurant: data,
    categories: data.categories,
    dishes: data.categories.flatMap((c: any) => c.dishes),
  }, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  })
})
