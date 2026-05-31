"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import type { Order } from "@/types"

const statusColors: Record<string, "available" | "unavailable" | "trial" | "starter" | "growth" | "premium"> = {
  received: "available", preparing: "growth", ready: "premium",
  completed: "available", cancelled: "unavailable",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<"today" | "week" | "all">("today")
  const [loading, setLoading] = useState(true)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    const supabase = createClient()
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
    setLoading(false)
  }, [filter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  // Real-time subscription for new orders
  useEffect(() => {
    if (!restaurantId) return
    const supabase = createClient()

    const channel = supabase
      .channel(`orders-page-${restaurantId}`)
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
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [restaurantId])

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Orders</h1>

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
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="flex items-center justify-between p-4 rounded-[10px] bg-white border border-[#E8E8E8] hover:border-[#CCC] transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{order.order_number}</p>
                <p className="text-xs text-[#555] mt-0.5">
                  {order.customer_name} • {order.order_type.replace("_", " ")}
                </p>
                <p className="text-xs text-[#555]">
                  {new Date(order.created_at).toLocaleString("en-PK")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatPrice(order.total_price)}</p>
                <Badge variant={statusColors[order.order_status] || "starter"} className="capitalize mt-1">
                  {order.order_status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
