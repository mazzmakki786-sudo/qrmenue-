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
  const [whatsapp, setWhatsapp] = useState(whatsappNumber || "")

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/plans")
      if (res.ok) {
        const data = await res.json()
        if (data.plans && Array.isArray(data.plans)) {
          setPlans(mergeYearlyPlans(data.plans))
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

  const handleSelectPlan = (planId: string, isYearly?: boolean) => {
    if (planId === "trial") return
    if (!whatsapp) return
    const plan = plans.find(p => p.id === planId)
    if (!plan) return
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
    const period = isYearly ? "yearly" : "monthly"
    const msg = `Hi, I'm interested in the ${plan.name} plan (${period}: ${price}). Please activate my plan.`
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, "_blank")
  }

  if (!plans.length) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400 text-lg animate-pulse">Loading plans...</div>
      </div>
    )
  }

  return <Pricing2 heading={heading} description={description} plans={plans} onSelectPlan={handleSelectPlan} data-testid="pricing-section" />
}
