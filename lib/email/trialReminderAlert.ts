import { Resend } from "resend"
import { createAdminClient } from "@/lib/supabase/server"
import { escapeHtml } from "@/lib/utils"

let _r: Resend | null = null
function get() {
  if (!_r) _r = new Resend(process.env.RESEND_API_KEY!)
  return _r
}

const FROM = "QRMenu.pk <noreply@qrmenu.pk>"
const TRIAL_REMINDER_DAYS = [5, 3, 1]

export async function checkAndSendTrialReminders(): Promise<{ sent: number }> {
  if (!process.env.RESEND_API_KEY) return { sent: 0 }

  const admin = createAdminClient()
  let sent = 0

  for (const daysBefore of TRIAL_REMINDER_DAYS) {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + daysBefore)
    const targetDateStr = targetDate.toISOString().split("T")[0]

    const { data: restaurants } = await admin
      .from("restaurants")
      .select("id, name, owner_id, plan, trial_end")
      .eq("plan", "trial")
      .gte("trial_end", `${targetDateStr}T00:00:00Z`)
      .lt("trial_end", `${targetDateStr}T23:59:59Z`)

    if (!restaurants?.length) continue

    for (const restaurant of restaurants) {
      const { data: owner } = await admin.auth.admin.getUserById(restaurant.owner_id)
      const ownerEmail = owner?.user?.email
      if (!ownerEmail) continue

      const today = new Date().toISOString().split("T")[0]
      const { data: existing } = await admin
        .from("notification_logs")
        .select("id")
        .eq("restaurant_id", restaurant.id)
        .eq("type", "trial_reminder")
        .eq("recipient_email", ownerEmail)
        .gte("created_at", today)
        .maybeSingle()

      if (existing) continue

      try {
        const { error } = await get().emails.send({
          from: FROM,
          to: ownerEmail,
          subject: `Your trial ends in ${daysBefore} day${daysBefore > 1 ? "s" : ""} — QRMenu.pk`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111;">
              <h1 style="font-size: 22px; margin-bottom: 8px;">Your trial ends in ${daysBefore} day${daysBefore > 1 ? "s" : ""}, ${escapeHtml(restaurant.name)}</h1>
              <p style="color: #555; font-size: 15px; line-height: 1.6;">
                Your free trial will expire on <strong>${new Date(restaurant.trial_end).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}</strong>.
              </p>
              <p style="color: #555; font-size: 15px; line-height: 1.6;">
                After your trial ends, you'll have a <strong>3-day grace period</strong> before your menu goes offline. Choose a plan to keep serving your customers.
              </p>
              <div style="margin: 32px 0; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || ""}/dashboard/subscription" 
                   style="display: inline-block; background: #25D366; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
                  Choose a Plan →
                </a>
              </div>
              <p style="color: #999; font-size: 13px; text-align: center;">
                Plans start at just PKR 1,200/month. Contact us on WhatsApp if you need help.
              </p>
            </div>
          `,
        })

        if (!error) {
          await admin.from("notification_logs").insert({
            restaurant_id: restaurant.id,
            type: "trial_reminder",
            status: "sent",
            recipient_email: ownerEmail,
          })
          sent++
        }
      } catch (e) {
        console.error("trialReminderAlert error", e)
      }
    }
  }

  return { sent }
}
