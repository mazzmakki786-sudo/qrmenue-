import { NextResponse } from "next/server"

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.NEXT_PUBLIC_SITE_URL,
  "http://localhost:3000",
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : []),
].filter(Boolean) as string[]

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

function __isStateChangingMethod(method: string): boolean {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())
}
