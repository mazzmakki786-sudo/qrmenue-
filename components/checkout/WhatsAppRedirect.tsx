"use client"

import { useEffect } from "react"
import { buildWhatsAppURL } from "@/lib/whatsapp"

interface Props {
  order: any
  restaurant: any
  customerName: string
  customerPhone?: string
}

export function WhatsAppRedirect({ order, restaurant, customerName, customerPhone }: Props) {
  const whatsappUrl = buildWhatsAppURL({
    orderNumber: order.order_number,
    items: order.items,
    totalPrice: order.total_price,
    paymentMethod: order.payment_method,
    customerName,
    customerPhone,
    orderType: order.order_type,
    tableNumber: order.table_number,
    deliveryAddress: order.delivery_address,
    restaurantPhone: restaurant.phone,
  })

  useEffect(() => {
    window.open(whatsappUrl, "_blank")
  }, [whatsappUrl])

  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto">
        <span className="text-3xl">✅</span>
      </div>
      <h2 className="text-2xl font-bold">Order Placed!</h2>
      <p className="text-sm text-[#555]">#{order.order_number}</p>
      <p className="text-sm">WhatsApp message sent to restaurant</p>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center h-12 px-6 rounded-[10px] border border-[#E8E8E8] text-[#111] font-semibold hover:bg-[#F8F8F8] transition-colors"
      >
        Resend WhatsApp Message
      </a>
    </div>
  )
}
