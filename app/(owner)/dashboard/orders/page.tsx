"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import type { Order } from "@/types"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { Lock, Eye, Sparkles, ArrowRight } from "lucide-react"

const statusColors: Record<string, "available" | "unavailable" | "trial" | "starter" | "growth" | "premium"> = {
  received: "available", preparing: "growth", ready: "premium",
  completed: "available", cancelled: "unavailable",
}

export default function OrdersPage() {
  const sub = useSubscription()
  const { shouldBlurOrderDetails, plan, orderCount, planLimits } = sub
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<"today" | "week" | "all">("today")
  const [loading, setLoading] = useState(true)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    const supabase = createClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", user.id)
        .single()
      if (!restaurant) return

      setRestaurantId(restaurant.id)

      let query = supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false })

      const now = new Date()
      if (filter === "today") {
        const start = now.toISOString().split("T")[0]
        query = query.gte("created_at", start)
      } else if (filter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        query = query.gte("created_at", weekAgo)
      }

      const { data } = await query.limit(50)
      setOrders(data || [])
    } catch (err) {
      console.error("Orders fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    if (!restaurantId) return
    const supabase = createClient()
    const debounceRef = { current: null as ReturnType<typeof setTimeout> | null }

    const debouncedFetch = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => fetchOrders(), 500)
    }

    const channel = supabase
      .channel(uid(`orders-page-${restaurantId}`))
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
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
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.new.id ? (payload.new as Order) : o))
          )
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "restaurants",
          filter: `id=eq.${restaurantId}`,
        },
        debouncedFetch
      )
      .subscribe()

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      supabase.removeChannel(channel)
    }
  }, [restaurantId, fetchOrders])

  const blur = (text: string) => "█".repeat(Math.max(4, Math.min(text?.length || 0, 14)))

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Orders</h1>

      {shouldBlurOrderDetails && (
        <div className="mb-6 bg-gradient-to-br from-[#FEF3C7] to-[#FED7AA] border border-[#D97706]/30 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D97706] text-white flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#92400E]">
                Order details locked
              </p>
              <p className="text-xs text-[#78350F] mt-1">
                Your Free Trial order limit ({planLimits.maxOrders}) was reached.
                You've received {orderCount} orders. Customer details and order information
                are hidden until you upgrade.
              </p>
              <Link
                href="/dashboard/subscription"
                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-[#D97706] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Upgrade to Unlock <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {(["today", "week", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              filter === f ? "bg-black text-white" : "bg-[#F8F8F8] text-[#555]"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-[#E8E8E8] rounded-[10px] animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-center text-[#999] py-12">No orders found</p>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 rounded-[10px] bg-white border border-[#E8E8E8] hover:border-[#CCC] transition-colors"
            >
              <div className="min-w-0 flex-1">
                {shouldBlurOrderDetails ? (
                  <>
                    <p className="text-sm font-medium blur-sm select-none">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-[#555] mt-0.5 blur-sm select-none">
                      {blur(order.customer_name)} • {order.order_type.replace("_", " ")}
                    </p>
                    <p className="text-xs text-[#555] blur-sm select-none">
                      {new Date(order.created_at).toLocaleString("en-PK")}
                    </p>
                  </>
                ) : (
                  <Link href={`/dashboard/orders/${order.id}`} className="block">
                    <p className="text-sm font-medium">{order.order_number}</p>
                    <p className="text-xs text-[#555] mt-0.5">
                      {order.customer_name} • {order.order_type.replace("_", " ")}
                    </p>
                    <p className="text-xs text-[#555]">
                      {new Date(order.created_at).toLocaleString("en-PK")}
                    </p>
                  </Link>
                )}
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                {shouldBlurOrderDetails ? (
                  <p className="text-sm font-semibold blur-sm select-none">
                    {formatPrice(order.total_price)}
                  </p>
                ) : (
                  <p className="text-sm font-semibold">{formatPrice(order.total_price)}</p>
                )}
                <Badge variant={statusColors[order.order_status] || "starter"} className="capitalize mt-1">
                  {order.order_status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
