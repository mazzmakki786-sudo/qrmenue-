"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

/**
 * Client-side equivalent of the old server-side homepage auth redirect.
 * Keeps `/` fully static (ISR) — no cookies() on the server — while still
 * sending logged-in owners to /dashboard after hydration.
 */
export function RedirectIfAuthed() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function check() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (cancelled || !session) return

        const { data: restaurant } = await supabase
          .from("restaurants")
          .select("id")
          .eq("owner_id", session.user.id)
          .maybeSingle()

        if (cancelled) return
        router.replace(restaurant ? "/dashboard" : "/signup/restaurant")
      } catch {
        // Never block the landing page on auth/network errors
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [router])

  return null
}
