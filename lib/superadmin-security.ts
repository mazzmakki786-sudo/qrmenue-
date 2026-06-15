import { createAdminClient } from "@/lib/supabase/server"

export const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL?.toLowerCase()

const RATE_LIMIT_MAX = 30
const RATE_LIMIT_WINDOW_MS = 60_000

export async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    const admin = createAdminClient()
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()

    const { count } = await admin
      .from("superadmin_login_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("attempted_at", since)

    if ((count ?? 0) >= RATE_LIMIT_MAX) return false

    await admin.from("superadmin_login_attempts").insert({
      email: "rate_limit",
      ip_address: ip,
      success: true,
    })
    return true
  } catch {
    return false
  }
}

const MAX_ATTEMPTS = 3
const LOCKOUT_WINDOW_MINUTES = 30

export async function recordLoginAttempt(email: string, ip: string, success: boolean) {
  try {
    const admin = createAdminClient()
    await admin.from("superadmin_login_attempts").insert({
      email: email.toLowerCase(),
      ip_address: ip,
      success,
    })
  } catch {}
}

export async function isLockedOut(email: string): Promise<boolean> {
  try {
    const admin = createAdminClient()
    const since = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000).toISOString()
    const { data } = await admin
      .from("superadmin_login_attempts")
      .select("success")
      .eq("email", email.toLowerCase())
      .gte("attempted_at", since)
      .order("attempted_at", { ascending: false })
      .limit(3)

    if (!data || data.length < 3) return false
    return data.every((a: any) => !a.success)
  } catch {
    return true
  }
}

export async function logAudit(email: string, action: string, details: Record<string, any> = {}) {
  try {
    const admin = createAdminClient()
    await admin.from("superadmin_audit_log").insert({
      email: email.toLowerCase(),
      action,
      details,
    })
  } catch {}
}

export function getIp(request: Request): string {
  return request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
}
