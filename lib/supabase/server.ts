import { createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"
import { cache } from "react"

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Can only be modified in a Server Action or Route Handler
          }
        },
      },
    }
  )
}

/**
 * Creates a Supabase client using the pgBouncer connection pooler.
 * Use this for serverless/edge contexts where direct connections are limited.
 *
 * The pooler multiplexes many short-lived connections over fewer persistent
 * PostgreSQL connections, preventing connection exhaustion under high concurrency.
 *
 * Requires SUPABASE_POOL_URL env var:
 *   postgres://postgres.[project-ref]:[password]@[project-ref]-pooler.supabase.co:6543/postgres?pgbouncer=true
 *
 * Falls back to createAdminClient() if pool URL is not configured.
 */
export function createPooledClient() {
  const poolUrl = process.env.SUPABASE_POOL_URL
  if (!poolUrl) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[supabase] SUPABASE_POOL_URL not set — falling back to direct admin client")
    }
    return createAdminClient()
  }

  return createSupabaseClient(
    poolUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: "public",
      },
    }
  )
}

export function createRouteClient(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  return { supabase, supabaseResponse }
}

export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    }
  )
}

/**
 * Cached version of createClient for use in server components.
 * React cache() deduplicates calls within the same render pass.
 */
export const getCachedClient = cache(async () => {
  return createClient()
})

/**
 * Cached version of createAdminClient for use in server components.
 */
export const getCachedAdminClient = cache(() => {
  return createAdminClient()
})
