"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { formatPrice } from "@/lib/utils"
import { TrendingUp, ShoppingBag, DollarSign, XCircle, BarChart3, Calendar, UserPlus, Users, Clock, AlertTriangle, Zap, Crown, ShoppingCart, ExternalLink } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, CartesianGrid } from "recharts"

type AnalyticsData = {
  allTime: { total: number; revenue: number; cancelled: number; completed: number }
  last7: any
  last30: any
  customerFlow: {
    newCustomers7: number; newCustomers30: number; totalCustomers: number
    activeBuyers7: number; activeBuyers30: number; repeatCustomers: number
    oneTimeCustomers: number
    purchaseFunnel: { one_order: number; two_orders: number; three_plus: number }
  }
  registrations: { total: number; last7: number; last30: number; byDay: { date: string; count: number }[] }
  restaurants: {
    total: number; activeTrials: number; expiringSoonTrials: number
    expiredTrials: number; activeSubscriptions: number; inactive: number
    planDistribution: Record<string, number>
    byDay: { date: string; count: number }[]
  }
  trialList: any[]
  trialOrderUsage: { id: string; name: string; city: string; trial_end: string; order_count: number; max_orders: number }[]
}

const COLORS = { trial: "#D97706", starter: "#6B7280", growth: "#2563EB", premium: "#EA580C" }
const STATUS_COLORS: Record<string, string> = {
  received: "#2563EB", preparing: "#D97706", ready: "#16A34A", completed: "#6B7280", cancelled: "#DC2626",
}
const TYPE_COLORS: Record<string, string> = { dine_in: "#2563EB", takeaway: "#D97706", delivery: "#16A34A" }

export function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const fetchAnalytics = async () => {
    const res = await fetch("/api/superadmin/analytics")
    if (res.ok) { const json = await res.json(); setData(json) }
    setLoading(false)
  }

  useEffect(() => { fetchAnalytics() }, [])

  const scheduleRefetch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchAnalytics(), 500)
  }

  useEffect(() => {
    const channel = supabase
      .channel(uid("analytics-orders"))
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => scheduleRefetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurants" }, () => scheduleRefetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "customers" }, () => scheduleRefetch())
      .subscribe()
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); supabase.removeChannel(channel) }
  }, [])

  // 15s polling fallback
  useEffect(() => {
    const interval = setInterval(() => scheduleRefetch(), 15000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white rounded-[14px] border border-[#E8E8E8] animate-pulse" />)}
        </div>
        <div className="h-64 bg-white rounded-[14px] border border-[#E8E8E8] animate-pulse" />
      </div>
    )
  }

  if (!data) {
    return <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-12 text-center"><p className="text-[#999] text-sm">Failed to load analytics</p></div>
  }

  const planPie = Object.entries(data.restaurants.planDistribution).map(([name, value]) => ({
    name, value, fill: (COLORS as any)[name] || "#999",
  }))

  const statusPie7: { name: string; value: number; fill: string }[] = Object.entries(data.last7.byStatus || {}).map(([name, value]: [string, any]) => ({
    name, value: value as number, fill: STATUS_COLORS[name] || "#999",
  }))

  const typePie7: { name: string; value: number; fill: string }[] = Object.entries(data.last7.byType || {}).map(([name, value]: [string, any]) => ({
    name, value: value as number, fill: TYPE_COLORS[name] || "#999",
  }))

  const topRestaurantsData: { name: string; orders: number; revenue: number }[] = (
    (data.last7.recent || []).reduce((acc: Record<string, { name: string; orders: number; revenue: number }>, o: any) => {
      const name = o.restaurant?.name || "Unknown"
      if (!acc[name]) acc[name] = { name, orders: 0, revenue: 0 }
      acc[name].orders += 1
      if (o.order_status !== "cancelled") acc[name].revenue += o.total_price
      return acc
    }, {} as Record<string, { name: string; orders: number; revenue: number }>)
  )
  const topSorted = Object.values(topRestaurantsData).sort((a, b) => b.orders - a.orders).slice(0, 10)

  return (
    <div className="space-y-8">
      {/* All Time Overview */}
      <div>
        <h2 className="text-sm font-semibold text-[#555] mb-3 uppercase tracking-wide flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard icon={<ShoppingBag className="w-5 h-5" />} label="Total Orders" value={data.allTime.total.toString()} color="black" />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Total Revenue" value={formatPrice(data.allTime.revenue)} color="green" />
          <StatCard icon={<XCircle className="w-5 h-5" />} label="Cancelled" value={data.allTime.cancelled.toString()} color="red" />
          <StatCard icon={<Crown className="w-5 h-5" />} label="Restaurants" value={data.restaurants.total.toString()} color="black" />
        </div>
      </div>

      {/* Revenue Trend */}
      <div>
        <h2 className="text-sm font-semibold text-[#555] mb-3 uppercase tracking-wide flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Revenue Trend
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
            <p className="text-xs font-semibold text-[#555] mb-3 uppercase tracking-wide">Last 7 Days</p>
            {data.last7.byDay?.length === 0 ? (
              <p className="text-xs text-[#999] text-center py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.last7.byDay}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short" })} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `Rs ${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    labelFormatter={(d) => new Date(d).toLocaleDateString("en-PK", { weekday: "short", day: "numeric", month: "short" })}
                    formatter={(value: number) => [formatPrice(value), "Revenue"]}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E8E8E8" }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#16A34A" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
            <div className="flex justify-between mt-2 text-xs text-[#999]">
              <span>Total: {data.last7.total} orders</span>
              <span>{formatPrice(data.last7.revenue)}</span>
            </div>
          </div>
          <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
            <p className="text-xs font-semibold text-[#555] mb-3 uppercase tracking-wide">Last 30 Days</p>
            {data.last30.byDay?.length === 0 ? (
              <p className="text-xs text-[#999] text-center py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.last30.byDay}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short" })} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `Rs ${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    labelFormatter={(d) => new Date(d).toLocaleDateString("en-PK", { weekday: "short", day: "numeric", month: "short" })}
                    formatter={(value: number) => [formatPrice(value), "Revenue"]}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E8E8E8" }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
            <div className="flex justify-between mt-2 text-xs text-[#999]">
              <span>Total: {data.last30.total} orders</span>
              <span>{formatPrice(data.last30.revenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-[#555] mb-3 uppercase tracking-wide flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" /> Order Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Daily orders bar */}
          <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
            <p className="text-xs font-semibold text-[#555] mb-3 uppercase tracking-wide">Daily Orders (7d)</p>
            {data.last7.byDay?.length === 0 ? (
              <p className="text-xs text-[#999] text-center py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.last7.byDay}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short" })} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E8E8E8" }} />
                  <Bar dataKey="orders" fill="#111" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Status pie */}
          <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
            <p className="text-xs font-semibold text-[#555] mb-3 uppercase tracking-wide">By Status (7d)</p>
            {statusPie7.length === 0 ? (
              <p className="text-xs text-[#999] text-center py-8">No data</p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={statusPie7} cx="50%" cy="50%" innerRadius={28} outerRadius={50} dataKey="value">
                      {statusPie7.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {statusPie7.map((s) => (
                    <div key={s.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.fill }} />
                      <span className="capitalize flex-1">{s.name}</span>
                      <span className="font-medium">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Type pie */}
          <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
            <p className="text-xs font-semibold text-[#555] mb-3 uppercase tracking-wide">By Type (7d)</p>
            {typePie7.length === 0 ? (
              <p className="text-xs text-[#999] text-center py-8">No data</p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={typePie7} cx="50%" cy="50%" innerRadius={28} outerRadius={50} dataKey="value">
                      {typePie7.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {typePie7.map((s) => (
                    <div key={s.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.fill }} />
                      <span className="capitalize flex-1">{s.name.replace("_", " ")}</span>
                      <span className="font-medium">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Restaurants */}
      {topSorted.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#555] mb-3 uppercase tracking-wide flex items-center gap-2">
            <Crown className="w-4 h-4" /> Top Restaurants (7d)
          </h2>
          <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
            <div className="space-y-3">
              {topSorted.slice(0, 5).map((r: any, i: number) => (
                <div key={r.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium flex items-center gap-1.5">
                      <span className="text-[#999]">#{i + 1}</span> {r.name}
                    </span>
                    <span className="text-[#555]">{r.orders} orders • {formatPrice(r.revenue)}</span>
                  </div>
                  <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                    <div className="h-full bg-black rounded-full" style={{ width: `${(r.orders / topSorted[0].orders) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Plan Distribution */}
      <div>
        <h2 className="text-sm font-semibold text-[#555] mb-3 uppercase tracking-wide flex items-center gap-2">
          <Crown className="w-4 h-4" /> Plan Distribution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Plan pie */}
          <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
            {planPie.length === 0 ? (
              <p className="text-xs text-[#999] text-center py-8">No data</p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie data={planPie} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value">
                      {planPie.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {planPie.map((s) => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.fill }} />
                        <span className="capitalize">{s.name}</span>
                      </div>
                      <span className="font-medium">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Active Trials" value={data.restaurants.activeTrials.toString()} color="blue" />
            <StatCard label="Active Subs" value={data.restaurants.activeSubscriptions.toString()} color="green" />
            <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Expiring in 3d" value={data.restaurants.expiringSoonTrials.toString()} color="red" />
            <StatCard label="Expired" value={data.restaurants.expiredTrials.toString()} color="black" />
          </div>
        </div>
      </div>

      {/* Customer Flow */}
      <div>
        <h2 className="text-sm font-semibold text-[#555] mb-3 uppercase tracking-wide flex items-center gap-2">
          <Users className="w-4 h-4" /> Customer Flow
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Purchase Funnel */}
          <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
            <p className="text-xs font-semibold text-[#555] mb-3 uppercase tracking-wide">Purchase Funnel</p>
            {data.customerFlow.totalCustomers === 0 ? (
              <p className="text-xs text-[#999] text-center py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={[
                  { name: "1 order", value: data.customerFlow.purchaseFunnel.one_order, fill: "#D1D5DB" },
                  { name: "2 orders", value: data.customerFlow.purchaseFunnel.two_orders, fill: "#2563EB" },
                  { name: "3+ orders", value: data.customerFlow.purchaseFunnel.three_plus, fill: "#16A34A" },
                ]} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {[
                      <Cell key="1" fill="#D1D5DB" />,
                      <Cell key="2" fill="#2563EB" />,
                      <Cell key="3" fill="#16A34A" />,
                    ]}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            <div className="mt-2 pt-2 border-t border-[#F0F0F0] text-xs text-[#999]">
              {data.customerFlow.totalCustomers > 0
                ? `${Math.round((data.customerFlow.repeatCustomers / data.customerFlow.totalCustomers) * 100)}% repeat buyers`
                : "No customers yet"}
            </div>
          </div>
          {/* Customer Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={<UserPlus className="w-4 h-4" />} label="New (30d)" value={data.customerFlow.newCustomers30.toString()} color="green" />
            <StatCard icon={<ShoppingBag className="w-4 h-4" />} label="Active Buyers (30d)" value={data.customerFlow.activeBuyers30.toString()} color="blue" />
            <StatCard icon={<Zap className="w-4 h-4" />} label="Repeat" value={data.customerFlow.repeatCustomers.toString()} color="black" />
            <StatCard label="Total Customers" value={data.customerFlow.totalCustomers.toString()} color="black" />
          </div>
        </div>
      </div>

      {/* Restaurant Signups */}
      <div>
        <h2 className="text-sm font-semibold text-[#555] mb-3 uppercase tracking-wide flex items-center gap-2">
          <Users className="w-4 h-4" /> Restaurant Signups (30d)
        </h2>
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div><p className="text-[18px] font-bold">{data.restaurants.total}</p><p className="text-[10px] text-[#999]">Total</p></div>
            <div><p className="text-[18px] font-bold text-[#2563EB]">{data.restaurants.byDay.filter((d: any) => {
              const d7 = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
              return d.date >= d7
            }).reduce((s: number, d: any) => s + d.count, 0)}</p><p className="text-[10px] text-[#999]">Last 7d</p></div>
            <div><p className="text-[18px] font-bold text-[#16A34A]">{data.restaurants.byDay.reduce((s: number, d: any) => s + d.count, 0)}</p><p className="text-[10px] text-[#999]">Last 30d</p></div>
          </div>
          {data.restaurants.byDay.length === 0 ? (
            <p className="text-xs text-[#999] text-center py-4">No new signups in 30d</p>
          ) : (
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={data.restaurants.byDay}>
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(d) => new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short" })} />
                <YAxis allowDecimals={false} tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#FF6B35" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Customer Registrations */}
      <div>
        <h2 className="text-sm font-semibold text-[#555] mb-3 uppercase tracking-wide flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Customer Registrations (30d)
        </h2>
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div><p className="text-[18px] font-bold">{data.registrations.total}</p><p className="text-[10px] text-[#999]">Total</p></div>
            <div><p className="text-[18px] font-bold text-[#16A34A]">{data.registrations.last30}</p><p className="text-[10px] text-[#999]">Last 30d</p></div>
          </div>
          {data.registrations.byDay.length === 0 ? (
            <p className="text-xs text-[#999] text-center py-4">No registrations in 30d</p>
          ) : (
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={data.registrations.byDay}>
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(d) => new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short" })} />
                <YAxis allowDecimals={false} tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#111" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Trial Order Usage */}
      {data.trialOrderUsage?.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#555] mb-3 uppercase tracking-wide flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> Trial Order Usage
          </h2>
          <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
            <p className="text-[11px] text-[#999] mb-3">Order progress for active trial restaurants (max 10).</p>
            <div className="space-y-2.5">
              {data.trialOrderUsage.map((r) => {
                const pct = Math.min(100, (r.order_count / r.max_orders) * 100)
                const daysLeft = Math.max(0, Math.ceil((new Date(r.trial_end).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
                const atLimit = r.order_count >= r.max_orders
                return (
                  <a key={r.id} href={`/superadmin/restaurants/${r.id}`} className="block p-2 -mx-2 rounded-lg hover:bg-[#FAFAFA] transition-colors">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <p className="font-medium truncate flex-1 min-w-0">{r.name}</p>
                      <p className={`text-xs ml-2 font-semibold flex-shrink-0 ${atLimit ? "text-[#DC2626]" : pct >= 70 ? "text-[#D97706]" : "text-[#555]"}`}>
                        {r.order_count}/{r.max_orders} • {daysLeft === 0 ? "Today" : `${daysLeft}d left`}
                      </p>
                    </div>
                    <div className="h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${atLimit ? "bg-[#DC2626]" : pct >= 70 ? "bg-[#D97706]" : "bg-black"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Trials Expiring Soon */}
      {data.trialList?.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#555] mb-3 uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#D97706]" /> Trials Expiring Soon
          </h2>
          <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
            <div className="space-y-2">
              {data.trialList.map((r: any) => {
                const daysLeft = Math.max(0, Math.ceil((new Date(r.trial_end).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
                return (
                  <a key={r.id} href={`/superadmin/restaurants/${r.id}`} className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-[#FAFAFA] transition-colors text-sm">
                    <div><p className="font-medium">{r.name}</p><p className="text-xs text-[#999]">{r.city}</p></div>
                    <div className="text-right">
                      <p className={`text-xs font-semibold ${daysLeft <= 1 ? "text-[#DC2626]" : "text-[#D97706]"}`}>{daysLeft === 0 ? "Today" : `${daysLeft}d left`}</p>
                      <p className="text-xs text-[#999]">{new Date(r.trial_end).toLocaleDateString()}</p>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {data.last7.recent?.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#555] mb-3 uppercase tracking-wide">Recent Orders (7d)</h2>
          <div className="bg-white rounded-[14px] border border-[#E8E8E8] overflow-hidden">
            <div className="divide-y divide-[#F0F0F0]">
              {data.last7.recent.map((o: any) => (
                <div key={o.id} className="p-3 flex items-center justify-between text-sm hover:bg-[#FAFAFA]">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{o.order_number}</p>
                    <p className="text-xs text-[#999] truncate">{o.restaurant?.name || "—"} • {o.customer_name}</p>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <p className="font-semibold text-sm">{formatPrice(o.total_price)}</p>
                    <p className="text-xs text-[#999] capitalize">{o.order_status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon?: React.ReactNode; label: string; value: string; color: "black" | "green" | "red" | "blue" }) {
  const colorMap = { black: "text-black", green: "text-[#16A34A]", red: "text-[#DC2626]", blue: "text-[#2563EB]" }
  return (
    <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-3">
      <div className="flex items-center justify-between mb-1">{icon && <span className="text-[#999]">{icon}</span>}</div>
      <p className={`text-[20px] font-bold ${colorMap[color]}`}>{value}</p>
      <p className="text-xs text-[#555]">{label}</p>
    </div>
  )
}
