import { NextResponse } from "next/server"
import { cookies } from "next/headers"

function buildAllowedOrigins(): string[] {
  const origins: string[] = []

  const addWithWww = (url: string) => {
    origins.push(url)
    try {
      const u = new URL(url)
      if (u.hostname.startsWith("www.")) {
        origins.push(`${u.protocol}//${u.hostname.slice(4)}`)
      } else {
        origins.push(`${u.protocol}//www.${u.hostname}`)
      }
    } catch {}
  }

  if (process.env.NEXT_PUBLIC_APP_URL) addWithWww(process.env.NEXT_PUBLIC_APP_URL)
  if (process.env.NEXT_PUBLIC_SITE_URL) addWithWww(process.env.NEXT_PUBLIC_SITE_URL)

  if (process.env.NODE_ENV !== "production") {
    origins.push("http://localhost:3000")
  }

  if (process.env.CORS_ORIGINS) {
    process.env.CORS_ORIGINS.split(",").forEach((o) => addWithWww(o.trim()))
  }

  return origins
}

const ALLOWED_ORIGINS = buildAllowedOrigins()

const CSRF_COOKIE = "qrmenu_csrf"
const CSRF_HEADER = "x-csrf-token"

function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("")
}

export function getCsrfToken(): string {
  return generateToken()
}

export async function validateCsrfToken(request: Request): Promise<{ valid: boolean; reason?: string }> {
  if (!__isStateChangingMethod(request.method)) {
    return { valid: true }
  }

  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value
  const headerToken = request.headers.get(CSRF_HEADER)

  if (!cookieToken || !headerToken) {
    return { valid: false, reason: "Missing CSRF token" }
  }

  if (cookieToken !== headerToken) {
    return { valid: false, reason: "CSRF token mismatch" }
  }

  return { valid: true }
}

export function validateCsrf(request: Request): { valid: boolean; reason?: string } {
  if (!__isStateChangingMethod(request.method)) {
    return { valid: true }
  }

  const origin = request.headers.get("origin")
  const referer = request.headers.get("referer")

  if (!origin && !referer) {
    return { valid: false, reason: "Missing Origin and Referer headers" }
  }

  const source = (origin || referer || "").toLowerCase()
  const allowed = ALLOWED_ORIGINS.some((allowedOrigin) => {
    if (!allowedOrigin) return false
    return source.startsWith(allowedOrigin.toLowerCase())
  })

  if (!allowed) {
    return { valid: false, reason: `Request from untrusted origin: ${source}` }
  }

  return { valid: true }
}

export function csrfGuard(request: Request): NextResponse | null {
  const result = validateCsrf(request)
  if (!result.valid) {
    return NextResponse.json(
      { error: "CSRF_VALIDATION_FAILED", message: result.reason },
      { status: 403 }
    )
  }
  return null
}

export function setCsrfCookie(): NextResponse {
  const token = generateToken()
  const response = NextResponse.json({ csrfToken: token })
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 3600,
  })
  return response
}

function __isStateChangingMethod(method: string): boolean {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())
}
