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
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  const { data: customers, error } = await supabaseAdmin
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("id, customer_id, total_price, order_status, created_at, restaurant_id")

  const restaurantsRes = await supabaseAdmin
    .from("restaurants")
    .select("id, name")

  const restaurantMap = new Map(
    (restaurantsRes.data || []).map((r: any) => [r.id, r.name])
  )

  const customerStats: Record<string, { total_orders: number; total_spent: number; last_order: string | null }> = {}
  ;(orders || []).forEach((o) => {
    if (!o.customer_id) return
    if (!customerStats[o.customer_id]) {
      customerStats[o.customer_id] = { total_orders: 0, total_spent: 0, last_order: null }
    }
    const stat = customerStats[o.customer_id]
    stat.total_orders += 1
    if (o.order_status !== "cancelled") stat.total_spent += o.total_price
    if (!stat.last_order || o.created_at > stat.last_order) stat.last_order = o.created_at
  })

  const customersWithStats = (customers || []).map((c: any) => ({
    ...c,
    ...(customerStats[c.id] || { total_orders: 0, total_spent: 0, last_order: null }),
  }))

  return NextResponse.json({ customers: customersWithStats })
}
