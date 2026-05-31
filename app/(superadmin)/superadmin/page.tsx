"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { RestaurantTable } from "@/components/superadmin/RestaurantTable"
import { Card } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"

export default function SuperAdminPage() {
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const supabase = createClient()

    const [restaurantsRes, ordersRes] = await Promise.all([
      supabase
        .from("restaurants")
        .select("*, orders(count)")
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("total_price")
        .neq("order_status", "cancelled"),
    ])

    if (restaurantsRes.data) {
      setRestaurants(
        restaurantsRes.data.map((r: any) => ({
          ...r,
          total_orders: r.orders?.[0]?.count || 0,
        }))
      )
    }

    if (ordersRes.data) {
      setTotalOrders(ordersRes.data.length)
      setTotalRevenue(ordersRes.data.reduce((s, o) => s + o.total_price, 0))
    }

    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-[#E8E8E8] rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-[#E8E8E8] rounded-[14px] animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-[#E8E8E8] rounded-[14px] animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Super Admin</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-[28px] font-bold">{restaurants.length}</p>
          <p className="text-sm text-[#555]">Restaurants</p>
        </Card>
        <Card>
          <p className="text-[28px] font-bold">{totalOrders}</p>
          <p className="text-sm text-[#555]">Total Orders</p>
        </Card>
        <Card>
          <p className="text-[28px] font-bold">{formatPrice(totalRevenue)}</p>
          <p className="text-sm text-[#555]">Total Revenue</p>
        </Card>
      </div>

      <RestaurantTable
        restaurants={restaurants}
        search={search}
        onSearchChange={setSearch}
      />
    </div>
  )
}
