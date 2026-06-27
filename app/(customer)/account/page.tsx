"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { LogOut, Package, Store, ChevronDown, ChevronUp } from "lucide-react"
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
  const [expandedRestaurants, setExpandedRestaurants] = useState<Set<string>>(new Set())

  const CUSTOMER_RETENTION_DAYS = 7

  const fetchOrders = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    setUser(user)
    try {
      const sevenDaysAgo = new Date(Date.now() - CUSTOMER_RETENTION_DAYS * 86400000).toISOString()
      const { data } = await supabase
        .from("orders")
        .select("*, restaurants(name, slug)")
        .eq("customer_id", user.id)
        .gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: false })
        .limit(50)

      setOrders(data || [])
    } catch (err) {
      console.error("Orders fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

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
          const sevenDaysAgo = Date.now() - CUSTOMER_RETENTION_DAYS * 86400000
          const orderTime = new Date((payload.new as Order).created_at).getTime()
          if (orderTime >= sevenDaysAgo) {
            setOrders((prev) => [payload.new as Order, ...prev.slice(0, 49)])
          }
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

  // Auto-expand restaurants that have orders
  useEffect(() => {
    if (orders.length > 0) {
      const uniqueNames = [...new Set(orders.map((o) => o.restaurants?.name || "Other"))]
      setExpandedRestaurants(new Set(uniqueNames))
    }
  }, [orders.length])

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
        <Link href="/login?redirect=/account">
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
              <p className="text-[#999]">No orders in the last 7 days</p>
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
                        <Link
                          key={order.id}
                          href={`/order-confirm/${order.id}`}
                          className="block p-3.5 rounded-xl border border-[#F0F0F0] hover:border-[#DDD] hover:shadow-sm transition-all active:scale-[0.99]"
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
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
