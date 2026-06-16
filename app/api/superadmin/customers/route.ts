import { NextRequest, NextResponse } from "next/server"
import { safeRoute } from "@/lib/api-error"
import { createClient, createAdminClient } from "@/lib/supabase/server"

export const GET = safeRoute(async (request) => {
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

  const [customersRes, countRes, ordersRes, restaurantsRes] = await Promise.all([
    supabaseAdmin
      .from("customers")
      .select("id, name, phone, email, city, created_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1),
    supabaseAdmin
      .from("customers")
      .select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("orders")
      .select("id, customer_id, total_price, order_status, created_at, restaurant_id")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("restaurants")
      .select("id, name"),
  ])

  if (customersRes.error) {
    return NextResponse.json({ error: customersRes.error.message }, { status: 400 })
  }

  const customers = customersRes.data || []
  const orders = ordersRes.data || []
  const total = countRes.count ?? 0

  const restaurantMap = new Map(
    (restaurantsRes.data || []).map((r: any) => [r.id, r.name])
  )

  const customerStats: Record<string, { total_orders: number; total_spent: number; last_order: string | null }> = {}
  orders.forEach((o) => {
    if (!o.customer_id) return
    if (!customerStats[o.customer_id]) {
      customerStats[o.customer_id] = { total_orders: 0, total_spent: 0, last_order: null }
    }
    const stat = customerStats[o.customer_id]
    stat.total_orders += 1
    if (o.order_status !== "cancelled") stat.total_spent += o.total_price
    if (!stat.last_order || o.created_at > stat.last_order) stat.last_order = o.created_at
  })

  const customersWithStats = customers.map((c: any) => ({
    ...c,
    ...(customerStats[c.id] || { total_orders: 0, total_spent: 0, last_order: null }),
  }))

  return NextResponse.json({ data: customersWithStats, page, limit, total })
})
