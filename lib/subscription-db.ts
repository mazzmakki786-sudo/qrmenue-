import { createClient } from "@/lib/supabase/server"
import {
  PLAN_LIMITS, PLAN_PRICES, PLAN_NAMES,
  type Plan, type PlanLimits,
} from "@/lib/subscription"

export interface DBPlan {
  id: string
  slug: string
  name: string
  price_pkr: number
  max_dishes: number
  max_images: number
  max_orders: number
  max_categories: number
  analytics: boolean
  custom_branding: boolean
  can_have_qr: boolean
  can_have_whatsapp: boolean
  description: string
  sort_order: number
  is_active: boolean
}

// In-memory cache for plans (per-request)
let plansCache: { data: DBPlan[]; timestamp: number } | null = null
const CACHE_TTL_MS = 60_000

/**
 * Load all plans from database with fallback to hardcoded values.
 */
export async function loadPlansFromDB(): Promise<DBPlan[]> {
  const now = Date.now()
  if (plansCache && now - plansCache.timestamp < CACHE_TTL_MS) {
    return plansCache.data
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error || !data || data.length === 0) {
      return getFallbackPlans()
    }

    plansCache = { data, timestamp: now }
    return data
  } catch {
    return getFallbackPlans()
  }
}

export async function loadPlanFromDB(slug: Plan): Promise<DBPlan | null> {
  const plans = await loadPlansFromDB()
  return plans.find((p) => p.slug === slug) || null
}

export function dbPlanToLimits(plan: DBPlan): PlanLimits {
  return {
    maxDishes: plan.max_dishes === -1 ? Infinity : plan.max_dishes,
    maxImages: plan.max_images === -1 ? Infinity : plan.max_images,
    maxOrders: plan.max_orders === -1 ? Infinity : plan.max_orders,
    maxCategories: plan.max_categories === -1 ? Infinity : plan.max_categories,
    analytics: plan.analytics,
    customBranding: plan.custom_branding,
    canHaveQR: plan.can_have_qr,
    canHaveWhatsapp: plan.can_have_whatsapp,
  }
}

export async function getPlanLimitsFromDB(slug: Plan): Promise<PlanLimits> {
  const plan = await loadPlanFromDB(slug)
  if (plan) return dbPlanToLimits(plan)
  return PLAN_LIMITS[slug]
}

export async function getAllPlanLimitsFromDB(): Promise<Record<Plan, PlanLimits>> {
  const plans = await loadPlansFromDB()
  if (plans.length === 0) return PLAN_LIMITS

  const result: Record<Plan, PlanLimits> = { ...PLAN_LIMITS }
  for (const plan of plans) {
    if (plan.slug in result) {
      result[plan.slug as Plan] = dbPlanToLimits(plan)
    }
  }
  return result
}

export async function getAllPlanPricesFromDB(): Promise<Record<Plan, number>> {
  const plans = await loadPlansFromDB()
  if (plans.length === 0) return PLAN_PRICES

  const result: Record<Plan, number> = { ...PLAN_PRICES }
  for (const plan of plans) {
    if (plan.slug in result) {
      result[plan.slug as Plan] = plan.price_pkr
    }
  }
  return result
}

export async function getAllPlanNamesFromDB(): Promise<Record<Plan, string>> {
  const plans = await loadPlansFromDB()
  if (plans.length === 0) return PLAN_NAMES

  const result: Record<Plan, string> = { ...PLAN_NAMES }
  for (const plan of plans) {
    if (plan.slug in result) {
      result[plan.slug as Plan] = plan.name
    }
  }
  return result
}

export async function getAllPlanDataFromDB(): Promise<Array<{
  slug: Plan
  name: string
  price: number
  limits: PlanLimits
  description: string
}>> {
  const plans = await loadPlansFromDB()
  if (plans.length === 0) {
    return (["trial", "starter", "growth", "premium"] as Plan[]).map((slug) => ({
      slug,
      name: PLAN_NAMES[slug],
      price: PLAN_PRICES[slug],
      limits: PLAN_LIMITS[slug],
      description: "",
    }))
  }

  return plans
    .filter((p) => p.slug in PLAN_LIMITS)
    .map((plan) => ({
      slug: plan.slug as Plan,
      name: plan.name,
      price: plan.price_pkr,
      limits: dbPlanToLimits(plan),
      description: plan.description,
    }))
}

export function invalidatePlansCache(): void {
  plansCache = null
}

function getFallbackPlans(): DBPlan[] {
  return [
    { id: "fallback-1", slug: "trial", name: "Free Trial", price_pkr: 0, max_dishes: 20, max_images: 20, max_orders: 10, max_categories: 20, analytics: true, custom_branding: false, can_have_qr: true, can_have_whatsapp: true, description: "Perfect for testing", sort_order: 0, is_active: true },
    { id: "fallback-2", slug: "starter", name: "Starter", price_pkr: 1200, max_dishes: 30, max_images: 10, max_orders: -1, max_categories: -1, analytics: true, custom_branding: false, can_have_qr: true, can_have_whatsapp: true, description: "For small restaurants", sort_order: 1, is_active: true },
    { id: "fallback-3", slug: "growth", name: "Growth", price_pkr: 2500, max_dishes: 50, max_images: 20, max_orders: -1, max_categories: -1, analytics: true, custom_branding: true, can_have_qr: true, can_have_whatsapp: true, description: "For growing restaurants", sort_order: 2, is_active: true },
    { id: "fallback-4", slug: "premium", name: "Premium", price_pkr: 4500, max_dishes: 100, max_images: 100, max_orders: -1, max_categories: -1, analytics: true, custom_branding: true, can_have_qr: true, can_have_whatsapp: true, description: "Full features", sort_order: 3, is_active: true },
  ]
}
