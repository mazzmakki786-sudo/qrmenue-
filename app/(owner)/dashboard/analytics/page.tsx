"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils"
import type { DailyStats } from "@/types"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

type DateRange = "7d" | "30d"

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
        const day = new Date(o.created_at).toISOString().split("T")[0]
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
      <div className="space-y-4">
        <div className="h-7 w-32 bg-[#F0F0F0] rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-[#F0F0F0] rounded-2xl animate-pulse" />
          <div className="h-24 bg-[#F0F0F0] rounded-2xl animate-pulse" />
        </div>
        <div className="h-48 bg-[#F0F0F0] rounded-2xl animate-pulse" />
        <div className="h-48 bg-[#F0F0F0] rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Analytics</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-[#F0F0F0] p-4 rounded-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#555]">Total Orders</p>
          <p className="text-2xl font-bold text-black mt-1">{totalOrders}</p>
        </div>
        <div className="bg-white border border-[#F0F0F0] p-4 rounded-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#555]">Total Revenue</p>
          <p className="text-2xl font-bold text-black mt-1 truncate">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      {/* Orders Over Time */}
      <div className="bg-white border border-[#F0F0F0] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-black">Orders Over Time</h3>
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
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#999" }}
                  tickFormatter={(v: string) => {
                    const d = new Date(v)
                    return `${d.getMonth() + 1}/${d.getDate()}`
                  }}
                />
                <YAxis tick={{ fontSize: 10, fill: "#999" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #F0F0F0", fontSize: 12 }}
                  formatter={(value: number) => [value, "Orders"]}
                  labelFormatter={(label: string) => new Date(label).toLocaleDateString()}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#000"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#000" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-xs text-[#999]">
            No order data yet
          </div>
        )}
      </div>

      {/* Revenue Over Time */}
      <div className="bg-white border border-[#F0F0F0] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-black">Revenue Over Time</h3>
        </div>
        {chartData.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#999" }}
                  tickFormatter={(v: string) => {
                    const d = new Date(v)
                    return `${d.getMonth() + 1}/${d.getDate()}`
                  }}
                />
                <YAxis tick={{ fontSize: 10, fill: "#999" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #F0F0F0", fontSize: 12 }}
                  formatter={(value: number) => [`Rs ${value.toLocaleString("en-PK")}`, "Revenue"]}
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
          <div className="h-32 flex items-center justify-center text-xs text-[#999]">
            No revenue data yet
          </div>
        )}
      </div>

      {/* Popular Dishes */}
      {topDishes.length > 0 && (
        <div className="bg-white border border-[#F0F0F0] rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-black mb-3">Popular Dishes</h3>
          <div className="space-y-2.5">
            {topDishes.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-[#999] w-4">{i + 1}.</span>
                  <span className="text-sm font-medium text-black truncate">{d.name}</span>
                </div>
                <span className="text-xs text-[#555] font-medium shrink-0 ml-3">{d.count} orders</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Type Breakdown */}
      {Object.keys(orderTypeStats).length > 0 && (
        <div className="bg-white border border-[#F0F0F0] rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-black mb-3">Order Types</h3>
          <div className="space-y-3">
            {Object.entries(orderTypeStats)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-[#555]">{orderTypeLabels[type] || type}</span>
                    <span className="text-xs text-[#999]">{count} orders</span>
                  </div>
                  <div className="h-2 w-full bg-[#F0F0F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxTypeCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
