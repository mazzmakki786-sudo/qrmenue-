import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

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
        setAll(cookiesToSet: { name: string; value: string }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Only recreate response if setAll was not called before,
          // to avoid losing previously set headers/cookies
          if (cookiesToSet.length > 0) {
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value }) =>
              supabaseResponse.cookies.set(name, value)
            )
          }
        },
      },
    }
  )

  let user: any = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (err) {
    console.error("[middleware] getUser failed:", err)
    // Fall through — allow the request to proceed, client-side will handle auth
  }

  const pathname = request.nextUrl.pathname

  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login?redirect=/dashboard", request.url))
    }
    try {
      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle()
      if (!restaurant) {
        // User is logged in but doesn't own a restaurant — redirect to customer home
        return NextResponse.redirect(new URL("/restaurants", request.url))
      }
    } catch (err) {
      console.error("[middleware] restaurant check failed:", err)
      // Pass through — let the client-side handle it with a retry
    }
  }

  if (pathname.startsWith("/account")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login/customer?redirect=/account", request.url))
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
    try {
      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle()
      if (!restaurant) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      // Set headers directly on request AND rebuild supabaseResponse so
      // downstream route handlers receive the custom headers even if setAll
      // recreated the response after getUser().
      request.headers.set("x-owner-id", user.id)
      request.headers.set("x-restaurant-id", restaurant.id)
      supabaseResponse = NextResponse.next({ request: { ...request, headers: request.headers } })
    } catch (err) {
      console.error("[middleware] api/owner restaurant fetch failed:", err)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  return supabaseResponse
}
