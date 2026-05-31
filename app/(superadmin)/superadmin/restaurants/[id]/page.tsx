"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useParams } from "next/navigation"
import { PlanEditor } from "@/components/superadmin/PlanEditor"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Restaurant } from "@/types"

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const supabase = createClient()
    const { data: r } = await supabase.from("restaurants").select("*").eq("id", id).single()
    if (r) {
      setRestaurant(r)
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", r.id)
        .order("created_at", { ascending: false })
        .limit(10)
      setRecentOrders(orders || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [id])

  const handlePlanUpdate = async (plan: string, endDate: string) => {
    const supabase = createClient()
    await supabase.from("restaurants").update({
      plan,
      plan_end_date: endDate ? new Date(endDate).toISOString() : null,
    }).eq("id", id)
    await supabase.from("subscriptions").insert({
      restaurant_id: id,
      plan,
      amount_pkr: plan === "starter" ? 800 : plan === "growth" ? 1800 : 2500,
      start_date: new Date().toISOString(),
      end_date: new Date(endDate).toISOString(),
    })
    fetchData()
  }

  const toggleActive = async () => {
    if (!restaurant) return
    const supabase = createClient()
    await supabase.from("restaurants").update({ is_active: !restaurant.is_active }).eq("id", id)
    fetchData()
  }

  if (loading) return <div className="text-center text-[#999] py-12">Loading...</div>
  if (!restaurant) return <div className="text-center text-[#DC2626] py-12">Restaurant not found</div>

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/superadmin">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">{restaurant.name}</h1>
      </div>

      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-[#555]">City</span><span>{restaurant.city}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#555]">Phone</span><span>{restaurant.phone || "—"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#555]">Slug</span><span className="text-xs">/{restaurant.slug}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#555]">Plan</span>
          <Badge variant={(restaurant.plan as any) || "starter"} className="capitalize">{restaurant.plan}</Badge>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#555]">Status</span>
          <Badge variant={restaurant.is_active ? "available" : "unavailable"}>
            {restaurant.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#555]">Joined</span>
          <span>{new Date(restaurant.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5">
        <h3 className="text-sm font-semibold mb-4">Change Plan</h3>
        <PlanEditor currentPlan={restaurant.plan} onSave={handlePlanUpdate} />
      </div>

      <Button variant="ghost" fullWidth onClick={toggleActive}>
        {restaurant.is_active ? "Deactivate Restaurant" : "Activate Restaurant"}
      </Button>

      {recentOrders.length > 0 && (
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5">
          <h3 className="text-sm font-semibold mb-3">Recent Orders</h3>
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex justify-between text-sm py-1 border-b border-[#F0F0F0] last:border-0">
                <span>{o.order_number}</span>
                <span className="text-[#555]">{formatPrice(o.total_price)} • {o.order_status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
