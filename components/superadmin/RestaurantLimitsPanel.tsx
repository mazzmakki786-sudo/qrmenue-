"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { getEffectiveLimits } from "@/lib/subscription"
import { LimitStepper } from "./LimitStepper"
import { Badge } from "@/components/ui/badge"
import { Sparkles, RotateCcw, Loader2 } from "lucide-react"

interface Props {
  restaurantId: string
  /** Fired after every successful change so the page re-fetches its data. */
  onUpdated?: () => void
}

/**
 * Per-restaurant credits & limits panel (used on the superadmin detail page).
 * Lists AI poster credits + remaining limits with quick − / + steppers.
 * Persistent via restaurants.plan_limits_override, live via Supabase Realtime.
 */
export function RestaurantLimitsPanel({ restaurantId, onUpdated }: Props) {
  const [row, setRow] = useState<{
    name: string
    slug: string
    plan: string
    plan_limits_override: Record<string, number> | null
    ai_usage: number
    dish_count: number
    image_count: number
    order_count: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onUpdatedRef = useRef(onUpdated)
  useEffect(() => {
    onUpdatedRef.current = onUpdated
  }, [onUpdated])

  const fetchRow = useCallback(async () => {
    try {
      const res = await fetch("/api/superadmin/credits")
      if (res.ok) {
        const json = await res.json()
        const found = (json.data || []).find((r: any) => r.id === restaurantId)
        if (found) {
          setRow({
            name: found.name,
            slug: found.slug,
            plan: found.plan,
            plan_limits_override: found.plan_limits_override,
            ai_usage: found.ai_usage ?? 0,
            dish_count: found.dish_count ?? 0,
            image_count: found.image_count ?? 0,
            order_count: found.order_count ?? 0,
          })
        } else {
          setRow(null)
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [restaurantId])

  useEffect(() => {
    fetchRow()
  }, [fetchRow])

  const scheduleRefetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchRow()
      onUpdatedRef.current?.()
    }, 400)
  }, [fetchRow])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(uid(`restaurant-credits-${restaurantId}`))
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "restaurants",
          filter: `id=eq.${restaurantId}`,
        },
        scheduleRefetch
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ai_poster_generations",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        scheduleRefetch
      )
      .subscribe()
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      supabase.removeChannel(channel)
    }
  }, [restaurantId, scheduleRefetch])

  const applyChange = async (changes: Record<string, number>) => {
    setSaving(true)
    try {
      const res = await fetch("/api/superadmin/credits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, changes }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        window.alert(json?.error || "Failed to update limits")
      }
      await fetchRow()
      onUpdated?.()
    } catch {
      window.alert("Failed to update limits")
    } finally {
      setSaving(false)
    }
  }

  const resetOverrides = async () => {
    if (!row) return
    if (!window.confirm(`Reset "${row.name}" back to its plan's default limits?`)) return
    setSaving(true)
    try {
      await fetch("/api/superadmin/credits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, reset: true }),
      })
      await fetchRow()
      onUpdated?.()
    } catch {
      window.alert("Failed to reset limits")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="skeleton h-40 rounded-xl" />
  }
  if (!row) {
    return (
      <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-6 text-center">
        <p className="text-xs text-[#999]">No restaurant data found.</p>
      </div>
    )
  }

  const effective = getEffectiveLimits(row.plan as any, row.plan_limits_override)
  const creditsPercent =
    effective.aiGenerationsPerMonth > 0
      ? Math.min(100, (row.ai_usage / effective.aiGenerationsPerMonth) * 100)
      : 0
  const creditsExhausted = row.ai_usage >= effective.aiGenerationsPerMonth

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-semibold text-black">AI Poster Credits &amp; Limits</h4>
        <div className="flex items-center gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin text-[#999]" />}
          {row.plan_limits_override && (
            <button
              onClick={resetOverrides}
              disabled={saving}
              className="text-[10px] font-semibold text-[#9A3412] border border-[#D97706]/30 rounded-lg px-2.5 h-7 hover:bg-[#FFF7ED] disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset to plan
            </button>
          )}
        </div>
      </div>

      {/* AI credits */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-black flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> AI Poster Credits
          </span>
          <span className={`text-[11px] font-medium tabular-nums ${creditsExhausted ? "text-[#DC2626]" : "text-[#555]"}`}>
            {row.ai_usage} / {effective.aiGenerationsPerMonth === Infinity ? "∞" : effective.aiGenerationsPerMonth} used
          </span>
        </div>
        <div className="h-2 rounded-full bg-[#F0F0F0] overflow-hidden mb-1.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              creditsExhausted ? "bg-[#DC2626]" : effective.aiGenerationsPerMonth > 0 && row.ai_usage / effective.aiGenerationsPerMonth > 0.7 ? "bg-[#D97706]" : "bg-black"
            }`}
            style={{ width: `${creditsPercent}%` }}
          />
        </div>
        <p className="text-[10px] text-[#999] mb-2">
          Monthly allowance for <Badge variant="starter" className="capitalize">{row.plan}</Badge> · Resets monthly.
        </p>
        <LimitStepper
          label="AI Credits / mo"
          value={effective.aiGenerationsPerMonth}
          accent
          disabled={saving}
          onChange={(v) => applyChange({ aiGenerationsPerMonth: v })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <LimitStepper label="Images" value={effective.maxImages} used={row.image_count} disabled={saving} onChange={(v) => applyChange({ maxImages: v })} />
        <LimitStepper label="Dishes" value={effective.maxDishes} used={row.dish_count} disabled={saving} onChange={(v) => applyChange({ maxDishes: v })} />
        <LimitStepper label="Orders" value={effective.maxOrders} used={row.order_count} disabled={saving} onChange={(v) => applyChange({ maxOrders: v })} />
        <LimitStepper label="Categories" value={effective.maxCategories} disabled={saving} onChange={(v) => applyChange({ maxCategories: v })} />
      </div>
    </div>
  )
}