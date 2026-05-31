interface CartItem {
  dish_id: string
  name_en: string
  name_ur?: string
  price: number
  quantity: number
  subtotal: number
}

interface OrderDetails {
  orderNumber: string
  items: CartItem[]
  totalPrice: number
  paymentMethod: string
  customerName: string
  customerPhone?: string
  orderType: "dine_in" | "takeaway" | "delivery"
  tableNumber?: string
  deliveryAddress?: string
  restaurantPhone: string
}

export function buildWhatsAppURL(order: OrderDetails): string {
  const itemsList = order.items
    .map((item) => `• ${item.name_en} x${item.quantity} — Rs ${item.subtotal}`)
    .join("\n")

  const orderTypeLabel = {
    dine_in: "Dine-in",
    takeaway: "Takeaway",
    delivery: "Delivery",
  }[order.orderType]

  const locationInfo =
    order.orderType === "dine_in"
      ? `Table: ${order.tableNumber}`
      : order.orderType === "delivery"
        ? `Address: ${order.deliveryAddress}`
        : "Takeaway (will collect)"

  const paymentLabel =
    order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"

  const message = [
    "New Order — QRMenu.pk",
    `Order #${order.orderNumber}`,
    "",
    "Items:",
    itemsList,
    "",
    `Total: Rs ${order.totalPrice}`,
    `Payment: ${paymentLabel}`,
    "",
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone || "Not provided"}`,
    locationInfo,
    `Type: ${orderTypeLabel}`,
    "",
    `Time: ${new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" })}`,
    "",
    "Sent via QRMenu.pk",
  ].join("\n")

  const encodedMessage = encodeURIComponent(message)
  const phone = order.restaurantPhone.replace(/[^0-9]/g, "")
  return `https://wa.me/92${phone.slice(1)}?text=${encodedMessage}`
}
