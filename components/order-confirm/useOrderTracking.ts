"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/stores/cartStore"
import { useToastStore } from "@/stores/toastStore"
import { playStatusChange, playNotification } from "@/lib/sound"
import { useCustomerPushNotifications } from "@/lib/hooks/useCustomerPushNotifications"
import { buildWhatsAppURL } from "@/lib/whatsapp"

export function useOrderTracking(id: string) {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [whatsappSuccess, setWhatsappSuccess] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [signupToCancelDialogOpen, setSignupToCancelDialogOpen] = useState(false)
  const [pushSubscribed, setPushSubscribed] = useState(false)

  const clearCart = useCartStore((s) => s.clearCart)
  const setRestaurant = useCartStore((s) => s.setRestaurant)
  const addToast = useToastStore((s) => s.addToast)
  const customerPush = useCustomerPushNotifications(user?.id || null, id)

  const prevStatusRef = useRef<string | null>(null)
  const lastRealtimeRef = useRef<number>(Date.now())
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      setError(null)
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        const { data, error: fetchError } = await supabase
          .from("orders")
          .select("*, restaurants(*)")
          .eq("id", id)
          .single()

        if (fetchError) throw new Error(fetchError.message)

        if (!data) {
          router.replace("/restaurants")
          return
        }

        if (user && data.customer_id && data.customer_id !== user.id) {
          setError("You do not have permission to view this order.")
          setLoading(false)
          return
        }

        setOrder(data)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order.")
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id, router])

  // Initialize prevStatusRef when order loads
  useEffect(() => {
    if (order?.order_status) {
      prevStatusRef.current = order.order_status
    }
  }, [order?.order_status])

  // Realtime subscription + polling fallback
  // Depends on `loading` — subscription starts only after auth + initial fetch
  // are resolved, so the Realtime connection carries the correct session for RLS.
  useEffect(() => {
    if (!id) return
    if (loading) return // wait for auth + initial fetch to resolve

    const supabase = createClient()
    const channel = supabase
      .channel(uid(`order-tracking-${id}`))
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const newData = payload.new as any
          const newStatus = newData.order_status
          const oldStatus = prevStatusRef.current
          lastRealtimeRef.current = Date.now()

          if (oldStatus && newStatus !== oldStatus) {
            if (newStatus === "preparing") {
              playStatusChange()
              addToast({
                type: "info",
                title: "Order Being Prepared",
                message: `Your order #${newData.order_number} is now being prepared`,
                duration: 5000,
                sound: true,
                action: { label: "View Order", url: `/order-confirm/${id}` },
              })
            }
            if (newStatus === "ready") {
              playStatusChange()
              addToast({
                type: "order",
                title: "Order Ready!",
                message: `Your order #${newData.order_number} is ready!`,
                duration: 6000,
                sound: true,
                action: { label: "View Order", url: `/order-confirm/${id}` },
              })
            }
            if (newStatus === "cancelled") {
              playNotification()
              addToast({
                type: "error",
                title: "Order Cancelled",
                message: `Your order #${newData.order_number} has been cancelled`,
                duration: 5000,
                sound: true,
              })
            }
            if (newStatus === "completed") {
              playNotification()
              addToast({
                type: "success",
                title: "Order Completed",
                message: `Your order #${newData.order_number} is completed`,
                duration: 4000,
              })
            }
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Order Update", {
                body:
                  newStatus === "preparing"
                    ? `Order #${newData.order_number} is being prepared`
                    : newStatus === "ready"
                      ? `Order #${newData.order_number} is ready!`
                      : `Order #${newData.order_number}: ${newStatus}`,
                icon: "/og-image.png",
                tag: `order-${id}`,
              })
            }
          }
          prevStatusRef.current = newStatus
          setOrder((prev: any) => (prev ? { ...prev, ...newData } : prev))
        }
      )
      .subscribe()

    // Polling fallback: if no realtime update for 8s, poll manually every 5s
    pollingIntervalRef.current = setInterval(async () => {
      const elapsed = Date.now() - lastRealtimeRef.current
      if (elapsed < 8000) return

      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("orders")
          .select("order_status, ready_at, updated_at, prepared_at")
          .eq("id", id)
          .single()
        if (data) {
          const prevStatus = prevStatusRef.current
          const newStatus = data.order_status
          if (newStatus !== prevStatus) {
            prevStatusRef.current = newStatus
            // Update the full order state with polled fields to trigger re-renders
            setOrder((prev: any) => (prev ? { ...prev, ...data } : prev))
          } else if (data.ready_at) {
            // Even if status hasn't changed, update ready_at for live countdown
            setOrder((prev: any) => (prev && prev.ready_at !== data.ready_at ? { ...prev, ready_at: data.ready_at } : prev))
          }
        }
      } catch {}
    }, 5000)

    return () => {
      supabase.removeChannel(channel)
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
    }
  }, [id, user, loading, addToast])

  // Push notification subscription
  useEffect(() => {
    if (user && order && !pushSubscribed) {
      const nonFinal = ["received", "preparing", "ready"]
      if (nonFinal.includes(order.order_status)) {
        customerPush.subscribe().then((ok) => {
          if (ok) setPushSubscribed(true)
        })
      }
    }
    return () => {
      if (pushSubscribed && customerPush.subscribed) {
        customerPush.unsubscribe()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, order, pushSubscribed])

  // Handle cancel order
  const handleCancelOrder = useCallback(async () => {
    if (!order || cancelling) return
    setCancelling(true)
    setCancelError(null)

    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": "1" },
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel order")
      }
      setOrder((prev: any) => (prev ? { ...prev, order_status: "cancelled" } : prev))
      setCancelDialogOpen(false)
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setCancelling(false)
    }
  }, [order, cancelling])

  // Handle reorder
  const handleReorder = useCallback(() => {
    if (!order) return
    clearCart()
    const restaurant = order.restaurants
    if (restaurant) {
      setRestaurant(restaurant.id, restaurant.name, restaurant.slug, restaurant.delivery_fee ?? 0)
      router.push(`/${restaurant.slug}`)
    } else {
      router.push("/restaurants")
    }
  }, [order, clearCart, setRestaurant, router])

  // Auto-send WhatsApp — once per order, only when freshly placed
  useEffect(() => {
    if (!order) return
    if (order.order_status !== "received") return
    if (order.whatsapp_sent) return
    if (whatsappSuccess) return

    const restaurant = order.restaurants
    const url = buildWhatsAppURL({
      orderNumber: order.order_number,
      items: order.items || [],
      totalPrice: order.total_price,
      paymentMethod: order.payment_method,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      orderType: order.order_type,
      tableNumber: order.table_number,
      deliveryAddress: order.delivery_address,
      restaurantPhone: restaurant?.phone || "",
      deliveryFee: order.delivery_fee ?? 0,
    })
    if (!url) return

    const timer = setTimeout(() => {
      window.open(url, "_blank")
      setWhatsappSuccess(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [order, whatsappSuccess])

  return {
    order,
    user,
    loading,
    error,
    whatsappSuccess,
    setWhatsappSuccess,
    pushSubscribed,
    handleCancelOrder,
    handleReorder,
    cancelDialogOpen,
    setCancelDialogOpen,
    cancelling,
    cancelError,
    signupToCancelDialogOpen,
    setSignupToCancelDialogOpen,
    setOrder,
  }
}
