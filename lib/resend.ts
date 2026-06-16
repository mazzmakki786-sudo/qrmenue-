import { Resend } from "resend"

let _resend: Resend | null = null
function getResend(): Resend | null {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) return null
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

export async function sendOrderEmail(order: any, restaurant: any) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping order email")
    return
  }
  try {
    const resend = getResend()
    if (!resend) return
    await resend.emails.send({
      from: "orders@qrmenu.pk",
      to: restaurant.owner_email,
      subject: `New Order #${order.order_number} — ${restaurant.name}`,
      html: `
        <h2>New Order Received!</h2>
        <p><strong>Order #${order.order_number}</strong></p>
        <p>Time: ${new Date(order.created_at).toLocaleString("en-PK")}</p>
        <h3>Items:</h3>
        <ul>
          ${order.items.map((i: any) => `<li>${i.name_en} x${i.quantity} — Rs ${i.subtotal}</li>`).join("")}
        </ul>
        <p><strong>Total: Rs ${order.total_price}</strong></p>
        <p>Payment: ${order.payment_method}</p>
        <p>Customer: ${order.customer_name} | ${order.customer_phone}</p>
        ${order.order_type === "delivery" ? `<p>Address: ${order.delivery_address}</p>` : ""}
        ${order.order_type === "dine_in" ? `<p>Table: ${order.table_number}</p>` : ""}
      `,
    })
  } catch (e) {
    console.error("sendOrderEmail error", e)
  }
}

export async function sendNewDishEmail(dish: any, restaurant: any, customerEmails: string[]) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping new-dish email")
    return
  }
  try {
    const resend = getResend()
    if (!resend) return
    await resend.emails.send({
      from: "updates@qrmenu.pk",
      to: customerEmails,
      subject: `New dish at ${restaurant.name}: ${dish.name_en}`,
      html: `
        <h2>${restaurant.name} added a new dish!</h2>
        <h3>${dish.name_en} — Rs ${dish.price}</h3>
        <p>${dish.description_en}</p>
      `,
    })
  } catch (e) {
    console.error("sendNewDishEmail error", e)
  }
}
