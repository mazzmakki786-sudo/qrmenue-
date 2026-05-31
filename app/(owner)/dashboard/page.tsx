"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardStats } from "@/components/owner/DashboardStats"
import { OrdersChart } from "@/components/owner/OrdersChart"
import { RecentOrders } from "@/components/owner/RecentOrders"
import { BellNotification } from "@/components/owner/BellNotification"
import { formatPrice } from "@/lib/utils"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import type { DailyStats, Order } from "@/types"

export default function DashboardPage() {
  const router = useRouter()
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [todayOrders, setTodayOrders] = useState(0)
  const [todayRevenue, setTodayRevenue] = useState(0)
  const [graph7d, setGraph7d] = useState<DailyStats[]>([])
  const [graph30d, setGraph30d] = useState<DailyStats[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [topDishes, setTopDishes] = useState<{ name: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

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
    setRestaurantId(restaurant.id)

    const today = new Date().toISOString().split("T")[0]

    const [todayRes, statsRes, ordersRes] = await Promise.all([
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
      const dishCount: Record<string, number> = {}
      ordersRes.data.forEach((order) => {
        ;(order.items as any[]).forEach((item: any) => {
          dishCount[item.name_en] = (dishCount[item.name_en] || 0) + item.quantity
        })
      })
      setTopDishes(
        Object.entries(dishCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }))
      )
    }

    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        {restaurantId && <BellNotification restaurantId={restaurantId} />}
      </div>

      <DashboardStats todayOrders={todayOrders} todayRevenue={todayRevenue} />

      <OrdersChart data7d={graph7d} data30d={graph30d} />

      {topDishes.length > 0 && (
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5">
          <h3 className="text-sm font-semibold mb-3">Popular Dishes</h3>
          <div className="space-y-2">
            {topDishes.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <span>{i + 1}. {d.name}</span>
                <span className="text-[#555]">{d.count} orders</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <RecentOrders orders={recentOrders} />

      {/* Logout button at bottom-left */}
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
