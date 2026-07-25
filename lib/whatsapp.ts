// lib/whatsapp.ts
interface WhatsAppOrder {
  orderNumber: string
  items: Array<{ name_en: string; quantity: number; subtotal: number }>
  totalPrice: number
  paymentMethod: string
  customerName: string
  customerPhone?: string
  orderType: string
  tableNumber?: string
  deliveryAddress?: string
  restaurantPhone: string
  deliveryFee?: number
}

export function buildWhatsAppURL(order: WhatsAppOrder): string {
  if (!order.restaurantPhone) return ""

  const itemsList = order.items
    .map((i) => `• ${i.name_en} x${i.quantity} — Rs ${i.subtotal}`)
    .join("\n")

  const locationInfo =
    order.orderType === "dine_in"
      ? `Table: ${order.tableNumber}`
      : order.orderType === "delivery"
        ? `Address: ${order.deliveryAddress}`
        : "Takeaway"

  const message = [
    "New Order — Digital QR Menue",
    `Order #${order.orderNumber}`,
    "",
    "Items:",
    itemsList,
    "",
    order.deliveryFee ? `Delivery Fee: Rs ${order.deliveryFee}` : "Pickup / Dine-in",
    `Total: Rs ${order.totalPrice}`,
    `Payment: ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}`,
    "",
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone || "Not provided"}`,
    locationInfo,
    `Type: ${order.orderType.replace("_", " ")}`,
  ].join("\n")

  const phone = order.restaurantPhone.replace(/[^0-9+]/g, "")
  return `https://wa.me/92${phone.slice(1)}?text=${encodeURIComponent(message)}`
}
