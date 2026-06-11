"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Bell, X } from "lucide-react"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"

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

function playNotificationSound() {
  try {
    const ctx = new AudioContext()
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

  useEffect(() => {
    const supabase = createClient()

    const fetchInitial = async () => {
      const today = new Date().toISOString().split("T")[0]
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .gte("created_at", today)
        .eq("order_status", "received")
        .order("created_at", { ascending: false })
        .limit(20)

      const pending = (data || []).filter((o: any) => o.order_status === "received")
      setUnreadCount(pending.length)
    }

    fetchInitial()

    const channel = supabase
      .channel(`orders-${restaurantId}`)
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
          setTimeout(() => {
            setAlerts((prev) => prev.filter((a) => a.id !== order.id))
          }, 8000)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [restaurantId])

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="relative">
      <button onClick={() => setShowDropdown(!showDropdown)} className="relative">
        <Bell className="w-5 h-5 text-[#555]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#FF6B35] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Toast notifications */}
      {alerts.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 max-w-sm mx-auto pointer-events-none">
          {alerts.map((alert) => (
            <Link
              key={alert.id}
              href={`/dashboard/orders/${alert.id}`}
              className="pointer-events-auto bg-black text-white rounded-[14px] p-4 shadow-2xl animate-slide-up"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-pulse" />
                    <span className="text-sm font-semibold">New Order</span>
                  </div>
                  <p className="text-xs text-white/60">{alert.order_number}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium">{alert.customer_name}</p>
                    <p className="text-xs text-white/70">{alert.items.length} item{alert.items.length > 1 ? "s" : ""} • {alert.order_type.replace("_", " ")}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {alert.items.slice(0, 3).map((item, i) => (
                        <span key={i} className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">
                          {item.name_en} x{item.quantity}
                        </span>
                      ))}
                      {alert.items.length > 3 && (
                        <span className="text-[10px] text-white/40">+{alert.items.length - 3} more</span>
                      )}
                    </div>
                    <p className="text-sm font-bold mt-1">{formatPrice(alert.total_price)}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); dismissAlert(alert.id) }}
                  className="p-1 hover:bg-white/10 rounded-lg shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute top-full right-0 mt-2 z-50 w-72 bg-white border border-[#E8E8E8] rounded-[14px] shadow-xl overflow-hidden">
            <div className="p-3 border-b border-[#F0F0F0]">
              <p className="text-sm font-semibold">Notifications</p>
            </div>
            <Link
              href="/dashboard/orders"
              onClick={() => setShowDropdown(false)}
              className="block p-3 text-sm text-[#555] hover:bg-[#F8F8F8] transition-colors"
            >
              View all orders →
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
