"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useParams } from "next/navigation"
import { PlanEditor } from "@/components/superadmin/PlanEditor"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { ArrowLeft, Phone, MapPin, Mail, Calendar, ExternalLink, ShoppingBag, Utensils, ToggleLeft, ToggleRight, BarChart3, Users, TrendingUp, XCircle, Clock, Image as ImageIcon, Crown, Loader2, RotateCcw } from "lucide-react"
import Link from "next/link"
import type { Restaurant } from "@/types"
import { PLAN_PRICES } from "@/lib/subscription"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts"

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null)
  const [dishes, setDishes] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0, revenue: 0, last7: 0, last30: 0,
    last7Revenue: 0, last30Revenue: 0,
    avgOrder: 0, cancelled: 0, customers: 0,
  })
  const [chart7, setChart7] = useState<{ date: string; orders: number; revenue: number }[]>([])
  const [chart30, setChart30] = useState<{ date: string; orders: number; revenue: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [resetMsg, setResetMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  const supabase = createClient()
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = async () => {
    const [r, dishesRes, ordersRes, ownerRes, customersRes] = await Promise.all([
      supabase.from("restaurants").select("*").eq("id", id).single(),
      supabase.from("dishes").select("*").eq("restaurant_id", id).order("created_at", { ascending: false }),
      supabase.from("orders").select("*").eq("restaurant_id", id).order("created_at", { ascending: false }).limit(500),
      fetch("/api/superadmin/users").then((res) => res.json()).catch(() => null),
      fetch(`/api/superadmin/restaurants/${id}/customers`).then((res) => res.json()).catch(() => null),
    ])

    if (r.data) {
      setRestaurant(r.data)
      const users = ownerRes?.users || []
      const owner = users.find((u: any) => u.id === r.data.owner_id)
      setOwnerEmail(owner?.email || null)
    }

    setDishes(dishesRes.data || [])
    const allOrders = ordersRes.data || []
    setOrders(allOrders)
    setCustomers(customersRes?.customers || [])

    const now = Date.now()
    const last7 = allOrders.filter((o: any) => Date.parse(o.created_at) > now - 7 * 86400000)
    const last30 = allOrders.filter((o: any) => Date.parse(o.created_at) > now - 30 * 86400000)
    const valid = allOrders.filter((o: any) => o.order_status !== "cancelled")
    const revenue = valid.reduce((s: number, o: any) => s + o.total_price, 0)
    const rev7 = last7.filter((o: any) => o.order_status !== "cancelled").reduce((s: number, o: any) => s + o.total_price, 0)
    const rev30 = last30.filter((o: any) => o.order_status !== "cancelled").reduce((s: number, o: any) => s + o.total_price, 0)
    const cancelled = allOrders.filter((o: any) => o.order_status === "cancelled").length

    setStats({
      total: allOrders.length,
      revenue,
      last7: last7.length,
      last30: last30.length,
      last7Revenue: rev7,
      last30Revenue: rev30,
      avgOrder: valid.length > 0 ? Math.round(revenue / valid.length) : 0,
      cancelled,
      customers: customersRes?.customers?.length || 0,
    })

    setChart7(buildChart(last7))
    setChart30(buildChart(last30))
    setLoading(false)
  }

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  // Debounced 500ms real-time
  const scheduleRefetch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { fetchData() }, 500)
  }

  useEffect(() => {
    if (!id) return
    const channel = supabase
      .channel(`restaurant-${id}-changes`)
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurants", filter: `id=eq.${id}` }, () => scheduleRefetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${id}` }, () => scheduleRefetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "dishes", filter: `restaurant_id=eq.${id}` }, () => scheduleRefetch())
      .subscribe()
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      supabase.removeChannel(channel)
    }
  }, [id])

  // 15s polling fallback
  useEffect(() => {
    if (!id) return
    const interval = setInterval(() => scheduleRefetch(), 15000)
    return () => clearInterval(interval)
  }, [id])

  const handleToggleActive = async () => {
    if (!restaurant) return
    const next = !restaurant.is_active
    setRestaurant({ ...restaurant, is_active: next })
    try {
      const res = await fetch(`/api/superadmin/restaurants/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: next }),
      })
      if (!res.ok) { setRestaurant({ ...restaurant, is_active: !next }) }
      else { await fetchData() }
    } catch { setRestaurant({ ...restaurant, is_active: !next }) }
  }

  const handleToggleImages = async () => {
    if (!restaurant) return
    const next = !restaurant.image_upload_allowed
    setRestaurant({ ...restaurant, image_upload_allowed: next })
    try {
      const res = await fetch(`/api/superadmin/restaurants/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_upload_allowed: next }),
      })
      if (!res.ok) { setRestaurant({ ...restaurant, image_upload_allowed: !next }) }
      else { await fetchData() }
    } catch { setRestaurant({ ...restaurant, image_upload_allowed: !next }) }
  }

  const handlePlanUpdate = async (plan: string, endDate: string) => {
    setSaving(true)
    try {
      await fetch(`/api/superadmin/restaurants/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, plan_end_date: plan === "trial" ? null : endDate || null }),
      })
      const amount = PLAN_PRICES[plan as keyof typeof PLAN_PRICES] ?? 0
      if (plan !== "trial" && amount > 0) {
        await supabase.from("subscriptions").insert({
          restaurant_id: id, plan, amount_pkr: amount,
          start_date: new Date().toISOString(),
          end_date: endDate ? new Date(endDate).toISOString() : null,
        })
      }
      await fetchData()
    } finally { setSaving(false) }
  }

  const handleResetTrial = async () => {
    if (!restaurant) return
    if (!window.confirm("Reset trial for this restaurant? This will set plan=trial with a fresh 7-day window and clear sent reminder emails.")) return
    setResetting(true); setResetMsg(null)
    try {
      const res = await fetch(`/api/superadmin/restaurants/${id}/reset-trial`, { method: "POST" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to reset trial")
      setResetMsg({ type: "ok", text: "Trial reset to 7-day window." })
      await fetchData()
    } catch (e: any) {
      setResetMsg({ type: "err", text: e.message || "Failed to reset trial" })
    } finally { setResetting(false) }
  }

  if (loading) return <div className="text-center text-[#999] py-12">Loading...</div>
  if (!restaurant) return <div className="text-center text-[#DC2626] py-12">Restaurant not found</div>

  const trialDaysLeft = restaurant.trial_end
    ? Math.max(0, Math.ceil((new Date(restaurant.trial_end).getTime() - Date.now()) / (24 * 60 * 60 * 1000))) : 0

  const orderFunnel = [
    { name: "Received", value: orders.filter((o) => o.order_status === "received").length, fill: "#2563EB" },
    { name: "Preparing", value: orders.filter((o) => o.order_status === "preparing").length, fill: "#D97706" },
    { name: "Ready", value: orders.filter((o) => o.order_status === "ready").length, fill: "#16A34A" },
    { name: "Completed", value: orders.filter((o) => o.order_status === "completed").length, fill: "#6B7280" },
    { name: "Cancelled", value: orders.filter((o) => o.order_status === "cancelled").length, fill: "#DC2626" },
  ].filter((s) => s.value > 0)

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/superadmin" className="p-2 hover:bg-white rounded-lg transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{restaurant.name}</h1>
          <p className="text-xs text-[#999]">/{restaurant.slug}</p>
        </div>
        <a href={`/menu/${restaurant.slug}`} target="_blank" rel="noopener"
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm border border-[#E8E8E8] hover:bg-white transition-colors">
          <ExternalLink className="w-4 h-4" /> View Menu
        </a>
      </div>

      {/* Quick toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button onClick={handleToggleActive}
          className="bg-white rounded-[14px] border border-[#E8E8E8] p-4 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors text-left">
          <div>
            <p className="text-sm font-semibold">Restaurant Active</p>
            <p className="text-xs text-[#999]">Show on /restaurants list</p>
          </div>
          {restaurant.is_active ? <ToggleRight className="w-10 h-10 text-[#16A34A]" /> : <ToggleLeft className="w-10 h-10 text-[#999]" />}
        </button>
        <button onClick={handleToggleImages}
          className="bg-white rounded-[14px] border border-[#E8E8E8] p-4 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors text-left">
          <div>
            <p className="text-sm font-semibold flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Image Upload Allowed
            </p>
            <p className="text-xs text-[#999]">Owner can upload dish images</p>
          </div>
          {restaurant.image_upload_allowed ? <ToggleRight className="w-10 h-10 text-[#16A34A]" /> : <ToggleLeft className="w-10 h-10 text-[#999]" />}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={<ShoppingBag className="w-4 h-4" />} label="Total Orders" value={stats.total} color="black" />
        <Stat icon={<TrendingUp className="w-4 h-4" />} label="Revenue" value={formatPrice(stats.revenue)} color="green" />
        <Stat icon={<Users className="w-4 h-4" />} label="Customers" value={stats.customers} color="blue" />
        <Stat icon={<BarChart3 className="w-4 h-4" />} label="Avg Order" value={formatPrice(stats.avgOrder)} color="black" />
        <Stat label="Last 7 Days" value={`${stats.last7} orders`} sub={formatPrice(stats.last7Revenue)} color="blue" />
        <Stat label="Last 30 Days" value={`${stats.last30} orders`} sub={formatPrice(stats.last30Revenue)} color="green" />
        <Stat label="Cancelled" value={stats.cancelled} color={stats.cancelled > 0 ? "red" : "black"} />
        <Stat icon={<Utensils className="w-4 h-4" />} label="Dishes" value={dishes.length} color="black" />
      </div>

      {/* Charts section */}
      <div>
        <h3 className="text-sm font-semibold text-[#555] mb-3 uppercase tracking-wide flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Order Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* 7-day orders bar chart */}
          <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Orders (7 days)</p>
              <p className="text-xs text-[#999]">{stats.last7} orders</p>
            </div>
            {chart7.length === 0 ? (
              <p className="text-xs text-[#999] text-center py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chart7}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short" })} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip
                    labelFormatter={(d) => new Date(d).toLocaleDateString("en-PK", { weekday: "short", day: "numeric", month: "short" })}
                    formatter={(value: number, name: string) => [value, name === "orders" ? "Orders" : name]}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E8E8E8" }}
                  />
                  <Bar dataKey="orders" fill="#111" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* 7-day revenue line chart */}
          <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Revenue (7 days)</p>
              <p className="text-xs text-[#999]">{formatPrice(stats.last7Revenue)}</p>
            </div>
            {chart7.length === 0 ? (
              <p className="text-xs text-[#999] text-center py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chart7}>
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
          </div>
          {/* 30-day orders bar chart */}
          <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Orders (30 days)</p>
              <p className="text-xs text-[#999]">{stats.last30} orders</p>
            </div>
            {chart30.length === 0 ? (
              <p className="text-xs text-[#999] text-center py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chart30}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short" })} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip
                    labelFormatter={(d) => new Date(d).toLocaleDateString("en-PK", { weekday: "short", day: "numeric", month: "short" })}
                    formatter={(value: number, name: string) => [value, name === "orders" ? "Orders" : name]}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E8E8E8" }}
                  />
                  <Bar dataKey="orders" fill="#111" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Order status breakdown */}
          <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Order Status</p>
              <p className="text-xs text-[#999]">{orders.length} total</p>
            </div>
            {orderFunnel.length === 0 ? (
              <p className="text-xs text-[#999] text-center py-8">No data</p>
            ) : (
              <div className="space-y-2.5">
                {orderFunnel.map((s) => (
                  <div key={s.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize">{s.name}</span>
                      <span className="font-medium">{s.value}</span>
                    </div>
                    <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(s.value / Math.max(...orderFunnel.map((x) => x.value))) * 100}%`, backgroundColor: s.fill }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5 space-y-3">
        <h3 className="text-sm font-semibold mb-2">Details</h3>
        <Row icon={<MapPin className="w-4 h-4" />} label="City" value={restaurant.city} />
        <Row icon={<Phone className="w-4 h-4" />} label="Phone" value={restaurant.phone || "—"} />
        <Row icon={<Mail className="w-4 h-4" />} label="Owner Email" value={ownerEmail || "—"} />
        <Row icon={<Utensils className="w-4 h-4" />} label="Cuisine" value={restaurant.cuisine_type || "—"} />
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#555]">Plan</span>
          <Badge variant={(restaurant.plan as any) || "trial"} className="capitalize">{restaurant.plan}</Badge>
        </div>
        {restaurant.plan === "trial" && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#555] flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Trial ends</span>
            <span className={trialDaysLeft <= 3 ? "text-[#DC2626] font-semibold" : ""}>
              {trialDaysLeft === 0 ? "Today" : `${trialDaysLeft} days`} ({new Date(restaurant.trial_end!).toLocaleDateString()})
            </span>
          </div>
        )}
        {restaurant.plan_end_date && (
          <Row icon={<Calendar className="w-4 h-4" />} label="Plan Ends" value={new Date(restaurant.plan_end_date).toLocaleDateString()} />
        )}
        <Row icon={<Calendar className="w-4 h-4" />} label="Joined" value={new Date(restaurant.created_at).toLocaleDateString()} />
      </div>

      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Crown className="w-4 h-4" /> Change Plan</h3>
        <PlanEditor currentPlan={restaurant.plan} currentTrialEnd={restaurant.trial_end} onSave={handlePlanUpdate} />
        {saving && <p className="text-xs text-[#999] mt-2">Saving...</p>}
      </div>

      {/* Trial controls */}
      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Trial Controls</h3>
        <p className="text-xs text-[#555] mb-3">Reset this restaurant's trial to a fresh 7-day window. All sent reminder emails will be cleared.</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Button variant="ghost" onClick={handleResetTrial} disabled={resetting} className="!bg-[#FFF7ED] !text-[#9A3412] hover:!bg-[#FFEDD5]">
            {resetting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
            Reset Trial Counter
          </Button>
          {resetMsg && <p className={`text-xs ${resetMsg.type === "ok" ? "text-[#16A34A]" : "text-[#DC2626]"}`}>{resetMsg.text}</p>}
        </div>
      </div>

      {/* Customers */}
      {customers.length > 0 && (
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Customers ({customers.length})</h3>
          <div className="space-y-1">
            {customers.slice(0, 20).map((c: any) => (
              <div key={c.id || c.phone || c.name} className="flex items-center justify-between text-sm py-2 border-b border-[#F0F0F0] last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-xs text-[#999] truncate">{c.phone || "—"} • {c.total_orders} orders</p>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <p className="font-semibold text-sm">{formatPrice(c.total_spent)}</p>
                  <p className="text-xs text-[#999]">{c.last_order ? new Date(c.last_order).toLocaleDateString() : "—"}</p>
                </div>
              </div>
            ))}
            {customers.length > 20 && <p className="text-xs text-[#999] pt-2">+{customers.length - 20} more</p>}
          </div>
        </div>
      )}

      {/* Recent orders */}
      {orders.length > 0 && (
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Recent Orders</h3>
          <div className="space-y-1">
            {orders.slice(0, 10).map((o) => (
              <div key={o.id} className="flex items-center justify-between text-sm py-1.5 border-b border-[#F0F0F0] last:border-0">
                <div className="min-w-0">
                  <p className="font-medium truncate">{o.order_number}</p>
                  <p className="text-xs text-[#999]">{o.customer_name}</p>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <p className="font-medium text-sm">{formatPrice(o.total_price)}</p>
                  <p className="text-xs text-[#999] capitalize">{o.order_status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function buildChart(orders: any[]): { date: string; orders: number; revenue: number }[] {
  const map: Record<string, { date: string; orders: number; revenue: number }> = {}
  orders.forEach((o) => {
    const date = new Date(o.created_at).toISOString().slice(0, 10)
    if (!map[date]) map[date] = { date, orders: 0, revenue: 0 }
    map[date].orders += 1
    if (o.order_status !== "cancelled") map[date].revenue += o.total_price
  })
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
}

function Stat({ icon, label, value, sub, color }: { icon?: React.ReactNode; label: string; value: string | number; sub?: string; color: "black" | "green" | "red" | "blue" }) {
  const colorMap = { black: "text-black", green: "text-[#16A34A]", red: "text-[#DC2626]", blue: "text-[#2563EB]" }
  return (
    <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-3">
      {icon && <div className="text-[#999] mb-1">{icon}</div>}
      <p className={`text-[18px] font-bold ${colorMap[color]}`}>{value}</p>
      <p className="text-xs text-[#555]">{label}</p>
      {sub && <p className="text-[10px] text-[#999] mt-0.5">{sub}</p>}
    </div>
  )
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#555] flex items-center gap-2">{icon} {label}</span>
      <span className="truncate ml-2">{value}</span>
    </div>
  )
}
