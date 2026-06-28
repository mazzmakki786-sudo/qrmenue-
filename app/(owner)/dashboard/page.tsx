"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatPrice, timeAgo } from "@/lib/utils"
import { ChevronRight, ClipboardList, UtensilsCrossed, User, Check, TrendingUp, TrendingDown, AlertCircle, RefreshCw, Power, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Order } from "@/types"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DashboardFooter } from "@/components/shared/DashboardFooter"


export default function DashboardPage() {
  const router = useRouter()
  const sub = useSubscription()
  const { restaurant, orderCount, loading: subLoading } = sub
  const [todayOrders, setTodayOrders] = useState(0)
  const [yesterdayOrders, setYesterdayOrders] = useState(0)
  const [todayRevenue, setTodayRevenue] = useState(0)
  const [yesterdayRevenue, setYesterdayRevenue] = useState(0)
  const [monthlyOrders, setMonthlyOrders] = useState(0)
  const [monthlyRevenue, setMonthlyRevenue] = useState(0)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [isOpen, setIsOpen] = useState(true)
  const [openingTime, setOpeningTime] = useState("09:00")
  const [closingTime, setClosingTime] = useState("23:00")
  const [toggling, setToggling] = useState(false)
  const [cleanupNotifications, setCleanupNotifications] = useState<any[]>([])

  const supabase = createClient()

  const handleToggleOpen = async () => {
    if (!restaurant?.id || toggling) return
    setToggling(true)
    const next = !isOpen
    setIsOpen(next)
    await supabase.from("restaurants").update({ is_open: next }).eq("id", restaurant.id)
    setToggling(false)
  }

  const handleTimeChange = async (field: "opening_time" | "closing_time", value: string) => {
    if (!restaurant?.id) return
    if (field === "opening_time") setOpeningTime(value)
    else setClosingTime(value)
    await supabase.from("restaurants").update({ [field]: value }).eq("id", restaurant.id)
  }
  const [topDishes, setTopDishes] = useState<{ name: string; count: number }[]>([])
  const [categoryCount, setCategoryCount] = useState(0)
  const [dishCount, setDishCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dataReady, setDataReady] = useState(false)

  const fetchData = useCallback(async () => {
    if (!restaurant?.id) {
      return // Keep loading=true — subscription hasn't resolved yet
    }
    const supabase = createClient()
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]

    try {
      const [todayRes, yesterdayRes, monthlyRes, ordersRes, catRes, dishRes] = await Promise.all([
        supabase
          .from("orders")
          .select("total_price")
          .eq("restaurant_id", restaurant.id)
          .gte("created_at", today)
          .neq("order_status", "cancelled"),
        supabase
          .from("orders")
          .select("total_price")
          .eq("restaurant_id", restaurant.id)
          .gte("created_at", yesterday)
          .lt("created_at", today)
          .neq("order_status", "cancelled"),
        supabase
          .from("orders")
          .select("total_price")
          .eq("restaurant_id", restaurant.id)
          .gte("created_at", monthStart)
          .neq("order_status", "cancelled"),
        supabase
          .from("orders")
          .select("*")
          .eq("restaurant_id", restaurant.id)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("categories")
          .select("*", { count: "exact", head: true })
          .eq("restaurant_id", restaurant.id),
        supabase
          .from("dishes")
          .select("*", { count: "exact", head: true })
          .eq("restaurant_id", restaurant.id),
      ])

      if (todayRes.error) throw new Error(todayRes.error.message)

      if (todayRes.data) {
        setTodayOrders(todayRes.data.length)
        setTodayRevenue(todayRes.data.reduce((sum, o) => sum + o.total_price, 0))
      }

      if (yesterdayRes.data) {
        setYesterdayOrders(yesterdayRes.data.length)
        setYesterdayRevenue(yesterdayRes.data.reduce((sum, o) => sum + o.total_price, 0))
      }

      if (monthlyRes.data) {
        setMonthlyOrders(monthlyRes.data.length)
        setMonthlyRevenue(monthlyRes.data.reduce((sum, o) => sum + o.total_price, 0))
      }

      if (ordersRes.data) {
        setRecentOrders(ordersRes.data)
        const dc: Record<string, number> = {}
        ordersRes.data.forEach((order) => {
          ;(order.items as any[]).forEach((item: any) => {
            dc[item.name_en] = (dc[item.name_en] || 0) + item.quantity
          })
        })
        setTopDishes(
          Object.entries(dc)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }))
        )
      }

      setCategoryCount(catRes.count ?? 0)
      setDishCount(dishRes.count ?? 0)

      // Fetch cleanup notifications
      const { data: notifData } = await supabase
        .from("owner_notifications")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .eq("type", "cleanup")
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(3)
      setCleanupNotifications(notifData || [])

      setError(null)
      setDataReady(true)
    } catch (err) {
      console.error("Dashboard data fetch error:", err)
      setError("Failed to load dashboard data. Please try again.")
      setDataReady(true)
    } finally {
      setLoading(false)
    }
  }, [restaurant?.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (restaurant) {
      setIsOpen((restaurant as any).is_open ?? true)
      setOpeningTime((restaurant as any).opening_time || "09:00")
      setClosingTime((restaurant as any).closing_time || "23:00")
    }
  }, [restaurant])

  useEffect(() => {
    if (!restaurant?.id) return
    if (restaurant.plan === "trial") {
      fetch("/api/trial/reminders/check", { method: "POST" }).catch(() => {})
    }
    fetch("/api/owner/alerts/check", { method: "POST" }).catch(() => {})
  }, [restaurant?.id, restaurant?.plan])

  const profileFields = [
    { label: "Phone number", done: !!restaurant?.phone },
    { label: "Address", done: !!restaurant?.address },
    { label: "Logo", done: !!restaurant?.logo_url },
    { label: "Cuisine type", done: !!restaurant?.cuisine_type },
    { label: "Urdu name", done: !!restaurant?.name_ur },
  ]
  const profileDone = profileFields.filter((f) => f.done).length
  const profilePercent = Math.round((profileDone / profileFields.length) * 100)

  const menuFields = [
    { label: "Categories added", done: categoryCount > 0 },
    { label: "Dishes added", done: dishCount > 0 },
  ]
  const menuDone = menuFields.filter((f) => f.done).length

  const isTrial = restaurant?.plan === "trial"
  const trialDaysRemaining = isTrial && restaurant?.trial_end
    ? Math.max(0, Math.ceil((new Date(restaurant.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const onboardingComplete = profilePercent === 100 && menuDone === 2

  const ordersTrend = yesterdayOrders > 0
    ? Math.round(((todayOrders - yesterdayOrders) / yesterdayOrders) * 100)
    : todayOrders > 0 ? 100 : 0
  const revenueTrend = yesterdayRevenue > 0
    ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
    : todayRevenue > 0 ? 100 : 0

  // Handle edge case: subscription finished but no restaurant exists
  useEffect(() => {
    if (!subLoading && !restaurant && !dataReady) {
      setLoading(false)
      setDataReady(true)
    }
  }, [subLoading, restaurant, dataReady])

  if (loading || subLoading) {
    return (
      <div className="space-y-4 animate-pulse" aria-hidden="true">
        <div className="h-7 w-32 bg-[#F0F0F0] rounded-lg" />
        <div className="h-20 bg-[#F0F0F0] rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-[#F0F0F0] rounded-2xl" />
          <div className="h-24 bg-[#F0F0F0] rounded-2xl" />
          <div className="h-24 bg-[#F0F0F0] rounded-2xl" />
          <div className="h-24 bg-[#F0F0F0] rounded-2xl" />
        </div>
        <div className="h-48 bg-[#F0F0F0] rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-10 h-10 text-[#DC2626]" />
        <p className="text-sm text-[#555] text-center">{error}</p>
        <button
          onClick={() => { setError(null); setLoading(true); fetchData() }}
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-full hover:opacity-90 transition-all active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Top Row */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-black">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/orders"
            className="bg-black text-white px-5 py-2 rounded-full flex items-center gap-2 text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
          >
            <ClipboardList className="w-4 h-4" />
            Orders
          </Link>
        </div>
      </div>

      {/* Subscription Banner */}
      {restaurant && (
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0052D4] via-[#4364F7] to-[#6FB1FC] p-5 md:p-6 rounded-2xl text-white shadow-sm">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {isTrial ? "Trial Version" : `${restaurant.plan} Plan`}
                </span>
                <h2 className="text-lg font-semibold mt-2">
                  {isTrial
                    ? `${trialDaysRemaining} days left in trial`
                    : "Plan Active"}
                </h2>
              </div>
              {isTrial && (
                <div className="w-full sm:w-56">
                  <div className="flex justify-between text-xs font-medium mb-2">
                    <span>Order usage</span>
                    <span>{orderCount}/{10} orders used</span>
                  </div>
                  <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (orderCount / 10) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        </div>
      )}

      {/* Closed Banner */}
      {!isOpen && (
        <div className="bg-gradient-to-r from-[#DC2626] to-[#EF4444] rounded-2xl p-5 text-white shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Power className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold">Your restaurant is closed</h3>
              <p className="text-xs text-white/80 mt-1">Customers cannot place orders right now. Open your restaurant to start accepting orders.</p>
              <button
                onClick={handleToggleOpen}
                disabled={toggling}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white text-[#DC2626] text-xs font-bold rounded-xl hover:opacity-90 transition-all active:scale-95"
              >
                <Power className="w-3.5 h-3.5" />
                Open Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Open/Close Toggle + Timing */}
      <div className="bg-white border border-[#F0F0F0] rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOpen ? "bg-[#25D366]/10" : "bg-red-50"}`}>
            <Power className={`w-5 h-5 ${isOpen ? "text-[#25D366]" : "text-[#DC2626]"}`} />
          </div>
          <div>
            <p className="text-sm font-semibold">{isOpen ? "Accepting Orders" : "Closed"}</p>
            <div className="flex items-center gap-2 text-xs text-[#555] mt-0.5">
              <Clock className="w-3 h-3" />
              <input
                type="time"
                value={openingTime}
                onChange={(e) => handleTimeChange("opening_time", e.target.value)}
                className="w-16 bg-transparent border-none outline-none text-xs p-0 cursor-pointer"
              />
              <span>—</span>
              <input
                type="time"
                value={closingTime}
                onChange={(e) => handleTimeChange("closing_time", e.target.value)}
                className="w-16 bg-transparent border-none outline-none text-xs p-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
        <button
          onClick={handleToggleOpen}
          disabled={toggling}
          className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${isOpen ? "bg-[#25D366]" : "bg-[#CCC]"}`}
        >
          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isOpen ? "translate-x-6" : "translate-x-0.5"}`} />
        </button>
      </div>

      {/* Cleanup Notifications */}
      {cleanupNotifications.length > 0 && (
        <div className="space-y-2">
          {cleanupNotifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-amber-800">{notif.title}</h4>
                <p className="text-xs text-amber-700 mt-1">{notif.body}</p>
                <p className="text-[10px] text-amber-500 mt-1">
                  {new Date(notif.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <button
                onClick={async () => {
                  await supabase.from("owner_notifications").update({ is_read: true }).eq("id", notif.id)
                  setCleanupNotifications((prev) => prev.filter((n) => n.id !== notif.id))
                }}
                className="text-amber-500 hover:text-amber-700 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/dashboard/menu"
          className="bg-black text-white p-4 rounded-2xl flex items-center gap-3 group cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="bg-white/10 p-2.5 rounded-xl shrink-0">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Menu</p>
            <p className="text-[10px] text-white/60">Categories & dishes</p>
          </div>
        </Link>
        <Link
          href="/dashboard/settings"
          className="bg-white border border-[#F0F0F0] p-4 rounded-2xl flex items-center gap-3 group cursor-pointer hover:bg-[#F9FAFB] transition-colors"
        >
          <div className="bg-[#EDEEEF] p-2.5 rounded-xl text-black shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-black truncate">Profile</p>
            <p className="text-[10px] text-[#555]">Restaurant info</p>
          </div>
        </Link>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column - Onboarding (hide when complete) */}
        {!onboardingComplete && (
          <div className="lg:col-span-4 space-y-4">
            {/* Profile Completion */}
            <div className="bg-white border border-[#F0F0F0] rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-black mb-3">Profile Completion</h3>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-extrabold text-black">{profilePercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#EDEEEF] rounded-full mb-4">
                <div className="h-full bg-black rounded-full" style={{ width: `${profilePercent}%` }} />
              </div>
              <ul className="space-y-3">
                {profileFields.map((f) => (
                  <li key={f.label} className="flex items-center gap-2.5">
                    {f.done ? (
                      <Check className="w-4 h-4 text-[#25D366] shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-[#BBCBB9] shrink-0" />
                    )}
                    <span className="text-xs text-[#191c1d]">{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Menu Setup */}
            <div className="bg-white border border-[#F0F0F0] rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-black mb-3">Menu Setup</h3>
              <ul className="space-y-3">
                {menuFields.map((f) => (
                  <li key={f.label} className="flex items-center gap-2.5">
                    {f.done ? (
                      <Check className="w-4 h-4 text-[#25D366] shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-[#BBCBB9] shrink-0" />
                    )}
                    <span className="text-xs text-[#191c1d]">{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Right Column */}
        <div className={`${onboardingComplete ? "lg:col-span-12" : "lg:col-span-8"} space-y-4`}>
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-[#F0F0F0] p-4 rounded-2xl">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#555]">Today Orders</span>
              <span className="text-2xl font-bold text-black mt-1 block">{todayOrders}</span>
              <span className={`text-[10px] font-medium mt-2 flex items-center gap-1 ${ordersTrend >= 0 ? "text-[#25D366]" : "text-[#DC2626]"}`}>
                {ordersTrend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {ordersTrend === 0 && todayOrders === 0 ? "No data yet" : `${Math.abs(ordersTrend)}% vs yesterday`}
              </span>
            </div>
            <div className="bg-white border border-[#F0F0F0] p-4 rounded-2xl">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#555]">Today Revenue</span>
              <span className="text-2xl font-bold text-black mt-1 block truncate">{formatPrice(todayRevenue)}</span>
              <span className={`text-[10px] font-medium mt-2 flex items-center gap-1 ${revenueTrend >= 0 ? "text-[#25D366]" : "text-[#DC2626]"}`}>
                {revenueTrend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {revenueTrend === 0 && todayRevenue === 0 ? "No data yet" : `${Math.abs(revenueTrend)}% vs yesterday`}
              </span>
            </div>
            <div className="bg-white border border-[#F0F0F0] p-4 rounded-2xl">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#555]">Monthly Orders</span>
              <span className="text-2xl font-bold text-black mt-1 block">{monthlyOrders}</span>
              <span className="text-[10px] font-medium mt-2 text-[#999]">This month</span>
            </div>
            <div className="bg-white border border-[#F0F0F0] p-4 rounded-2xl">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#555]">Monthly Revenue</span>
              <span className="text-2xl font-bold text-black mt-1 block truncate">{formatPrice(monthlyRevenue)}</span>
              <span className="text-[10px] font-medium mt-2 text-[#999]">This month</span>
            </div>
          </div>

          {/* Popular Dishes */}
          {topDishes.length > 0 && (
            <div className="bg-white border border-[#F0F0F0] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-black">Popular Dishes</h3>
                <Link href="/dashboard/analytics" className="text-xs text-[#25D366] font-semibold hover:underline flex items-center gap-0.5">
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {topDishes.map((d, i) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-xl"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-bold text-[#555] text-xs w-4">{i + 1}.</span>
                      <span className="text-xs font-semibold text-black truncate">{d.name}</span>
                    </div>
                    <span className="text-[10px] text-[#555] font-medium shrink-0 ml-2">{d.count} orders</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-[#F0F0F0] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-black">Recent Orders</h3>
          <Link href="/dashboard/orders" className="text-xs text-[#25D366] font-semibold hover:underline flex items-center gap-0.5">
            View All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className="divide-y divide-[#F0F0F0]">
            {recentOrders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                className="flex items-center justify-between p-3 hover:bg-[#F9FAFB] transition-colors cursor-pointer active:bg-[#F0F0F0]"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-black">#{order.order_number}</span>
                      <Badge variant={
                        order.order_status === "received" ? "growth" :
                        order.order_status === "ready" ? "available" :
                        order.order_status === "cancelled" ? "unavailable" : "starter"
                      } className="text-[9px] px-1.5 py-0">
                        {order.order_status}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-[#999] mt-0.5">
                      {order.customer_name || "Guest"} &bull; {order.order_type.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-xs font-bold text-black">{formatPrice(order.total_price)}</span>
                  <span className="text-[10px] text-[#999]">{timeAgo(order.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-[#999]">
            No orders yet
          </div>
        )}
      </div>

      <DashboardFooter />
    </div>
  )
}
