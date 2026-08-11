import { createHash, randomInt } from "crypto"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

/**
 * Generate a 6-digit verification code and its SHA-256 hash.
 * The plaintext code is sent to the user via email; only the hash is stored
 * in the `restaurant_signup_verification` table so a DB leak can't be used
 * to confirm accounts.
 */
export function generateEmailVerificationCode(): { code: string; codeHash: string } {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0")
  const codeHash = createHash("sha256").update(code).digest("hex")
  return { code, codeHash }
}

export function verifyCodeHash(code: string, codeHash: string): boolean {
  const hash = createHash("sha256").update(code).digest("hex")
  return hash === codeHash
}

/** Send the 6-digit confirmation code via Resend (transactional). */
export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Digital QR Menue"
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.digitalmenue.com"
  try {
    await resend.emails.send({
      from: `${appName} <noreply@${new URL(appUrl).hostname}>`,
      to: email,
      subject: `Your ${appName} verification code`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#000;">Verify your email</h2>
          <p style="color:#555;font-size:14px;line-height:1.6;">
            Use the code below to confirm your email and activate your restaurant account.
          </p>
          <div style="background:#f5f5f5;border-radius:12px;padding:20px;text-align:center;margin:16px 0;">
            <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#000;">${code}</span>
          </div>
          <p style="color:#555;font-size:14px;line-height:1.6;">
            This code expires in <strong>15 minutes</strong>.
          </p>
          <p style="color:#999;font-size:12px;margin-top:24px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error("[Verification Email] failed to send:", err instanceof Error ? err.message : err)
  }
}
