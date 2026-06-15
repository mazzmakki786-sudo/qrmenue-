"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import type { DailyStats } from "@/types"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

type DateRange = "7d" | "30d"

const NAV_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "revenue", label: "Revenue" },
  { id: "popular", label: "Popular" },
  { id: "order-types", label: "Order Types" },
] as const

export default function AnalyticsPage() {
  const [graph7d, setGraph7d] = useState<DailyStats[]>([])
  const [graph30d, setGraph30d] = useState<DailyStats[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [topDishes, setTopDishes] = useState<{ name: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>("7d")
  const [orderTypeStats, setOrderTypeStats] = useState<Record<string, number>>({})

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
        .select("items, total_price, order_type, created_at")
        .eq("restaurant_id", restaurant.id)
        .neq("order_status", "cancelled"),
    ])

    if (statsRes.data && statsRes.data.length > 0) {
      const reversed = [...statsRes.data].reverse()
      setGraph7d(reversed.slice(-7))
      setGraph30d(reversed)
      setTotalOrders(statsRes.data.reduce((s, d) => s + d.total_orders, 0))
      setTotalRevenue(statsRes.data.reduce((s, d) => s + d.total_revenue, 0))
    } else if (ordersRes.data) {
      setTotalOrders(ordersRes.data.length)
      setTotalRevenue(ordersRes.data.reduce((s, o) => s + o.total_price, 0))

      const grouped: Record<string, { total_orders: number; total_revenue: number }> = {}
      ordersRes.data.forEach((o: any) => {
        const d = new Date(o.created_at)
        const pkDate = new Date(d.getTime() + 5 * 60 * 60 * 1000).toISOString().split("T")[0]
        const day = pkDate
        if (!grouped[day]) grouped[day] = { total_orders: 0, total_revenue: 0 }
        grouped[day].total_orders += 1
        grouped[day].total_revenue += o.total_price
      })
      const graphData: DailyStats[] = Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({
          restaurant_id: restaurant.id,
          order_date: date,
          total_orders: v.total_orders,
          total_revenue: v.total_revenue,
          unique_customers: 0,
        }))
      setGraph7d(graphData.slice(-7))
      setGraph30d(graphData.slice(-30))
    }

    if (ordersRes.data) {
      const count: Record<string, number> = {}
      const typeCount: Record<string, number> = {}
      ordersRes.data.forEach((o: any) => {
        typeCount[o.order_type] = (typeCount[o.order_type] || 0) + 1
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
      setOrderTypeStats(typeCount)
    }

    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const chartData = (dateRange === "7d" ? graph7d : graph30d).map((d) => ({
    date: d.order_date,
    revenue: d.total_revenue,
    orders: d.total_orders,
  }))

  const maxTypeCount = Math.max(...Object.values(orderTypeStats), 1)

  const orderTypeLabels: Record<string, string> = {
    dine_in: "Dine-in",
    takeaway: "Takeaway",
    delivery: "Delivery",
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-[#F0F0F0] rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 bg-[#F0F0F0] rounded-[14px] animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-[#F0F0F0] rounded-[14px] animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Analytics</h1>

      {/* Anchor Navigation */}
      <nav className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {NAV_SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#F0F0F0] text-[#555] hover:bg-[#E2E2E2] whitespace-nowrap transition-colors"
          >
            {s.label}
          </a>
        ))}
      </nav>

      {/* Overview Stats */}
      <section id="overview" className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-[28px] font-bold">{totalOrders}</p>
          <p className="text-sm text-[#555]">Total Orders</p>
        </Card>
        <Card>
          <p className="text-[28px] font-bold">{formatPrice(totalRevenue)}</p>
          <p className="text-sm text-[#555]">Total Revenue</p>
        </Card>
      </section>

      {/* Revenue Over Time */}
      <section id="revenue" className="bg-white rounded-[14px] border border-[#F0F0F0] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Revenue Over Time</h3>
          <div className="flex gap-1">
            {(["7d", "30d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  dateRange === r ? "bg-black text-white" : "bg-[#F8F8F8] text-[#555]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#999" }}
                  tickFormatter={(v: string) => {
                    const d = new Date(v)
                    return `${d.getMonth() + 1}/${d.getDate()}`
                  }}
                />
                <YAxis tick={{ fontSize: 11, fill: "#999" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #F0F0F0", fontSize: 12 }}
                  formatter={(value: number) => [`PKR ${formatPrice(value)}`, "Revenue"]}
                  labelFormatter={(label: string) => new Date(label).toLocaleDateString()}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#25D366"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#25D366" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-sm text-[#999]">
            No revenue data yet
          </div>
        )}
      </section>

      {/* Popular Dishes */}
      {topDishes.length > 0 && (
        <section id="popular" className="bg-white rounded-[14px] border border-[#F0F0F0] p-5">
          <h3 className="text-sm font-semibold mb-3">All Time Popular Dishes</h3>
          <div className="space-y-2">
            {topDishes.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-sm gap-2">
                <span className="truncate min-w-0">{i + 1}. {d.name}</span>
                <span className="text-[#555] shrink-0">{d.count} orders</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Order Type Breakdown */}
      {Object.keys(orderTypeStats).length > 0 && (
        <section id="order-types" className="bg-white rounded-[14px] border border-[#F0F0F0] p-5">
          <h3 className="text-sm font-semibold mb-4">Order Type Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(orderTypeStats)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-[#555]">{orderTypeLabels[type] || type}</span>
                    <span className="text-xs text-[#999]">{count} orders</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#F0F0F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxTypeCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  )
}
