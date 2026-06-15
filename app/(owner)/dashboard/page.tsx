"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils"
import { ChevronRight, ClipboardList, UtensilsCrossed, User, Check, TrendingUp, ShoppingBag, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { DailyStats, Order } from "@/types"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { Badge } from "@/components/ui/badge"
import dynamic from "next/dynamic"

const OrdersChart = dynamic(() => import("@/components/owner/OrdersChart").then((m) => ({ default: m.OrdersChart })), {
  loading: () => <div className="h-64 bg-[#F0F0F0] animate-pulse rounded-[14px]" />,
})

export default function DashboardPage() {
  const router = useRouter()
  const sub = useSubscription()
  const { restaurant, orderCount, loading: subLoading } = sub
  const [todayOrders, setTodayOrders] = useState(0)
  const [todayRevenue, setTodayRevenue] = useState(0)
  const [graph7d, setGraph7d] = useState<DailyStats[]>([])
  const [graph30d, setGraph30d] = useState<DailyStats[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [topDishes, setTopDishes] = useState<{ name: string; count: number }[]>([])
  const [categoryCount, setCategoryCount] = useState(0)
  const [dishCount, setDishCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [chartView, setChartView] = useState<"7d" | "30d">("7d")
  const fetchData = useCallback(async () => {
    if (!restaurant?.id) {
      setLoading(false)
      return
    }
    const supabase = createClient()
    const today = new Date().toISOString().split("T")[0]

    try {
      const [todayRes, statsRes, ordersRes, catRes, dishRes] = await Promise.all([
        supabase
          .from("orders")
          .select("total_price")
          .eq("restaurant_id", restaurant.id)
          .gte("created_at", today)
          .neq("order_status", "cancelled"),
        supabase
          .from("daily_order_stats")
          .select("*")
          .eq("restaurant_id", restaurant.id)
          .order("order_date", { ascending: false })
          .limit(30),
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

      if (todayRes.data) {
        setTodayOrders(todayRes.data.length)
        setTodayRevenue(todayRes.data.reduce((sum, o) => sum + o.total_price, 0))
      }

      if (statsRes.data) {
        const reversed = statsRes.data.reverse()
        setGraph7d(reversed.slice(-7))
        setGraph30d(reversed)
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
    } catch (err) {
      console.error("Dashboard data fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [restaurant?.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!restaurant?.id) return
    if (restaurant.plan === "trial") {
      fetch("/api/trial/reminders/check", { method: "POST" }).catch(() => {})
    }
    fetch("/api/owner/alerts/check", { method: "POST" }).catch(() => {})
  }, [restaurant?.id, restaurant?.plan])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

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

  const chartData = chartView === "7d" ? graph7d : graph30d
  const maxOrders = Math.max(...chartData.map((d) => d.total_orders), 1)

  const onboardingComplete = profilePercent === 100 && menuDone === 2

  if (loading || subLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-[#F0F0F0] rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-[#F0F0F0] rounded-[14px]" />
          <div className="h-32 bg-[#F0F0F0] rounded-[14px]" />
        </div>
        <div className="h-64 bg-[#F0F0F0] rounded-[14px]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">


      {/* Top Row */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#000]">Dashboard</h1>
        <Link
          href="/dashboard/orders"
          className="bg-black text-white px-6 py-2.5 rounded-full flex items-center gap-2 text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
        >
          <ClipboardList className="w-4 h-4" />
          Orders
        </Link>
      </div>

      {/* Subscription Banner */}
      {restaurant && (
        <section>
          <div className="relative overflow-hidden bg-gradient-to-r from-[#0052D4] via-[#4364F7] to-[#6FB1FC] p-6 rounded-[14px] text-white shadow-sm">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                  <div className="w-full md:w-64">
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
        </section>
      )}

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/menu"
          className="bg-black text-white p-6 rounded-[14px] flex items-center justify-between group cursor-pointer hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-xl">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <p className="text-lg font-semibold">Manage Menu</p>
              <p className="text-sm text-white/60">Categories & dishes</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          href="/dashboard/settings"
          className="bg-white border border-[#F0F0F0] p-6 rounded-[14px] flex items-center justify-between group cursor-pointer hover:bg-[#F9FAFB] transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="bg-[#EDEEEF] p-3 rounded-xl text-black">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-lg font-semibold text-black">Profile</p>
              <p className="text-sm text-[#555]">Restaurant info</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-black/40 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Onboarding (hide when complete) */}
        {!onboardingComplete && (
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Completion */}
            <div className="bg-white border border-[#F0F0F0] rounded-[14px] p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Profile Completion</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-[40px] font-extrabold text-black">{profilePercent}%</span>
                <span className="text-sm text-[#555]">Complete</span>
              </div>
              <div className="h-1.5 w-full bg-[#EDEEEF] rounded-full mb-6">
                <div className="h-full bg-black w-[80%] rounded-full" style={{ width: `${profilePercent}%` }} />
              </div>
              <ul className="space-y-4">
                {profileFields.map((f) => (
                  <li key={f.label} className="flex items-center gap-3">
                    {f.done ? (
                      <Check className="w-5 h-5 text-[#25D366]" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[#BBCBB9]" />
                    )}
                    <span className="text-sm text-[#191c1d]">{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Menu Setup */}
            <div className="bg-white border border-[#F0F0F0] rounded-[14px] p-6">
              <h3 className="text-lg font-semibold text-black mb-6">Menu Setup</h3>
              <ul className="space-y-4">
                {menuFields.map((f) => (
                  <li key={f.label} className="flex items-center gap-3">
                    {f.done ? (
                      <Check className="w-5 h-5 text-[#25D366]" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[#BBCBB9]" />
                    )}
                    <span className="text-sm text-[#191c1d]">{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Right Column - full width when onboarding hidden */}
        <div className={`${onboardingComplete ? "lg:col-span-12" : "lg:col-span-8"} space-y-6`}>
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-[#F0F0F0] p-6 rounded-[14px] flex flex-col justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#555]">Today Orders</span>
              <span className="text-[28px] font-bold text-black mt-2">{todayOrders}</span>
              <span className="text-xs text-[#25D366] font-medium mt-4 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                from today
              </span>
            </div>
            <div className="bg-white border border-[#F0F0F0] p-6 rounded-[14px] flex flex-col justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#555]">Today Revenue</span>
              <span className="text-[28px] font-bold text-black mt-2">{formatPrice(todayRevenue)}</span>
              <span className="text-xs text-[#25D366] font-medium mt-4 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                from today
              </span>
            </div>
          </div>

          {/* Orders Chart */}
          {chartData.length > 0 ? (
            <OrdersChart data7d={graph7d} data30d={graph30d} />
          ) : (
            <div className="bg-white border border-[#F0F0F0] rounded-[14px] p-6">
              <h3 className="text-lg font-semibold text-black mb-6">Order Trends</h3>
              <div className="h-48 flex items-center justify-center text-sm text-[#999]">
                No order data yet
              </div>
            </div>
          )}

          {/* Popular Dishes */}
          {topDishes.length > 0 && (
            <div className="bg-white border border-[#F0F0F0] rounded-[14px] p-6">
              <h3 className="text-lg font-semibold text-black mb-6">Popular Dishes</h3>
              <div className="space-y-3">
                {topDishes.map((d, i) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl border border-transparent hover:border-[#F0F0F0] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-[#555] w-5">{i + 1}.</span>
                      <span className="text-sm font-semibold text-black">{d.name}</span>
                    </div>
                    <span className="text-xs text-[#555] font-medium">{d.count} orders</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <section>
        <div className="bg-white border border-[#F0F0F0] rounded-[14px] overflow-hidden">
          <div className="p-6 border-b border-[#F0F0F0] flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black">Recent Orders</h3>
            <Link href="/dashboard/orders" className="text-sm text-[#25D366] font-semibold hover:underline">
              View All
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F9FAFB] text-[#555] text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Order #</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-[#F9FAFB]/50 transition-colors cursor-pointer group"
                      onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-black">
                        {order.order_number || `#${order.id.slice(0, 4)}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-black">{order.customer_name || "Guest"}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-[#555]">
                          {order.order_type === "dine_in" ? "Dine-in" : order.order_type === "delivery" ? "Delivery" : "Takeaway"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-black">
                        {formatPrice(order.total_price)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          order.order_status === "completed" || order.order_status === "received"
                            ? "available"
                            : order.order_status === "preparing"
                              ? "growth"
                              : order.order_status === "cancelled"
                                ? "unavailable"
                                : "starter"
                        }>
                          {order.order_status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-[#999]">
              No orders yet
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-[#F0F0F0]">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <span className="text-sm font-bold text-black">QRMenu.pk</span>
          <div className="flex gap-4 text-xs text-[#555]">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs text-[#555]">&copy; 2024 QRMenu.pk. All rights reserved.</span>
          <button
            onClick={handleLogout}
            className="text-xs text-[#BA1A1A] font-semibold flex items-center gap-1 hover:underline opacity-80 hover:opacity-100 transition-opacity"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </footer>
    </div>
  )
}
