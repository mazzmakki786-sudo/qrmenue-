import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limiter"
import { safeRoute } from "@/lib/api-error"
import { isSuperAdmin } from "@/lib/superadmin-security"

async function checkSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isSuperAdmin(user.email))) return false
  return true
}

export const GET = safeRoute(async (request) => {
  await checkRateLimit(request, "superadmin:read")

  if (!(await checkSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()
  const url = new URL(request.url)
  const restaurantId = url.searchParams.get("restaurant_id")

  let query = admin
    .from("ai_posts")
    .select("*, restaurant:restaurants!restaurant_id(name, slug, plan)")

  if (restaurantId) {
    query = query.eq("restaurant_id", restaurantId)
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 400 })
  }

  return NextResponse.json({ posts: data })
})
