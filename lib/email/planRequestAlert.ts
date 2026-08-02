import { Resend } from "resend"
import { escapeHtml } from "@/lib/utils"

const resend = new Resend(process.env.RESEND_API_KEY!)

interface PlanRequest {
  restaurantName: string
  restaurantPhone: string
  ownerEmail: string
  plan: string
  slug: string
  city: string
}

export async function sendPlanRequestAlert(details: PlanRequest): Promise<void> {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Digital QR Menue"
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.digitalmenue.com"
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL

  if (!superAdminEmail) {
    console.warn("[PlanRequestAlert] SUPER_ADMIN_EMAIL not set, skipping email")
    return
  }

  try {
    await resend.emails.send({
      from: `${appName} <noreply@${new URL(appUrl).hostname}>`,
      to: superAdminEmail,
      subject: `🔔 Plan Request: ${escapeHtml(details.plan)} — ${escapeHtml(details.restaurantName)}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
          <h2 style="color:#000;font-size:20px;margin-bottom:4px;">New Plan Request</h2>
          <p style="color:#888;font-size:13px;margin-top:0;">
            A restaurant has signed up and requested a paid plan
          </p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr>
              <td style="padding:8px 12px;background:#f5f5f5;font-size:12px;color:#888;width:100px;">Restaurant</td>
              <td style="padding:8px 12px;font-size:13px;font-weight:600;">${escapeHtml(details.restaurantName)}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;background:#f5f5f5;font-size:12px;color:#888;">City</td>
              <td style="padding:8px 12px;font-size:13px;">${escapeHtml(details.city)}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;background:#f5f5f5;font-size:12px;color:#888;">Phone</td>
              <td style="padding:8px 12px;font-size:13px;">${escapeHtml(details.restaurantPhone)}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;background:#f5f5f5;font-size:12px;color:#888;">Owner Email</td>
              <td style="padding:8px 12px;font-size:13px;">${escapeHtml(details.ownerEmail)}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;background:#f5f5f5;font-size:12px;color:#888;">Requested Plan</td>
              <td style="padding:8px 12px;font-size:13px;font-weight:700;color:#16A34A;">${escapeHtml(details.plan)}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;background:#f5f5f5;font-size:12px;color:#888;">Menu URL</td>
              <td style="padding:8px 12px;font-size:13px;">
                <a href="${appUrl}/${escapeHtml(details.slug)}" style="color:#25D366;">${appUrl}/${escapeHtml(details.slug)}</a>
              </td>
            </tr>
          </table>

          <div style="display:flex;gap:8px;margin:24px 0;">
            <a href="${appUrl}/superadmin/restaurants/${escapeHtml(details.slug)}"
               style="display:inline-block;background:#000;color:#fff;padding:12px 24px;
                      border-radius:8px;text-decoration:none;font-size:14px;">
              Activate Plan
            </a>
          </div>

          <p style="color:#999;font-size:12px;border-top:1px solid #eee;padding-top:16px;">
            To activate manually, go to the superadmin panel and update this restaurant's plan.
          </p>
        </div>
      `,
    })

    console.log("[PlanRequestAlert] Email sent to superadmin for", details.restaurantName)
  } catch (err) {
    console.error("[PlanRequestAlert] Failed to send:", err instanceof Error ? err.message : err)
  }
}

/**
 * Builds a WhatsApp message URL for the superadmin with plan request details.
 * Used client-side to open wa.me link.
 */
export function buildPlanRequestWhatsAppUrl(details: PlanRequest, superadminPhone: string): string {
  const phone = superadminPhone.replace(/[^0-9+]/g, "")
  // Convert to international format
  const cleanPhone = phone.startsWith("0") ? "92" + phone.slice(1) : phone

  const message = [
    "🔔 *New Plan Request — Digital QR Menue*",
    "",
    `*Restaurant:* ${details.restaurantName}`,
    `*Phone:* ${details.restaurantPhone}`,
    `*Owner Email:* ${details.ownerEmail}`,
    `*City:* ${details.city}`,
    "",
    `*Requested Plan:* ${details.plan}`,
    `*Menu URL:* ${process.env.NEXT_PUBLIC_APP_URL || "https://www.digitalmenue.com"}/${details.slug}`,
    "",
    "Activate from superadmin panel.",
  ].join("\n")

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}
