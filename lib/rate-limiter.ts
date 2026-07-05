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
  "ai:generate": { maxRequests: 5, windowSeconds: 60 },
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

export async function rateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  if (shouldBypassRateLimit(identifier)) return true

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
      if (process.env.NODE_ENV !== "production") console.error("[rate-limiter] DB query failed, denying request:", error.message)
      return false
    }

    if ((count ?? 0) >= maxRequests) {
      return false
    }

    // NOTE: This inserts a row per request. For high-traffic endpoints,
    // consider a cleanup job or TTL-based partitioning to prevent unbounded
    // growth of the rate_limits table. The table uses window_start for
    // windowed lookups; rows older than the largest window (60s) can be pruned.
    const { error: insertError } = await supabase.from("rate_limits").insert({
      identifier,
      endpoint: "__generic__",
      request_count: 1,
      window_start: now.toISOString(),
    })

    if (insertError) {
      if (process.env.NODE_ENV !== "production") console.error("[rate-limiter] DB insert failed:", insertError.message)
    }

    return true
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("[rate-limiter] Unexpected error, denying request:", err)
    return false
  }
}

export async function checkRateLimit(
  request: Request,
  tier: keyof typeof DEFAULTS = "default",
  userId?: string
): Promise<void> {
  const config = DEFAULTS[tier] || DEFAULTS.default
  const ip = getClientIp(request)

  if (shouldBypassRateLimit(ip)) return

  const identifier = userId ? `${ip}:${userId}` : ip
  const url = new URL(request.url)
  const endpoint = url.pathname

  const supabase = createAdminClient()
  const now = new Date()
  const windowStart = new Date(now.getTime() - config.windowSeconds * 1000)

  const { count, error } = await supabase
    .from("rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("identifier", identifier)
    .eq("endpoint", endpoint)
    .gte("window_start", windowStart.toISOString())

  if (error) {
    if (process.env.NODE_ENV !== "production") console.error("[rate-limiter] checkRateLimit DB error, denying request:", error.message)
    throw new RateLimitError(config.windowSeconds, "Rate limit check failed. Please try again.")
  }

  if ((count ?? 0) >= config.maxRequests) {
    throw new RateLimitError(config.windowSeconds)
  }

  const { error: insertError } = await supabase.from("rate_limits").insert({
    identifier,
    endpoint,
    request_count: 1,
    window_start: now.toISOString(),
  })

  if (insertError) {
    if (process.env.NODE_ENV !== "production") console.error("[rate-limiter] checkRateLimit insert failed:", insertError.message)
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