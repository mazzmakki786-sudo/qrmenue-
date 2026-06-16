import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { SUPER_ADMIN_EMAIL } from "@/lib/superadmin-security"

export const GET = safeRoute(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const testEmail = process.env.SUPER_ADMIN_EMAIL || "mazzmakki786@gmail.com"

  try {
    const { data, error } = await resend.emails.send({
      from: "QRMenu.pk <onboarding@resend.dev>",
      to: testEmail,
      subject: "QRMenu.pk — Test Email (from Resend)",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h1 style="font-size: 24px; color: #25D366;">QRMenu.pk Test Email</h1>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">
            This is a test email from QRMenu.pk using Resend.
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
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
})
