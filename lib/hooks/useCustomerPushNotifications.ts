"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { getVapidPublicKey } from "@/lib/push"

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i)
  }
  return output
}

export function useCustomerPushNotifications(
  customerId: string | null,
  orderId: string | null
) {
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [supported, setSupported] = useState(false)
  const swRef = useRef<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    setSupported("serviceWorker" in navigator && "PushManager" in window)
  }, [])

  const registerServiceWorker = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return null
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" })
      swRef.current = reg
      if (reg.installing) {
        await new Promise<void>((resolve) => {
          reg.installing!.addEventListener("statechange", (e: Event) => {
            const target = e.target as ServiceWorker
            if (target.state === "activated") resolve()
          })
        })
      }
      return reg
    } catch (err) {
      console.error("[customer-push] SW registration failed:", err)
      return null
    }
  }, [])

  const subscribe = useCallback(async () => {
    if (!customerId || !orderId || !supported) return false
    setLoading(true)
    try {
      let reg = swRef.current
      if (!reg) {
        reg = await registerServiceWorker()
      }
      if (!reg) {
        setLoading(false)
        return false
      }

      const publicKey = getVapidPublicKey()
      if (!publicKey) {
        setLoading(false)
        return false
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as BufferSource,
      })

      const subJson = sub.toJSON()

      const res = await fetch("/api/push/customer-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          order_id: orderId,
          endpoint: subJson.endpoint,
          p256dh_key: subJson.keys?.p256dh,
          auth_key: subJson.keys?.auth,
        }),
      })

      if (!res.ok) {
        setLoading(false)
        return false
      }

      setSubscribed(true)
      setLoading(false)
      return true
    } catch (err) {
      console.error("[customer-push] Subscribe failed:", err)
      setLoading(false)
      return false
    }
  }, [customerId, orderId, supported, registerServiceWorker])

  const unsubscribe = useCallback(async () => {
    if (!customerId || !orderId) return
    setLoading(true)
    try {
      const reg = swRef.current || await registerServiceWorker()
      if (reg) {
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          await sub.unsubscribe()
        }
      }
      await fetch("/api/push/customer-unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: customerId, order_id: orderId }),
      })
      setSubscribed(false)
    } catch (err) {
      console.error("[customer-push] Unsubscribe failed:", err)
    }
    setLoading(false)
  }, [customerId, orderId, registerServiceWorker])

  return {
    supported,
    subscribed,
    loading,
    subscribe,
    unsubscribe,
  }
}
