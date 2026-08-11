import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { fetchOwnerRestaurant } from "@/lib/owner-restaurant"

// In-memory cache for restaurant lookups in middleware.
// Short TTL (5s) keeps things fresh while reducing repeated DB queries
// on the same warm middleware instance.
const restaurantCache = new Map<string, { id: string; expiresAt: number }>()
function getCachedRestaurant(ownerId: string): string | undefined {
  const entry = restaurantCache.get(ownerId)
  if (!entry || Date.now() > entry.expiresAt) {
    restaurantCache.delete(ownerId)
    return undefined
  }
  return entry.id
}
function setCachedRestaurant(ownerId: string, restaurantId: string): void {
  restaurantCache.set(ownerId, { id: restaurantId, expiresAt: Date.now() + 5_000 })
}

// ── Short-TTL cache for auth.getUser() ──────────────────────────────────
// getUser() is a real network roundtrip to the Supabase Auth server
// (~150-400ms). Caching per session-cookie removes that from every protected
// request on a warm middleware instance. The key is derived from the Supabase
// auth cookie value, so login/logout (new/absent cookie) busts the cache
// automatically. JWTs themselves are valid for ~1h, so a 10s TTL is safe.
const USER_CACHE_TTL_MS = 10_000
const userCache = new Map<string, { user: any; expiresAt: number }>()

function getAuthCacheKey(request: NextRequest): string | null {
  // @supabase/ssr stores the session in `sb-<ref>-auth-token` (storage key is
  // derived from the project ref; verified empirically for this app). Sessions
  // whose base64url value exceeds 3180 chars are chunked into
  // `sb-<ref>-auth-token.0`, `.1`, ... (MAX_CHUNK_SIZE in @supabase/ssr) —
  // Google OAuth sessions commonly exceed this because of user_metadata +
  // identities. Strip any chunk suffix before matching so chunked sessions are
  // detected; the PKCE `-code-verifier` cookie is still excluded (its base
  // name ends in `-code-verifier`, not `-auth-token`).
  const cookie = request.cookies
    .getAll()
    .find((c) => {
      if (!c.value || !c.name.startsWith("sb-")) return false
      const baseName = c.name.replace(/\.\d+$/, "")
      return baseName.endsWith("-auth-token")
    })
  if (!cookie) return null
  return `${cookie.name}:${cookie.value.slice(0, 48)}`
}

function getCachedUser(request: NextRequest): any | undefined {
  const key = getAuthCacheKey(request)
  if (!key) return undefined
  const entry = userCache.get(key)
  if (!entry || Date.now() > entry.expiresAt) {
    userCache.delete(key ?? "")
    return undefined
  }
  return entry.user
}

function setCachedUser(request: NextRequest, user: any): void {
  const key = getAuthCacheKey(request)
  if (!key) return
  userCache.set(key, { user, expiresAt: Date.now() + USER_CACHE_TTL_MS })
}

// Resolve the restaurant id for an owner from cache, falling back to a
// duplicate-safe DB query (see fetchOwnerRestaurant). Returns { id } or null.
// Distinguishes "owner has no restaurant" (clean, null) from "query failed"
// ({ error: true, id: null }) so callers never redirect a user to restaurant
// creation merely because a lookup errored.
async function getOwnerRestaurantId(
  supabase: ReturnType<typeof createServerClient>,
  request: NextRequest,
  user: any
): Promise<{ id: string | null; error: boolean }> {
  const cachedId = getCachedRestaurant(user.id)
  if (cachedId) return { id: cachedId, error: false }
  try {
    const { restaurant } = await fetchOwnerRestaurant(supabase, user.id)
    if (restaurant?.id) {
      setCachedRestaurant(user.id, restaurant.id)
      return { id: restaurant.id, error: false }
    }
    return { id: null, error: false }
  } catch (err) {
    console.error("[middleware] restaurant check failed:", err)
    return { id: null, error: true }
  }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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
          // Only recreate response if setAll was not called before,
          // to avoid losing previously set headers/cookies
          if (cookiesToSet.length > 0) {
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          }
        },
      },
    }
  )

  let user: any = null
  const authCookieKey = getAuthCacheKey(request)
  if (!authCookieKey) {
    // No Supabase session cookie present → skip the Auth-server roundtrip
    // entirely. Without a session, getUser() can never return a user anyway.
    user = null
  } else {
    const cachedUser = userCache.get(authCookieKey)
    if (cachedUser && Date.now() <= cachedUser.expiresAt) {
      user = cachedUser.user
    } else {
      if (cachedUser) userCache.delete(authCookieKey)
      try {
        const { data } = await supabase.auth.getUser()
        user = data.user
        setCachedUser(request, user)
      } catch (err) {
        console.error("[middleware] getUser failed:", err)
        // Fall through — allow the request to proceed, client-side will handle auth
      }
    }
  }

  const pathname = request.nextUrl.pathname

  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login?redirect=/dashboard", request.url))
    }
    const { id: ownerRestaurantId, error: restaurantLookupFailed } = await getOwnerRestaurantId(supabase, request, user)
    if (restaurantLookupFailed) {
      // Query failed (RLS/network/transient) — never redirect a valid owner to
      // restaurant creation. Allow the request to proceed; the client-side
      // dashboard will surface the actual error.
      return supabaseResponse
    }
    if (!ownerRestaurantId) {
      // User is logged in but genuinely owns no restaurant — redirect to signup
      return NextResponse.redirect(new URL("/signup/restaurant", request.url))
    }
  }

  // Standalone owner onboarding wizard (outside dashboard chrome).
  // Must be signed in; signed-in users without a restaurant are sent to signup.
  if (pathname.startsWith("/onboarding")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    const { id: ownerRestaurantId, error: restaurantLookupFailed } = await getOwnerRestaurantId(supabase, request, user)
    if (restaurantLookupFailed) {
      return supabaseResponse
    }
    if (!ownerRestaurantId) {
      return NextResponse.redirect(new URL("/signup/restaurant", request.url))
    }
  }

  if (pathname.startsWith("/account")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login/customer?redirect=/account", request.url))
    }
  }

  // A user who already has a customer account cannot become a restaurant owner,
  // and an existing restaurant owner must never see the signup form again
  // (RLS would allow a duplicate restaurant). Both are clean UX guards.
  if (pathname.startsWith("/signup/restaurant")) {
    if (user) {
      const { id: ownerRestaurantId, error: restaurantLookupFailed } = await getOwnerRestaurantId(supabase, request, user)
      // If the lookup failed, fall through and let the client-side signup page
      // surface the error — never assume "no restaurant" from a failed query.
      if (!restaurantLookupFailed && ownerRestaurantId) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
      try {
        const { data: existingCustomer } = await supabase
          .from("customers")
          .select("id")
          .eq("id", user.id)
          .maybeSingle()
        if (existingCustomer) {
          return NextResponse.redirect(new URL("/account", request.url))
        }
      } catch (err) {
        console.error("[middleware] customer check failed:", err)
        // Pass through — let the client-side guard handle it
      }
    }
  }

  if (pathname.startsWith("/superadmin") && !pathname.startsWith("/api/") && pathname !== "/superadmin") {
    if (!user) {
      return NextResponse.redirect(new URL("/superadmin", request.url))
    }
  }

  if (pathname.startsWith("/api/owner")) {
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id: ownerRestaurantId, error: restaurantLookupFailed } = await getOwnerRestaurantId(supabase, request, user)
    if (restaurantLookupFailed) {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
    if (!ownerRestaurantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    // Set headers directly on request AND rebuild supabaseResponse so
    // downstream route handlers receive the custom headers even if setAll
    // recreated the response after getUser().
    request.headers.set("x-owner-id", user.id)
    request.headers.set("x-restaurant-id", ownerRestaurantId)
    supabaseResponse = NextResponse.next({ request: { ...request, headers: request.headers } })
    return supabaseResponse
  }

  return supabaseResponse
}
