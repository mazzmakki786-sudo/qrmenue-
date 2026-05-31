"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { User, LogOut } from "lucide-react"
import type { Order } from "@/types"

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20)
        setOrders(data || [])
      }
      setLoading(false)
    }
    init()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setOrders([])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#999]">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <User className="w-12 h-12 text-[#999] mb-4" />
        <p className="text-lg font-medium mb-2">Not logged in</p>
        <p className="text-sm text-[#555] mb-6">Login to view your orders</p>
        <Link href="/login?redirect=/account">
          <Button variant="primary">Sign In</Button>
        </Link>
        <Link href="/restaurants" className="mt-4">
          <Button variant="ghost">Browse Restaurants</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">My Account</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-[#DC2626] hover:text-red-700"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="bg-[#F8F8F8] rounded-[12px] p-4 mb-6">
          <p className="text-sm font-medium">{user.email}</p>
          <p className="text-xs text-[#555] mt-1">Member since {new Date(user.created_at).toLocaleDateString()}</p>
        </div>

        <h2 className="text-sm font-semibold mb-3">Order History</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-[#999]">No orders yet</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-[10px] border border-[#E8E8E8]"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{order.order_number}</p>
                  <span className="text-xs text-[#555] capitalize">{order.order_status}</span>
                </div>
                <p className="text-xs text-[#555]">
                  {new Date(order.created_at).toLocaleDateString()} • Rs {order.total_price}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
