"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { getEffectiveLimits } from "@/lib/subscription"
import { LimitStepper } from "./LimitStepper"
import { Badge } from "@/components/ui/badge"
import { Search, Sparkles, RotateCcw, Loader2 } from "lucide-react"

interface CreditsRow {
  id: string
  name: string
  slug: string
  owner_id: string | null
  city: string
  plan: string
  plan_limits_override: Record<string, number> | null
  ai_usage: number
  dish_count: number
  image_count: number
  order_count: number
}

interface Props {
  users: Record<string, { email: string; last_sign_in_at: string | null }>
}

const planBadgeVariant: Record<string, "trial" | "starter" | "growth" | "premium"> = {
  trial: "trial",
  starter: "starter",
  growth: "growth",
  premium: "premium",
}

export function LimitsCredits({ users }: Props) {
  const [rows, setRows] = useState<CreditsRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [savingId, setSavingId] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchRows = useCallback(async () => {
    try {
      const res = await fetch("/api/superadmin/credits")
      if (res.ok) {
        const json = await res.json()
        setRows(json.data || [])
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  const scheduleRefetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchRows(), 400)
  }, [fetchRows])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(uid("limits-credits-changes"))
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurants" }, scheduleRefetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "ai_poster_generations" }, scheduleRefetch)
      .subscribe()
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      supabase.removeChannel(channel)
    }
  }, [scheduleRefetch])

  const applyChange = async (id: string, changes: Record<string, number>) => {
    setSavingId(id)
    try {
      const res = await fetch("/api/superadmin/credits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId: id, changes }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        window.alert(json?.error || "Failed to update limits")
      }
      await fetchRows()
    } catch {
      window.alert("Failed to update limits")
    } finally {
      setSavingId(null)
    }
  }

  const resetOverrides = async (id: string, name: string) => {
    if (!window.confirm(`Reset "${name}" back to its plan's default limits?`)) return
    setSavingId(id)
    try {
      await fetch("/api/superadmin/credits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId: id, reset: true }),
      })
      await fetchRows()
    } catch {
      window.alert("Failed to reset limits")
    } finally {
      setSavingId(null)
    }
  }

  const filtered = rows.filter((r) => {
    const ownerEmail = (r.owner_id && users[r.owner_id]?.email) || ""
    return (
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.slug.toLowerCase().includes(search.toLowerCase()) ||
      ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, slug, owner email, or city..."
            className="w-full h-11 pl-10 pr-4 rounded-[10px] bg-white border border-[#E8E8E8] text-sm placeholder:text-[#999] focus:outline-none focus:border-black transition-colors"
          />
        </div>
        <button
          onClick={() => fetchRows()}
          className="shrink-0 text-xs font-semibold border border-black rounded-lg px-3 h-10 hover:opacity-70 transition-opacity flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
          Refresh
        </button>
      </div>

      {loading && rows.length === 0 ? (
        <div className="space-y-4">
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-12 text-center">
          <p className="text-[#999] text-sm">No restaurants match your search</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => {
            const effective = getEffectiveLimits(r.plan as any, r.plan_limits_override)
            const owner = r.owner_id ? users[r.owner_id] : undefined
            const creditsPercent =
              effective.aiGenerationsPerMonth > 0
                ? Math.min(100, (r.ai_usage / effective.aiGenerationsPerMonth) * 100)
                : 0
            const creditsExhausted = r.ai_usage >= effective.aiGenerationsPerMonth

            return (
              <div key={r.id} className="bg-white rounded-[14px] border border-[#E8E8E8] p-4 md:p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/superadmin/restaurants/${r.id}`} className="font-semibold hover:underline text-sm">
                        {r.name}
                      </Link>
                      <Badge variant={planBadgeVariant[r.plan] || "starter"} className="capitalize">
                        {r.plan}
                      </Badge>
                      {r.plan_limits_override && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF7ED] text-[#9A3412] font-semibold">
                          Custom limits
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#999] mt-0.5">
                      /{r.slug} · {owner?.email || "No owner"} · {r.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {savingId === r.id && <Loader2 className="w-4 h-4 animate-spin text-[#999]" />}
                    <button
                      onClick={() => resetOverrides(r.id, r.name)}
                      disabled={savingId === r.id || !r.plan_limits_override}
                      className="text-[10px] font-semibold text-[#9A3412] border border-[#D97706]/30 rounded-lg px-2.5 h-7 hover:bg-[#FFF7ED] disabled:opacity-40 transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset to plan
                    </button>
                  </div>
                </div>

                {/* AI credits — headline */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-black flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> AI Poster Credits
                    </span>
                    <span className={`text-[11px] font-medium tabular-nums ${creditsExhausted ? "text-[#DC2626]" : "text-[#555]"}`}>
                      {r.ai_usage} / {effective.aiGenerationsPerMonth === Infinity ? "∞" : effective.aiGenerationsPerMonth} used
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#F0F0F0] overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        creditsExhausted ? "bg-[#DC2626]" : effective.aiGenerationsPerMonth > 0 && r.ai_usage / effective.aiGenerationsPerMonth > 0.7 ? "bg-[#D97706]" : "bg-black"
                      }`}
                      style={{ width: `${creditsPercent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#999]">
                    Monthly allowance. Resets on the 1st. Failed generations don&apos;t count.
                  </p>
                </div>

                {/* Steppers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <LimitStepper
                    label="AI Credits / mo"
                    value={effective.aiGenerationsPerMonth}
                    accent
                    disabled={savingId === r.id}
                    onChange={(v) => applyChange(r.id, { aiGenerationsPerMonth: v })}
                  />
                  <LimitStepper
                    label="Images"
                    value={effective.maxImages}
                    used={r.image_count}
                    disabled={savingId === r.id}
                    onChange={(v) => applyChange(r.id, { maxImages: v })}
                  />
                  <LimitStepper
                    label="Dishes"
                    value={effective.maxDishes}
                    used={r.dish_count}
                    disabled={savingId === r.id}
                    onChange={(v) => applyChange(r.id, { maxDishes: v })}
                  />
                  <LimitStepper
                    label="Orders"
                    value={effective.maxOrders}
                    used={r.order_count}
                    disabled={savingId === r.id}
                    onChange={(v) => applyChange(r.id, { maxOrders: v })}
                  />
                  <LimitStepper
                    label="Categories"
                    value={effective.maxCategories}
                    disabled={savingId === r.id}
                    onChange={(v) => applyChange(r.id, { maxCategories: v })}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}