"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { AIPosterGenerator } from "@/components/owner/AIPosterGenerator"
import { PosterCard } from "@/components/owner/PosterCard"
import { Sparkles } from "lucide-react"
import type { Database } from "@/types/supabase"

type Generation = Database["public"]["Tables"]["ai_poster_generations"]["Row"]

interface UsageState {
  usage: number
  limit: number
}

export default function AIPostersPage() {
  const { restaurant, plan, isExpired, isSuspended } = useSubscription()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [usage, setUsage] = useState<UsageState>({ usage: 0, limit: 0 })
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const refreshHistory = useCallback(async () => {
    if (!restaurant?.id) return
    const supabase = createClient()
    const { data } = await supabase
      .from("ai_poster_generations")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false })
      .limit(50)
    if (data) setGenerations(data)
  }, [restaurant?.id])

  const loadUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/owner/ai/generations")
      if (res.ok) {
        const json = await res.json()
        setUsage({ usage: json.usage ?? 0, limit: json.limit ?? 0 })
      }
    } catch {}
  }, [])

  useEffect(() => {
    refreshHistory()
    loadUsage()
  }, [refreshHistory, loadUsage])

  // Realtime — live-update when a generation completes / fails
  useEffect(() => {
    if (!restaurant?.id) return
    const supabase = createClient()
    const channel = supabase
      .channel(`ai-posters-${restaurant.id}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ai_poster_generations",
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        () => {
          refreshHistory()
          loadUsage()
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [restaurant?.id, refreshHistory, loadUsage])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await fetch(`/api/owner/ai/generations/${id}`, { method: "DELETE" })
      setGenerations((prev) => prev.filter((g) => g.id !== id))
      loadUsage()
    } finally {
      setDeletingId(null)
    }
  }

  const blocked = isExpired || isSuspended
  const percent = usage.limit > 0 ? Math.min(100, (usage.usage / usage.limit) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#111]">AI Posters</h1>
          <p className="text-sm text-[#666]">
            Generate restaurant posters from your menu with AI
          </p>
        </div>
      </div>

      {/* ── Monthly usage bar ── */}
      <div className="bg-white rounded-2xl border border-[#EDEDED] p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-[#333]">
            Monthly usage
          </span>
          <span className="text-sm text-[#666]">
            {usage.usage} / {usage.limit} generated
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-[#F0F0F0] overflow-hidden">
          <div
            className="h-full rounded-full bg-black transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-[#999] mt-2">
          Resets on the 1st of every month. Failed attempts don&apos;t count. Plan:{" "}
          <span className="capitalize font-medium text-[#333]">{plan}</span>
        </p>
      </div>

      {blocked ? (
        <div className="bg-white rounded-2xl border border-[#EDEDED] p-8 text-center">
          <p className="text-sm text-[#666]">
            Your subscription has expired. Renew your plan to use AI Posters.
          </p>
        </div>
      ) : (
        <AIPosterGenerator
          onGenerated={(gen) => {
            setGenerations((prev) => [gen as Generation, ...prev])
          }}
          remaining={usage.limit - usage.usage}
          limit={usage.limit}
          onUsageChange={(u) => setUsage(u)}
        />
      )}

      {/* ── History ── */}
      <div>
        <h2 className="text-base font-bold text-[#111] mb-3">
          Your Posters <span className="text-[#999] font-normal">({generations.length})</span>
        </h2>
        {generations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-[#E5E5E5] p-10 text-center">
            <Sparkles className="w-8 h-8 text-[#CCC] mx-auto mb-3" />
            <p className="text-sm text-[#666]">
              No posters yet — generate your first one above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {generations.map((gen) => (
              <PosterCard
                key={gen.id}
                gen={gen}
                restaurantName={restaurant?.name || "Our Restaurant"}
                onDelete={handleDelete}
                deleting={deletingId === gen.id}
              />
            ))}
          </div>
        )}
        {loading && generations.length === 0 && (
          <p className="text-sm text-[#999] text-center py-8">Loading…</p>
        )}
      </div>
    </div>
  )
}
