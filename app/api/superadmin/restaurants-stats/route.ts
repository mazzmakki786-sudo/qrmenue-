import { NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== process.env.SUPER_ADMIN_EMAIL?.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "100", 10)))
  const offset = (page - 1) * limit

  const supabaseAdmin = createAdminClient()

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [allRestaurantsRes, allOrdersRes, countRes] = await Promise.all([
    supabaseAdmin
      .from("restaurants")
      .select("id, name, city, plan, plan_end_date, trial_end, is_active, image_upload_allowed, created_at")
      .range(offset, offset + limit - 1),
    supabaseAdmin
      .from("orders")
      .select("id, restaurant_id, total_price, order_status, created_at")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("restaurants")
      .select("id", { count: "exact", head: true }),
  ])

  const allRestaurants = allRestaurantsRes.data || []
  const allOrders = allOrdersRes.data || []
  const total = countRes.count ?? 0

  const stats: Record<string, { total_orders: number; revenue: number; last7: number; last30: number }> = {}
  allOrders.forEach((o: any) => {
    if (!stats[o.restaurant_id]) {
      stats[o.restaurant_id] = { total_orders: 0, revenue: 0, last7: 0, last30: 0 }
    }
    const s = stats[o.restaurant_id]
    s.total_orders += 1
    if (o.order_status !== "cancelled") s.revenue += o.total_price
    if (new Date(o.created_at) >= sevenDaysAgo) s.last7 += 1
    if (new Date(o.created_at) >= thirtyDaysAgo) s.last30 += 1
  })

  const restaurantsWithStats = allRestaurants.map((r: any) => ({
    ...r,
    total_orders: stats[r.id]?.total_orders || 0,
    revenue: stats[r.id]?.revenue || 0,
    last7_orders: stats[r.id]?.last7 || 0,
    last30_orders: stats[r.id]?.last30 || 0,
  }))

  return NextResponse.json({ data: restaurantsWithStats, page, limit, total })
}
