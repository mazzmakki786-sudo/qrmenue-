import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== process.env.SUPER_ADMIN_EMAIL?.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const supabaseAdmin = (await import("@supabase/supabase-js")).createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, customer_id, customer_name, customer_phone, total_price, order_status, order_type, created_at")
    .eq("restaurant_id", id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Group by customer
  const customerMap: Record<string, any> = {}
  ;(orders || []).forEach((o: any) => {
    const key = o.customer_id || o.customer_phone || o.customer_name || "anonymous"
    if (!customerMap[key]) {
      customerMap[key] = {
        id: o.customer_id,
        name: o.customer_name,
        phone: o.customer_phone,
        orders: [],
        total_orders: 0,
        total_spent: 0,
        last_order: null,
      }
    }
    const c = customerMap[key]
    c.orders.push(o)
    c.total_orders += 1
    if (o.order_status !== "cancelled") c.total_spent += o.total_price
    if (!c.last_order || o.created_at > c.last_order) c.last_order = o.created_at
  })

  const customers = Object.values(customerMap).sort(
    (a: any, b: any) => b.total_spent - a.total_spent
  )

  return NextResponse.json({ customers, orders: orders || [] })
}
