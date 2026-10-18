"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import Link from "next/link"
import { ChefHat, CheckCircle2, ArrowRight, Loader2, Clock, Receipt } from "lucide-react"
import type { Order } from "@/types"
import { ORDER_STATUS_META, type OrderStatus } from "@/lib/orderStatus"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { useToastStore } from "@/stores/toastStore"
import { DashboardFooter } from "@/components/shared/DashboardFooter"

// Pipeline columns for the kitchen board (active orders only)
const BOARD_COLUMNS: { status: OrderStatus; title: string; icon: typeof ChefHat; accent: string }[] = [
  { status: "received", title: "New", icon: Receipt, accent: "border-t-[#2563EB]" },
  { status: "preparing", title: "Preparing", icon: ChefHat, accent: "border-t-[#EA580C]" },
  { status: "ready", title: "Ready", icon: CheckCircle2, accent: "border-t-[#4F46E5]" },
]

const NEXT_ACTION: Record<OrderStatus, { next: OrderStatus; label: string; className: string } | null> = {
  received: { next: "preparing", label: "Start Preparing", className: "bg-[#25D366] hover:bg-[#1ba94a] text-white" },
  preparing: { next: "ready", label: "Mark Ready", className: "bg-[#2563EB] hover:bg-[#1d4ed8] text-white" },
  ready: { next: "completed", label: "Mark Completed", className: "bg-black hover:bg-[#1A1A1A] text-white" },
  completed: null,
  cancelled: null,
}

const orderTypeLabels: Record<string, string> = {
  dine_in: "Dine-in",
  takeaway: "Takeaway",
  delivery: "Delivery",
}

export default function PreparingBoardPage() {
  const sub = useSubscription()
  const { restaurant, shouldBlurOrderDetails } = sub
  const restaurantId = restaurant?.id ?? null
  const addToast = useToastStore((s) => s.addToast)

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  const getSupabase = () => {
    if (!supabaseRef.current) supabaseRef.current = createClient()
    return supabaseRef.current
  }

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return
    const supabase = getSupabase()
    setLoading(true)
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .in("order_status", ["received", "preparing", "ready"])
      .order("created_at", { ascending: true })
      .limit(200)
    setOrders((data as Order[]) || [])
    setLoading(false)
  }, [restaurantId])

  useEffect(() => {
    if (restaurantId) fetchOrders()
  }, [restaurantId, fetchOrders])

  useEffect(() => {
    if (!restaurantId) return
    const supabase = createClient()
    const channel = supabase
      .channel(uid(`preparing-board-${restaurantId}`))
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${restaurantId}` },
        (payload: any) => {
          const row = (payload.new ?? payload.old) as Order
          setOrders((prev) => {
            const active = ["received", "preparing", "ready"]
            if (active.includes(row.order_status)) {
              const exists = prev.some((o) => o.id === row.id)
              return exists
                ? prev.map((o) => (o.id === row.id ? row : o))
                : [row, ...prev].sort((a, b) => a.created_at.localeCompare(b.created_at))
            }
            // Order left the active pipeline (completed/cancelled) -> remove
            return prev.filter((o) => o.id !== row.id)
          })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [restaurantId])

  const updateStatus = async (id: string, next: OrderStatus) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: next }),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast({ type: "error", title: "Failed", message: data.error || "Could not update order", duration: 4000 })
        return
      }
      // Realtime handler will also update; optimistic local patch keeps it snappy
      setOrders((prev) => {
        const active = ["received", "preparing", "ready"]
        if (active.includes(next)) return prev.map((o) => (o.id === id ? data.order : o))
        return prev.filter((o) => o.id !== id)
      })
      addToast({ type: "success", title: "Updated", message: `Order ${next === "cancelled" ? "cancelled" : `marked as ${next}`}`, duration: 2500 })
    } catch {
      addToast({ type: "error", title: "Network Error", message: "Could not update order", duration: 4000 })
    } finally {
      setUpdatingId(null)
    }
  }

  const preparingCount = orders.filter((o) => o.order_status === "preparing").length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-black flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-[#EA580C]" />
            Kitchen Board
          </h1>
          <p className="text-sm text-[#999] mt-1">
            Live view of orders being prepared
            {preparingCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF7ED] text-[#EA580C] text-xs font-bold">
                {preparingCount} preparing
              </span>
            )}
          </p>
        </div>
        <Link
          href="/dashboard/orders"
          className="bg-white border border-[#E0E0E0] text-black px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold hover:bg-[#F5F5F5] transition-all active:scale-95"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span className="hidden sm:inline">All Orders</span>
        </Link>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-3">
          {[0, 1, 2].map((c) => (
            <div key={c} className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-[#F5F5F5] rounded-xl animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-3 items-start">
          {BOARD_COLUMNS.map((col) => {
            const colOrders = orders.filter((o) => o.order_status === col.status)
            const ColIcon = col.icon
            return (
              <div key={col.status} className="bg-[#F9FAFB] rounded-2xl border border-[#F0F0F0] border-t-4 overflow-hidden">
                <div className={`${col.accent} bg-white px-4 py-3 flex items-center justify-between border-b border-[#F0F0F0]`}>
                  <div className="flex items-center gap-2">
                    <ColIcon className="w-4 h-4 text-[#555]" />
                    <span className="text-sm font-bold text-black">{col.title}</span>
                  </div>
                  <span className="text-xs font-bold text-[#999] bg-[#F0F0F0] px-2 py-0.5 rounded-full">
                    {colOrders.length}
                  </span>
                </div>
                <div className="p-3 space-y-2 min-h-[120px]">
                  {colOrders.length === 0 ? (
                    <p className="text-xs text-[#BBB] text-center py-8">No orders</p>
                  ) : (
                    colOrders.map((order) => {
                      const action = NEXT_ACTION[order.order_status as OrderStatus]
                      const isUpdating = updatingId === order.id
                      return (
                        <div key={order.id} className="bg-white border border-[#F0F0F0] rounded-xl p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className="font-bold text-sm text-black">#{order.order_number}</span>
                              <span className="text-[10px] text-[#999] flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                {new Date(order.created_at).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-black shrink-0">
                              Rs {order.total_price.toLocaleString("en-PK")}
                            </span>
                          </div>
                          <p className="text-xs text-[#555] mt-1 truncate">
                            {shouldBlurOrderDetails ? "Locked" : `${order.customer_name} • ${orderTypeLabels[order.order_type] || order.order_type}`}
                          </p>
                          {!shouldBlurOrderDetails && (
                            <div className="mt-2 space-y-1">
                              {(order.items || []).slice(0, 4).map((item: any, i: number) => (
                                <p key={i} className="text-[11px] text-[#555] flex justify-between gap-2">
                                  <span className="truncate">{item.name_en}</span>
                                  <span className="text-[#999] shrink-0">x{item.quantity}</span>
                                </p>
                              ))}
                              {(order.items || []).length > 4 && (
                                <p className="text-[10px] text-[#999]">+{(order.items || []).length - 4} more</p>
                              )}
                            </div>
                          )}
                          {action && (
                            <button
                              onClick={() => updateStatus(order.id, action.next)}
                              disabled={isUpdating}
                              className={`mt-3 w-full h-10 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5 ${action.className}`}
                            >
                              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                              {action.label}
                            </button>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <DashboardFooter />
    </div>
  )
}
