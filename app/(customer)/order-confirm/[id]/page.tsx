"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, ClipboardList } from "lucide-react"

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
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(5)
  const [redirected, setRedirected] = useState(false)
  const openedRef = useRef(false)

  useEffect(() => {
    const fetchOrder = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

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

      if (!user) {
        router.replace(`/login?redirect=/order-confirm/${params.id}`)
        return
      }

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
        if (c <= 1) {
          clearInterval(tick)
          if (!openedRef.current) {
            openedRef.current = true
            setRedirected(true)
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#999]">Loading...</p>
      </div>
    )
  }

  if (!order) return null

  const whatsappUrl = buildWhatsAppUrl(order)

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="flex items-center gap-3 px-4 h-14 bg-white border-b border-[#F0F0F0]">
        <Link href="/account">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-semibold">Order Placed</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-[14px] p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-xl font-bold">Order Placed!</h2>
          <p className="text-sm text-[#555] mt-1">Order #{order.order_number}</p>
          <p className="text-xs text-[#888] mt-2">
            Your order has been sent to {order.restaurants?.name || "the restaurant"} on WhatsApp.
          </p>
        </div>

        {whatsappUrl && (
          <div className="bg-white rounded-[14px] p-5">
            {redirected ? (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl">✓</span>
                </div>
                <p className="text-sm font-semibold text-[#16A34A]">WhatsApp opened!</p>
                <p className="text-xs text-[#888] mt-1">If it didn't open, tap the button below</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">Sending to WhatsApp...</p>
                  <span className="text-sm text-[#555]">{countdown}s</span>
                </div>
                <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#25D366] transition-all duration-1000"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  />
                </div>
              </>
            )}
            <a href={whatsappUrl} target="_blank" rel="noopener" className="block mt-3">
              <Button variant="primary" fullWidth>
                <ExternalLink className="w-4 h-4 mr-2" />
                {redirected ? "Open WhatsApp again" : "Send on WhatsApp now"}
              </Button>
            </a>
          </div>
        )}

        <Link href="/account">
          <Button variant="ghost" fullWidth>
            <ClipboardList className="w-4 h-4 mr-2" />
            View my orders
          </Button>
        </Link>
      </div>
    </div>
  )
}
