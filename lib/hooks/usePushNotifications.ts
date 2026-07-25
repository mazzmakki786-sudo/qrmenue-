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

export function usePushNotifications(restaurantId: string | null) {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const swRef = useRef<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    setSupported("serviceWorker" in navigator && "PushManager" in window)
    // Notification may not exist or its permission may throw in some iOS web views
    try {
      if (typeof Notification !== "undefined" && typeof Notification.permission !== "undefined") {
        setPermission(Notification.permission)
      }
    } catch {
      // iOS web views may throw on Notification.access — fall back to default
    }
  }, [])

  const registerServiceWorker = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return null
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" })
      swRef.current = reg

      // Ensure service worker is active immediately
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
      console.error("[push] SW registration failed:", err)
      return null
    }
  }, [])

  const subscribe = useCallback(async () => {
    if (!restaurantId || !supported) return false
    setLoading(true)
    try {
      let reg = swRef.current
      if (!reg) {
        reg = await registerServiceWorker()
      }
      if (!reg) {
        console.error("[push] No SW registration")
        setLoading(false)
        return false
      }

      const publicKey = getVapidPublicKey()
      if (!publicKey) {
        console.error("[push] No VAPID public key")
        setLoading(false)
        return false
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as BufferSource,
      })

      const subJson = sub.toJSON()

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          endpoint: subJson.endpoint,
          p256dh_key: subJson.keys?.p256dh,
          auth_key: subJson.keys?.auth,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        console.error("[push] Subscribe API error:", res.status, errData)
        setLoading(false)
        return false
      }

      setSubscribed(true)
      setPermission("granted")
      setLoading(false)
      return true
    } catch (err) {
      console.error("[push] Subscribe failed:", err)
      setLoading(false)
      return false
    }
  }, [restaurantId, supported, registerServiceWorker])

  const unsubscribe = useCallback(async () => {
    if (!restaurantId) return
    setLoading(true)
    try {
      const reg = swRef.current || await registerServiceWorker()
      if (reg) {
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          await sub.unsubscribe()
        }
      }
      const res = await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id: restaurantId }),
      })
      if (!res.ok) {
        console.error("[push] Unsubscribe API error:", res.status)
      }
      setSubscribed(false)
    } catch (err) {
      console.error("[push] Unsubscribe failed:", err)
    }
    setLoading(false)
  }, [restaurantId, registerServiceWorker])

  const requestPermission = useCallback(async () => {
    if (!supported) {
      console.warn("[push] Not supported")
      return false
    }
    // Check if Notification API is actually available (may not be in iOS web views)
    if (typeof Notification === "undefined" || typeof Notification.requestPermission !== "function") {
      console.warn("[push] Notification API not available")
      return false
    }
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result === "granted") {
        return await subscribe()
      }
      if (result === "denied") {
        console.warn("[push] Permission denied")
      }
      return false
    } catch (err) {
      console.error("[push] Permission request failed:", err)
      return false
    }
  }, [supported, subscribe])

  // Check existing subscription on mount
  useEffect(() => {
    if (!supported || !restaurantId) return
    let cancelled = false
    const check = async () => {
      try {
        const reg = await registerServiceWorker()
        if (!reg || cancelled) return
        const sub = await reg.pushManager.getSubscription()
        if (!cancelled) setSubscribed(!!sub)
      } catch {}
    }
    check()
    return () => { cancelled = true }
  }, [supported, restaurantId, registerServiceWorker])

  return {
    supported,
    permission,
    subscribed,
    loading,
    requestPermission,
    subscribe,
    unsubscribe,
  }
}
