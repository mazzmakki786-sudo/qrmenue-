"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OrderReceipt } from "@/components/shared/OrderReceipt"
import { formatPrice } from "@/lib/utils"
import { ArrowLeft, Check, Printer, X, Lock, Sparkles, ArrowRight, Download, Phone } from "lucide-react"
import Link from "next/link"
import type { Order } from "@/types"
import { useSubscription } from "@/lib/hooks/useSubscription"

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const sub = useSubscription()
  const { shouldBlurOrderDetails, orderCount, planLimits } = sub
  const [order, setOrder] = useState<Order | null>(null)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" })
  const receiptRef = useRef<HTMLDivElement>(null)

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
    if (updating) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: newStatus }),
      })
      if (!res.ok) {
        const err = await res.json()
        console.error("Failed to update order status:", err.error)
        setToast({ show: true, message: `Failed: ${err.error || "Something went wrong"}`, type: "error" })
        setUpdating(false)
        return
      }
      await fetchData()
      setToast({ show: true, message: newStatus === "ready" ? "Order confirmed successfully" : "Order cancelled", type: "success" })
    } catch (e) {
      console.error("Failed to update order status:", e)
      setToast({ show: true, message: "Network error — please try again", type: "error" })
    } finally {
      setUpdating(false)
    }
  }

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

  if (loading) return <div className="text-center text-[#999] py-12">Loading order...</div>
  if (!order) return <div className="text-center text-[#DC2626] py-12">Order not found</div>

  const blur = (text: string) => "█".repeat(Math.max(4, Math.min(text?.length || 0, 14)))

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {toast.show && (
        <div className={`fixed top-4 left-4 right-4 z-50 max-w-md mx-auto p-4 rounded-xl text-sm font-semibold shadow-lg animate-slide-up ${toast.type === "success" ? "bg-black text-white" : "bg-[#DC2626] text-white"}`}>
          <div className="flex items-center justify-between gap-3">
            <span>{toast.message}</span>
            <button onClick={() => setToast({ ...toast, show: false })} className="p-1 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/orders" className="p-2 -ml-2 hover:bg-[#F0F0F0] rounded-lg transition-colors">
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

      {order.order_status === "received" && (
        <div className="space-y-3 mt-6">
          {order.customer_phone && !shouldBlurOrderDetails && (
            <a
              href={`tel:${order.customer_phone.replace(/[^0-9+]/g, "")}`}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-[#25D366] text-[#25D366] text-sm font-semibold hover:bg-[#25D366] hover:text-white transition-all active:scale-[0.98]"
            >
              <Phone className="w-4 h-4" />
              Call {order.customer_name} — {order.customer_phone}
            </a>
          )}
          <Button variant="primary" fullWidth disabled={updating} onClick={() => updateStatus("ready")}>
            {updating ? "Updating..." : <><Check className="w-4 h-4 mr-2" /> Confirm Order</>}
          </Button>
          <Button variant="ghost" fullWidth disabled={updating} onClick={() => updateStatus("cancelled")}>
            <X className="w-4 h-4 mr-2" /> Cancel Order
          </Button>
        </div>
      )}

      {order.order_status === "ready" && !shouldBlurOrderDetails && (
        <div className="mt-6 space-y-3">
          <div className="flex gap-2">
            <Button variant="primary" className="flex-1" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
            <Button variant="ghost" className="flex-1" onClick={handleDownloadPNG}>
              <Download className="w-4 h-4 mr-2" /> Download PNG
            </Button>
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
