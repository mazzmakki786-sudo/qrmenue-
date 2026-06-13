"use client"

import { useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

type ChannelSetup = (on: <T extends Record<string, unknown>>(
  event: "*" | "INSERT" | "UPDATE" | "DELETE",
  table: string,
  filter: string | undefined,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
) => void) => void

export function useRealtimeChannel(
  name: string,
  setup: ChannelSetup,
  deps: React.DependencyList = []
) {
  const idRef = useRef(0)

  useEffect(() => {
    idRef.current += 1
    const supabase = createClient()
    const channel = supabase.channel(`${name}-${idRef.current}-${Date.now()}`)

    setup((event, table, filter, callback) => {
      const opts: Record<string, any> = {
        event,
        schema: "public",
        table,
      }
      if (filter) opts.filter = filter
      channel.on("postgres_changes", opts, callback as any)
    })

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, deps)
}
