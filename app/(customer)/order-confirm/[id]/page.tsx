import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

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

export default async function OrderConfirmPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from("orders")
    .select("*, restaurants(*)")
    .eq("id", id)
    .single()

  if (!order) notFound()

  const whatsappUrl = buildWhatsAppUrl(order)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">✓</span>
      </div>
      <h1 className="text-2xl font-bold mb-1">Order Placed!</h1>
      <p className="text-sm text-[#555] mb-2">{order.order_number}</p>
      <p className="text-sm text-[#555] mb-8">Your order has been received</p>

      <div className="w-full max-w-sm bg-[#F8F8F8] rounded-[12px] p-4 mb-8 text-left">
        {order.items.map((item: any) => (
          <div key={item.dish_id} className="flex justify-between py-1 text-sm">
            <span>{item.name_en} x{item.quantity}</span>
            <span className="font-medium">Rs {item.subtotal}</span>
          </div>
        ))}
        <div className="border-t border-[#E8E8E8] mt-3 pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span>Rs {order.total_price}</span>
        </div>
        <p className="text-xs text-[#555] mt-2 capitalize">
          {order.payment_method === "cod" ? "Cash on Delivery" : "Bank Transfer"}
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-12 px-6 rounded-[10px] bg-[#25D366] text-white font-semibold hover:bg-[#20BD5A] transition-colors"
          >
            Open WhatsApp
          </a>
        )}
        <Link href={`/menu/${order.restaurants?.slug}`}>
          <Button variant="primary" fullWidth>Browse More Menu</Button>
        </Link>
      </div>
    </div>
  )
}
