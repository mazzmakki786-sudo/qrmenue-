"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OrderReceipt } from "@/components/shared/OrderReceipt"
import { formatPrice } from "@/lib/utils"
import { ArrowLeft, Check, Printer, X, Lock, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Order } from "@/types"
import { useSubscription } from "@/lib/hooks/useSubscription"

const statusFlow = ["received", "preparing", "ready", "completed"]

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const sub = useSubscription()
  const { shouldBlurOrderDetails, orderCount, planLimits } = sub
  const [order, setOrder] = useState<Order | null>(null)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showReceipt, setShowReceipt] = useState(false)

  const fetchData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: restaurantData } = await supabase
      .from("restaurants")
      .select("*")
      .eq("owner_id", user.id)
      .single()

    if (restaurantData) setRestaurant(restaurantData)

    const { data } = await supabase.from("orders").select("*").eq("id", id).single()
    setOrder(data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [id])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(uid(`order-detail-${id}`))
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setOrder(payload.new as Order)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id])

  const updateStatus = async (newStatus: string) => {
    const supabase = createClient()
    await supabase.from("orders").update({ order_status: newStatus }).eq("id", id)
    fetchData()
  }

  if (loading) return <div className="text-center text-[#999] py-12">Loading order...</div>
  if (!order) return <div className="text-center text-[#DC2626] py-12">Order not found</div>

  const currentIndex = statusFlow.indexOf(order.order_status)

  const blur = (text: string) => "█".repeat(Math.max(4, Math.min(text?.length || 0, 14)))

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/orders">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">{order.order_number}</h1>
      </div>

      {shouldBlurOrderDetails && (
        <div className="mb-6 bg-gradient-to-br from-[#FEF3C7] to-[#FED7AA] border border-[#D97706]/30 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D97706] text-white flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#92400E]">
                Order details locked
              </p>
              <p className="text-xs text-[#78350F] mt-1">
                Free Trial limit reached ({orderCount}/{planLimits.maxOrders}). Upgrade to see this order's details.
              </p>
              <Link
                href="/dashboard/subscription"
                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-[#D97706] text-white text-xs font-semibold rounded-lg hover:opacity-90"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Upgrade <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5 mb-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-[#555]">Status</span>
          <Badge variant={order.order_status === "received" || order.order_status === "preparing" ? "growth" : "available"} className="capitalize">{order.order_status}</Badge>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#555]">Order Type</span>
          <span className="capitalize">{order.order_type.replace("_", " ")}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#555]">Customer</span>
          {shouldBlurOrderDetails ? (
            <span className="blur-sm select-none font-mono">{blur(order.customer_name)}</span>
          ) : (
            <span>{order.customer_name}</span>
          )}
        </div>
        {order.customer_phone && (
          <div className="flex justify-between text-sm">
            <span className="text-[#555]">Phone</span>
            {shouldBlurOrderDetails ? (
              <span className="blur-sm select-none font-mono">{blur(order.customer_phone)}</span>
            ) : (
              <span>{order.customer_phone}</span>
            )}
          </div>
        )}
        {order.table_number && (
          <div className="flex justify-between text-sm">
            <span className="text-[#555]">Table</span>
            {shouldBlurOrderDetails ? (
              <span className="blur-sm select-none font-mono">{blur(order.table_number)}</span>
            ) : (
              <span>{order.table_number}</span>
            )}
          </div>
        )}
        {order.delivery_address && (
          <div className="flex justify-between text-sm">
            <span className="text-[#555]">Address</span>
            {shouldBlurOrderDetails ? (
              <span className="blur-sm select-none font-mono text-right">{blur(order.delivery_address)}</span>
            ) : (
              <span className="text-right">{order.delivery_address}</span>
            )}
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
        {shouldBlurOrderDetails ? (
          <div className="text-center py-4">
            <Lock className="w-8 h-8 text-[#999] mx-auto mb-2" />
            <p className="text-xs text-[#999]">Items hidden — upgrade to view</p>
            <p className="text-sm font-mono blur-sm select-none mt-2">
              {(order.items || []).length} item{(order.items || []).length === 1 ? "" : "s"}
            </p>
            <p className="text-base font-bold blur-sm select-none font-mono mt-1">
              {formatPrice(order.total_price)}
            </p>
          </div>
        ) : (
          <>
            {(order.items || []).map((item: any) => (
              <div key={item.dish_id} className="flex justify-between py-2 text-sm border-b border-[#F0F0F0] last:border-0">
                <span>{item.name_en} x{item.quantity}</span>
                <span>{formatPrice(item.subtotal)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 font-bold">
              <span>Total</span>
              <span>{formatPrice(order.total_price)}</span>
            </div>
          </>
        )}
      </div>

      {order.order_status !== "cancelled" && order.order_status !== "completed" && (
        <div className="space-y-2">
          {order.order_status === "received" && (
            <Button variant="primary" fullWidth onClick={() => updateStatus("preparing")}>
              <Check className="w-4 h-4 mr-2" /> Confirm Order
            </Button>
          )}
          {statusFlow[currentIndex + 1] && order.order_status !== "received" && (
            <Button variant="primary" fullWidth onClick={() => updateStatus(statusFlow[currentIndex + 1])}>
              Mark as {statusFlow[currentIndex + 1].charAt(0).toUpperCase() + statusFlow[currentIndex + 1].slice(1)}
            </Button>
          )}
          {currentIndex < statusFlow.length - 1 && (
            <Button variant="ghost" fullWidth onClick={() => updateStatus("cancelled")}>
              <X className="w-4 h-4 mr-2" /> Cancel Order
            </Button>
          )}
        </div>
      )}

      {(order.order_status === "preparing" || order.order_status === "ready" || order.order_status === "completed") && !shouldBlurOrderDetails && (
        <div className="mt-4">
          <Button variant="primary" fullWidth onClick={() => setShowReceipt(!showReceipt)}>
            <Printer className="w-4 h-4 mr-2" /> {showReceipt ? "Hide" : "View & Print"} Receipt
          </Button>
        </div>
      )}

      {showReceipt && restaurant && !shouldBlurOrderDetails && (
        <div className="mt-6">
          <OrderReceipt order={order} restaurant={restaurant} />
        </div>
      )}
    </div>
  )
}
