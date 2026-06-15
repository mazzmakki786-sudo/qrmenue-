import { createAdminClient } from "@/lib/supabase/server"
import { type NextRequest } from "next/server"

export interface RateLimitConfig {
  maxRequests: number
  windowSeconds: number
}

const DEFAULTS: Record<string, RateLimitConfig> = {
  "superadmin:write": { maxRequests: 30, windowSeconds: 60 },
  "superadmin:read": { maxRequests: 100, windowSeconds: 60 },
  "orders:create": { maxRequests: 20, windowSeconds: 60 },
  "owner:write": { maxRequests: 60, windowSeconds: 60 },
  default: { maxRequests: 60, windowSeconds: 60 },
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
  return "unknown"
}

export async function rateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
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

    if (error) return false

    if ((count ?? 0) >= maxRequests) {
      return false
    }

    await supabase.from("rate_limits").insert({
      identifier,
      endpoint: "__generic__",
      request_count: 1,
      window_start: now.toISOString(),
    })

    return true
  } catch {
    return false
  }
}

export async function checkRateLimit(
  request: Request,
  tier: keyof typeof DEFAULTS = "default"
): Promise<void> {
  const config = DEFAULTS[tier] || DEFAULTS.default
  const identifier = getClientIp(request)
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

  if (error) return

  if ((count ?? 0) >= config.maxRequests) {
    throw new RateLimitError(config.windowSeconds)
  }

  await supabase.from("rate_limits").insert({
    identifier,
    endpoint,
    request_count: 1,
    window_start: now.toISOString(),
  })
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