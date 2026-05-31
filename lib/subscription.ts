export type Plan = "trial" | "starter" | "growth" | "premium"

export interface SubscriptionStatus {
  plan: Plan
  daysRemaining: number
  isExpired: boolean
  canUploadImages: boolean
  isInGracePeriod: boolean
}

export function getSubscriptionStatus(restaurant: any): SubscriptionStatus {
  const now = new Date()
  const trialEnd = new Date(restaurant.trial_end)
  const planEnd = restaurant.plan_end_date ? new Date(restaurant.plan_end_date) : null

  if (restaurant.plan === "trial") {
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const trialStart = new Date(restaurant.trial_start)
    const daysSinceStart = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24))
    const graceEnd = new Date(trialEnd.getTime() + 3 * 24 * 60 * 60 * 1000)
    const isInGracePeriod = now > trialEnd && now < graceEnd
    const isExpired = now > graceEnd

    return {
      plan: "trial",
      daysRemaining: Math.max(0, daysRemaining),
      isExpired,
      canUploadImages: daysSinceStart <= 3,
      isInGracePeriod,
    }
  }

  const daysRemaining = planEnd
    ? Math.ceil((planEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 999

  return {
    plan: restaurant.plan as Plan,
    daysRemaining: Math.max(0, daysRemaining),
    isExpired: planEnd ? now > planEnd : false,
    canUploadImages: ["growth", "premium"].includes(restaurant.plan),
    isInGracePeriod: false,
  }
}

export const PLAN_LIMITS = {
  trial: { maxImages: 4, maxDishes: 4, analytics: true, customBranding: false },
  starter: { maxImages: 0, maxDishes: Infinity, analytics: true, customBranding: false },
  growth: { maxImages: 50, maxDishes: Infinity, analytics: true, customBranding: true },
  premium: { maxImages: Infinity, maxDishes: Infinity, analytics: true, customBranding: true },
}

export const PLAN_PRICES: Record<Plan, number> = {
  trial: 0,
  starter: 800,
  growth: 1800,
  premium: 2500,
}
