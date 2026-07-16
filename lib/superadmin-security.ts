import { createAdminClient } from "@/lib/supabase/server"

export const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || ""

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
  } catch (err) {
    console.error("[superadmin-security] recordLoginAttempt failed:", err)
  }
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
  } catch (err) {
    console.error("[superadmin-security] isLockedOut failed:", err)
    return false
  }
}

export async function isSuperAdmin(email: string | undefined): Promise<boolean> {
  if (!email) return false
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("super_admins")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle()

    if (error) {
      console.error("[superadmin-security] isSuperAdmin DB error:", error.message)
      return false
    }
    return !!data
  } catch (err) {
    console.error("[superadmin-security] isSuperAdmin failed:", err)
    return false
  }
}

export async function ensureSuperAdminEmail(email: string): Promise<void> {
  try {
    const allowedEmails = (process.env.SUPER_ADMIN_EMAIL || "")
      .split(",")
      .map(e => e.trim().toLowerCase())
      .filter(Boolean)

    // Only auto-provision if email matches the SUPER_ADMIN_EMAIL env var
    if (!allowedEmails.includes(email.toLowerCase())) {
      return
    }

    const admin = createAdminClient()
    const { data } = await admin
      .from("super_admins")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle()

    if (!data) {
      await admin.from("super_admins").insert({
        email: email.toLowerCase(),
      })
      console.log(`[superadmin-security] Auto-seeded super admin: ${email}`)
    }
  } catch (err) {
    console.error("[superadmin-security] ensureSuperAdminEmail failed:", err)
  }
}

export async function seedFromEnvVar(table: string = "super_admins"): Promise<void> {
  try {
    const envVal = process.env.SUPER_ADMIN_EMAIL
    if (!envVal) return

    const emails = envVal.split(",").map(e => e.trim().toLowerCase()).filter(Boolean)
    if (emails.length === 0) return

    const admin = createAdminClient()
    for (const email of emails) {
      const { data } = await admin
        .from(table)
        .select("id")
        .eq("email", email)
        .maybeSingle()

      if (!data) {
        await admin.from(table).insert({ email })
        console.log(`[superadmin-security] Seeded super admin from env: ${email}`)
      }
    }
  } catch (err) {
    console.error("[superadmin-security] seedFromEnvVar failed:", err)
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
  } catch (err) {
    console.error("[superadmin-security] logAudit failed:", err)
  }
}

export function getIp(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip")
  if (cfIp) return cfIp.trim()

  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp.trim()

  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() || ""

  return "unknown"
}
