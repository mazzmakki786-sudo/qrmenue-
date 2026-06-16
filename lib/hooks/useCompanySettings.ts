"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"

export function useCompanySettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const fetchedOnce = useRef(false)

  const fetchSettings = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("company_settings")
        .select("key, value")

      if (error) {
        console.error("Settings fetch error:", error.message)
        return
      }

      if (data) {
        const map: Record<string, string> = {}
        data.forEach((s: any) => { map[s.key] = s.value })
        setSettings(map)
        fetchedOnce.current = true
      }
    } catch (e) {
      console.error("Failed to load settings", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()

    const supabase = createClient()
    const channel = supabase
      .channel(uid("company-settings-live"))
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "company_settings" },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const row = payload.new as any
            setSettings((prev) => ({ ...prev, [row.key]: row.value }))
          } else if (payload.eventType === "DELETE") {
            const row = payload.old as any
            setSettings((prev) => {
              const next = { ...prev }
              delete next[row.key]
              return next
            })
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          fetchSettings()
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchSettings])

  return { settings, loading, refresh: fetchSettings }
}
