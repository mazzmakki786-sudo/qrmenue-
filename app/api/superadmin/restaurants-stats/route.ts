import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const supabaseAdmin = (await import("@supabase/supabase-js")).createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [allRestaurantsRes, allOrdersRes] = await Promise.all([
    supabaseAdmin
      .from("restaurants")
      .select("id, name, city, plan, plan_end_date, trial_end, is_active, image_upload_allowed, created_at"),
    supabaseAdmin
      .from("orders")
      .select("id, restaurant_id, total_price, order_status, created_at"),
  ])

  const allRestaurants = allRestaurantsRes.data || []
  const allOrders = allOrdersRes.data || []

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

  return NextResponse.json({ restaurants: restaurantsWithStats })
}
