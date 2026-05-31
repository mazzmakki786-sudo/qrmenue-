"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Bell } from "lucide-react"
import Link from "next/link"

interface Props {
  restaurantId: string
}

export function BellNotification({ restaurantId }: Props) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [latestOrder, setLatestOrder] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const fetchInitial = async () => {
      const today = new Date().toISOString().split("T")[0]
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId)
        .gte("created_at", today)
        .eq("order_status", "received")

      setUnreadCount(count || 0)
    }

    fetchInitial()

    const channel = supabase
      .channel(`orders-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          setUnreadCount((prev) => prev + 1)
          const newOrder = payload.new as any
          setLatestOrder(newOrder.order_number || newOrder.id)
          setTimeout(() => setLatestOrder(null), 5000)
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
        () => {
          // Refresh on status updates
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [restaurantId])

  return (
    <Link href="/dashboard/orders" className="relative">
      <Bell className="w-5 h-5 text-[#555]" />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#FF6B35] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
      {latestOrder && (
        <div className="absolute top-full right-0 mt-2 bg-black text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg animate-in">
          New order {latestOrder}!
        </div>
      )}
    </Link>
  )
}
