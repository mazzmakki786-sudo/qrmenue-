"use client"

import { useEffect, useState, useCallback } from "react"
import { Pricing2 } from "@/components/ui/pricing-cards"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"

interface DBPlan {
  id: string
  slug: string
  name: string
  price_pkr: number
  max_dishes: number
  max_images: number
  max_orders: number
  max_categories: number
  ai_posts_per_month: number
  analytics: boolean
  custom_branding: boolean
  can_have_qr: boolean
  can_have_whatsapp: boolean
  description: string
  custom_features: string[]
}

interface PricingSectionProps {
  heading?: string
  description?: string
}

function formatLimit(val: number): string {
  if (val === -1 || val === Infinity) return "Unlimited"
  return val.toString()
}

function buildFeatures(plan: DBPlan): { text: string }[] {
  const features: { text: string }[] = []

  features.push({ text: `${formatLimit(plan.max_dishes)} dish${plan.max_dishes === 1 ? "" : "es"}` })
  features.push({ text: `${formatLimit(plan.max_categories)} categor${plan.max_categories === 1 ? "y" : "ies"}` })
  if (plan.max_images === 0) {
    features.push({ text: "No images" })
  } else {
    features.push({ text: `${formatLimit(plan.max_images)} image${plan.max_images === 1 ? "" : "s"}` })
  }
  if (plan.max_orders === -1 || plan.max_orders === Infinity) {
    features.push({ text: "Unlimited orders" })
  } else {
    features.push({ text: `${plan.max_orders} orders/mo` })
  }
  if (plan.analytics) features.push({ text: "Analytics dashboard" })
  if (plan.can_have_qr) features.push({ text: "QR code generation" })
  if (plan.can_have_whatsapp) features.push({ text: "WhatsApp orders" })
  if (plan.custom_branding) features.push({ text: "Custom branding" })
  if (plan.ai_posts_per_month > 0) {
    features.push({ text: `${plan.ai_posts_per_month} AI posts/mo` })
  }

  if (Array.isArray(plan.custom_features)) {
    for (const f of plan.custom_features) {
      if (f.trim()) features.push({ text: f.trim() })
    }
  }

  return features
}

function mapPlan(plan: DBPlan) {
  const monthlyPrice = `PKR ${plan.price_pkr.toLocaleString("en-PK")}`
  return {
    id: plan.slug,
    name: plan.name,
    description: plan.description || "",
    monthlyPrice: plan.price_pkr === 0 ? "Free" : monthlyPrice,
    yearlyPrice: plan.price_pkr === 0 ? "Free" : `PKR ${(plan.price_pkr * 12).toLocaleString("en-PK")}`,
    features: buildFeatures(plan),
    button: {
      text: plan.slug === "trial" ? "Start Free Trial" : "Choose Plan",
      url: plan.slug === "trial" ? "/signup" : "/signup/restaurant",
    },
  }
}

export function PricingSection({ heading, description }: PricingSectionProps) {
  const [plans, setPlans] = useState<ReturnType<typeof mapPlan>[]>([])

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
    fetchPlans()
  }, [fetchPlans])

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
        fetchPlans()
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

  return <Pricing2 heading={heading} description={description} plans={plans} />
}
