import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"

let _r: Resend | null = null
function get() {
  if (!_r) _r = new Resend(process.env.RESEND_API_KEY!)
  return _r
}

const FROM = "QRMenu.pk <noreply@qrmenu.pk>"
const PLAN_END_WARNING_DAYS = 7

export async function checkAndSendPlanEndingAlert(restaurantId: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return

  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, owner_id, plan, plan_end_date")
    .eq("id", restaurantId)
    .single()

  if (!restaurant) return
  if (restaurant.plan === "trial") return
  if (!restaurant.plan_end_date) return

  const { data: owner } = await supabase.auth.admin.getUserById(restaurant.owner_id)
  const ownerEmail = owner?.user?.email
  if (!ownerEmail) return

  const now = new Date()
  const planEnd = new Date(restaurant.plan_end_date)
  const daysUntilEnd = Math.ceil((planEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilEnd <= 0 || daysUntilEnd > PLAN_END_WARNING_DAYS) return

  const today = new Date().toISOString().split("T")[0]
  const { data: existing } = await supabase
    .from("notification_logs")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .eq("type", "plan_ending_alert")
    .gte("created_at", today)
    .maybeSingle()

  if (existing) return

  const planLabel = restaurant.plan.charAt(0).toUpperCase() + restaurant.plan.slice(1)

  try {
    const { error } = await get().emails.send({
      from: FROM,
      to: ownerEmail,
      subject: `Your ${planLabel} plan ends in ${daysUntilEnd} days — QRMenu.pk`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111;">
          <h1 style="font-size: 22px; margin-bottom: 8px;">Your ${planLabel} plan ends soon, ${restaurant.name}</h1>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">
            Your current plan expires in <strong>${daysUntilEnd} day${daysUntilEnd > 1 ? "s" : ""}</strong>.
            After that, your account will be downgraded and some features may become unavailable.
          </p>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">
            <strong>Don't lose access.</strong> Renew your plan to keep all features active.
          </p>
          <div style="margin: 32px 0; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || ""}/dashboard/subscription" 
               style="display: inline-block; background: #FF6B35; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Renew My Plan →
            </a>
          </div>
          <p style="color: #999; font-size: 13px; text-align: center;">
            Need help? Contact us on WhatsApp — we're happy to assist.
          </p>
        </div>
      `,
    })

    if (!error) {
      await supabase.from("notification_logs").insert({
        restaurant_id: restaurantId,
        type: "plan_ending_alert",
        status: "sent",
        recipient_email: ownerEmail,
      })
    }
  } catch (e) {
    console.error("planEndingAlert error", e)
  }
}
