import { createAdminClient } from "@/lib/supabase/server"
import { type NextRequest } from "next/server"

export interface RateLimitConfig {
  maxRequests: number
  windowSeconds: number
}

const DEFAULTS: Record<string, RateLimitConfig> = {
  "superadmin:write": { maxRequests: 15, windowSeconds: 60 },
  "superadmin:read": { maxRequests: 60, windowSeconds: 60 },
  "orders:create": { maxRequests: 20, windowSeconds: 60 },
  "orders:update": { maxRequests: 20, windowSeconds: 60 },
  "orders:check": { maxRequests: 30, windowSeconds: 60 },
  "owner:write": { maxRequests: 30, windowSeconds: 60 },
  "owner:read": { maxRequests: 60, windowSeconds: 60 },
  "admin:write": { maxRequests: 15, windowSeconds: 60 },
  "menu:read": { maxRequests: 60, windowSeconds: 60 },
  "notifications:send": { maxRequests: 10, windowSeconds: 60 },
  "settings:read": { maxRequests: 30, windowSeconds: 60 },
  default: { maxRequests: 30, windowSeconds: 60 },
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
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp
  const cfIp = request.headers.get("cf-connecting-ip")
  if (cfIp) return cfIp
  return "unknown"
}

function shouldBypassRateLimit(identifier: string): boolean {
  return identifier === "unknown" || identifier === "127.0.0.1" || identifier === "::1"
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
      console.error("[rate-limiter] DB query failed, denying request:", error.message)
      return false
    }

    if ((count ?? 0) >= maxRequests) {
      return false
    }

    const { error: insertError } = await supabase.from("rate_limits").insert({
      identifier,
      endpoint: "__generic__",
      request_count: 1,
      window_start: now.toISOString(),
    })

    if (insertError) {
      console.error("[rate-limiter] DB insert failed:", insertError.message)
    }

    return true
  } catch (err) {
    console.error("[rate-limiter] Unexpected error, denying request:", err)
    return false
  }
}

export async function checkRateLimit(
  request: Request,
  tier: keyof typeof DEFAULTS = "default"
): Promise<void> {
  const config = DEFAULTS[tier] || DEFAULTS.default
  const identifier = getClientIp(request)

  if (shouldBypassRateLimit(identifier)) return

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
    console.error("[rate-limiter] checkRateLimit DB error, denying request:", error.message)
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
    console.error("[rate-limiter] checkRateLimit insert failed:", insertError.message)
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