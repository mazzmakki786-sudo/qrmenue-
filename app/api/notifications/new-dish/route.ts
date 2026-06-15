import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { escapeHtml } from "@/lib/utils"

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 10, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const supabase = await createClient()
  const body = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name")
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

  const admin = createAdminClient()

  // Find customers who ordered from this restaurant
  const { data: orders } = await admin
    .from("orders")
    .select("customer_id")
    .eq("restaurant_id", body.restaurant_id)
    .not("customer_id", "is", null)

  const customerIds = [...new Set(orders?.map((c: any) => c.customer_id) || [])]

  if (customerIds.length > 0) {
    const { data: customerProfiles } = await admin
      .from("customers")
      .select("email")
      .in("id", customerIds)
      .not("email", "is", null)

    const emails = customerProfiles?.map((c: any) => c.email).filter(Boolean) || []

    if (emails.length > 0 && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)

      const results = await Promise.allSettled(
        emails.map((email: string) =>
          resend.emails.send({
            from: "QRMenu.pk <onboarding@resend.dev>",
            to: email,
            subject: `New Dish Added: ${escapeHtml(dish.name_en)}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                <h1 style="font-size: 20px; color: #25D366;">New Dish Available!</h1>
                <p style="font-size: 15px; color: #333;">${escapeHtml(restaurant.name)} has added a new dish:</p>
                <div style="background: #F9FAFB; border-radius: 12px; padding: 16px; margin: 16px 0;">
                  <h2 style="font-size: 18px; margin: 0 0 4px;">${escapeHtml(dish.name_en)}${dish.name_ur ? ` / ${escapeHtml(dish.name_ur)}` : ""}</h2>
                  ${dish.description_en ? `<p style="color: #555; font-size: 14px; margin: 4px 0;">${escapeHtml(dish.description_en)}</p>` : ""}
                  ${dish.price ? `<p style="font-size: 20px; font-weight: bold; color: #000; margin: 8px 0 0;">Rs. ${dish.price}</p>` : ""}
                </div>
                <p style="color: #999; font-size: 13px;">Order now from ${escapeHtml(restaurant.name)}!</p>
              </div>
            `,
          })
        )
      )

      const notified = results.filter((r) => r.status === "fulfilled").length

      await admin.from("notification_logs").insert({
        restaurant_id: body.restaurant_id,
        type: "new_dish_email",
        recipient_email: emails.join(","),
        status: "sent",
      })
    }
  }

  return NextResponse.json({ success: true, notified: true })
}
