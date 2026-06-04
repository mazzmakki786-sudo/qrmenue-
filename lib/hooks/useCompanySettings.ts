"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export function useCompanySettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" })
      if (res.ok) {
        const json = await res.json()
        setSettings(json.settings || {})
      }
    } catch (e) {
      console.error("Failed to load settings", e)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSettings()

    const supabase = createClient()
    const channel = supabase
      .channel("public-company-settings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "company_settings" },
        () => fetchSettings()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchSettings])

  return { settings, loading, refresh: fetchSettings }
}
