"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { timeAgo } from "@/lib/utils"
import type { Order } from "@/types"
import { ORDER_STATUS_META, ORDER_STATUS_TABS, type OrderStatus } from "@/lib/orderStatus"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { Lock, Sparkles, ArrowRight, Receipt, ChevronRight, Clock, ClipboardList, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { DashboardFooter } from "@/components/shared/DashboardFooter"

function getStartOfTodayPK() {
  const pkOffset = 5 * 60 * 60 * 1000
  const nowPK = new Date(Date.now() + pkOffset)
  const startPK = new Date(nowPK.getFullYear(), nowPK.getMonth(), nowPK.getDate())
  return new Date(startPK.getTime() - pkOffset).toISOString()
}

const orderTypeLabels: Record<string, string> = {
  dine_in: "Dine-in",
  takeaway: "Takeaway",
  delivery: "Delivery",
}

const PAGE_SIZE = 25

export default function OrdersPage() {
  const router = useRouter()
  const sub = useSubscription()
  const { shouldBlurOrderDetails } = sub
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<"all" | "today" | "week" | "month">("today")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all")
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set())
  const [realtimeConnected, setRealtimeConnected] = useState(true)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  const lastRealtimeRef = useRef<number>(Date.now())
  const getSupabase = () => {
    if (!supabaseRef.current) supabaseRef.current = createClient()
    return supabaseRef.current
  }

  const fetchOrders = useCallback(async () => {
    const supabase = getSupabase()
    setError(null)
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("Session expired. Please sign in again.")
        setLoading(false)
        return
      }

      let { data: restaurant } = restaurantId
        ? { data: { id: restaurantId } }
        : await supabase.from("restaurants").select("id").eq("owner_id", user.id).single()

      if (!restaurant) {
        setLoading(false)
        return
      }

      if (!restaurantId) setRestaurantId(restaurant.id)

      let query = supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false })
        .limit(500)

      if (filter === "today") {
        query = query.gte("created_at", getStartOfTodayPK())
      } else if (filter === "week") {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        query = query.gte("created_at", weekAgo)
      } else if (filter === "month") {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        query = query.gte("created_at", monthAgo)
      }

      const { data } = await query
      setOrders(data || [])
      setLastUpdated(new Date().toLocaleTimeString("en-PK"))
    } catch (err) {
      console.error("Orders fetch error:", err)
      setError("Failed to load orders. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [filter, restaurantId])

  const fetchOrdersRef = useRef(fetchOrders)
  fetchOrdersRef.current = fetchOrders

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Realtime subscriptions with connection monitoring
  useEffect(() => {
    if (!restaurantId) return
    const supabase = createClient()

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
          lastRealtimeRef.current = Date.now()
          setRealtimeConnected(true)
          const newOrder = payload.new as Order
          setOrders((prev) => [newOrder, ...prev.slice(0, 499)])
          // Visually highlight freshly arrived orders for ~6s
          if (newOrder.order_status === "received") {
            setNewOrderIds((prev) => new Set(prev).add(newOrder.id))
            setTimeout(() => {
              setNewOrderIds((prev) => {
                const next = new Set(prev)
                next.delete(newOrder.id)
                return next
              })
            }, 6000)
          }
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
          lastRealtimeRef.current = Date.now()
          setRealtimeConnected(true)
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
        () => fetchOrdersRef.current()
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          lastRealtimeRef.current = Date.now()
          setRealtimeConnected(true)
        }
      })

    // Monitor connection — if no realtime event for 60s, show warning
    const connectionMonitor = setInterval(() => {
      const elapsed = Date.now() - lastRealtimeRef.current
      setRealtimeConnected(elapsed < 90000)
    }, 10000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(connectionMonitor)
    }
  }, [restaurantId])

  const blur = (text: string) => "█".repeat(Math.max(4, Math.min(text?.length || 0, 14)))

  // Status filter (client-side) applied on top of the server-side date filter
  const statusFiltered =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.order_status === statusFilter)

  // Client-side search by order number
  const searchedOrders = searchQuery.trim()
    ? statusFiltered.filter((o) => String(o.order_number).includes(searchQuery.trim()))
    : statusFiltered

  const totalPages = Math.ceil(searchedOrders.length / PAGE_SIZE)
  const paginatedOrders = searchedOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    setCurrentPage(1)
    setSearchQuery("")
  }, [filter, statusFilter])

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

      {/* Heading & Order Count + Time Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-black">Orders</h1>
            {/* Connection indicator */}
            {realtimeConnected ? (
              <Wifi className="w-3.5 h-3.5 text-[#25D366]" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-[#DC2626]" />
            )}
          </div>
          <p className="text-sm text-[#999] mt-1">
            {searchQuery.trim()
              ? `${searchedOrders.length} of ${orders.length} order${orders.length !== 1 ? "s" : ""}`
              : `${orders.length} order${orders.length !== 1 ? "s" : ""}`
            }
            {lastUpdated && <span className="text-xs text-[#BBB] ml-2">Updated {lastUpdated}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["today", "week", "month", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filter === f
                  ? "bg-black text-white"
                  : "bg-[#F0F0F0] text-[#555] hover:bg-[#E2E2E2]"
              }`}
            >
              {f === "month" ? "Last Month" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <button
            onClick={() => { setLoading(true); fetchOrders() }}
            disabled={loading}
            className="p-1.5 rounded-full bg-[#F0F0F0] text-[#555] hover:bg-[#E2E2E2] transition-colors disabled:opacity-40"
            title="Refresh orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Search by Order Number */}
      <div className="relative">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            type="text"
            placeholder="Search by order number..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
            className="w-full h-10 pl-9 pr-9 rounded-xl border border-[#E0E0E0] bg-white text-sm text-black placeholder:text-[#BBB] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setCurrentPage(1) }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#F0F0F0] flex items-center justify-center hover:bg-[#E0E0E0] transition-colors"
            >
              <svg className="w-3 h-3 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>



      {/* Status filter tabs with live counts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {ORDER_STATUS_TABS.map((tab) => {
          const count =
            tab.key === "all"
              ? orders.length
              : orders.filter((o) => o.order_status === tab.key).length
          const active = statusFilter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors shrink-0 ${
                active
                  ? "bg-black text-white"
                  : "bg-[#F0F0F0] text-[#555] hover:bg-[#E2E2E2]"
              }`}
            >
              {tab.label}
              <span
                className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  active ? "bg-white/20 text-white" : "bg-white text-[#999]"
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

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
          <p className="text-sm text-[#555] text-center">
            {searchQuery.trim() ? "No orders match your search" : "No orders found"}
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {paginatedOrders.map((order) => {
              const isLocked = shouldBlurOrderDetails
              const meta = ORDER_STATUS_META[order.order_status as OrderStatus]
              const isNew = newOrderIds.has(order.id)
              return (
                <Link
                  key={order.id}
                  href={isLocked ? "#" : `/dashboard/orders/${order.id}`}
                  className={`bg-white border rounded-xl p-4 hover:shadow-[0px_4px_20px_rgba(0,0,0,0.05)] transition-all active:scale-[0.995] block ${
                    isNew ? "border-[#25D366] ring-2 ring-[#25D366]/30" : "border-[#F0F0F0]"
                  } ${isLocked ? "cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 bg-[#F9FAFB] flex items-center justify-center rounded-xl border border-[#F0F0F0] text-[#555] shrink-0">
                        {isLocked ? <Lock className="w-4 h-4 opacity-50" /> : <Receipt className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-black truncate">
                            {isLocked ? (
                              <span className="blur-sm select-none">{order.order_number}</span>
                            ) : (
                              `#${order.order_number}`
                            )}
                          </span>
                          {!isLocked && meta && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} ${order.order_status === "received" ? "animate-pulse" : ""}`} />
                              {meta.label}
                            </span>
                          )}
                          <span className="text-[10px] text-[#999] flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" />
                            {timeAgo(order.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {isLocked ? (
                            <span className="font-mono text-xs tracking-tighter opacity-20 select-none blur-[2px]">{blur(order.customer_name)}</span>
                          ) : (
                            <span className="text-xs text-[#555] truncate">
                              {order.customer_name} &bull; {orderTypeLabels[order.order_type] || order.order_type.replace("_", " ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="font-bold text-sm text-black whitespace-nowrap">
                        {isLocked ? (
                          <span className="blur-sm select-none">Rs XXX</span>
                        ) : (
                          `Rs ${order.total_price.toLocaleString("en-PK")}`
                        )}
                      </span>
                      {!isLocked && (
                        <ChevronRight className="w-4 h-4 text-[#999]" />
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#999]">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, searchedOrders.length)} of {searchedOrders.length}
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
