"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatPrice, timeAgo } from "@/lib/utils"
import type { Order } from "@/types"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { Lock, Sparkles, ArrowRight, Receipt, ChevronRight, Clock, ClipboardList } from "lucide-react"
import { DashboardFooter } from "@/components/shared/DashboardFooter"

const statusStyles: Record<string, string> = {
  received: "bg-[#25D366]/10 text-[#25D366]",
  preparing: "bg-blue-100 text-blue-600",
  ready: "bg-purple-100 text-purple-600",
  completed: "bg-emerald-100 text-emerald-600",
  cancelled: "bg-gray-100 text-gray-500",
}

const orderTypeLabels: Record<string, string> = {
  dine_in: "Dine-in",
  takeaway: "Takeaway",
  delivery: "Delivery",
}

type StatusFilter = "all" | "received" | "preparing" | "ready" | "completed"

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "received", label: "Received" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
]

const PAGE_SIZE = 25

export default function OrdersPage() {
  const router = useRouter()
  const sub = useSubscription()
  const { shouldBlurOrderDetails } = sub
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<"today" | "week" | "all">("today")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    const supabase = createClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", user.id)
        .single()
      if (!restaurant) return

      setRestaurantId(restaurant.id)

      let query = supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false })

      const now = new Date()
      if (filter === "today") {
        const start = now.toISOString().split("T")[0]
        query = query.gte("created_at", start)
      } else if (filter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        query = query.gte("created_at", weekAgo)
      }

      const { data } = await query.limit(500)
      setOrders(data || [])
    } catch (err) {
      console.error("Orders fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    if (!restaurantId) return
    const supabase = createClient()
    const debounceRef = { current: null as ReturnType<typeof setTimeout> | null }

    const debouncedFetch = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => fetchOrders(), 500)
    }

    const channel = supabase
      .channel(uid(`orders-page-${restaurantId}`))
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          setOrders((prev) => [payload.new as Order, ...prev.slice(0, 499)])
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.new.id ? (payload.new as Order) : o))
          )
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "restaurants",
          filter: `id=eq.${restaurantId}`,
        },
        debouncedFetch
      )
      .subscribe()

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      supabase.removeChannel(channel)
    }
  }, [restaurantId, fetchOrders])

  const blur = (text: string) => "█".repeat(Math.max(4, Math.min(text?.length || 0, 14)))

  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter((o) => o.order_status === statusFilter)

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE)
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, filter])

  const clearFilters = () => {
    setStatusFilter("all")
    setFilter("today")
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Trial Lock Banner */}
      {shouldBlurOrderDetails && (
        <section className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4 text-white">
            <div className="bg-white/20 p-2 rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm md:text-base">Order details locked - You have reached your trial limit</p>
              <p className="text-xs md:text-sm opacity-90">Upgrade your plan to see customer info and order details.</p>
            </div>
          </div>
          <Link
            href="/dashboard/subscription"
            className="bg-amber-100 text-amber-900 px-6 py-2.5 rounded-lg font-bold hover:bg-white transition-colors flex items-center gap-2 whitespace-nowrap text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade to Unlock
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      )}

      {/* Heading & Time Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-black">Orders</h1>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {(["today", "week", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filter === f
                  ? "bg-black text-white"
                  : "bg-[#F0F0F0] text-[#555] hover:bg-[#E2E2E2]"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === opt.value
                ? "bg-black text-white"
                : "bg-[#F0F0F0] text-[#555] hover:bg-[#E2E2E2]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-[#F5F5F5] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : paginatedOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 bg-[#F0F0F0] rounded-2xl flex items-center justify-center">
            <ClipboardList className="w-8 h-8 text-[#999]" />
          </div>
          <p className="text-sm text-[#555] text-center">No orders found for this filter</p>
          <button
            onClick={clearFilters}
            className="text-sm text-[#25D366] font-semibold hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {paginatedOrders.map((order) => {
              const isLocked = shouldBlurOrderDetails
              return (
                <div
                  key={order.id}
                  className="bg-white border border-[#F0F0F0] rounded-xl p-4 hover:shadow-[0px_4px_20px_rgba(0,0,0,0.05)] transition-all active:scale-[0.995]"
                >
                  <div className="flex items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-[#F9FAFB] flex items-center justify-center rounded-lg border border-[#F0F0F0] text-[#555] shrink-0">
                        {isLocked ? <Lock className="w-5 h-5 opacity-50" /> : <Receipt className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-black">
                            {isLocked ? (
                              <span className="blur-sm select-none">{order.order_number}</span>
                            ) : (
                              <Link href={`/dashboard/orders/${order.id}`} className="hover:underline">
                                #{order.order_number}
                              </Link>
                            )}
                          </span>
                          <span className="text-sm text-[#555]">&bull;</span>
                          <span className="text-xs text-[#999] flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {timeAgo(order.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {isLocked ? (
                            <>
                              <span className="font-mono text-sm tracking-tighter opacity-20 select-none">{blur(order.customer_name)}</span>
                              <span className="text-xs px-2 py-0.5 bg-[#E1E3E4]/50 rounded-full text-transparent select-none blur-[2px]">{blur("dine_in")}</span>
                            </>
                          ) : (
                            <>
                              <Link href={`/dashboard/orders/${order.id}`} className="font-medium text-sm text-black hover:underline">
                                {order.customer_name}
                              </Link>
                              <span className="text-xs px-2 py-0.5 bg-[#E1E3E4] rounded-full text-[#555]">
                                {orderTypeLabels[order.order_type] || order.order_type.replace("_", " ")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-sm md:text-base text-black">
                          {isLocked ? (
                            <span className="blur-sm select-none">PKR {formatPrice(order.total_price)}</span>
                          ) : (
                            `PKR ${formatPrice(order.total_price)}`
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${statusStyles[order.order_status] || "bg-gray-100 text-gray-500"}`}>
                          {order.order_status}
                        </span>
                        {isLocked ? (
                          <div className="p-2 text-[#555] cursor-not-allowed">
                            <Lock className="w-[18px] h-[18px]" />
                          </div>
                        ) : (
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            className="p-2 hover:bg-[#F9FAFB] rounded-full transition-colors text-[#555]"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#999]">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} of {filteredOrders.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold border border-[#F0F0F0] text-[#555] hover:bg-[#F0F0F0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs text-[#555] font-medium">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold bg-black text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <DashboardFooter />
    </div>
  )
}
