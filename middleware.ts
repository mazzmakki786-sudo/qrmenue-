import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // For dashboard & API owner routes, use session cookie check first (faster, no API call),
  // falling back to getUser() only when needed.
  // Custom headers (x-restaurant-id, x-owner-id) are set inside updateSession().
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/superadmin") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/api/owner") ||
    pathname.startsWith("/api/superadmin")
  ) {
    return await updateSession(request)
  }

  // For all other routes, just pass through
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/superadmin/:path*",
    "/account/:path*",
    "/api/owner/:path*",
    "/api/superadmin/:path*",
  ],
}
