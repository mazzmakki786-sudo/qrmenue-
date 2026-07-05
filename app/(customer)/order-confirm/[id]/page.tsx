"use client"

import { useEffect, useState, use } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Check, ArrowLeft, ClipboardList, Store, ExternalLink, Phone, RotateCcw, X, Clock, MessageCircle } from "lucide-react"
import { useCartStore } from "@/stores/cartStore"
import { buildWhatsAppURL } from "@/lib/whatsapp"
import { formatPrice } from "@/lib/utils"

export default function OrderConfirmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [whatsappSuccess, setWhatsappSuccess] = useState(false)
  const clearCart = useCartStore((s) => s.clearCart)
  const setRestaurant = useCartStore((s) => s.setRestaurant)

  useEffect(() => {
    const fetchOrder = async () => {
      setError(null)
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        const { data, error: fetchError } = await supabase
          .from("orders")
          .select("*, restaurants(*)")
          .eq("id", id)
          .single()

        if (fetchError) throw new Error(fetchError.message)

        if (!data) {
          router.replace("/restaurants")
          return
        }

        if (user && data.customer_id && data.customer_id !== user.id) {
          setError("You do not have permission to view this order.")
          setLoading(false)
          return
        }

        setOrder(data)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order.")
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id, router])

  useEffect(() => {
    if (!id) return
    const supabase = createClient()
    const channel = supabase
      .channel(uid(`order-tracking-${id}`))
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const newStatus = (payload.new as any).order_status
          setOrder((prev: any) => prev ? { ...prev, ...payload.new } : prev)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id])

  const handleReorder = () => {
    if (!order) return
    clearCart()
    const restaurant = order.restaurants
    if (restaurant) {
      setRestaurant(restaurant.id, restaurant.name, restaurant.slug, restaurant.delivery_fee ?? 0)
      router.push(`/menu/${restaurant.slug}`)
    } else {
      router.push("/restaurants")
    }
  }

  // Auto-send to WhatsApp on order confirmation
  useEffect(() => {
    if (!order) return
    const url = buildWhatsAppURL({
      orderNumber: order.order_number,
      items: order.items || [],
      totalPrice: order.total_price,
      paymentMethod: order.payment_method,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      orderType: order.order_type,
      tableNumber: order.table_number,
      deliveryAddress: order.delivery_address,
      restaurantPhone: order.restaurants?.phone || "",
    })
    if (!url) return
    if (!whatsappSuccess) {
      const timer = setTimeout(() => {
        window.open(url, "_blank")
        setWhatsappSuccess(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [order, whatsappSuccess])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <p className="text-sm text-text-muted">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center">
          <X className="w-6 h-6 text-error" />
        </div>
        <p className="text-sm text-red-700 text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm font-semibold text-accent hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!order) return null

  const whatsappUrl = buildWhatsAppURL({
    orderNumber: order.order_number,
    items: order.items || [],
    totalPrice: order.total_price,
    paymentMethod: order.payment_method,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    orderType: order.order_type,
    tableNumber: order.table_number,
    deliveryAddress: order.delivery_address,
    restaurantPhone: order.restaurants?.phone || "",
  })
  const restaurant = order.restaurants
  const restaurantPhone = restaurant?.phone?.replace(/[^0-9+]/g, "")

  const isReady = order.order_status === "ready"
  const isCancelled = order.order_status === "cancelled"
  const isPending = order.order_status === "received"

  return (
    <>
    <div className="min-h-screen bg-[#F9FAFB] pb-20 md:hidden">

      {/* Top AppBar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-border">
        <div className="flex items-center justify-between px-4 h-16 max-w-[500px] mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href={user ? "/account" : "/restaurants"}
              className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center active:scale-95 transition-transform shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-lg font-bold text-text-primary">
              {isReady ? "Order Ready" : isCancelled ? "Order Cancelled" : "Order Placed"}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-[500px] mx-auto px-4 py-6 space-y-6">

        {/* Status Card */}
        {isReady && (
          <section className="bg-accent/5 border border-accent/10 rounded-2xl p-6 text-center shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-white" style={{ strokeWidth: 3 }} />
              </div>
            </div>
            <h2 className="text-lg font-bold text-accent mb-1">Order Ready!</h2>
            <p className="text-sm font-semibold text-accent mb-3">#{order.order_number}</p>
            <p className="text-sm text-text-secondary px-4">
              Your order from <span className="font-semibold text-text-primary">{restaurant?.name || "the restaurant"}</span> is ready for pickup
            </p>
          </section>
        )}

        {isCancelled && (
          <section className="bg-error/5 border border-error/10 rounded-2xl p-6 text-center shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-error rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-white" style={{ strokeWidth: 3 }} />
              </div>
            </div>
            <h2 className="text-lg font-bold text-error mb-1">Order Cancelled</h2>
            <p className="text-sm font-semibold text-error mb-3">#{order.order_number}</p>
            <p className="text-sm text-text-secondary px-4">
              Your order from <span className="font-semibold text-text-primary">{restaurant?.name || "the restaurant"}</span> has been cancelled
            </p>
          </section>
        )}

        {isPending && (
          <section className="bg-warning/5 border border-warning/10 rounded-2xl p-6 text-center shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-warning rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" style={{ strokeWidth: 3 }} />
              </div>
            </div>
            <h2 className="text-lg font-bold text-warning mb-1">Order Placed!</h2>
            <p className="text-sm font-semibold text-warning mb-3">#{order.order_number}</p>
            <p className="text-sm text-text-secondary px-4">
              Waiting for <span className="font-semibold text-text-primary">{restaurant?.name || "the restaurant"}</span> to confirm your order
            </p>
          </section>
        )}

        {/* WhatsApp + Call Buttons - Side by Side with stable alignment */}
        {(whatsappUrl || restaurantPhone) && (
          <div className="flex gap-2.5">
            {whatsappUrl && (
              <div className="flex-1 min-w-0">
                <div className="h-[28px]">
                  {whatsappSuccess && (
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-accent" style={{ strokeWidth: 3 }} />
                      <span className="text-[11px] text-text-secondary">Opened</span>
                      <button
                        onClick={() => { window.open(whatsappUrl, "_blank") }}
                        className="text-[11px] text-accent font-semibold ml-auto"
                      >
                        Resend
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => { window.open(whatsappUrl, "_blank"); setWhatsappSuccess(true) }}
                  className="w-full bg-accent text-white text-[12px] font-bold h-11 rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Send on WhatsApp
                </button>
              </div>
            )}
            {restaurantPhone && (
              <div className="shrink-0">
                <div className="h-[28px]" />
                <a
                  href={`tel:${restaurantPhone}`}
                  className="flex items-center justify-center gap-1.5 h-11 min-w-[88px] px-4 rounded-xl border border-border text-[12px] font-semibold text-text-primary active:scale-[0.95] transition-all hover:bg-[#FAFAFA]"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call
                </a>
              </div>
            )}
          </div>
        )}

        {/* Order Summary */}
        <section className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </span>
            <h3 className="text-lg font-bold text-text-primary">Order Summary</h3>
          </div>

          <div className="space-y-4 mb-6">
            {(order.items || []).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-text-primary">
                  {item.name_en} <span className="text-text-secondary">x{item.quantity}</span>
                </span>
                <span className="text-sm text-text-primary">Rs. {item.subtotal}</span>
              </div>
            ))}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-lg font-bold text-text-primary">Total</span>
              <span className="text-lg font-bold text-text-primary">Rs. {order.total_price}</span>
            </div>
          </div>

          <div className="bg-[#F5F5F5] rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Customer</span>
              <span className="font-semibold text-text-primary">{order.customer_name}</span>
            </div>
            {order.customer_phone && (
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Phone</span>
                <span className="font-semibold text-text-primary">{order.customer_phone}</span>
              </div>
            )}
            {order.table_number && (
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Table</span>
                <span className="font-semibold text-text-primary">Table {order.table_number}</span>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Type</span>
              <span className="font-semibold text-text-primary capitalize">{order.order_type?.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Payment</span>
              <span className="font-semibold text-text-primary capitalize">{order.payment_method === "cod" ? "Cash" : "Bank Transfer"}</span>
            </div>
          </div>
        </section>

        {/* Sign-in Prompt */}
        {!user && (
          <section className="bg-white border border-border rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F5F5F5] rounded-lg flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-text-primary">Track your order</span>
            </div>
            <Link
              href={`/login?redirect=/order-confirm/${order.id}`}
              className="text-sm font-bold text-accent hover:underline"
            >
              Sign in
            </Link>
          </section>
        )}

        {/* Bottom Actions */}
        <div className="space-y-3 pt-4">
          <button
            onClick={handleReorder}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-white font-semibold bg-primary active:scale-[0.98] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reorder
          </button>
          {user && (
            <Link
              href="/account"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-text-secondary font-semibold border border-border hover:bg-[#FAFAFA] transition-colors"
            >
              <ClipboardList className="w-4 h-4" />
              View my orders
            </Link>
          )}
          <Link
            href="/restaurants"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-text-secondary font-semibold border border-border hover:bg-[#FAFAFA] transition-colors"
          >
            <Store className="w-4 h-4" />
            Browse more restaurants
          </Link>
        </div>
      </main>
    </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden md:block min-h-screen bg-[#F8F8F8]">
        <header className="bg-white border-b border-border sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-8 h-16 flex items-center gap-3">
            <Link href={user ? "/account" : "/restaurants"} className="w-9 h-9 rounded-xl bg-[#F5F5F5] flex items-center justify-center active:scale-95 transition-all hover:bg-[#EFEFEF] shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-lg font-bold text-text-primary">
              {isReady ? "Order Ready" : isCancelled ? "Order Cancelled" : "Order Confirmed"}
            </h1>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-8 py-10 space-y-6">
          {/* Status Card */}
          {isReady && (
            <section className="bg-accent/5 border border-accent/15 rounded-2xl p-10 text-center">
              <div className="flex justify-center mb-5">
                <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(37,211,102,0.3)]">
                  <Check className="w-10 h-10 text-white" style={{ strokeWidth: 3 }} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-accent mb-1">Order Ready!</h2>
              <p className="text-base font-semibold text-accent/70 mb-4">#{order.order_number}</p>
              <p className="text-[14px] text-text-secondary">Your order from <span className="font-semibold text-text-primary">{restaurant?.name || "the restaurant"}</span> is ready for pickup</p>
            </section>
          )}

          {isCancelled && (
            <section className="bg-error/5 border border-error/15 rounded-2xl p-10 text-center">
              <div className="flex justify-center mb-5">
                <div className="w-20 h-20 bg-error rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(239,68,68,0.3)]">
                  <X className="w-10 h-10 text-white" style={{ strokeWidth: 3 }} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-error mb-1">Order Cancelled</h2>
              <p className="text-base font-semibold text-error/70 mb-4">#{order.order_number}</p>
              <p className="text-[14px] text-text-secondary">Your order from <span className="font-semibold text-text-primary">{restaurant?.name || "the restaurant"}</span> has been cancelled</p>
            </section>
          )}

          {isPending && (
            <section className="bg-warning/5 border border-warning/15 rounded-2xl p-10 text-center">
              <div className="flex justify-center mb-5">
                <div className="w-20 h-20 bg-warning rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(217,119,6,0.3)]">
                  <Clock className="w-10 h-10 text-white" style={{ strokeWidth: 3 }} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-warning mb-1">Order Placed!</h2>
              <p className="text-base font-semibold text-warning/70 mb-4">#{order.order_number}</p>
              <p className="text-[14px] text-text-secondary">Waiting for <span className="font-semibold text-text-primary">{restaurant?.name || "the restaurant"}</span> to confirm your order</p>
            </section>
          )}

          {/* WhatsApp + Call */}
          {(whatsappUrl || restaurantPhone) && (
            <div className="flex gap-3 justify-center">
              {whatsappUrl && (
                <button onClick={() => { window.open(whatsappUrl, "_blank"); setWhatsappSuccess(true) }} className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-accent text-white text-[14px] font-semibold hover:opacity-90 transition-all shadow-[0_2px_8px_rgba(37,211,102,0.25)]">
                  <MessageCircle className="w-4.5 h-4.5" />
                  {whatsappSuccess ? "Resend on WhatsApp" : "Send on WhatsApp"}
                </button>
              )}
              {restaurantPhone && (
                <a href={`tel:${restaurantPhone}`} className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl border border-border text-[14px] font-semibold text-text-primary hover:bg-white hover:border-border-strong transition-all">
                  <Phone className="w-4.5 h-4.5" />
                  Call Restaurant
                </a>
              )}
            </div>
          )}

          {/* Order Summary */}
          <section className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-[15px] font-bold text-text-primary">Order Summary</h3>
            </div>
            <div className="px-6 py-4 space-y-3">
              {(order.items || []).map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <span className="text-[14px] text-text-primary">{item.name_en} <span className="text-text-muted">×{item.quantity}</span></span>
                  <span className="text-[14px] text-text-primary font-medium">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-[#FAFAFA] border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-bold text-text-primary">Total</span>
                <span className="text-[18px] font-bold text-text-primary">{formatPrice(order.total_price)}</span>
              </div>
            </div>
          </section>

          {/* Order Details */}
          <section className="bg-white border border-border rounded-2xl p-6 space-y-3">
            <div className="flex justify-between text-[13px]">
              <span className="text-text-secondary">Customer</span>
              <span className="font-semibold text-text-primary">{order.customer_name}</span>
            </div>
            {order.customer_phone && (
              <div className="flex justify-between text-[13px]">
                <span className="text-text-secondary">Phone</span>
                <span className="font-semibold text-text-primary">{order.customer_phone}</span>
              </div>
            )}
            {order.table_number && (
              <div className="flex justify-between text-[13px]">
                <span className="text-text-secondary">Table</span>
                <span className="font-semibold text-text-primary">Table {order.table_number}</span>
              </div>
            )}
            <div className="flex justify-between text-[13px]">
              <span className="text-text-secondary">Type</span>
              <span className="font-semibold text-text-primary capitalize">{order.order_type?.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-text-secondary">Payment</span>
              <span className="font-semibold text-text-primary">{order.payment_method === "cod" ? "Cash on Delivery" : "Bank Transfer"}</span>
            </div>
          </section>

          {/* Sign-in Prompt */}
          {!user && (
            <section className="bg-white border border-border rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F5F5F5] rounded-xl flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-text-muted" />
                </div>
                <span className="text-[14px] font-medium text-text-primary">Track your order</span>
              </div>
              <Link href={`/login?redirect=/order-confirm/${order.id}`} className="text-[13px] font-bold text-accent hover:underline">Sign in</Link>
            </section>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleReorder} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] text-white font-semibold bg-primary hover:bg-primary-hover transition-all shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
              <RotateCcw className="w-4 h-4" />
              Reorder
            </button>
            {user && (
              <Link href="/account" className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] text-text-secondary font-semibold border border-border hover:bg-white hover:border-border-strong transition-all">
                <ClipboardList className="w-4 h-4" />
                My Orders
              </Link>
            )}
            <Link href="/restaurants" className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] text-text-secondary font-semibold border border-border hover:bg-white hover:border-border-strong transition-all">
              <Store className="w-4 h-4" />
              Browse
            </Link>
          </div>
        </main>
      </div>
    </>
  )
}
