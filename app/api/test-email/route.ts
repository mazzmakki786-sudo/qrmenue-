import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { isSuperAdmin } from "@/lib/superadmin-security"
import { checkRateLimit } from "@/lib/rate-limiter"

export const GET = safeRoute(async (request) => {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 })
  }

  await checkRateLimit(request, "default")

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isSuperAdmin(user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const testEmail = process.env.SUPER_ADMIN_EMAIL || ""

  try {
    const { data, error } = await resend.emails.send({
      from: "Digital QR Menue <onboarding@resend.dev>",
      to: testEmail,
      subject: "Digital QR Menue — Test Email (from Resend)",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h1 style="font-size: 24px; color: #25D366;">Digital QR Menue Test Email</h1>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">
            This is a test email from Digital QR Menue using Resend.
          </p>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">
            If you received this, Resend is configured correctly!
          </p>
          <div style="margin-top: 32px; padding: 16px; background: #F9FAFB; border-radius: 8px;">
            <p style="margin: 0; color: #555; font-size: 13px;">
              Sent at: ${new Date().toLocaleString("en-PK")}
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 })
  }
})
