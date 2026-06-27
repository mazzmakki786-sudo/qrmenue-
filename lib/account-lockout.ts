import { createAdminClient } from "@/lib/supabase/server"
import { getClientIp } from "@/lib/rate-limiter"

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 15
const PROGRESSIVE_DELAY_BASE_SECONDS = 2

export interface LockoutState {
  locked: boolean
  remainingMinutes?: number
  attemptNumber: number
}

async function getRecentFailures(email: string) {
  const supabase = createAdminClient()
  const recentWindow = new Date(Date.now() - LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from("login_attempts")
    .select("attempted_at", { count: "exact" })
    .eq("email", email.toLowerCase().trim())
    .eq("success", false)
    .gte("attempted_at", recentWindow)
    .order("attempted_at", { ascending: false })
    .limit(MAX_FAILED_ATTEMPTS)

  if (error) {
    console.error("[AccountLockout] query failed:", error.message)
    return null
  }

  return data ?? []
}

export async function checkLockout(email: string): Promise<LockoutState> {
  const failures = await getRecentFailures(email)
  if (!failures) return { locked: false, attemptNumber: 0 }

  const count = failures.length

  if (count >= MAX_FAILED_ATTEMPTS) {
    const oldestLocked = failures[count - 1]?.attempted_at
    if (oldestLocked) {
      const lockUntil = new Date(new Date(oldestLocked).getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
      const remainingMs = lockUntil.getTime() - Date.now()
      if (remainingMs > 0) {
        return {
          locked: true,
          remainingMinutes: Math.ceil(remainingMs / 60000),
          attemptNumber: count,
        }
      }
    }
  }

  return { locked: false, attemptNumber: count }
}

export function getProgressiveDelay(attemptNumber: number): number {
  if (attemptNumber <= 1) return 0
  return Math.min((attemptNumber - 1) * PROGRESSIVE_DELAY_BASE_SECONDS, 60) * 1000
}

export async function recordLoginAttempt(
  request: Request,
  email: string,
  success: boolean
): Promise<void> {
  const ip = getClientIp(request)
  const supabase = createAdminClient()

  await supabase.from("login_attempts").insert({
    email: email.toLowerCase().trim(),
    ip_address: ip,
    success,
  })
}

export async function clearLoginAttempts(email: string): Promise<void> {
  const supabase = createAdminClient()
  await supabase
    .from("login_attempts")
    .delete()
    .eq("email", email.toLowerCase().trim())
}
