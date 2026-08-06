import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { fetchOwnerRestaurant } from "@/lib/owner-restaurant"
import { createLogger } from "@/lib/logger"

const log = createLogger("auth-callback")

// Only honor a redirect target that points into the dashboard or signup flow.
// Anything else is ignored so an attacker-supplied `?redirect=` value can
// never bounce the user to an arbitrary URL.
function isSafeRedirectPath(path: string): boolean {
  return (
    path.startsWith("/dashboard") ||
    path.startsWith("/signup") ||
    path === "/onboarding"
  )
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const redirectParam = searchParams.get("redirect")

  let redirectTo = "/login?error=auth_callback_error"

  // Accumulate EVERY cookie Supabase wants to set across all setAll() calls.
  // exchangeCodeForSession() calls setAll() multiple times (session tokens,
  // then code-verifier cleanup), and recreating the response on each call
  // would discard earlier cookies — breaking the session for sign-ins.
  let authCookies: { name: string; value: string; options?: any }[] = []

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            // Merge, don't overwrite: later setAll() calls (e.g. code-verifier
            // cleanup) must not discard the session cookies set earlier.
            const existing = new Map(
              authCookies.map((c) => [c.name, c] as const)
            )
            cookiesToSet.forEach((c) => existing.set(c.name, c))
            authCookies = Array.from(existing.values())
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { restaurant, error: restaurantError } = await fetchOwnerRestaurant(supabase, user.id)
        const isOwner = !!restaurant

        log.info("OAuth callback routed", {
          user_id: user.id,
          is_owner: isOwner,
          restaurant_error: restaurantError?.message ?? null,
          redirect_param: redirectParam ?? null,
        })

        if (redirectParam && isSafeRedirectPath(redirectParam)) {
          redirectTo = redirectParam
        } else {
          redirectTo = isOwner ? "/dashboard" : "/signup/restaurant"
        }
      }
    }
  }

  // Create redirect response and write ALL accumulated session cookies onto it
  // so they actually reach the browser (the server client from
  // lib/supabase/server uses next/headers cookies() which doesn't write to the
  // HTTP response in Route Handler context).
  const redirectUrl = new URL(redirectTo, origin)
  const redirectResponse = NextResponse.redirect(redirectUrl.toString(), 302)

  // Write every collected cookie (access token, refresh token, code-verifier
  // cleanup) directly onto the redirect response.
  authCookies.forEach(({ name, value, options }) => {
    redirectResponse.cookies.set(name, value, options)
  })

  return redirectResponse
}
