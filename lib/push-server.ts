import { createAdminClient } from "@/lib/supabase/server"
import { getVapidPublicKey, getVapidPrivateKey, getVapidSubject } from "@/lib/push"

let webPush: any = null

function initWebPush(): boolean {
  if (webPush) return true
  try {
    webPush = require("web-push")
    webPush.setVapidDetails(
      getVapidSubject(),
      getVapidPublicKey(),
      getVapidPrivateKey()
    )
    return true
  } catch (e) {
    console.error("[push-server] Init failed:", e)
    return false
  }
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
  icon?: string
}

export async function sendPushNotification(
  restaurantId: string,
  payload: PushPayload
): Promise<{ sent: number; total: number }> {
  if (!initWebPush()) {
    return { sent: 0, total: 0 }
  }

  const admin = createAdminClient()
  const { data: subs, error } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh_key, auth_key")
    .eq("restaurant_id", restaurantId)

  if (error) {
    console.error("[push-server] DB query error:", error.message)
    return { sent: 0, total: 0 }
  }

  if (!subs?.length) {
    return { sent: 0, total: 0 }
  }

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/dashboard/orders",
    tag: payload.tag || "order-alert",
    icon: payload.icon || "/og-image.png",
  })

  let sent = 0
  const results = await Promise.allSettled(
    subs.map(async (sub: any) => {
      try {
        await webPush.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh_key, auth: sub.auth_key },
        }, body)
        sent++
      } catch (pushErr: any) {
        console.error("[push-server] Send failed:", pushErr?.statusCode || pushErr?.message || "Unknown error")
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
