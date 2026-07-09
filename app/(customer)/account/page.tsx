"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { LogOut, Package, Store, ChevronDown, ChevronUp, X, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Order } from "@/types"

const statusColors: Record<string, "available" | "unavailable" | "trial" | "starter" | "growth" | "premium"> = {
  received: "growth", preparing: "premium", ready: "available",
  completed: "available", cancelled: "unavailable",
}

const statusLabels: Record<string, string> = {
  received: "Pending", ready: "Ready",
  completed: "Delivered", cancelled: "Cancelled",
}

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRestaurants, setExpandedRestaurants] = useState<Set<string>>(new Set()) // All minimized by default
  const [cancelTarget, setCancelTarget] = useState<any>(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    setUser(user)
    try {
      const { data } = await supabase
        .from("orders")
        .select("*, restaurants(name, slug)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)

      setOrders(data || [])
    } catch (err) {
      console.error("Orders fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCancelOrder = async () => {
    if (!cancelTarget || cancelling) return
    setCancelling(true)
    setCancelError(null)

    try {
      const res = await fetch(`/api/orders/${cancelTarget.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": "1" },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to cancel order")

      setOrders((prev) =>
        prev.map((o) => (o.id === cancelTarget.id ? { ...o, order_status: "cancelled" } : o))
      )
      setCancelTarget(null)
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setCancelling(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    const channel = supabase
      .channel(uid(`customer-orders-${user.id}`))
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `customer_id=eq.${user.id}`,
        },
        (payload) => {
          setOrders((prev) => [payload.new as Order, ...prev.slice(0, 49)])
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `customer_id=eq.${user.id}`,
        },
        (payload) => {
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.new.id ? (payload.new as Order) : o))
          )
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user])

  const toggleRestaurant = (name: string) => {
    setExpandedRestaurants((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  // All restaurants collapsed (minimized) by default — user clicks to expand

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/restaurants")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-14 border-b border-[#F0F0F0]" />
        <div className="p-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-[#F9FAFB] rounded-[10px] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
        <Package className="w-12 h-12 text-[#999] mb-4" />
        <h1 className="text-xl font-bold mb-2">My Orders</h1>
        <p className="text-sm text-[#555] mb-6 text-center">Sign in to view your orders</p>
        <Link href="/login/customer?redirect=/account">
          <Button variant="primary">Sign In</Button>
        </Link>
      </div>
    )
  }

  // Group orders by restaurant
  const ordersByRestaurant = orders.reduce<Record<string, typeof orders>>((acc, order) => {
    const name = order.restaurants?.name || "Other"
    if (!acc[name]) acc[name] = []
    acc[name].push(order)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#F0F0F0] flex items-center justify-between px-4" style={{ height: "calc(48px + env(safe-area-inset-top, 0px))", paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <h1 className="text-lg font-semibold">My Orders</h1>
        <button onClick={handleLogout} className="text-sm text-[#DC2626] flex items-center gap-1 hover:underline">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </header>

      <main className="pt-16 pb-8 px-4 max-w-[600px] mx-auto">
        <div className="space-y-6 mt-4">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-10 h-10 text-[#999] mx-auto mb-3" />
              <p className="text-[#999]">No orders yet</p>
              <Link href="/restaurants" className="block mt-4">
                <Button variant="primary">Browse Restaurants</Button>
              </Link>
            </div>
          ) : (
            Object.entries(ordersByRestaurant).map(([restaurantName, restaurantOrders]) => {
              const isExpanded = expandedRestaurants.has(restaurantName)
              return (
                <div key={restaurantName}>
                  <button
                    onClick={() => toggleRestaurant(restaurantName)}
                    className="w-full flex items-center gap-2 mb-3 group"
                  >
                    <Store className="w-4 h-4 text-text-muted" />
                    <h2 className="text-[13px] font-bold text-text-primary group-hover:underline">{restaurantName}</h2>
                    <span className="text-[10px] text-text-muted bg-[#F5F5F5] px-2 py-0.5 rounded-full">{restaurantOrders.length}</span>
                    <div className="ml-auto text-text-muted transition-transform duration-200">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="space-y-2 transition-all duration-300">
                      {restaurantOrders.map((order) => (
                        <div
                          key={order.id}
                          className="block p-3.5 rounded-xl border border-[#F0F0F0] hover:border-[#DDD] hover:shadow-sm transition-all"
                        >
                          <Link
                            href={`/order-confirm/${order.id}`}
                            className="block"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-text-primary">#{order.order_number}</span>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  order.order_status === "received" ? "bg-accent/10 text-accent" :
                                  order.order_status === "ready" ? "bg-purple-100 text-purple-600" :
                                  order.order_status === "completed" ? "bg-emerald-100 text-emerald-600" :
                                  order.order_status === "cancelled" ? "bg-gray-100 text-gray-500" :
                                  "bg-gray-100 text-gray-500"
                                }`}>
                                  {statusLabels[order.order_status] || order.order_status}
                                </span>
                              </div>
                              <span className="text-[11px] text-text-muted">{new Date(order.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-text-muted">
                              <span>{order.items?.length || 0} items • {formatPrice(order.total_price)}</span>
                              <span className="text-[10px] text-text-muted">{order.order_type?.replace("_", " ")}</span>
                            </div>
                          </Link>
                          {/* Cancel button — only for pending orders */}
                          {order.order_status === "received" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setCancelTarget(order) }}
                              className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold text-error border border-error/20 hover:bg-error/5 transition-all"
                            >
                              <X className="w-3 h-3" />
                              Cancel Order
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </main>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={(open) => { if (!cancelling && !open) setCancelTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-error" />
              Cancel Order
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Are you sure you want to cancel order <span className="font-semibold text-text-primary">#{cancelTarget?.order_number}</span>?
              This action cannot be undone.
            </p>

            {cancelError && (
              <div className="bg-error/5 border border-error/10 rounded-xl px-4 py-3">
                <p className="text-xs text-error font-medium">{cancelError}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setCancelTarget(null); setCancelError(null) }}
                disabled={cancelling}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border border-border text-text-secondary hover:bg-[#FAFAFA] disabled:opacity-50 transition-all"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-error hover:bg-error/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {cancelling ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                    </svg>
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Yes, Cancel Order
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
