"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { LogOut, Package, Store } from "lucide-react"
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

  const activeOrders = orders.filter((o) => o.order_status !== "completed" && o.order_status !== "cancelled")
  const pastOrders = orders.filter((o) => o.order_status === "completed" || o.order_status === "cancelled")

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#F0F0F0] flex items-center justify-between px-4" style={{ height: "calc(48px + env(safe-area-inset-top, 0px))", paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <h1 className="text-lg font-semibold">My Orders</h1>
        <button onClick={handleLogout} className="text-sm text-[#DC2626] flex items-center gap-1 hover:underline">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </header>

      <main className="pt-16 pb-8 px-4 max-w-[600px] mx-auto">
        <div className="space-y-8 mt-4">
          {/* Active Orders */}
          {activeOrders.length > 0 && (
            <div>
              <h2 className="text-[12px] font-semibold text-[#999] uppercase tracking-wider mb-3">Active Orders</h2>
              <div className="space-y-2">
                {activeOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/order-confirm/${order.id}`}
                    className="block p-4 rounded-xl border border-[#F0F0F0] hover:border-[#DDD] hover:shadow-sm transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold">{order.order_number}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Store className="w-3 h-3 text-[#999]" />
                          <span className="text-xs text-[#999]">{order.restaurants?.name || "Restaurant"}</span>
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${
                        order.order_status === "received" ? "bg-[#25D366]/10 text-[#25D366]" :
                        order.order_status === "ready" ? "bg-purple-100 text-purple-600" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {statusLabels[order.order_status] || order.order_status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#999]">
                      <span>{order.items?.length || 0} items &bull; {formatPrice(order.total_price)}</span>
                      <span>{new Date(order.created_at).toLocaleDateString("en-PK")}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Past Orders */}
          {pastOrders.length > 0 && (
            <div>
              <h2 className="text-[12px] font-semibold text-[#999] uppercase tracking-wider mb-3">Past Orders</h2>
              <div className="space-y-2">
                {pastOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/order-confirm/${order.id}`}
                    className="block p-4 rounded-xl border border-[#F0F0F0] hover:border-[#DDD] hover:shadow-sm transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold">{order.order_number}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Store className="w-3 h-3 text-[#999]" />
                          <span className="text-xs text-[#999]">{order.restaurants?.name || "Restaurant"}</span>
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${
                        order.order_status === "completed" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"
                      }`}>
                        {statusLabels[order.order_status] || order.order_status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#999]">
                      <span className="font-medium text-[#555]">{formatPrice(order.total_price)}</span>
                      <span>{new Date(order.created_at).toLocaleDateString("en-PK")}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {orders.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-10 h-10 text-[#999] mx-auto mb-3" />
              <p className="text-[#999]">No orders yet</p>
              <Link href="/restaurants" className="block mt-4">
                <Button variant="primary">Browse Restaurants</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
