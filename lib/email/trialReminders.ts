import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"
import { PLAN_NAMES, PLAN_PRICES, type Plan } from "@/lib/subscription"
import { escapeHtml } from "@/lib/utils"

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured")
    }
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

const FROM = "QRMenu.pk <noreply@qrmenu.pk>"

export type ReminderType =
  | "5_days_left"
  | "3_days_left"
  | "1_day_left"
  | "trial_expired"
  | "grace_period_1"
  | "grace_period_2"

interface SendOptions {
  restaurantId: string
  ownerEmail: string
  restaurantName: string
  type: ReminderType
  daysRemaining?: number
}

interface EmailContent {
  subject: string
  html: string
}

function buildContent(opts: SendOptions): EmailContent {
  const { restaurantName, type, daysRemaining = 0 } = opts
  const safeRestaurantName = escapeHtml(restaurantName)
  const trialDays = 7
  const graceDays = 3

  const sharedStyle = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 24px;
    color: #111;
  `

  const buttonStyle = `
    display: inline-block;
    background: #25D366;
    color: white;
    padding: 14px 32px;
    border-radius: 10px;
    text-decoration: none;
    font-weight: 600;
    font-size: 15px;
  `

  const upgradeUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/dashboard/subscription`

  switch (type) {
    case "5_days_left":
      return {
        subject: `${daysRemaining} days left in your QRMenu trial — upgrade to keep going`,
        html: `
          <div style="${sharedStyle}">
            <h1 style="font-size: 24px; margin-bottom: 8px;">${safeRestaurantName}, your trial is halfway through</h1>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              You have <strong>${daysRemaining} days left</strong> in your free trial. We hope QRMenu is helping you take more orders.
            </p>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              To keep your menu live, your data safe, and continue accepting orders — pick a plan today.
            </p>
            <div style="margin: 32px 0; text-align: center;">
              <a href="${upgradeUrl}" style="${buttonStyle}">Choose Your Plan →</a>
            </div>
            <p style="color: #999; font-size: 13px; text-align: center;">
              Starter: PKR ${PLAN_PRICES.starter.toLocaleString()}/mo • Growth: PKR ${PLAN_PRICES.growth.toLocaleString()}/mo • Premium: PKR ${PLAN_PRICES.premium.toLocaleString()}/mo
            </p>
          </div>
        `,
      }

    case "3_days_left":
      return {
        subject: `3 days left — don't lose your menu`,
        html: `
          <div style="${sharedStyle}">
            <h1 style="font-size: 24px; margin-bottom: 8px;">3 days left, ${safeRestaurantName}</h1>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              Your trial ends in <strong>3 days</strong>. After that, your menu will go offline.
            </p>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              <strong>What you get with Starter (PKR ${PLAN_PRICES.starter.toLocaleString()}/mo):</strong><br/>
              ✓ Unlimited dishes<br/>
              ✓ Up to 10 dish images<br/>
              ✓ QR code & WhatsApp orders<br/>
              ✓ Analytics dashboard
            </p>
            <div style="margin: 32px 0; text-align: center;">
              <a href="${upgradeUrl}" style="${buttonStyle}">Upgrade Now — PKR ${PLAN_PRICES.starter.toLocaleString()}/mo →</a>
            </div>
          </div>
        `,
      }

    case "1_day_left":
      return {
        subject: `⏰ Last day of your trial — upgrade to keep your menu live`,
        html: `
          <div style="${sharedStyle}">
            <h1 style="font-size: 24px; margin-bottom: 8px;">Last day, ${safeRestaurantName}</h1>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              Your free trial ends <strong>tomorrow</strong>. After that, your menu will be hidden from customers.
            </p>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              <strong>Don't lose your data.</strong> Upgrade in the next 24 hours to keep everything you built.
            </p>
            <div style="margin: 32px 0; text-align: center;">
              <a href="${upgradeUrl}" style="${buttonStyle}">Upgrade Now →</a>
            </div>
            <p style="color: #999; font-size: 13px; text-align: center;">
              Need help? WhatsApp us — we can have you upgraded in 2 minutes.
            </p>
          </div>
        `,
      }

    case "trial_expired":
      return {
        subject: `Your trial ended — your menu is now in grace period`,
        html: `
          <div style="${sharedStyle}">
            <h1 style="font-size: 24px; margin-bottom: 8px;">Trial ended</h1>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              Your ${trialDays}-day free trial has ended, ${safeRestaurantName}. You now have <strong>${graceDays} days of grace</strong> to upgrade before your menu goes offline.
            </p>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              <strong>Your data is safe.</strong> All your dishes, images, and orders are preserved. Just pick a plan to restore full access.
            </p>
            <div style="margin: 32px 0; text-align: center;">
              <a href="${upgradeUrl}" style="${buttonStyle}">Restore My Menu →</a>
            </div>
          </div>
        `,
      }

    case "grace_period_1":
      return {
        subject: `1 day of grace left — upgrade to keep your menu`,
        html: `
          <div style="${sharedStyle}">
            <h1 style="font-size: 24px; margin-bottom: 8px;">1 day of grace left</h1>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              ${safeRestaurantName}, your grace period ends tomorrow. After that, your menu will be hidden.
            </p>
            <div style="margin: 32px 0; text-align: center;">
              <a href="${upgradeUrl}" style="${buttonStyle}">Upgrade Now →</a>
            </div>
          </div>
        `,
      }

    case "grace_period_2":
      return {
        subject: `Final reminder: grace period ends today`,
        html: `
          <div style="${sharedStyle}">
            <h1 style="font-size: 24px; margin-bottom: 8px;">Last day of grace</h1>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              ${safeRestaurantName}, this is your final reminder. After today, your menu will be hidden from customers.
            </p>
            <div style="margin: 32px 0; text-align: center;">
              <a href="${upgradeUrl}" style="${buttonStyle}">Keep My Menu Live →</a>
            </div>
          </div>
        `,
      }
  }
}

export async function sendTrialReminder(opts: SendOptions): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping email send")
    return false
  }

  try {
    const { subject, html } = buildContent(opts)

    const { error } = await getResend().emails.send({
      from: FROM,
      to: opts.ownerEmail,
      subject,
      html,
    })

    if (error) {
      console.error("Resend error:", error)
      return false
    }

    return true
  } catch (e) {
    console.error("sendTrialReminder error", e)
    return false
  }
}

export async function checkAndSendReminders(
  restaurantId: string
): Promise<void> {
  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", restaurantId)
    .single()

  if (!restaurant || restaurant.plan !== "trial") return

  const { data: owner } = await supabase.auth.admin.getUserById(
    restaurant.owner_id
  )
  const ownerEmail = owner?.user?.email
  if (!ownerEmail) return

  const now = new Date()
  const trialEnd = new Date(restaurant.trial_end)
  const trialStart = new Date(restaurant.trial_start)
  const graceEnd = new Date(
    trialEnd.getTime() + 3 * 24 * 60 * 60 * 1000
  )

  const msPerDay = 1000 * 60 * 60 * 24
  const daysSinceStart = Math.floor(
    (now.getTime() - trialStart.getTime()) / msPerDay
  )
  const daysUntilEnd = Math.ceil(
    (trialEnd.getTime() - now.getTime()) / msPerDay
  )
  const daysUntilGraceEnd = Math.ceil(
    (graceEnd.getTime() - now.getTime()) / msPerDay
  )

  const remindersToSend: ReminderType[] = []

  if (daysSinceStart >= 2 && daysUntilEnd === 5) {
    remindersToSend.push("5_days_left")
  }
  if (daysSinceStart >= 4 && daysUntilEnd === 3) {
    remindersToSend.push("3_days_left")
  }
  if (daysSinceStart >= 6 && daysUntilEnd === 1) {
    remindersToSend.push("1_day_left")
  }
  if (daysSinceStart >= 7 && daysUntilEnd <= 0 && now < graceEnd) {
    remindersToSend.push("trial_expired")
  }
  if (daysUntilGraceEnd === 1) {
    remindersToSend.push("grace_period_1")
  }
  if (daysUntilGraceEnd === 0) {
    remindersToSend.push("grace_period_2")
  }

  const { data: existingReminders } = await supabase
    .from("trial_reminder_emails")
    .select("reminder_type")
    .eq("restaurant_id", restaurantId)

  const existingTypes = new Set((existingReminders || []).map((r) => r.reminder_type))
  const toSend = remindersToSend.filter((t) => !existingTypes.has(t))

  if (toSend.length === 0) return

  const emailResults = await Promise.allSettled(
    toSend.map((type) =>
      sendTrialReminder({
        restaurantId,
        ownerEmail,
        restaurantName: restaurant.name,
        type,
        daysRemaining: Math.max(0, daysUntilEnd),
      })
    )
  )

  const reminderInserts = toSend
    .filter((_, i) => emailResults[i].status === "fulfilled" && emailResults[i].value)
    .map((type) => ({
      restaurant_id: restaurantId,
      reminder_type: type,
      email: ownerEmail,
    }))

  if (reminderInserts.length > 0) {
    await supabase.from("trial_reminder_emails").insert(reminderInserts)
  }
}
