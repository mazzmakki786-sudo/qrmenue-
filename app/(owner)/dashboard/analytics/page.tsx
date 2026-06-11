"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import type { DailyStats } from "@/types"

const OrdersChart = dynamic(
  () => import("@/components/owner/OrdersChart").then((mod) => ({ default: mod.OrdersChart })),
  { loading: () => <div className="h-64 bg-[#E8E8E8] rounded-[14px] animate-pulse" /> }
)

export default function AnalyticsPage() {
  const [graph7d, setGraph7d] = useState<DailyStats[]>([])
  const [graph30d, setGraph30d] = useState<DailyStats[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [topDishes, setTopDishes] = useState<{ name: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .single()
    if (!restaurant) return

    const [statsRes, ordersRes] = await Promise.all([
      supabase
        .from("daily_order_stats")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("order_date", { ascending: false })
        .limit(30),
      supabase
        .from("orders")
        .select("items, total_price")
        .eq("restaurant_id", restaurant.id)
        .neq("order_status", "cancelled"),
    ])

    if (statsRes.data) {
      const reversed = statsRes.data.reverse()
      setGraph7d(reversed.slice(-7))
      setGraph30d(reversed)
      setTotalOrders(statsRes.data.reduce((s, d) => s + d.total_orders, 0))
      setTotalRevenue(statsRes.data.reduce((s, d) => s + d.total_revenue, 0))
    } else if (ordersRes.data) {
      setTotalOrders(ordersRes.data.length)
      setTotalRevenue(ordersRes.data.reduce((s, o) => s + o.total_price, 0))
    }

    if (ordersRes.data) {
      const count: Record<string, number> = {}
      ordersRes.data.forEach((o: any) => {
        ;(o.items as any[]).forEach((item: any) => {
          count[item.name_en] = (count[item.name_en] || 0) + item.quantity
        })
      })
      setTopDishes(
        Object.entries(count)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([name, count]) => ({ name, count }))
      )
    }

    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-[#E8E8E8] rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 bg-[#E8E8E8] rounded-[14px] animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-[#E8E8E8] rounded-[14px] animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Analytics</h1>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-[28px] font-bold">{totalOrders}</p>
          <p className="text-sm text-[#555]">Total Orders</p>
        </Card>
        <Card>
          <p className="text-[28px] font-bold">{formatPrice(totalRevenue)}</p>
          <p className="text-sm text-[#555]">Total Revenue</p>
        </Card>
      </div>

      <OrdersChart data7d={graph7d} data30d={graph30d} />

      {topDishes.length > 0 && (
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5">
          <h3 className="text-sm font-semibold mb-3">All Time Popular Dishes</h3>
          <div className="space-y-2">
            {topDishes.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-sm gap-2">
                <span className="truncate min-w-0">{i + 1}. {d.name}</span>
                <span className="text-[#555] shrink-0">{d.count} orders</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
