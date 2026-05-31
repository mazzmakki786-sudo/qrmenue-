import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", body.restaurant_id)
    .eq("owner_id", user.id)
    .single()

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found or unauthorized" }, { status: 403 })
  }

  const { data: dish } = await supabase
    .from("dishes")
    .select("*")
    .eq("id", body.dish_id)
    .single()

  if (!dish) {
    return NextResponse.json({ error: "Dish not found" }, { status: 404 })
  }

  const { data: customers } = await supabase
    .from("orders")
    .select("customer_id")
    .eq("restaurant_id", body.restaurant_id)
    .not("customer_id", "is", null)

  const customerIds = [...new Set(customers?.map((c: any) => c.customer_id) || [])]

  if (customerIds.length > 0) {
    const { data: customerProfiles } = await supabase
      .from("customers")
      .select("email")
      .in("id", customerIds)
      .not("email", "is", null)

    const emails = customerProfiles?.map((c: any) => c.email).filter(Boolean) || []

    if (emails.length > 0) {
      await supabase.from("notification_logs").insert({
        restaurant_id: body.restaurant_id,
        type: "new_dish_email",
        recipient_email: emails.join(","),
        status: "sent",
      })
    }
  }

  return NextResponse.json({ success: true, notified: true })
}
