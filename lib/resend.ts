import { Resend } from "resend"
import { escapeHtml } from "@/lib/utils"

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
    return
  }
  try {
    const resend = getResend()
    if (!resend) return
    await resend.emails.send({
      from: "orders@digitalmenue.com",
      to: restaurant.owner_email,
      subject: `New Order #${escapeHtml(order.order_number)} — ${escapeHtml(restaurant.name)}`,
      html: `
        <h2>New Order Received!</h2>
        <p><strong>Order #${escapeHtml(order.order_number)}</strong></p>
        <p>Time: ${escapeHtml(new Date(order.created_at).toLocaleString("en-PK"))}</p>
        <h3>Items:</h3>
        <ul>
          ${order.items.map((i: any) => `<li>${escapeHtml(i.name_en)} x${i.quantity} — Rs ${i.subtotal}</li>`).join("")}
        </ul>
        <p><strong>Total: Rs ${order.total_price}</strong></p>
        <p>Payment: ${escapeHtml(order.payment_method)}</p>
        <p>Customer: ${escapeHtml(order.customer_name)} | ${escapeHtml(order.customer_phone || "")}</p>
        ${order.order_type === "delivery" ? `<p>Address: ${escapeHtml(order.delivery_address || "")}</p>` : ""}
        ${order.order_type === "dine_in" ? `<p>Table: ${escapeHtml(order.table_number || "")}</p>` : ""}
      `,
    })
  } catch (e) {
    console.error("sendOrderEmail error", e)
  }
}

export async function sendWelcomeEmail(restaurant: { name: string; owner_email: string; slug: string }) {
  if (!process.env.RESEND_API_KEY) return
  try {
    const resend = getResend()
    if (!resend) return
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.digitalmenue.com"
    await resend.emails.send({
      from: "Digital QR Menue <noreply@digitalmenue.com>",
      to: restaurant.owner_email,
      subject: `Welcome to Digital QR Menue — ${escapeHtml(restaurant.name)} is Live!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h1 style="font-size: 22px; color: #22C55E; margin-bottom: 8px;">Welcome to Digital QR Menue!</h1>
          <p style="color: #333; font-size: 15px; line-height: 1.6;">
            Hi <strong>${escapeHtml(restaurant.name)}</strong> team,
          </p>
          <p style="color: #333; font-size: 15px; line-height: 1.6;">
            Your restaurant is now live! Your 30-day free trial has started and you can start taking QR orders today.
          </p>
          <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px; font-weight: bold; color: #166534;">Your menu link:</p>
            <a href="${appUrl}/${escapeHtml(restaurant.slug)}" style="color: #25D366; font-size: 16px; word-break: break-all;">
              ${appUrl}/${escapeHtml(restaurant.slug)}
            </a>
          </div>
          <h3 style="font-size: 16px; color: #333; margin-top: 20px;">Quick Start:</h3>
          <ol style="color: #555; font-size: 14px; line-height: 1.8; padding-left: 20px;">
            <li>Add your menu categories & dishes in the dashboard</li>
            <li>Download your QR code from the QR section</li>
            <li>Print it and place it on your tables</li>
            <li>Customers scan → view menu → place order → you get notified!</li>
          </ol>
          <div style="margin-top: 24px;">
            <a href="${appUrl}/dashboard" style="display: inline-block; background: #22C55E; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Go to Dashboard →
            </a>
          </div>
          <hr style="margin-top: 24px; border: none; border-top: 1px solid #E8E8E8;" />
          <p style="color: #999; font-size: 13px;">Need help? Reply to this email or visit our <a href="${appUrl}/faq" style="color: #25D366;">FAQ</a>.</p>
        </div>
      `,
    })
  } catch (e) {
    console.error("sendWelcomeEmail error", e)
  }
}

export async function sendNewDishEmail(dish: any, restaurant: any, customerEmails: string[]) {
  if (!process.env.RESEND_API_KEY) {
    return
  }
  try {
    const resend = getResend()
    if (!resend) return
    await resend.emails.send({
      from: "updates@digitalmenue.com",
      to: customerEmails,
      subject: `New dish at ${escapeHtml(restaurant.name)}: ${escapeHtml(dish.name_en)}`,
      html: `
        <h2>${escapeHtml(restaurant.name)} added a new dish!</h2>
        <h3>${escapeHtml(dish.name_en)} — Rs ${dish.price}</h3>
        <p>${escapeHtml(dish.description_en || "")}</p>
      `,
    })
  } catch (e) {
    console.error("sendNewDishEmail error", e)
  }
}
