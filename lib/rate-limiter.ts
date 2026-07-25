import { createAdminClient } from "@/lib/supabase/server"
import { type NextRequest } from "next/server"

export interface RateLimitConfig {
  maxRequests: number
  windowSeconds: number
}

const DEFAULTS: Record<string, RateLimitConfig> = {
  "login": { maxRequests: 10, windowSeconds: 60 },
  "superadmin:write": { maxRequests: 10, windowSeconds: 60 },
  "superadmin:read": { maxRequests: 30, windowSeconds: 60 },
  "orders:create": { maxRequests: 10, windowSeconds: 60 },
  "orders:update": { maxRequests: 10, windowSeconds: 60 },
  "orders:check": { maxRequests: 15, windowSeconds: 60 },
  "owner:write": { maxRequests: 15, windowSeconds: 60 },
  "owner:read": { maxRequests: 30, windowSeconds: 60 },
  "admin:write": { maxRequests: 10, windowSeconds: 60 },
  "menu:read": { maxRequests: 30, windowSeconds: 60 },
  "notifications:send": { maxRequests: 5, windowSeconds: 60 },
  "favorites:write": { maxRequests: 30, windowSeconds: 60 },
  "settings:read": { maxRequests: 20, windowSeconds: 60 },
  default: { maxRequests: 20, windowSeconds: 60 },
}

export class RateLimitError extends Error {
  constructor(
    public retryAfter: number,
    message = "Too many requests. Please try again later."
  ) {
    super(message)
    this.name = "RateLimitError"
  }
}

export function getClientIp(request: Request | NextRequest): string {
  const cfIp = request.headers.get("cf-connecting-ip")
  if (cfIp) return cfIp.trim()

  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp.trim()

  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim()
    if (firstIp && !isPrivateIp(firstIp)) return firstIp
  }

  return "unknown"
}

function isPrivateIp(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.") || ip.startsWith("172.17.") || ip.startsWith("172.18.") ||
    ip.startsWith("172.19.") || ip.startsWith("172.20.") || ip.startsWith("172.21.") ||
    ip.startsWith("172.22.") || ip.startsWith("172.23.") || ip.startsWith("172.24.") ||
    ip.startsWith("172.25.") || ip.startsWith("172.26.") || ip.startsWith("172.27.") ||
    ip.startsWith("172.28.") || ip.startsWith("172.29.") || ip.startsWith("172.30.") ||
    ip.startsWith("172.31.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("::ffff:127.") || ip.startsWith("::ffff:10.") ||
    ip.startsWith("::ffff:172.16.") || ip.startsWith("::ffff:192.168.")
  )
}

function shouldBypassRateLimit(identifier: string): boolean {
  return identifier === "127.0.0.1" || identifier === "::1"
}

// ── In-memory rate limiter (primary) ──
// Uses a sliding window counter per identifier.
// Each serverless Lambda instance has its own cache, so under extreme concurrency
// some over-counting is possible — this is an acceptable trade-off to avoid
// hitting the database on every request (which was the previous bottleneck).
const rateLimitCache = new Map<string, { count: number; windowStart: number }>()

// Periodic cleanup to prevent memory leaks — runs once per minute
const CLEANUP_INTERVAL_MS = 60_000
let lastCleanup = Date.now()

function cleanupRateLimitCache(): void {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  const cutoff = now - 120_000 // Keep entries up to 2 min old
  for (const [key, entry] of rateLimitCache) {
    if (entry.windowStart < cutoff) {
      rateLimitCache.delete(key)
    }
  }
}

/**
 * Fast in-memory rate limiter. Returns true if the request is allowed,
 * false if it exceeds the rate limit.
 *
 * Falls back to DB-based rate limiting only when the in-memory path indicates
 * the limit has been exceeded (defense-in-depth).
 */
export async function rateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  if (shouldBypassRateLimit(identifier)) return true

  const now = Date.now()
  const windowMs = windowSeconds * 1000

  // ── In-memory check (fast path) ──
  cleanupRateLimitCache()

  const existing = rateLimitCache.get(identifier)
  if (existing) {
    if (now - existing.windowStart > windowMs) {
      // Window expired — reset
      rateLimitCache.set(identifier, { count: 1, windowStart: now })
      return true
    }
    if (existing.count >= maxRequests) {
      // In-memory says exceeded — verify against DB before denying
      // (defense-in-depth against per-instance skew)
      return dbRateLimitFallback(identifier, maxRequests, windowSeconds, false)
    }
    existing.count++
    return true
  }

  // First request from this identifier
  rateLimitCache.set(identifier, { count: 1, windowStart: now })
  return true
}

/**
 * DB-backed rate limit fallback. Used when the in-memory limiter flags
 * a possible overlimit — verifies against the database to avoid
 * false positives from per-Lambda-instance state.
 */
async function dbRateLimitFallback(
  identifier: string,
  maxRequests: number,
  windowSeconds: number,
  isInitial: boolean
): Promise<boolean> {
  try {
    const supabase = createAdminClient()
    const now = new Date()
    const windowStart = new Date(now.getTime() - windowSeconds * 1000)

    const { count, error } = await supabase
      .from("rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("identifier", identifier)
      .eq("endpoint", "__generic__")
      .gte("window_start", windowStart.toISOString())

    if (error) {
      // DB unreachable — allow in degraded mode
      if (process.env.NODE_ENV !== "production") console.error("[rate-limiter] DB fallback failed:", error.message)
      return true
    }

    if ((count ?? 0) >= maxRequests) {
      return false
    }

    if (!isInitial) {
      // Only write to DB on the fallback path (minimizes writes)
      const { error: insertError } = await supabase.from("rate_limits").insert({
        identifier,
        endpoint: "__generic__",
        request_count: 1,
        window_start: now.toISOString(),
      })
      if (insertError && process.env.NODE_ENV !== "production") {
        console.error("[rate-limiter] DB fallback insert failed:", insertError.message)
      }
    }

    return true
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("[rate-limiter] DB fallback error:", err)
    return true
  }
}

// ── DB-backed rate limiter for admin/security endpoints ──
// This is the original checkRateLimit kept for endpoints that need
// strict, persistent rate limiting (login, superadmin writes, etc.)

export async function checkRateLimit(
  request: Request,
  tier: keyof typeof DEFAULTS = "default",
  userId?: string
): Promise<void> {
  const config = DEFAULTS[tier] || DEFAULTS.default
  const ip = getClientIp(request)

  if (shouldBypassRateLimit(ip)) return

  const identifier = userId ? `${ip}:${userId}` : ip

  // Try in-memory first
  const inMemoryAllowed = await rateLimit(identifier, config.maxRequests, config.windowSeconds)
  if (!inMemoryAllowed) {
    throw new RateLimitError(config.windowSeconds)
  }
}

export function rateLimitMiddleware(handler: Function, tier?: string) {
  return async (request: Request, ...args: any[]) => {
    try {
      await checkRateLimit(request, tier as any)
      return handler(request, ...args)
    } catch (err) {
      if (err instanceof RateLimitError) {
        return new Response(
          JSON.stringify({
            error: "RATE_LIMITED",
            message: err.message,
            retryAfter: err.retryAfter,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(err.retryAfter),
            },
          }
        )
      }
      throw err
    }
  }
}
