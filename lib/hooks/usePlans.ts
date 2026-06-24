"use client"

import { useState, useEffect, useCallback } from "react"
import type { Plan, PlanLimits } from "@/lib/subscription"

export interface PlanData {
  slug: Plan
  name: string
  price: number
  limits: PlanLimits
  description: string
}

export function usePlans() {
  const [plans, setPlans] = useState<PlanData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/plans")
      if (res.ok) {
        const data = await res.json()
        if (data.plans) {
          setPlans(data.plans.map((p: any) => ({
            slug: p.slug as Plan,
            name: p.name,
            price: p.price_pkr,
            limits: {
              maxDishes: p.max_dishes === -1 ? Infinity : p.max_dishes,
              maxImages: p.max_images === -1 ? Infinity : p.max_images,
              maxOrders: p.max_orders === -1 ? Infinity : p.max_orders,
              maxCategories: p.max_categories === -1 ? Infinity : p.max_categories,
              analytics: p.analytics,
              customBranding: p.custom_branding,
              canHaveQR: p.can_have_qr,
              canHaveWhatsapp: p.can_have_whatsapp,
            },
            description: p.description || "",
          })))
        }
      }
    } catch {
      // Fallback to empty — consumers should use hardcoded as fallback
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPlans() }, [fetchPlans])

  const getPlan = useCallback((slug: Plan) => plans.find((p) => p.slug === slug), [plans])

  return { plans, loading, getPlan, refetch: fetchPlans }
}
