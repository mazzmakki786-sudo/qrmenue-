"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const FAVORITES_STORAGE_KEY = "qrmenu-favorites"
const SYNC_DEBOUNCE_MS = 120_000 // 2 minutes

function loadLocalFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY)
    return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>()
  } catch {
    return new Set<string>()
  }
}

function saveLocalFavorites(ids: Set<string>) {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...ids]))
  } catch { /* ignore */ }
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(loadLocalFavorites)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSyncRef = useRef<Set<string> | null>(null)

  // On mount: load from localStorage first, then fetch from API to reconcile
  useEffect(() => {
    const reconcile = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Not logged in — just use localStorage
        setLoading(false)
        return
      }

      try {
        const res = await fetch("/api/favorites")
        const data = await res.json()
        const serverIds = new Set<string>(data.favorites || [])
        const localIds = loadLocalFavorites()

        // Merge: server wins, but keep local additions too
        const merged = new Set([...serverIds, ...localIds])
        setFavoriteIds(merged)
        saveLocalFavorites(merged)
      } catch {
        // On error, keep local state
        setFavoriteIds(loadLocalFavorites())
      }
      setLoading(false)
    }
    reconcile()
  }, [])

  // Debounced sync to API
  const scheduleSync = useCallback((updatedIds: Set<string>) => {
    pendingSyncRef.current = updatedIds

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current)
    }

    syncTimerRef.current = setTimeout(async () => {
      const ids = pendingSyncRef.current
      if (!ids) return

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      try {
        const res = await fetch("/api/favorites/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ favorite_ids: [...ids] }),
        })
        if (!res.ok) {
          console.error("Favorites sync failed")
        }
      } catch (err) {
        console.error("Favorites sync error:", err)
      }
    }, SYNC_DEBOUNCE_MS)
  }, [])

  const toggleFavorite = useCallback(async (restaurantId: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login?redirect=/restaurants")
      return
    }

    // Optimistic local update
    const wasFavorited = favoriteIds.has(restaurantId)
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (wasFavorited) next.delete(restaurantId)
      else next.add(restaurantId)
      saveLocalFavorites(next)
      return next
    })

    // Immediately persist to DB (individual toggle)
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id: restaurantId }),
      })
      if (!res.ok) {
        // Revert on failure
        setFavoriteIds((prev) => {
          const next = new Set(prev)
          if (wasFavorited) next.add(restaurantId)
          else next.delete(restaurantId)
          saveLocalFavorites(next)
          return next
        })
      }
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        if (wasFavorited) next.add(restaurantId)
        else next.delete(restaurantId)
        saveLocalFavorites(next)
        return next
      })
    }

    // Schedule periodic sync as backup (for cross-device)
    setFavoriteIds((prev) => {
      scheduleSync(prev)
      return prev
    })
  }, [favoriteIds, router, scheduleSync])

  const isFavorited = useCallback(
    (restaurantId: string) => favoriteIds.has(restaurantId),
    [favoriteIds]
  )

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current)
      }
    }
  }, [])

  return { favoriteIds, toggleFavorite, isFavorited, loading }
}
