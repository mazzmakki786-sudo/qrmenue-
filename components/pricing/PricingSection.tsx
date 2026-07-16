"use client"

import { useEffect, useState, useCallback, startTransition } from "react"
import { Pricing2 } from "@/components/ui/pricing-cards"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { mapPlan, type DBPlan, type PricingPlan } from "@/lib/map-plans"

interface PricingSectionProps {
  heading?: string
  description?: string
  initialPlans?: PricingPlan[]
}

export { type DBPlan, type PricingPlan, mapPlan }

export function PricingSection({ heading, description, initialPlans }: PricingSectionProps) {
  const [plans, setPlans] = useState<PricingPlan[]>(initialPlans || [])

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/plans")
      if (res.ok) {
        const data = await res.json()
        if (data.plans && Array.isArray(data.plans)) {
          setPlans(data.plans.map(mapPlan))
        }
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    if (!initialPlans) {
      fetchPlans()
    }
  }, [initialPlans, fetchPlans])

  // Real-time subscription — instantly reflects superadmin changes
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(uid("pricing-page-plans"))
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "plans",
      }, () => {
        startTransition(() => fetchPlans())
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchPlans])

  if (!plans.length) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400 text-lg animate-pulse">Loading plans...</div>
      </div>
    )
  }

  return <Pricing2 heading={heading} description={description} plans={plans} data-testid="pricing-section" />
}
