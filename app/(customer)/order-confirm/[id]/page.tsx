"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Check, ArrowLeft, ClipboardList, Store, ExternalLink } from "lucide-react"

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

export default function OrderConfirmPage({ params }: any) {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(5)
  const [whatsappSuccess, setWhatsappSuccess] = useState(false)
  const openedRef = useRef(false)

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

  useEffect(() => {
    if (!order || loading) return
    if (openedRef.current) return
    const url = buildWhatsAppUrl(order)
    if (!url) return

    const tick = setInterval(() => {
      setCountdown((c) => {
        if (c <= 0) {
          clearInterval(tick)
          if (!openedRef.current) {
            openedRef.current = true
            setWhatsappSuccess(true)
            window.open(url, "_blank")
          }
          return 0
        }
        return c - 1
      })
    }, 1000)

    return () => clearInterval(tick)
  }, [order, loading])

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
            Your order has been sent to <span className="font-semibold text-black">{restaurant?.name || "the restaurant"}</span> on WhatsApp
          </p>
        </section>

        {/* WhatsApp Automation Status */}
        <section className="bg-white border border-[#F0F0F0] rounded-[14px] p-5 shadow-sm">
          {whatsappSuccess ? (
            <div className="flex items-center justify-between">
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
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span className="text-sm font-semibold text-black">Opening WhatsApp...</span>
                </div>
                <span className="text-sm text-[#555]">{countdown}s</span>
              </div>
              <div className="w-full h-1.5 bg-[#EDEEEF] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#25D366] rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
          <button
            onClick={() => { window.open(whatsappUrl, "_blank") }}
            className="w-full mt-4 bg-[#25D366] text-white text-sm font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            Send on WhatsApp now
          </button>
        </section>

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
