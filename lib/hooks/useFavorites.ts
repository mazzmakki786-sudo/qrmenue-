"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load favorites on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setFavoriteIds(new Set())
        setLoading(false)
        return
      }

      try {
        const res = await fetch("/api/favorites")
        const data = await res.json()
        setFavoriteIds(new Set<string>(data.favorites || []))
      } catch {
        setFavoriteIds(new Set())
      }
      setLoading(false)
    }
    load()
  }, [])

  const toggleFavorite = useCallback(async (restaurantId: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Redirect to login
      router.push("/login?redirect=/restaurants")
      return
    }

    // Optimistic update
    const wasFavorited = favoriteIds.has(restaurantId)
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (wasFavorited) {
        next.delete(restaurantId)
      } else {
        next.add(restaurantId)
      }
      return next
    })

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id: restaurantId }),
      })

      if (!res.ok) {
        // Revert on error
        setFavoriteIds((prev) => {
          const next = new Set(prev)
          if (wasFavorited) {
            next.add(restaurantId)
          } else {
            next.delete(restaurantId)
          }
          return next
        })

        const data = await res.json()
        if (res.status === 401) {
          router.push("/login?redirect=/restaurants")
        }
        return
      }

      const data = await res.json()
      // Ensure state matches server
      if (data.favorited) {
        setFavoriteIds((prev) => new Set(prev).add(restaurantId))
      } else {
        setFavoriteIds((prev) => {
          const next = new Set(prev)
          next.delete(restaurantId)
          return next
        })
      }
    } catch {
      // Revert on network error
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        if (wasFavorited) {
          next.add(restaurantId)
        } else {
          next.delete(restaurantId)
        }
        return next
      })
    }
  }, [favoriteIds, router])

  const isFavorited = useCallback(
    (restaurantId: string) => favoriteIds.has(restaurantId),
    [favoriteIds]
  )

  return { favoriteIds, toggleFavorite, isFavorited, loading }
}
