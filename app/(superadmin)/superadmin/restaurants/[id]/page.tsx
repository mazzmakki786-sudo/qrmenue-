"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { useParams } from "next/navigation"
import { PlanEditor } from "@/components/superadmin/PlanEditor"
import { Button } from "@/components/ui/button"
import { formatPrice, timeAgo } from "@/lib/utils"
import { ArrowLeft, Phone, MapPin, Mail, Calendar, ExternalLink, ShoppingBag, Utensils, BarChart3, Users, TrendingUp, XCircle, Clock, Image as ImageIcon, Crown, Loader2, RotateCcw, PauseCircle, ChevronLeft } from "lucide-react"
import Link from "next/link"
import type { Restaurant } from "@/types"
import { PLAN_PRICES, type PlanLimitsPartial } from "@/lib/subscription"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

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
  const isFetchingRef = useRef(false)

  const fetchData = async () => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    try {
      const [rRes, ordersRes, ownerRes, customersRes] = await Promise.all([
        fetch(`/api/superadmin/restaurants/${id}`).then((r) => r.json()).catch(() => null),
        supabase.from("orders").select("*").eq("restaurant_id", id).order("created_at", { ascending: false }).limit(100),
        fetch("/api/superadmin/users").then((res) => res.json()).catch(() => null),
        fetch(`/api/superadmin/restaurants/${id}/customers`).then((res) => res.json()).catch(() => null),
      ])

      if (rRes?.restaurant) {
        setRestaurant(rRes.restaurant)
        setDishes(rRes.restaurant.dishes || [])
        const users = ownerRes?.users || []
        const owner = users.find((u: any) => u.id === rRes.restaurant.owner_id)
        setOwnerEmail(owner?.email || null)
      }

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
        total: allOrders.length, revenue,
        last7: last7.length, last30: last30.length,
        last7Revenue: rev7, last30Revenue: rev30,
        avgOrder: valid.length > 0 ? Math.round(revenue / valid.length) : 0,
        cancelled, customers: customersRes?.customers?.length || 0,
      })

      setChart7(buildChart(last7))
      setChart30(buildChart(last30))
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }

  useEffect(() => { if (id) fetchData() }, [id])

  const scheduleRefetch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { fetchData() }, 500)
  }

  useEffect(() => {
    if (!id) return
    const channel = supabase
      .channel(uid(`restaurant-${id}-changes`))
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurants", filter: `id=eq.${id}` }, () => scheduleRefetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${id}` }, () => scheduleRefetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "dishes", filter: `restaurant_id=eq.${id}` }, () => scheduleRefetch())
      .subscribe()
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      supabase.removeChannel(channel)
    }
  }, [id])

  const handleToggleActive = async () => {
    if (!restaurant) return
    const next = !restaurant.is_active
    setRestaurant({ ...restaurant, is_active: next })
    try {
      const res = await fetch(`/api/superadmin/restaurants/${id}/toggle`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: next }),
      })
      if (!res.ok) setRestaurant({ ...restaurant, is_active: !next })
      else await fetchData()
    } catch { setRestaurant({ ...restaurant, is_active: !next }) }
  }

  const handleToggleSuspended = async () => {
    if (!restaurant) return
    const next = !restaurant.is_suspended
    setRestaurant({ ...restaurant, is_suspended: next })
    try {
      const res = await fetch(`/api/superadmin/restaurants/${id}/toggle`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_suspended: next }),
      })
      if (!res.ok) setRestaurant({ ...restaurant, is_suspended: !next })
      else await fetchData()
    } catch { setRestaurant({ ...restaurant, is_suspended: !next }) }
  }

  const handleSaveOverrides = async (overrides: PlanLimitsPartial | null) => {
    if (!restaurant) return
    setSaving(true)
    try {
      const res = await fetch(`/api/superadmin/restaurants/${id}/toggle`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_limits_override: overrides }),
      })
      if (!res.ok) throw new Error("Failed to save overrides")
      await fetchData()
    } catch (e: any) { console.error(e) }
    finally { setSaving(false) }
  }

  const handleToggleImages = async () => {
    if (!restaurant) return
    const next = !restaurant.image_upload_allowed
    setRestaurant({ ...restaurant, image_upload_allowed: next })
    try {
      const res = await fetch(`/api/superadmin/restaurants/${id}/toggle`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_upload_allowed: next }),
      })
      if (!res.ok) setRestaurant({ ...restaurant, image_upload_allowed: !next })
      else await fetchData()
    } catch { setRestaurant({ ...restaurant, image_upload_allowed: !next }) }
  }

  const handlePlanUpdate = async (plan: string, endDate: string) => {
    setSaving(true)
    try {
      await fetch(`/api/superadmin/restaurants/${id}/toggle`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, plan_end_date: plan === "trial" ? null : endDate || null }),
      })
      const amount = PLAN_PRICES[plan as keyof typeof PLAN_PRICES] ?? 0
      if (plan !== "trial" && amount > 0) {
        await fetch("/api/superadmin/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurant_id: id,
            plan_type: plan,
            price: amount,
            status: endDate ? "active" : "inactive",
          }),
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
    } catch (e: any) { setResetMsg({ type: "err", text: e.message || "Failed to reset trial" }) }
    finally { setResetting(false) }
  }

  if (loading) return <div className="text-center text-[#999] py-12">Loading...</div>
  if (!restaurant) return <div className="text-center text-[#DC2626] py-12">Restaurant not found</div>

  const trialDaysLeft = restaurant.trial_end
    ? Math.max(0, Math.ceil((new Date(restaurant.trial_end).getTime() - Date.now()) / (24 * 60 * 60 * 1000))) : 0

  const orderFunnel = [
    { name: "Pending", value: orders.filter((o) => o.order_status === "received").length, fill: "#2196F3" },
    { name: "Preparing", value: orders.filter((o) => o.order_status === "preparing").length, fill: "#FFA07E" },
    { name: "Delivered", value: orders.filter((o) => o.order_status === "completed").length, fill: "#25D366" },
    { name: "Cancelled", value: orders.filter((o) => o.order_status === "cancelled").length, fill: "#C6C6C6" },
  ].filter((s) => s.value > 0)
  const totalFunnel = orderFunnel.reduce((s, x) => s + x.value, 0)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/superadmin" className="p-2 hover:bg-white rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-black" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-black">{restaurant.name}</h1>
            <code className="text-sm text-[#555]">/{restaurant.slug}</code>
          </div>
        </div>
        <a href={`/menu/${restaurant.slug}`} target="_blank" rel="noopener"
          className="px-6 py-2 border border-black text-black text-sm font-semibold rounded-lg hover:bg-[#F3F4F5] transition-colors flex items-center gap-2">
          <ExternalLink className="w-4 h-4" /> View Menu
        </a>
      </header>

      {/* Quick-Toggle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ToggleCard label="Restaurant Active" checked={!!restaurant.is_active} color="#25D366" onToggle={handleToggleActive} />
        <ToggleCard label="Account Suspended" checked={!!restaurant.is_suspended} color="#FFA07E" icon={<PauseCircle className="w-4 h-4" />} onToggle={handleToggleSuspended} />
        <ToggleCard label="Image Upload Allowed" checked={!!restaurant.image_upload_allowed} color="#25D366" onToggle={handleToggleImages} />
      </div>

      {/* Stat Cards Grid (4x2) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 overflow-x-auto">
        <StatCard label="Total Orders" value={stats.total} />
        <StatCard label="Revenue (PKR)" value={stats.revenue.toLocaleString()} />
        <StatCard label="Customers" value={stats.customers} />
        <StatCard label="Avg Order" value={stats.avgOrder} />
        <StatCard label="Last 7 Days" value={`${stats.last7} orders`} sub={formatPrice(stats.last7Revenue)} />
        <StatCard label="Last 30 Days" value={`${stats.last30} orders`} sub={formatPrice(stats.last30Revenue)} />
        <StatCard label="Cancelled" value={stats.cancelled} color={stats.cancelled > 0 ? "text-[#ba1a1a]" : "text-black"} />
        <StatCard label="Dishes" value={dishes.length} />
      </div>

      {/* Details + Charts Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 overflow-x-auto">
        {/* Details Card (4 cols) */}
        <div className="md:col-span-4">
          <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-4 h-full">
            <h4 className="text-xs font-semibold text-black mb-4">Restaurant Details</h4>
            <div className="space-y-3">
              <DetailRow icon={<MapPin className="w-4 h-4" />} text={`${restaurant.city}, PK`} />
              <DetailRow icon={<Phone className="w-4 h-4" />} text={restaurant.phone || "—"} />
              <DetailRow icon={<Mail className="w-4 h-4" />} text={ownerEmail || "—"} />
              <DetailRow icon={<Utensils className="w-4 h-4" />} text={restaurant.cuisine_type || "—"} />
              <div className="pt-3 border-t border-[#F0F0F0] space-y-2">
                <DetailRow label="Current Plan" value={restaurant.plan} badge />
                {restaurant.plan === "trial" && (
                  <DetailRow label="Trial Ends" value={trialDaysLeft === 0 ? "Today" : `${trialDaysLeft} Days Remaining`} color={trialDaysLeft <= 3 ? "text-[#ba1a1a]" : "text-black"} />
                )}
                {restaurant.plan_end_date && (
                  <DetailRow label="Plan Ends" value={new Date(restaurant.plan_end_date).toLocaleDateString()} />
                )}
                <DetailRow label="Joined" value={new Date(restaurant.created_at).toLocaleDateString()} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid (8 cols) */}
        <div className="md:col-span-8 flex flex-col gap-4">
          {/* Mini Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-4">
              <p className="text-xs text-[#555] mb-3">7d Orders</p>
              {chart7.length === 0 ? (
                <p className="text-xs text-[#999] text-center py-8">No data</p>
              ) : (
                <div className="flex items-end gap-1 h-20">
                  {chart7.map((d, i) => {
                    const maxVal = Math.max(...chart7.map((x) => x.orders), 1)
                    const h = (d.orders / maxVal) * 100
                    return <div key={i} className="flex-1 bg-black rounded-t-sm transition-all duration-300" style={{ height: `${Math.max(h, 4)}%` }} />
                  })}
                </div>
              )}
            </div>
            <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-4">
              <p className="text-xs text-[#555] mb-3">7d Revenue</p>
              {chart7.length === 0 ? (
                <p className="text-xs text-[#999] text-center py-8">No data</p>
              ) : (
                <div className="h-20 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chart7}>
                      <Line type="monotone" dataKey="revenue" stroke="#006d2f" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* 30d Order Distribution */}
          <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-4">
            <h4 className="text-xs font-semibold text-black mb-4">Order Distribution (30d)</h4>
            {orders.length === 0 ? (
              <p className="text-xs text-[#999] text-center py-4">No orders</p>
            ) : (
              <div className="space-y-3">
                {orderFunnel.map((s) => (
                  <div key={s.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[#555]">{s.name}</span>
                      <span className="text-xs">{totalFunnel > 0 ? Math.round((s.value / totalFunnel) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-[#EDEEEF] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${totalFunnel > 0 ? (s.value / totalFunnel) * 100 : 0}%`, backgroundColor: s.fill }} />
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[#555]">Cancelled</span>
                      <span className="text-xs">{totalFunnel > 0 ? Math.round((orderFunnel.find((x) => x.name === "Cancelled")?.value || 0) / totalFunnel * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-[#EDEEEF] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#C6C6C6] rounded-full" style={{ width: `${totalFunnel > 0 ? ((orderFunnel.find((x) => x.name === "Cancelled")?.value || 0) / totalFunnel) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[#555]">Rejected</span>
                      <span className="text-xs">0%</span>
                    </div>
                    <div className="w-full bg-[#EDEEEF] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#ba1a1a] rounded-full" style={{ width: "0%" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subscription & Limits */}
      <section className="mb-6">
        <h2 className="text-xl font-bold text-black mb-4">Subscription &amp; Limits</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 overflow-x-auto">
          <div className="md:col-span-8 bg-white border border-[#E8E8E8] rounded-[14px] p-4">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="w-full md:w-1/2">
                <label className="block text-xs text-[#555] mb-2">Select Plan</label>
                <PlanEditor
                  currentPlan={restaurant.plan}
                  currentTrialEnd={restaurant.trial_end}
                  currentOverrides={restaurant.plan_limits_override as PlanLimitsPartial | null}
                  onSave={handlePlanUpdate}
                  onSaveOverrides={handleSaveOverrides}
                />
              </div>
              <div className="w-full md:w-1/2 bg-[#F3F4F5] p-3 rounded-xl">
                <p className="text-xs text-[#555] leading-relaxed">
                  {restaurant.plan === "growth" ? "Growth plan includes up to 100 dishes, HD images, and custom analytics reporting." :
                   restaurant.plan === "premium" ? "Premium plan includes unlimited dishes, images, and everything in Growth." :
                   restaurant.plan === "starter" ? "Starter plan includes up to 30 dishes, 10 images, and basic features." :
                   "Trial plan with limited features. Upgrade to unlock more."}
                </p>
              </div>
            </div>
            {saving && <p className="text-xs text-[#999] mt-2">Saving...</p>}
          </div>
          <div className="md:col-span-4 bg-white border border-[#E8E8E8] rounded-[14px] p-4 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-semibold text-black mb-2">Trial Controls</h4>
              <p className="text-xs text-[#555] mb-4">Manually reset the 14-day trial period for this restaurant.</p>
            </div>
            <Button variant="ghost" onClick={handleResetTrial} disabled={resetting} className="!bg-[#FFA07E]/20 !text-[#78351b] hover:!bg-[#FFA07E]/30 w-full">
              {resetting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
              Reset Trial Counter
            </Button>
            {resetMsg && <p className={`text-xs mt-2 ${resetMsg.type === "ok" ? "text-[#16A34A]" : "text-[#DC2626]"}`}>{resetMsg.text}</p>}
          </div>
        </div>
      </section>

      {/* Bottom Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-x-auto">
        {/* Recent Customers */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-black">Recent Customers</h3>
            {customers.length > 5 && <Link href={`/superadmin/restaurants/${id}`} className="text-xs text-[#006d2f] font-semibold">View All</Link>}
          </div>
          <div className="bg-white border border-[#E8E8E8] rounded-[14px] overflow-hidden">
            {customers.length === 0 ? (
              <p className="text-xs text-[#999] text-center py-8">No customers yet</p>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F9FAFB] border-b border-[#F0F0F0]">
                  <tr>
                    <th className="px-4 py-3 text-xs text-[#555] font-semibold">Name</th>
                    <th className="px-4 py-3 text-xs text-[#555] font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {customers.slice(0, 5).map((c: any) => (
                    <tr key={c.id || c.phone || c.name}>
                      <td className="px-4 py-3 text-sm">{c.name}</td>
                      <td className="px-4 py-3 text-xs text-[#555]">{c.last_order ? new Date(c.last_order).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </section>

        {/* Recent Orders */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-black">Recent Orders</h3>
            {orders.length > 5 && <Link href={`/superadmin/restaurants/${id}`} className="text-xs text-[#006d2f] font-semibold">View All</Link>}
          </div>
          <div className="bg-white border border-[#E8E8E8] rounded-[14px] overflow-hidden">
            {orders.length === 0 ? (
              <p className="text-xs text-[#999] text-center py-8">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F9FAFB] border-b border-[#F0F0F0]">
                  <tr>
                    <th className="px-4 py-3 text-xs text-[#555] font-semibold">Status</th>
                    <th className="px-4 py-3 text-xs text-[#555] font-semibold">Amount</th>
                    <th className="px-4 py-3 text-xs text-[#555] font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id}>
                      <td className="px-4 py-3">
                        <span className={`text-[12px] px-2 py-0.5 rounded-full font-medium ${
                          o.order_status === "completed" ? "bg-[#25D366]/10 text-[#006d2f]" :
                          o.order_status === "preparing" ? "bg-[#FFA07E]/10 text-[#78351b]" :
                          o.order_status === "cancelled" ? "bg-gray-100 text-gray-500" :
                          "bg-[#25D366]/10 text-[#006d2f]"
                        }`}>{o.order_status === "completed" ? "Delivered" : o.order_status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">{formatPrice(o.total_price)}</td>
                      <td className="px-4 py-3 text-xs text-[#555]">{timeAgo(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </section>
      </div>
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

function ToggleCard({ label, checked, color, icon, onToggle }: { label: string; checked: boolean; color: string; icon?: React.ReactNode; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="bg-white border border-[#E8E8E8] rounded-[14px] p-4 flex items-center justify-between hover:shadow-[0px_4px_20px_rgba(0,0,0,0.03)] transition-all text-left">
      <div>
        <p className="text-sm font-semibold text-black flex items-center gap-1.5">{icon} {label}</p>
      </div>
      <div className={`w-11 h-6 rounded-full relative transition-colors ${checked ? "bg-[#25D366]" : "bg-[#EDEEEF]"}`}>
        <div className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-all ${checked ? "translate-x-5" : ""}`} />
      </div>
    </button>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-4">
      <p className="text-xs text-[#555] uppercase tracking-wider mb-1">{label}</p>
      <h3 className={`text-xl font-bold ${color || "text-black"}`}>{value}</h3>
      {sub && <p className="text-[10px] text-[#555] mt-0.5">{sub}</p>}
    </div>
  )
}

function DetailRow({ icon, text, label, value, badge, color }: { icon?: React.ReactNode; text?: string; label?: string; value?: string; badge?: boolean; color?: string }) {
  if (icon && text) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-[#555]">{icon}</span>
        <span className="text-sm">{text}</span>
      </div>
    )
  }
  if (label && value) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#555]">{label}</span>
        {badge ? (
          <span className="text-[11px] px-2 py-0.5 bg-[#25D366]/10 text-[#006d2f] rounded font-semibold uppercase">{value}</span>
        ) : (
          <span className={`font-semibold ${color || "text-black"}`}>{value}</span>
        )}
      </div>
    )
  }
  return null
}
