"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Check, ArrowLeft, ClipboardList, Store, ExternalLink, Phone, RotateCcw } from "lucide-react"
import { useCartStore } from "@/stores/cartStore"

function buildWhatsAppUrl(order: any): string {
  const restaurant = order.restaurants
  if (!restaurant?.phone) return ""

  const itemsList = (order.items || [])
    .map((i: any) => `• ${i.name_en} x${i.quantity} — Rs ${i.subtotal}`)
    .join("\n")

  const locationInfo = order.order_type === "dine_in"
    ? `Table: ${order.table_number}`
    : order.order_type === "delivery"
      ? `Address: ${order.delivery_address}`
      : "Takeaway"

  const message = [
    "New Order — QRMenu.pk",
    `Order #${order.order_number}`,
    "",
    "Items:",
    itemsList,
    "",
    `Total: Rs ${order.total_price}`,
    `Payment: ${order.payment_method === "cod" ? "Cash on Delivery" : "Bank Transfer"}`,
    "",
    `Customer: ${order.customer_name}`,
    `Phone: ${order.customer_phone || "Not provided"}`,
    locationInfo,
    `Type: ${order.order_type.replace("_", " ")}`,
  ].join("\n")

  const phone = restaurant.phone.replace(/[^0-9]/g, "")
  return `https://wa.me/92${phone.slice(1)}?text=${encodeURIComponent(message)}`
}

const STATUS_STEPS = ["placed", "received", "preparing", "ready"] as const

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus as any)
  const activeIndex = currentIndex >= 0 ? currentIndex : 0

  return (
    <div className="flex items-center justify-between px-2">
      {STATUS_STEPS.map((step, i) => {
        const isCompleted = i <= activeIndex
        const isCurrent = i === activeIndex
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isCompleted
                  ? "bg-[#25D366] text-white"
                  : "border-2 border-[#DDD] text-[#999]"
              }`}>
                {isCompleted ? <Check className="w-3.5 h-3.5" style={{ strokeWidth: 3 }} /> : i + 1}
              </div>
              <span className={`text-[10px] mt-1 font-medium capitalize ${
                isCurrent ? "text-black" : isCompleted ? "text-[#25D366]" : "text-[#999]"
              }`}>
                {step}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${
                i < activeIndex ? "bg-[#25D366]" : "bg-[#E8E8E8]"
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function OrderConfirmPage({ params }: any) {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [whatsappSuccess, setWhatsappSuccess] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const setRestaurant = useCartStore((s) => s.setRestaurant)

  useEffect(() => {
    const fetchOrder = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data } = await supabase
        .from("orders")
        .select("*, restaurants(*)")
        .eq("id", params.id)
        .single()

      if (!data) {
        router.replace("/restaurants")
        return
      }

      setOrder(data)
      setLoading(false)
    }
    fetchOrder()
  }, [params.id, router])

  const handleReorder = () => {
    if (!order) return
    clearCart()
    const restaurant = order.restaurants
    if (restaurant) {
      setRestaurant(restaurant.id, restaurant.name)
    }
    order.items?.forEach((item: any) => {
      const dish = {
        id: item.id,
        name_en: item.name_en,
        price: item.price,
        image_url: null,
        is_available: true,
        tags: [],
      }
      for (let i = 0; i < item.quantity; i++) {
        addItem(dish as any)
      }
    })
    router.push("/cart")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <p className="text-sm text-[#999]">Loading...</p>
      </div>
    )
  }

  if (!order) return null

  const whatsappUrl = buildWhatsAppUrl(order)
  const restaurant = order.restaurants
  const restaurantPhone = restaurant?.phone?.replace(/[^0-9+]/g, "")

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      {/* Top AppBar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-[#F0F0F0]">
        <div className="flex items-center justify-between px-4 h-16 max-w-[500px] mx-auto">
          <div className="flex items-center gap-4">
            <Link href={user ? "/account" : "/restaurants"} className="active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold">Order Placed</h1>
          </div>
        </div>
      </header>

      <main className="max-w-[500px] mx-auto px-4 py-6 space-y-6">
        {/* Success Card */}
        <section className="bg-white border border-[#F0F0F0] rounded-[14px] p-6 text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-[#25D366]" style={{ strokeWidth: 3 }} />
            </div>
          </div>
          <h2 className="text-lg font-bold text-black mb-1">Order Placed!</h2>
          <p className="text-sm font-semibold text-[#25D366] mb-3">#{order.order_number}</p>
          <p className="text-sm text-[#555] px-4">
            Your order has been sent to <span className="font-semibold text-black">{restaurant?.name || "the restaurant"}</span>
          </p>
        </section>

        {/* Status Timeline */}
        <section className="bg-white border border-[#F0F0F0] rounded-[14px] p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4 text-black">Order Status</h3>
          <StatusTimeline currentStatus={order.status || "placed"} />
        </section>

        {/* WhatsApp Button */}
        {whatsappUrl && (
          <section className="bg-white border border-[#F0F0F0] rounded-[14px] p-5 shadow-sm">
            {whatsappSuccess && (
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#25D366]" style={{ strokeWidth: 3 }} />
                  <span className="text-sm font-semibold text-black">WhatsApp opened!</span>
                </div>
                <button
                  onClick={() => { window.open(whatsappUrl, "_blank") }}
                  className="text-sm font-semibold text-[#25D366] hover:underline"
                >
                  Resend
                </button>
              </div>
            )}
            <button
              onClick={() => { window.open(whatsappUrl, "_blank"); setWhatsappSuccess(true) }}
              className="w-full bg-[#25D366] text-white text-sm font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              Send on WhatsApp
            </button>
          </section>
        )}

        {/* Order Summary */}
        <section className="bg-white border border-[#F0F0F0] rounded-[14px] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[#25D366]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </span>
            <h3 className="text-lg font-bold text-black">Order Summary</h3>
          </div>

          <div className="space-y-4 mb-6">
            {(order.items || []).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-black">
                  {item.name_en} <span className="text-[#555]">x{item.quantity}</span>
                </span>
                <span className="text-sm text-black">Rs. {item.subtotal}</span>
              </div>
            ))}
            <div className="pt-4 border-t border-[#F0F0F0] flex items-center justify-between">
              <span className="text-lg font-bold text-black">Total</span>
              <span className="text-lg font-bold text-black">Rs. {order.total_price}</span>
            </div>
          </div>

          <div className="bg-[#F3F4F5] rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-[#555]">Customer</span>
              <span className="font-semibold text-black">{order.customer_name}</span>
            </div>
            {order.customer_phone && (
              <div className="flex justify-between text-xs">
                <span className="text-[#555]">Phone</span>
                <span className="font-semibold text-black">{order.customer_phone}</span>
              </div>
            )}
            {order.table_number && (
              <div className="flex justify-between text-xs">
                <span className="text-[#555]">Table</span>
                <span className="font-semibold text-black">Table {order.table_number}</span>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span className="text-[#555]">Type</span>
              <span className="font-semibold text-black capitalize">{order.order_type?.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#555]">Payment</span>
              <span className="font-semibold text-black capitalize">{order.payment_method === "cod" ? "Cash" : "Bank Transfer"}</span>
            </div>
          </div>
        </section>

        {/* Sign-in Prompt */}
        {!user && (
          <section className="bg-white border border-[#F0F0F0] rounded-[14px] p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#EDEEEF] rounded-lg flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-[#555]" />
              </div>
              <span className="text-sm font-medium text-black">Track your order</span>
            </div>
            <Link
              href={`/login?redirect=/order-confirm/${order.id}`}
              className="text-sm font-bold text-[#25D366] hover:underline"
            >
              Sign in
            </Link>
          </section>
        )}

        {/* Bottom Actions */}
        <div className="space-y-3 pt-4">
          <button
            onClick={handleReorder}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm text-white font-semibold bg-black active:scale-[0.98] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reorder
          </button>
          {restaurantPhone && (
            <a
              href={`tel:${restaurantPhone}`}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm text-[#555] font-semibold border border-[#F0F0F0] hover:bg-[#EDEEEF] transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call Restaurant
            </a>
          )}
          {user && (
            <Link
              href="/account"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm text-[#555] font-semibold border border-[#F0F0F0] hover:bg-[#EDEEEF] transition-colors"
            >
              <ClipboardList className="w-4 h-4" />
              View my orders
            </Link>
          )}
          <Link
            href="/restaurants"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm text-[#555] font-semibold border border-[#F0F0F0] hover:bg-[#EDEEEF] transition-colors"
          >
            <Store className="w-4 h-4" />
            Browse more restaurants
          </Link>
        </div>
      </main>
    </div>
  )
}
