"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { Bell, X, ChevronRight, Clock, Megaphone, BellRing } from "lucide-react"
import Link from "next/link"
import { formatPrice, timeAgo } from "@/lib/utils"

interface Props {
  restaurantId: string
}

interface OrderAlert {
  id: string
  order_number: string
  customer_name: string
  total_price: number
  items: { name_en: string; quantity: number }[]
  order_type: string
}

interface TodayOrder {
  id: string
  order_number: string
  customer_name: string
  total_price: number
  order_type: string
  created_at: string
  items: { name_en: string; quantity: number }[]
}

interface AnnouncementAlert {
  id: string
  title: string
  body: string
  created_at: string
}

let audioCtx: AudioContext | null = null

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume()
  }
  return audioCtx
}

function playNotificationSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = "sine"
    osc1.frequency.setValueAtTime(880, now)
    osc1.frequency.setValueAtTime(1320, now + 0.1)
    gain1.gain.setValueAtTime(0.3, now)
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
    osc1.connect(gain1).connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.3)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = "sine"
    osc2.frequency.setValueAtTime(1100, now + 0.15)
    osc2.frequency.setValueAtTime(1540, now + 0.25)
    gain2.gain.setValueAtTime(0.25, now + 0.15)
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
    osc2.connect(gain2).connect(ctx.destination)
    osc2.start(now + 0.15)
    osc2.stop(now + 0.5)
  } catch {}
}

export function BellNotification({ restaurantId }: Props) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [alerts, setAlerts] = useState<OrderAlert[]>([])
  const [todayOrders, setTodayOrders] = useState<TodayOrder[]>([])
  const [dropdownLoading, setDropdownLoading] = useState(false)
  const [announcementQueue, setAnnouncementQueue] = useState<AnnouncementAlert[]>([])
  const [announcementModal, setAnnouncementModal] = useState<AnnouncementAlert | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const dismissAnnouncement = useCallback(() => {
    setAnnouncementModal((current) => {
      if (!current) return null
      setAnnouncementQueue((prev) => {
        const remaining = prev.filter((a) => a.id !== current.id)
        if (remaining.length > 0) {
          const next = remaining[0]
          setTimeout(() => setAnnouncementModal(next), 100)
        }
        return remaining
      })
      return null
    })
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const fetchInitial = async () => {
      const today = new Date().toISOString().split("T")[0]
      const [ordersRes, announcementsRes] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .gte("created_at", today)
          .eq("order_status", "received")
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("owner_notifications")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", restaurantId)
          .eq("type", "announcement")
          .eq("is_read", false),
      ])

      const pending = (ordersRes.data || []).filter((o: any) => o.order_status === "received")
      const announcementCount = announcementsRes.count ?? 0
      setUnreadCount(pending.length + announcementCount)
    }

    fetchInitial()

    const channel = supabase
      .channel(uid(`orders-${restaurantId}`))
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          const order = payload.new as any
          playNotificationSound()
          setUnreadCount((prev) => prev + 1)
          setAlerts((prev) =>
            [{
              id: order.id,
              order_number: order.order_number,
              customer_name: order.customer_name,
              total_price: order.total_price,
              items: (order.items || []).map((i: any) => ({
                name_en: i.name_en,
                quantity: i.quantity,
              })),
              order_type: order.order_type,
            } as OrderAlert, ...prev].slice(0, 5)
          )
        }
      )
      .subscribe()

    const announcementChannel = supabase
      .channel(uid(`owner-announcements-${restaurantId}`))
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "owner_notifications",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          const n = payload.new as any
          if (n.type === "announcement") {
            playNotificationSound()
            const alert: AnnouncementAlert = {
              id: n.id,
              title: n.title,
              body: n.body,
              created_at: n.created_at,
            }
            setAnnouncementQueue((prev) => [...prev, alert])
            setUnreadCount((prev) => prev + 1)
            setAnnouncementModal((current) => {
              if (!current) return alert
              return current
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(announcementChannel)
    }
  }, [restaurantId])

  const fetchTodayOrders = useCallback(async () => {
    setDropdownLoading(true)
    const supabase = createClient()
    const today = new Date().toISOString().split("T")[0]

    const { data } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, total_price, order_type, created_at, items")
      .eq("restaurant_id", restaurantId)
      .gte("created_at", today)
      .order("created_at", { ascending: false })
      .limit(20)

    setTodayOrders(data || [])
    setDropdownLoading(false)
  }, [restaurantId])

  const handleToggleDropdown = () => {
    const next = !showDropdown
    setShowDropdown(next)
    if (next) fetchTodayOrders()
  }

  useEffect(() => {
    if (!showDropdown) return
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showDropdown])

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <>
      {/* Bell Icon */}
      <div className="relative" ref={dropdownRef}>
        <button onClick={handleToggleDropdown} className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F0F0F0] transition-colors">
          <Bell className="w-5 h-5 text-[#555]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#25D366] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Toast notifications for orders - top right corner */}
        {alerts.length > 0 && (
          <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-[60] flex flex-col gap-3 sm:w-[340px] pointer-events-none">
            {alerts.map((alert) => (
              <Link
                key={alert.id}
                href={`/dashboard/orders/${alert.id}`}
                className="bg-black text-white rounded-2xl p-4 shadow-2xl animate-slide-up pointer-events-auto block"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse shrink-0" />
                      <span className="text-sm font-bold">New Order</span>
                    </div>
                    <p className="text-[11px] text-white/50 mb-1.5">{alert.order_number}</p>
                    <p className="text-sm font-medium truncate">{alert.customer_name}</p>
                    <p className="text-xs text-white/60 mt-0.5">{alert.items.length} item{alert.items.length > 1 ? "s" : ""} &bull; {alert.order_type.replace("_", " ")}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {alert.items.slice(0, 3).map((item, i) => (
                        <span key={i} className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">
                          {item.name_en} x{item.quantity}
                        </span>
                      ))}
                      {alert.items.length > 3 && (
                        <span className="text-[10px] text-white/40">+{alert.items.length - 3} more</span>
                      )}
                    </div>
                    <p className="text-sm font-bold mt-2">{formatPrice(alert.total_price)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); dismissAlert(alert.id) }}
                    className="p-1.5 hover:bg-white/10 rounded-lg shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown - Today's Orders */}
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="fixed top-14 right-4 sm:absolute sm:top-full sm:right-0 sm:mt-2 z-50 w-80 max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-[#F0F0F0] flex flex-col overflow-hidden animate-scale-up">
            <div className="p-4 border-b border-[#F0F0F0] flex items-center justify-between shrink-0">
              <p className="text-sm font-bold">Today&apos;s Orders</p>
              <button
                onClick={() => setShowDropdown(false)}
                className="p-1.5 hover:bg-[#F0F0F0] rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-[#555]" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {dropdownLoading ? (
                <div className="flex flex-col gap-2 p-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-[#F5F5F5] rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : todayOrders.length === 0 ? (
                <div className="text-center py-10 text-sm text-[#999]">
                  No orders today
                </div>
              ) : (
                <div className="divide-y divide-[#F0F0F0]">
                  {todayOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/dashboard/orders/${order.id}`}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center justify-between p-4 hover:bg-[#F9FAFB] active:bg-[#F0F0F0] transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-black">
                            #{order.order_number}
                          </span>
                          <span className="text-[10px] text-[#999] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(order.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-[#555] mt-0.5">
                          {order.customer_name} &bull; {order.order_type.replace("_", " ")}
                        </p>
                        <p className="text-xs text-[#999]">
                          {(order.items || []).length} item{(order.items || []).length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="text-sm font-bold text-black">{formatPrice(order.total_price)}</span>
                        <ChevronRight className="w-4 h-4 text-[#999]" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Announcement Center Modal */}
      {announcementModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={dismissAnnouncement} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-up" style={{ maxHeight: "calc(100vh - 32px)", overflowY: "auto" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5 text-[#25D366]" />
              </div>
              <div>
                <h3 className="font-bold text-black text-sm">New Announcement</h3>
                <p className="text-[10px] text-[#999]">
                  {new Date(announcementModal.created_at).toLocaleDateString("en-PK", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
              <button
                onClick={dismissAnnouncement}
                className="ml-auto p-2 hover:bg-[#F0F0F0] rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="w-4 h-4 text-[#555]" />
              </button>
            </div>
            {announcementQueue.length > 1 && (
              <div className="flex items-center gap-1.5 mb-3">
                {announcementQueue.map((a, i) => (
                  <div
                    key={a.id}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i === 0 ? "bg-[#25D366]" : "bg-[#F0F0F0]"
                    }`}
                  />
                ))}
              </div>
            )}
            <h4 className="text-base font-bold text-black mb-2">{announcementModal.title}</h4>
            <p className="text-sm text-[#555] leading-relaxed whitespace-pre-wrap">{announcementModal.body}</p>
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={dismissAnnouncement}
                className="flex-1 h-12 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 transition-opacity min-h-[44px]"
              >
                {announcementQueue.length > 1
                  ? `Next (${announcementQueue.length - 1} remaining)`
                  : "Got it"}
              </button>
              <Link
                href="/dashboard/announcements"
                onClick={dismissAnnouncement}
                className="shrink-0 h-12 px-4 rounded-xl border border-[#F0F0F0] text-sm font-medium text-[#555] hover:bg-[#F0F0F0] transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <BellRing className="w-4 h-4" />
                All
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
