import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"
import { escapeHtml } from "@/lib/utils"

let _r: Resend | null = null
function get() {
  if (!_r) _r = new Resend(process.env.RESEND_API_KEY!)
  return _r
}

const FROM = "QRMenu.pk <noreply@qrmenu.pk>"
const DAILY_THRESHOLD = 10

export async function checkAndSendOrderLimitAlert(restaurantId: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return

  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, owner_id")
    .eq("id", restaurantId)
    .single()

  if (!restaurant) return

  const { data: owner } = await supabase.auth.admin.getUserById(restaurant.owner_id)
  const ownerEmail = owner?.user?.email
  if (!ownerEmail) return

  const today = new Date().toISOString().split("T")[0]
  const { count: todayCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId)
    .gte("created_at", today)
    .neq("order_status", "cancelled")

  const count = todayCount ?? 0
  if (count < DAILY_THRESHOLD) return

  const { data: existing } = await supabase
    .from("notification_logs")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .eq("type", "order_limit_alert")
    .gte("created_at", today)
    .maybeSingle()

  if (existing) return

  try {
    const { error } = await get().emails.send({
      from: FROM,
      to: ownerEmail,
      subject: `You've received ${count} orders today — QRMenu.pk`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111;">
          <h1 style="font-size: 22px; margin-bottom: 8px;">${escapeHtml(restaurant.name)}, you're busy today!</h1>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">
            You've received <strong>${count} orders</strong> today. Your restaurant is doing great!
          </p>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">
            Keep an eye on your <a href="${process.env.NEXT_PUBLIC_APP_URL || ""}/dashboard/orders" style="color: #25D366;">orders dashboard</a> to stay on top of incoming orders.
          </p>
          <div style="margin-top: 32px; padding: 20px; background: #F8F8F8; border-radius: 12px; text-align: center;">
            <p style="font-size: 36px; font-weight: bold; margin: 0;">${count}</p>
            <p style="color: #555; font-size: 14px; margin: 4px 0 0;">orders today</p>
          </div>
        </div>
      `,
    })

    if (!error) {
      await supabase.from("notification_logs").insert({
        restaurant_id: restaurantId,
        type: "order_limit_alert",
        status: "sent",
        recipient_email: ownerEmail,
      })
    }
  } catch (e) {
    console.error("orderLimitAlert error", e)
  }
}
