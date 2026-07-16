"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OrderReceipt } from "@/components/shared/OrderReceipt"
import { formatPrice } from "@/lib/utils"
import { ArrowLeft, Printer, X, Lock, Sparkles, ArrowRight, Download, Phone, Loader2, RefreshCw } from "lucide-react"
import Link from "next/link"
import type { Order } from "@/types"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { useToastStore } from "@/stores/toastStore"

const STATUS_FLOW: Order["order_status"][] = ["received", "preparing", "ready", "completed"]

const STATUS_ACTIONS: Record<string, { next: Order["order_status"]; label: string; color: string }> = {
  received: { next: "preparing", label: "Start Preparing", color: "bg-[#25D366] hover:bg-[#1ba94a]" },
  preparing: { next: "ready", label: "Mark as Ready", color: "bg-[#2563EB] hover:bg-[#1d4ed8]" },
  ready: { next: "completed", label: "Mark as Completed", color: "bg-black hover:bg-[#1A1A1A]" },
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const sub = useSubscription()
  const { shouldBlurOrderDetails, orderCount, planLimits } = sub
  const [order, setOrder] = useState<Order | null>(null)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const addToast = useToastStore((s) => s.addToast)
  const receiptRef = useRef<HTMLDivElement>(null)

  const fetchData = async () => {
    setFetchError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setFetchError("Session expired. Please sign in again.")
        setLoading(false)
        return
      }

      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle()

      if (restaurantError) {
        setFetchError("Failed to load restaurant data.")
        setLoading(false)
        return
      }

      if (!restaurantData) {
        setFetchError("No restaurant found for this account.")
        setLoading(false)
        return
      }

      setRestaurant(restaurantData)

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .eq("restaurant_id", restaurantData.id)
        .maybeSingle()

      if (orderError) {
        setFetchError("Failed to load order.")
        setLoading(false)
        return
      }

      if (!orderData) {
        setFetchError("Order not found.")
        setLoading(false)
        return
      }

      setOrder(orderData)
    } catch (err) {
      console.error("Order fetch error:", err)
      setFetchError("An unexpected error occurred.")
    }
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

  const handlePrint = () => {
    const content = receiptRef.current
    if (!content) return
    const printWindow = window.open("", "_blank")
    if (!printWindow) return
    const clone = content.cloneNode(true) as HTMLElement
    printWindow.document.write(`
      <html><head><title>Order ${order?.order_number}</title>
      <style>body{font-family:sans-serif;padding:20px;max-width:400px;margin:auto;}table{width:100%;}td{padding:4px 0;font-size:14px;}</style>
      </head><body><div id="receipt"></div></body></html>
    `)
    printWindow.document.close()
    printWindow.document.getElementById("receipt")?.appendChild(clone)
    printWindow.print()
  }

  const updateOrderStatus = async (newStatus: Order["order_status"]) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast({ type: "error", title: "Failed", message: data.error || "Failed to update order", duration: 4000 })
        return
      }
      setOrder(data.order)
      addToast({ type: "success", title: "Order Updated", message: `Order ${newStatus === "cancelled" ? "cancelled" : `marked as ${newStatus}`}`, duration: 3000 })
    } catch {
      addToast({ type: "error", title: "Network Error", message: "Could not update order", duration: 4000 })
    }
    setUpdating(false)
    setShowCancelDialog(false)
  }

  const handleCancelOrder = () => {
    updateOrderStatus("cancelled")
  }

  const handleDownloadPNG = async () => {
    const content = receiptRef.current
    if (!content) return
    const { default: html2canvas } = await import("html2canvas")
    const canvas = await html2canvas(content, { backgroundColor: "#ffffff", scale: 2 })
    const link = document.createElement("a")
    link.download = `order-${order?.order_number || "receipt"}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="h-8 w-48 bg-[#F0F0F0] rounded mb-6 animate-pulse" />
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4 sm:p-5 mb-4 space-y-4 animate-pulse">
          {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-[#F0F0F0] rounded w-full" />)}
        </div>
        <div className="h-48 bg-[#F0F0F0] rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
          <X className="w-6 h-6 text-error" />
        </div>
        <p className="text-sm text-error font-medium mb-4">{fetchError}</p>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:opacity-90 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    )
  }

  if (!order) return null

  const blur = (text: string) => "█".repeat(Math.max(4, Math.min(text?.length || 0, 14)))

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/orders"
          className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center hover:bg-[#EBEBEB] active:scale-95 transition-all shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
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
                Free Trial limit reached ({orderCount}/{planLimits.maxOrders}). Upgrade to see this order&apos;s details.
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

      <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4 sm:p-5 mb-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#555]">Status</span>
          <Badge variant={order.order_status === "received" ? "growth" : order.order_status === "ready" ? "available" : "unavailable"} className="capitalize">{order.order_status}</Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#555]">Order Type</span>
          <span className="capitalize font-medium">{order.order_type.replace("_", " ")}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#555]">Customer</span>
          {shouldBlurOrderDetails ? (
            <span className="blur-sm select-none font-mono">{blur(order.customer_name)}</span>
          ) : (
            <span className="font-medium text-right">{order.customer_name}</span>
          )}
        </div>
        {order.customer_phone && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#555]">Phone</span>
            {shouldBlurOrderDetails ? (
              <span className="blur-sm select-none font-mono">{blur(order.customer_phone)}</span>
            ) : (
              <a href={`tel:${order.customer_phone.replace(/[^0-9+]/g, "")}`} className="font-medium text-[#25D366] hover:underline flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {order.customer_phone}
              </a>
            )}
          </div>
        )}
        {order.table_number && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#555]">Table</span>
            {shouldBlurOrderDetails ? (
              <span className="blur-sm select-none font-mono">{blur(order.table_number)}</span>
            ) : (
              <span className="font-medium">{order.table_number}</span>
            )}
          </div>
        )}
        {order.delivery_address && (
          <div className="flex items-center justify-between text-sm gap-4">
            <span className="text-[#555] shrink-0">Address</span>
            {shouldBlurOrderDetails ? (
              <span className="blur-sm select-none font-mono text-right">{blur(order.delivery_address)}</span>
            ) : (
              <span className="font-medium text-right break-all">{order.delivery_address}</span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#555]">Payment</span>
          <span className="capitalize font-medium">{order.payment_method.replace("_", " ")}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#555]">Time</span>
          <span className="font-medium text-right text-xs">{new Date(order.created_at).toLocaleString("en-PK")}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#F0F0F0] p-4 sm:p-5 mb-4">
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
              <div key={item.dish_id} className="flex items-center justify-between py-2.5 text-sm border-b border-[#F0F0F0] last:border-0">
                <span className="text-[#555]">{item.name_en} <span className="text-[#999]">x{item.quantity}</span></span>
                <span className="font-medium shrink-0 ml-4">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 font-bold text-base">
              <span>Total</span>
              <span>{formatPrice(order.total_price)}</span>
            </div>
          </>
        )}
      </div>

      {/* Status Action Buttons */}
      {!shouldBlurOrderDetails && (
        <div className="mt-6 space-y-3">
          {/* Call customer - shown on any active status */}
          {order.order_status !== "completed" && order.order_status !== "cancelled" && order.customer_phone && (
            <a
              href={`tel:${order.customer_phone.replace(/[^0-9+]/g, "")}`}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-[#25D366] text-[#25D366] text-sm font-semibold hover:bg-[#25D366] hover:text-white transition-all active:scale-[0.98]"
            >
              <Phone className="w-4 h-4" />
              Call {order.customer_name} — {order.customer_phone}
            </a>
          )}

          {/* Status progression button */}
          {STATUS_ACTIONS[order.order_status] && (
            <button
              onClick={() => updateOrderStatus(STATUS_ACTIONS[order.order_status].next)}
              disabled={updating}
              className={`flex items-center justify-center gap-2 w-full h-12 rounded-xl text-white text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${STATUS_ACTIONS[order.order_status].color}`}
            >
              {updating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
              ) : (
                STATUS_ACTIONS[order.order_status].label
              )}
            </button>
          )}

          {/* Cancel button - only for active orders */}
          {(order.order_status === "received" || order.order_status === "preparing") && (
            <button
              onClick={() => setShowCancelDialog(true)}
              disabled={updating}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-[#DC2626] text-[#DC2626] text-sm font-semibold hover:bg-[#DC2626] hover:text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              Cancel Order
            </button>
          )}

          {/* Print/Download for any status except cancelled */}
          {order.order_status !== "cancelled" && (
            <div className="flex gap-2">
              <Button variant="primary" className="flex-1" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" /> Print
              </Button>
              <Button variant="ghost" className="flex-1" onClick={handleDownloadPNG}>
                <Download className="w-4 h-4 mr-2" /> Download PNG
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowCancelDialog(false)}>
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
              <X className="w-5 h-5 text-[#DC2626]" />
            </div>
            <h3 className="text-lg font-bold text-center mb-1">Cancel Order?</h3>
            <p className="text-sm text-[#555] text-center mb-5">
              Are you sure you want to cancel <strong>{order.order_number}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                disabled={updating}
                className="flex-1 h-11 rounded-xl bg-[#F5F5F5] text-[#555] text-sm font-semibold hover:bg-[#EBEBEB] transition-all disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={updating}
                className="flex-1 h-11 rounded-xl bg-[#DC2626] text-white text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {restaurant && !shouldBlurOrderDetails && (
        <div className="mt-6">
          <div ref={receiptRef}>
            <OrderReceipt order={order} restaurant={restaurant} />
          </div>
        </div>
      )}
    </div>
  )
}
