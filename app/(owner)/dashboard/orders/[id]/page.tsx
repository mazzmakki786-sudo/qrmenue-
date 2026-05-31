"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Order } from "@/types"

const statusFlow = ["received", "preparing", "ready", "completed"]

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOrder = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("orders").select("*").eq("id", id).single()
    setOrder(data)
    setLoading(false)
  }

  useEffect(() => { fetchOrder() }, [id])

  const updateStatus = async (newStatus: string) => {
    const supabase = createClient()
    await supabase.from("orders").update({ order_status: newStatus }).eq("id", id)
    fetchOrder()
  }

  if (loading) return <div className="text-center text-[#999] py-12">Loading order...</div>
  if (!order) return <div className="text-center text-[#DC2626] py-12">Order not found</div>

  const currentIndex = statusFlow.indexOf(order.order_status)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/orders">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">{order.order_number}</h1>
      </div>

      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5 mb-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-[#555]">Status</span>
          <Badge variant="available" className="capitalize">{order.order_status}</Badge>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#555]">Order Type</span>
          <span className="capitalize">{order.order_type.replace("_", " ")}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#555]">Customer</span>
          <span>{order.customer_name}</span>
        </div>
        {order.customer_phone && (
          <div className="flex justify-between text-sm">
            <span className="text-[#555]">Phone</span>
            <span>{order.customer_phone}</span>
          </div>
        )}
        {order.table_number && (
          <div className="flex justify-between text-sm">
            <span className="text-[#555]">Table</span>
            <span>{order.table_number}</span>
          </div>
        )}
        {order.delivery_address && (
          <div className="flex justify-between text-sm">
            <span className="text-[#555]">Address</span>
            <span className="text-right max-w-[200px]">{order.delivery_address}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-[#555]">Payment</span>
          <span className="capitalize">{order.payment_method.replace("_", " ")}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#555]">Time</span>
          <span>{new Date(order.created_at).toLocaleString("en-PK")}</span>
        </div>
      </div>

      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5 mb-6">
        <h3 className="text-sm font-semibold mb-3">Items</h3>
        {order.items.map((item: any) => (
          <div key={item.dish_id} className="flex justify-between py-2 text-sm border-b border-[#F0F0F0] last:border-0">
            <span>{item.name_en} x{item.quantity}</span>
            <span>{formatPrice(item.subtotal)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 font-bold">
          <span>Total</span>
          <span>{formatPrice(order.total_price)}</span>
        </div>
      </div>

      {order.order_status !== "cancelled" && order.order_status !== "completed" && (
        <div className="space-y-2">
          {statusFlow[currentIndex + 1] && (
            <Button
              variant="primary"
              fullWidth
              onClick={() => updateStatus(statusFlow[currentIndex + 1])}
            >
              Mark as {statusFlow[currentIndex + 1].charAt(0).toUpperCase() + statusFlow[currentIndex + 1].slice(1)}
            </Button>
          )}
          {currentIndex < statusFlow.length - 1 && (
            <Button
              variant="ghost"
              fullWidth
              onClick={() => updateStatus("cancelled")}
            >
              Cancel Order
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
