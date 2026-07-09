"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatPrice, timeAgo, formatTo12Hour } from "@/lib/utils"
import { ChevronRight, ClipboardList, QrCode, UtensilsCrossed, User, Check, TrendingUp, TrendingDown, AlertCircle, RefreshCw, Power, Clock, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Order } from "@/types"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DashboardFooter } from "@/components/shared/DashboardFooter"
import { PageLoader } from "@/components/shared/PageLoader"

type PageState = "loading" | "ready" | "error" | "offline"

export default function DashboardPage() {
  const router = useRouter()
  const sub = useSubscription()
  const { restaurant, orderCount, planLimits, loading: subLoading } = sub
  const hasAiAccess = (planLimits?.aiPostsPerMonth ?? 0) > 0
  const [pageState, setPageState] = useState<PageState>("loading")
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
  const supabase = createClient()
  const fetchedRef = useRef(false) // Prevent double-fetch in strict mode

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
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    // Wait until subscription provides a restaurant
    if (!restaurant?.id) return

    const supabase = createClient()
    const pkOffset = 5 * 60 * 60 * 1000
    const pkNow = new Date(Date.now() + pkOffset)
    const today = pkNow.toISOString().split("T")[0]
    const yesterdayDate = new Date(pkNow.getTime() - 86400000)
    const yesterday = yesterdayDate.toISOString().split("T")[0]
    const monthStart = new Date(pkNow.getFullYear(), pkNow.getMonth(), 1).toISOString().split("T")[0]

    try {
      const [todayRes, yesterdayRes, ordersRes, catRes, dishRes, monthlyStatsRes] = await Promise.all([
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
        // Use daily_order_stats for monthly totals
        supabase
          .from("daily_order_stats")
          .select("total_orders, total_revenue")
          .eq("restaurant_id", restaurant.id)
          .gte("order_date", monthStart),
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

      // Monthly totals from daily_order_stats (persistent)
      if (monthlyStatsRes.data && monthlyStatsRes.data.length > 0) {
        setMonthlyOrders(monthlyStatsRes.data.reduce((s, d) => s + d.total_orders, 0))
        setMonthlyRevenue(monthlyStatsRes.data.reduce((s, d) => s + d.total_revenue, 0))
      } else {
        // Fallback: query orders directly
        const { data: monthlyFallback } = await supabase
          .from("orders")
          .select("total_price")
          .eq("restaurant_id", restaurant.id)
          .gte("created_at", monthStart)
          .neq("order_status", "cancelled")
        if (monthlyFallback) {
          setMonthlyOrders(monthlyFallback.length)
          setMonthlyRevenue(monthlyFallback.reduce((s, o) => s + o.total_price, 0))
        }
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

      setError(null)
      setPageState("ready")
    } catch (err) {
      console.error("Dashboard data fetch error:", err)
      setError("Failed to load dashboard data. Please try again.")
      setPageState("error")
    }
  }, [restaurant?.id])

  // Central loading orchestrator — waits for subscription + dashboard data
  useEffect(() => {
    if (fetchedRef.current) return
    if (subLoading) {
      setPageState("loading")
      return
    }
    // Subscription resolved
    if (!restaurant) {
      // User has no restaurant — show empty state
      setPageState("ready")
      return
    }
    // Restaurant exists — fetch dashboard data
    setPageState("loading")
    fetchedRef.current = true
    fetchData()
  }, [subLoading, restaurant, fetchData])

  useEffect(() => {
    if (restaurant) {
      setIsOpen((restaurant as any).is_open ?? true)
      const rawOpen: string = (restaurant as any).opening_time || "09:00"
      const rawClose: string = (restaurant as any).closing_time || "23:00"
      setOpeningTime(rawOpen.length > 5 ? rawOpen.slice(0, 5) : rawOpen)
      setClosingTime(rawClose.length > 5 ? rawClose.slice(0, 5) : rawClose)
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
  const planDaysRemaining = !isTrial && restaurant?.plan_end_date
    ? Math.max(0, Math.ceil((new Date(restaurant.plan_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  const onboardingComplete = profilePercent === 100 && menuDone === 2

  const ordersTrend = yesterdayOrders > 0
    ? Math.round(((todayOrders - yesterdayOrders) / yesterdayOrders) * 100)
    : todayOrders > 0 ? 100 : 0
  const revenueTrend = yesterdayRevenue > 0
    ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
    : todayRevenue > 0 ? 100 : 0

  // Show PageLoader while loading (covers: slow internet, offline, error)
  if (pageState !== "ready") {
    return (
      <PageLoader
        state={pageState}
        error={error}
        onRetry={() => {
          fetchedRef.current = false
          setPageState("loading")
          fetchData()
        }}
        skeleton={
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
        }
      />
    )
  }

  return (
    <div className="space-y-4">

      {/* Top Row */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-black">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/qr"
            className="bg-white border border-[#E0E0E0] text-black px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold hover:bg-[#F5F5F5] transition-all active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">QR</span>
          </Link>
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
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {isTrial ? "Free Trial" : `${restaurant.plan} Plan`}
                  </span>
                  <h2 className="text-base font-semibold mt-1.5">
                    {isTrial
                      ? `${trialDaysRemaining} day${trialDaysRemaining === 1 ? "" : "s"} remaining in trial`
                      : `${restaurant.plan.charAt(0).toUpperCase() + restaurant.plan.slice(1)} Plan — Active`}
                  </h2>
                  <p className="text-[11px] text-white/70 mt-0.5">
                    {restaurant.trial_start && isTrial
                      ? `Started ${new Date(restaurant.trial_start).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}`
                      : restaurant.plan_end_date
                        ? `Renews ${new Date(restaurant.plan_end_date).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}`
                        : ""}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold">
                  {isTrial ? trialDaysRemaining : planDaysRemaining ?? "∞"}
                </p>
                <p className="text-[10px] text-white/70 font-medium">
                  {isTrial ? "days left" : "days remaining"}
                </p>
              </div>
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
      <div className="bg-white border border-[#F0F0F0] rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isOpen ? "bg-[#25D366]/10" : "bg-red-50"}`}>
              <Power className={`w-5 h-5 ${isOpen ? "text-[#25D366]" : "text-[#DC2626]"}`} />
            </div>
            <div>
              <p className="text-sm font-semibold">{isOpen ? "Accepting Orders" : "Closed"}</p>
              <p className="text-[11px] text-[#555] mt-0.5">
                {isOpen ? "Customers can place orders" : "Customers cannot place orders"}
              </p>
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
        <div className="flex flex-col gap-3 pt-4 mt-4 border-t border-[#F0F0F0]">
          <div className="flex items-center gap-2 text-[11px] text-[#555] font-medium shrink-0">
            <Clock className="w-4 h-4 text-[#555]" />
            <span>Business Hours</span>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#F5F5F5] rounded-lg px-2.5 py-1.5 border border-[#E0E0E0] min-w-0">
              <input
                type="time"
                value={openingTime}
                onChange={(e) => handleTimeChange("opening_time", e.target.value.slice(0, 5))}
                className="min-w-0 bg-transparent text-xs font-medium text-black focus:outline-none cursor-pointer"
              />
              <span className="text-[10px] text-[#888] font-medium whitespace-nowrap shrink-0">{formatTo12Hour(openingTime)}</span>
            </div>
            <span className="text-[#BBB] text-xs">—</span>
            <div className="flex items-center gap-1.5 bg-[#F5F5F5] rounded-lg px-2.5 py-1.5 border border-[#E0E0E0] min-w-0">
              <input
                type="time"
                value={closingTime}
                onChange={(e) => handleTimeChange("closing_time", e.target.value.slice(0, 5))}
                className="min-w-0 bg-transparent text-xs font-medium text-black focus:outline-none cursor-pointer"
              />
              <span className="text-[10px] text-[#888] font-medium whitespace-nowrap shrink-0">{formatTo12Hour(closingTime)}</span>
            </div>
          </div>
        </div>
      </div>

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
        {hasAiAccess && (
          <Link
            href="/dashboard/ai-posts"
            className="bg-gradient-to-br from-[#7C3AED] to-[#2563EB] text-white p-4 rounded-2xl flex items-center gap-3 group cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="bg-white/10 p-2.5 rounded-xl shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">AI Posts</p>
              <p className="text-[10px] text-white/60">Generate with AI</p>
            </div>
          </Link>
        )}
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
