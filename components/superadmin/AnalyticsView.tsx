"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils"
import { TrendingUp, ShoppingBag, DollarSign, XCircle, BarChart3, Calendar, UserPlus, Users, Clock, AlertTriangle, Zap, Crown, ShoppingCart, ExternalLink } from "lucide-react"

type AnalyticsData = {
  allTime: { total: number; revenue: number; cancelled: number; completed: number }
  last7: any
  last30: any
  customerFlow: {
    newCustomers7: number
    newCustomers30: number
    totalCustomers: number
    activeBuyers7: number
    activeBuyers30: number
    repeatCustomers: number
    oneTimeCustomers: number
    purchaseFunnel: { one_order: number; two_orders: number; three_plus: number }
  }
  registrations: {
    total: number
    last7: number
    last30: number
    byDay: { date: string; count: number }[]
  }
  restaurants: {
    total: number
    activeTrials: number
    expiringSoonTrials: number
    expiredTrials: number
    activeSubscriptions: number
    inactive: number
    planDistribution: Record<string, number>
    byDay: { date: string; count: number }[]
  }
  trialList: any[]
  trialOrderUsage: { id: string; name: string; city: string; trial_end: string; order_count: number; max_orders: number }[]
}

export function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const fetchAnalytics = async () => {
    const res = await fetch("/api/superadmin/analytics")
    if (res.ok) {
      const json = await res.json()
      setData(json)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  // Debounced 500ms real-time
  const scheduleRefetch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchAnalytics()
    }, 500)
  }

  useEffect(() => {
    const channel = supabase
      .channel("analytics-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => scheduleRefetch()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "restaurants" },
        () => scheduleRefetch()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customers" },
        () => scheduleRefetch()
      )
      .subscribe()
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-[14px] border border-[#E8E8E8] animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-white rounded-[14px] border border-[#E8E8E8] animate-pulse" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-12 text-center">
        <p className="text-[#999] text-sm">Failed to load analytics</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* === Customer Flow & Registrations === */}
      <div>
        <h2 className="text-sm font-semibold text-[#555] mb-3 uppercase tracking-wide flex items-center gap-2">
          <Users className="w-4 h-4" /> Customer Flow & Registrations
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard
            icon={<UserPlus className="w-5 h-5" />}
            label="New Customers (30d)"
            value={data.customerFlow.newCustomers30.toString()}
            color="green"
          />
          <StatCard
            icon={<ShoppingBag className="w-5 h-5" />}
            label="Active Buyers (30d)"
            value={data.customerFlow.activeBuyers30.toString()}
            color="blue"
          />
          <StatCard
            icon={<Zap className="w-5 h-5" />}
            label="Repeat Customers"
            value={data.customerFlow.repeatCustomers.toString()}
            color="black"
          />
          <StatCard
            label="Total Customers"
            value={data.customerFlow.totalCustomers.toString()}
            color="black"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Purchase Funnel */}
          <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
            <h3 className="text-xs font-semibold text-[#555] mb-3 uppercase tracking-wide">Purchase Funnel</h3>
            <div className="space-y-2">
              <FunnelRow label="1 order" value={data.customerFlow.purchaseFunnel.one_order} total={data.customerFlow.totalCustomers} color="bg-[#F0F0F0]" />
              <FunnelRow label="2 orders" value={data.customerFlow.purchaseFunnel.two_orders} total={data.customerFlow.totalCustomers} color="bg-[#2563EB]" />
              <FunnelRow label="3+ orders" value={data.customerFlow.purchaseFunnel.three_plus} total={data.customerFlow.totalCustomers} color="bg-[#16A34A]" />
            </div>
            <div className="mt-3 pt-3 border-t border-[#F0F0F0] text-xs text-[#999]">
              {data.customerFlow.totalCustomers > 0
                ? `${Math.round((data.customerFlow.repeatCustomers / data.customerFlow.totalCustomers) * 100)}% are repeat buyers`
                : "No customers yet"}
            </div>
          </div>

          {/* Registrations chart */}
          <DayBarChart
            title="Customer Registrations (30d)"
            days={data.registrations.byDay}
            totalLabel="Total in 30d"
            total={data.registrations.last30}
          />
        </div>
      </div>

      {/* === Trials & Subscriptions === */}
      <div>
        <h2 className="text-sm font-semibold text-[#555] mb-3 uppercase tracking-wide flex items-center gap-2">
          <Crown className="w-4 h-4" /> Trials & Subscriptions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard
            label="Total Restaurants"
            value={data.restaurants.total.toString()}
            color="black"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Active Trials"
            value={data.restaurants.activeTrials.toString()}
            color="blue"
          />
          <StatCard
            icon={<AlertTriangle className="w-5 h-5" />}
            label="Expiring in 3d"
            value={data.restaurants.expiringSoonTrials.toString()}
            color={data.restaurants.expiringSoonTrials > 0 ? "red" : "black"}
          />
          <StatCard
            icon={<Crown className="w-5 h-5" />}
            label="Active Subs"
            value={data.restaurants.activeSubscriptions.toString()}
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlanDistribution data={data.restaurants.planDistribution} />
          <RestaurantRegistrationChart
            byDay={data.restaurants.byDay}
            total={data.restaurants.total}
            last7={data.registrations.last7}
            last30={data.registrations.last30}
          />
        </div>

        {/* Trial order usage (NEW) */}
        {data.trialOrderUsage && data.trialOrderUsage.length > 0 && (
          <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4 mt-4">
            <h3 className="text-xs font-semibold text-[#555] mb-3 uppercase tracking-wide flex items-center gap-2">
              <ShoppingCart className="w-3 h-3" /> Trial Order Usage
            </h3>
            <p className="text-[11px] text-[#999] mb-3">Order progress for active trial restaurants (max 10).</p>
            <div className="space-y-2.5">
              {data.trialOrderUsage.map((r) => {
                const pct = Math.min(100, (r.order_count / r.max_orders) * 100)
                const daysLeft = Math.max(0, Math.ceil((new Date(r.trial_end).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
                const atLimit = r.order_count >= r.max_orders
                return (
                  <a
                    key={r.id}
                    href={`/superadmin/restaurants/${r.id}`}
                    className="block p-2 -mx-2 rounded-lg hover:bg-[#FAFAFA] transition-colors"
                  >
                    <div className="flex items-center justify-between text-sm mb-1">
                      <p className="font-medium truncate flex-1 min-w-0">{r.name}</p>
                      <p className={`text-xs ml-2 font-semibold flex-shrink-0 ${atLimit ? "text-[#DC2626]" : pct >= 70 ? "text-[#D97706]" : "text-[#555]"}`}>
                        {r.order_count}/{r.max_orders} • {daysLeft === 0 ? "Today" : `${daysLeft}d left`}
                      </p>
                    </div>
                    <div className="h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${atLimit ? "bg-[#DC2626]" : pct >= 70 ? "bg-[#D97706]" : "bg-black"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {data.trialList?.length > 0 && (
          <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4 mt-4">
            <h3 className="text-xs font-semibold text-[#555] mb-3 uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-[#D97706]" /> Trials Expiring Soon
            </h3>
            <div className="space-y-2">
              {data.trialList.map((r: any) => {
                const daysLeft = Math.max(0, Math.ceil((new Date(r.trial_end).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
                return (
                  <a
                    key={r.id}
                    href={`/superadmin/restaurants/${r.id}`}
                    className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-[#FAFAFA] transition-colors text-sm"
                  >
                    <div>
                      <p className="font-medium">{r.name}</p>
                      <p className="text-xs text-[#999]">{r.city}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-semibold ${daysLeft <= 1 ? "text-[#DC2626]" : "text-[#D97706]"}`}>
                        {daysLeft === 0 ? "Today" : `${daysLeft}d left`}
                      </p>
                      <p className="text-xs text-[#999]">{new Date(r.trial_end).toLocaleDateString()}</p>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* === Order analytics === */}
      <div>
        <h2 className="text-sm font-semibold text-[#555] mb-3 uppercase tracking-wide flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" /> Order Analytics
        </h2>

        <div className="mb-4">
          <h3 className="text-xs font-semibold text-[#555] mb-3 uppercase tracking-wide">All Time</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Orders" value={data.allTime.total.toString()} color="black" />
            <StatCard label="Revenue" value={formatPrice(data.allTime.revenue)} color="green" />
            <StatCard label="Cancelled" value={data.allTime.cancelled.toString()} color="red" />
            <StatCard label="Completed" value={data.allTime.completed.toString()} color="blue" />
          </div>
        </div>

        {/* 7-day */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-[#555] mb-3 uppercase tracking-wide flex items-center gap-2">
            <Calendar className="w-3 h-3" /> Last 7 Days
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <StatCard label="Orders" value={data.last7.total.toString()} color="black" />
            <StatCard label="Revenue" value={formatPrice(data.last7.revenue)} color="green" />
            <StatCard label="Cancelled" value={data.last7.cancelled.toString()} color="red" />
            <StatCard label="Avg/day" value={(data.last7.total / 7).toFixed(1)} color="blue" />
          </div>
          <DayChart days={data.last7.byDay} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <StatusBreakdown data={data.last7.byStatus} />
            <TypeBreakdown data={data.last7.byType} />
          </div>
        </div>

        {/* 30-day */}
        <div>
          <h3 className="text-xs font-semibold text-[#555] mb-3 uppercase tracking-wide flex items-center gap-2">
            <Calendar className="w-3 h-3" /> Last 30 Days
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <StatCard label="Orders" value={data.last30.total.toString()} color="black" />
            <StatCard label="Revenue" value={formatPrice(data.last30.revenue)} color="green" />
            <StatCard label="Cancelled" value={data.last30.cancelled.toString()} color="red" />
            <StatCard label="Avg/day" value={(data.last30.total / 30).toFixed(1)} color="blue" />
          </div>
          <DayChart days={data.last30.byDay} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <StatusBreakdown data={data.last30.byStatus} />
            <TypeBreakdown data={data.last30.byType} />
          </div>
        </div>
      </div>

      {/* Recent orders */}
      {data.last7.recent?.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#555] mb-3 uppercase tracking-wide">
            Recent Orders (7 days)
          </h2>
          <div className="bg-white rounded-[14px] border border-[#E8E8E8] overflow-hidden">
            <div className="divide-y divide-[#F0F0F0]">
              {data.last7.recent.map((o: any) => (
                <div key={o.id} className="p-3 flex items-center justify-between text-sm hover:bg-[#FAFAFA]">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{o.order_number}</p>
                    <p className="text-xs text-[#999] truncate">
                      {o.restaurant?.name || "—"} • {o.customer_name}
                    </p>
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

function FunnelRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2 flex-1 ml-3">
        <div className="flex-1 h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-medium w-12 text-right">{value} ({pct}%)</span>
      </div>
    </div>
  )
}

function PlanDistribution({ data }: { data: Record<string, number> }) {
  const total = Object.values(data).reduce((s, n) => s + n, 0) || 1
  const colors: Record<string, string> = {
    trial: "bg-[#FEF3C7] text-[#D97706]",
    starter: "bg-[#F0F0F0] text-[#555]",
    growth: "bg-[#EFF6FF] text-[#2563EB]",
    premium: "bg-[#FFF7ED] text-[#EA580C]",
  }
  return (
    <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
      <h3 className="text-xs font-semibold text-[#555] mb-3 uppercase tracking-wide">Plan Distribution</h3>
      <div className="space-y-2">
        {Object.entries(data).length === 0 ? (
          <p className="text-xs text-[#999]">No data</p>
        ) : (
          Object.entries(data)
            .sort((a, b) => b[1] - a[1])
            .map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${colors[plan] || "bg-[#F0F0F0] text-[#555]"}`}>
                  {plan}
                </span>
                <div className="flex items-center gap-2 flex-1 ml-3">
                  <div className="flex-1 h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                    <div className="h-full bg-black rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}

function RestaurantRegistrationChart({ byDay, total, last7, last30 }: { byDay: { date: string; count: number }[]; total: number; last7: number; last30: number }) {
  return (
    <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
      <h3 className="text-xs font-semibold text-[#555] mb-3 uppercase tracking-wide">Restaurant Signups (30d)</h3>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <p className="text-[18px] font-bold">{total}</p>
          <p className="text-[10px] text-[#999]">Total</p>
        </div>
        <div>
          <p className="text-[18px] font-bold text-[#2563EB]">{last7}</p>
          <p className="text-[10px] text-[#999]">Last 7d</p>
        </div>
        <div>
          <p className="text-[18px] font-bold text-[#16A34A]">{last30}</p>
          <p className="text-[10px] text-[#999]">Last 30d</p>
        </div>
      </div>
      {byDay.length === 0 ? (
        <p className="text-xs text-[#999] text-center py-4">No new signups in 30d</p>
      ) : (
        <div className="flex items-end gap-0.5 h-20">
          {byDay.map((d) => {
            const max = Math.max(...byDay.map((x) => x.count), 1)
            return (
              <div
                key={d.date}
                className="flex-1 bg-[#FF6B35] rounded-t min-h-[2px] hover:opacity-80"
                style={{ height: `${(d.count / max) * 100}%` }}
                title={`${d.date}: ${d.count} signups`}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function DayBarChart({ title, days, totalLabel, total }: { title: string; days: { date: string; count: number }[]; totalLabel: string; total: number }) {
  return (
    <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-[#555] uppercase tracking-wide">{title}</h3>
        <span className="text-xs text-[#999]">{totalLabel}: {total}</span>
      </div>
      {days.length === 0 ? (
        <p className="text-xs text-[#999] text-center py-4">No data</p>
      ) : (
        <div className="flex items-end gap-0.5 h-20">
          {days.map((d) => {
            const max = Math.max(...days.map((x) => x.count), 1)
            return (
              <div
                key={d.date}
                className="flex-1 bg-black rounded-t min-h-[2px] hover:bg-[#333]"
                style={{ height: `${(d.count / max) * 100}%` }}
                title={`${d.date}: ${d.count}`}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon?: React.ReactNode
  label: string
  value: string
  color: "black" | "green" | "red" | "blue"
}) {
  const colorMap = {
    black: "text-black",
    green: "text-[#16A34A]",
    red: "text-[#DC2626]",
    blue: "text-[#2563EB]",
  }
  return (
    <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-3">
      <div className="flex items-center justify-between mb-1">
        {icon && <span className="text-[#999]">{icon}</span>}
      </div>
      <p className={`text-[20px] font-bold ${colorMap[color]}`}>{value}</p>
      <p className="text-xs text-[#555]">{label}</p>
    </div>
  )
}

function DayChart({ days }: { days: { date: string; orders: number; revenue: number }[] }) {
  if (days.length === 0) {
    return (
      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-12 text-center">
        <BarChart3 className="w-8 h-8 text-[#999] mx-auto mb-2" />
        <p className="text-[#999] text-sm">No data in this period</p>
      </div>
    )
  }
  const max = Math.max(...days.map((d) => d.orders), 1)
  return (
    <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
      <div className="flex items-end gap-1 h-40">
        {days.map((d) => {
          const height = (d.orders / max) * 100
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <div className="relative w-full flex flex-col items-center justify-end h-32">
                <div
                  className="w-full bg-black rounded-t-md min-h-[2px] transition-all hover:bg-[#333]"
                  style={{ height: `${height}%` }}
                  title={`${d.date}: ${d.orders} orders, ${formatPrice(d.revenue)}`}
                />
              </div>
              <p className="text-[10px] text-[#999] truncate w-full text-center">
                {new Date(d.date).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatusBreakdown({ data }: { data: Record<string, number> }) {
  const total = Object.values(data).reduce((s, n) => s + n, 0) || 1
  const colors: Record<string, string> = {
    received: "bg-[#EFF6FF] text-[#2563EB]",
    preparing: "bg-[#FEF3C7] text-[#D97706]",
    ready: "bg-[#DCFCE7] text-[#16A34A]",
    completed: "bg-[#F0F0F0] text-[#16A34A]",
    cancelled: "bg-[#FEE2E2] text-[#DC2626]",
  }
  return (
    <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
      <h3 className="text-xs font-semibold text-[#555] mb-3 uppercase tracking-wide">By Status</h3>
      <div className="space-y-2">
        {Object.entries(data).length === 0 ? (
          <p className="text-xs text-[#999]">No data</p>
        ) : (
          Object.entries(data)
            .sort((a, b) => b[1] - a[1])
            .map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${colors[status] || "bg-[#F0F0F0] text-[#555]"}`}>
                  {status}
                </span>
                <div className="flex items-center gap-2 flex-1 ml-3">
                  <div className="flex-1 h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full"
                      style={{ width: `${(count / total) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}

function TypeBreakdown({ data }: { data: Record<string, number> }) {
  const total = Object.values(data).reduce((s, n) => s + n, 0) || 1
  const labels: Record<string, string> = {
    dine_in: "Dine In",
    takeaway: "Takeaway",
    delivery: "Delivery",
  }
  return (
    <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
      <h3 className="text-xs font-semibold text-[#555] mb-3 uppercase tracking-wide">By Type</h3>
      <div className="space-y-2">
        {Object.entries(data).length === 0 ? (
          <p className="text-xs text-[#999]">No data</p>
        ) : (
          Object.entries(data)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm capitalize">{labels[type] || type}</span>
                <div className="flex items-center gap-2 flex-1 ml-3">
                  <div className="flex-1 h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF6B35] rounded-full"
                      style={{ width: `${(count / total) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}
