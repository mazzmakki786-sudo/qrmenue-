import { createAdminClient } from "@/lib/supabase/server"
import type { PushPayload } from "@/lib/push-server"

let webPush: any = null

function initWebPush(): boolean {
  if (webPush) return true
  try {
    webPush = require("web-push")
    const subject = process.env.VAPID_SUBJECT || "mailto:admin@qrmenu.pk"
    webPush.setVapidDetails(
      subject,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
      process.env.VAPID_PRIVATE_KEY || ""
    )
    return true
  } catch (e) {
    console.error("[customer-push] Init failed:", e)
    return false
  }
}

export async function sendCustomerPushNotification(
  customerId: string,
  payload: PushPayload
): Promise<{ sent: number; total: number }> {
  if (!initWebPush()) {
    return { sent: 0, total: 0 }
  }

  const admin = createAdminClient()
  const { data: subs, error } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh_key, auth_key")
    .eq("customer_id", customerId)

  if (error) {
    console.error("[customer-push] DB query error:", error.message)
    return { sent: 0, total: 0 }
  }

  if (!subs?.length) {
    return { sent: 0, total: 0 }
  }

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/account",
    tag: payload.tag || "customer-order-alert",
    icon: payload.icon || "/og-image.png",
  })

  let sent = 0
  await Promise.allSettled(
    subs.map(async (sub: any) => {
      try {
        await webPush.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh_key, auth: sub.auth_key },
        }, body)
        sent++
      } catch (pushErr: any) {
        console.error("[customer-push] Send failed:", pushErr?.statusCode || pushErr?.message || "Unknown error")
        if (pushErr?.statusCode === 410 || pushErr?.statusCode === 404) {
          try {
            await admin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint)
          } catch {}
        }
      }
    })
  )

  return { sent, total: subs.length }
}

export interface CreateCustomerNotificationInput {
  customer_id: string
  order_id: string
  type: string
  title_en: string
  title_ur?: string | null
  body_en?: string | null
  body_ur?: string | null
  data?: Record<string, unknown>
}

export async function createCustomerNotification(input: CreateCustomerNotificationInput) {
  const admin = createAdminClient()
  const { error } = await admin
    .from("customer_notifications")
    .insert({
      customer_id: input.customer_id,
      order_id: input.order_id,
      type: input.type,
      title_en: input.title_en,
      title_ur: input.title_ur || null,
      body_en: input.body_en || null,
      body_ur: input.body_ur || null,
      data: input.data || {},
    })

  if (error) {
    console.error("[customer-notifications] Insert error:", error.message)
  }
}
