"use client"

import { useEffect, useState, useCallback, startTransition } from "react"
import { Pricing2 } from "@/components/ui/pricing-cards"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { mapPlan, mergeYearlyPlans, type DBPlan, type PricingPlan } from "@/lib/map-plans"

interface PricingSectionProps {
  heading?: string
  description?: string
  initialPlans?: PricingPlan[]
  whatsappNumber?: string
}

export { type DBPlan, type PricingPlan, mapPlan }

export function PricingSection({ heading, description, initialPlans, whatsappNumber }: PricingSectionProps) {
  const [plans, setPlans] = useState<PricingPlan[]>(initialPlans || [])
  const [mounted, setMounted] = useState(false)
  const [whatsapp, setWhatsapp] = useState(whatsappNumber || "")

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/plans")
      if (res.ok) {
        const data = await res.json()
        if (data.plans && Array.isArray(data.plans)) {
          const merged = mergeYearlyPlans(data.plans)
          setPlans((prev) => {
            // Only update if data actually differs to avoid infinite loops
            if (JSON.stringify(prev) === JSON.stringify(merged)) return prev
            return merged
          })
        }
      }
    } catch {
      // silent
    }
  }, [])

  // Always fetch from API on mount to ensure fresh data (bypasses ISR)
  useEffect(() => {
    fetchPlans()
    setMounted(true)
  }, [fetchPlans])

  // Polling fallback — every 30s in case Realtime misses an update
  useEffect(() => {
    const interval = setInterval(() => fetchPlans(), 30000)
    return () => clearInterval(interval)
  }, [fetchPlans])

  // Fetch WhatsApp number from settings
  useEffect(() => {
    if (!whatsappNumber) {
      const fetchWhatsapp = async () => {
        try {
          const res = await fetch("/api/plans")
          if (res.ok) {
            const supabase = createClient()
            const { data } = await supabase
              .from("company_settings")
              .select("value")
              .eq("key", "whatsapp_support")
              .single()
            if (data?.value) {
              let num = data.value.replace(/[^0-9]/g, "")
              if (num.startsWith("0")) num = "92" + num.slice(1)
              setWhatsapp(num)
            }
          }
        } catch {}
      }
      fetchWhatsapp()
    }
  }, [whatsappNumber])

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
      <div className="min-h-[400px] bg-white flex items-center justify-center">
        <div className="text-[#999] text-sm animate-pulse">Loading plans...</div>
      </div>
    )
  }

  return <Pricing2 heading={heading} description={description} plans={plans} data-testid="pricing-section" />
}
