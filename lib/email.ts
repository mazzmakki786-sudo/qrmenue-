import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendLockoutAlert(
  email: string,
  ipAddress: string,
  remainingMinutes: number
): Promise<void> {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "QRMenu.pk"
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qrmenu.pk"

  try {
    await resend.emails.send({
      from: `${appName} Security <noreply@${new URL(appUrl).hostname}>`,
      to: email,
      subject: `Temporary Account Lock – ${appName}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#000;">Account Temporarily Locked</h2>
          <p style="color:#555;font-size:14px;line-height:1.6;">
            We detected multiple failed login attempts on your ${appName} account
            from <strong>${ipAddress}</strong>.
          </p>
          <p style="color:#555;font-size:14px;line-height:1.6;">
            For security, your account has been locked for <strong>${remainingMinutes} minutes</strong>.
          </p>
          <p style="color:#555;font-size:14px;line-height:1.6;">
            If this was you, wait ${remainingMinutes} minutes and try again.
            If this wasn't you, reset your password immediately:
          </p>
          <a href="${appUrl}/reset-password"
             style="display:inline-block;background:#000;color:#fff;padding:12px 24px;
                    border-radius:8px;text-decoration:none;font-size:14px;margin:16px 0;">
            Reset Password
          </a>
          <p style="color:#999;font-size:12px;margin-top:24px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error("[Lockout Email] failed to send:", err instanceof Error ? err.message : err)
  }
}
