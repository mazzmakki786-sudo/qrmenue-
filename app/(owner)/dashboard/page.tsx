"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardStats } from "@/components/owner/DashboardStats"
import { OrdersChart } from "@/components/owner/OrdersChart"
import { RecentOrders } from "@/components/owner/RecentOrders"
import { SubscriptionBanner } from "@/components/shared/SubscriptionBanner"
import { formatPrice } from "@/lib/utils"
import { LogOut, UtensilsCrossed, User, Check, ChevronRight, ClipboardList } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { DailyStats, Order } from "@/types"
import { useSubscription } from "@/lib/hooks/useSubscription"

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

  if (loading || subLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-[#E8E8E8] rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-[#E8E8E8] rounded-[14px] animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-[#E8E8E8] rounded-[14px] animate-pulse" />
      </div>
    )
  }

  const profileFields = [
    { label: "Phone number", done: !!restaurant?.phone },
    { label: "Address", done: !!restaurant?.address },
    { label: "Logo / Photo", done: !!restaurant?.logo_url },
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
  const menuPercent = Math.round((menuDone / menuFields.length) * 100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-[#1A1A1A] transition-colors"
        >
          <ClipboardList className="w-4 h-4" />
          <span className="hidden sm:inline">Orders</span>
        </Link>
      </div>

      {restaurant && (
        <SubscriptionBanner restaurant={restaurant} orderCount={orderCount} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/dashboard/menu"
          className="flex items-center gap-3 p-4 rounded-[14px] bg-black text-white hover:bg-[#1A1A1A] transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Manage Menu</p>
            <p className="text-xs text-white/60 truncate">Categories & dishes</p>
          </div>
          <ChevronRight className="w-4 h-4 ml-auto text-white/40 flex-shrink-0" />
        </Link>
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 p-4 rounded-[14px] border border-[#E8E8E8] hover:border-black transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-[#F8F8F8] flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Profile</p>
            <p className="text-xs text-[#555] truncate">Restaurant info</p>
          </div>
          <ChevronRight className="w-4 h-4 ml-auto text-[#CCC] flex-shrink-0" />
        </Link>
      </div>

      {profilePercent < 100 && (
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Profile Completion</h3>
            <span className="text-xs font-medium text-[#555]">{profilePercent}%</span>
          </div>
          <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all duration-500"
              style={{ width: `${profilePercent}%` }}
            />
          </div>
          <div className="space-y-2">
            {profileFields.map((f) => (
              <div key={f.label} className="flex items-center gap-2 text-xs text-[#555]">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    f.done ? "bg-[#DCFCE7]" : "bg-[#F0F0F0]"
                  }`}
                >
                  {f.done && <Check className="w-3 h-3 text-[#16A34A]" />}
                </div>
                {f.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {menuPercent < 100 && (
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Menu Setup</h3>
            <span className="text-xs font-medium text-[#555]">{menuPercent}%</span>
          </div>
          <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all duration-500"
              style={{ width: `${menuPercent}%` }}
            />
          </div>
          <div className="space-y-2">
            {menuFields.map((f) => (
              <div key={f.label} className="flex items-center gap-2 text-xs text-[#555]">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    f.done ? "bg-[#DCFCE7]" : "bg-[#F0F0F0]"
                  }`}
                >
                  {f.done && <Check className="w-3 h-3 text-[#16A34A]" />}
                </div>
                {f.label}
              </div>
            ))}
          </div>
        </div>
      )}

      <DashboardStats todayOrders={todayOrders} todayRevenue={todayRevenue} />

      <OrdersChart data7d={graph7d} data30d={graph30d} />

      {topDishes.length > 0 && (
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5">
          <h3 className="text-sm font-semibold mb-3">Popular Dishes</h3>
          <div className="space-y-2">
            {topDishes.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <span className="truncate">{i + 1}. {d.name}</span>
                <span className="text-[#555] flex-shrink-0 ml-2">{d.count} orders</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <RecentOrders orders={recentOrders} />

      <div className="pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-[#DC2626] hover:text-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
