export type Plan = "trial" | "starter" | "growth" | "premium"

export interface PlanLimits {
  maxDishes: number
  maxImages: number
  maxOrders: number
  analytics: boolean
  customBranding: boolean
  canHaveQR: boolean
  canHaveWhatsapp: boolean
}

export interface SubscriptionStatus {
  plan: Plan
  daysRemaining: number
  isExpired: boolean
  isInGracePeriod: boolean
  canUploadImages: boolean
  canAddDish: boolean
  canAcceptOrder: boolean
  shouldBlurOrderDetails: boolean
  orderCount: number
  dishCount: number
  imageCount: number
  trialDaysRemaining: number
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  trial: {
    maxDishes: 5,
    maxImages: 5,
    maxOrders: 10,
    analytics: true,
    customBranding: false,
    canHaveQR: true,
    canHaveWhatsapp: true,
  },
  starter: {
    maxDishes: 30,
    maxImages: 10,
    maxOrders: Infinity,
    analytics: true,
    customBranding: false,
    canHaveQR: true,
    canHaveWhatsapp: true,
  },
  growth: {
    maxDishes: 50,
    maxImages: 20,
    maxOrders: Infinity,
    analytics: true,
    customBranding: true,
    canHaveQR: true,
    canHaveWhatsapp: true,
  },
  premium: {
    maxDishes: 100,
    maxImages: 100,
    maxOrders: Infinity,
    analytics: true,
    customBranding: true,
    canHaveQR: true,
    canHaveWhatsapp: true,
  },
}

export const PLAN_PRICES: Record<Plan, number> = {
  trial: 0,
  starter: 1200,
  growth: 2500,
  premium: 4500,
}

export const PLAN_NAMES: Record<Plan, string> = {
  trial: "Free Trial",
  starter: "Starter",
  growth: "Growth",
  premium: "Premium",
}

export const TRIAL_DURATION_DAYS = 7
export const GRACE_PERIOD_DAYS = 3
export const TRIAL_REMINDER_DAYS = [5, 3, 1]

export interface RestaurantLike {
  plan: Plan
  plan_end_date: string | null
  trial_start: string
  trial_end: string
  image_upload_allowed?: boolean
  is_active?: boolean
}

export interface StatusCounts {
  dishCount?: number
  imageCount?: number
  orderCount?: number
}

export function getSubscriptionStatus(
  restaurant: RestaurantLike,
  counts: StatusCounts = {}
): SubscriptionStatus {
  const now = new Date()
  const trialEnd = new Date(restaurant.trial_end)
  const planEnd = restaurant.plan_end_date
    ? new Date(restaurant.plan_end_date)
    : null

  const orderCount = counts.orderCount ?? 0
  const dishCount = counts.dishCount ?? 0
  const imageCount = counts.imageCount ?? 0

  const limits = PLAN_LIMITS[restaurant.plan]

  const dishLimit = limits.maxDishes
  const imageLimit = limits.maxImages
  const orderLimit = limits.maxOrders

  const canAddDish = dishCount < dishLimit
  const canUploadImages = imageCount < imageLimit
  const canAcceptOrder = orderCount < orderLimit

  const shouldBlurOrderDetails =
    restaurant.plan === "trial" && orderCount >= orderLimit

  if (restaurant.plan === "trial") {
    const msPerDay = 1000 * 60 * 60 * 24
    const trialDaysRemaining = Math.max(
      0,
      Math.ceil((trialEnd.getTime() - now.getTime()) / msPerDay)
    )
    const graceEnd = new Date(
      trialEnd.getTime() + GRACE_PERIOD_DAYS * msPerDay
    )
    const isInGracePeriod = now > trialEnd && now < graceEnd
    const isExpired = now > graceEnd

    return {
      plan: "trial",
      daysRemaining: trialDaysRemaining,
      trialDaysRemaining,
      isExpired,
      isInGracePeriod,
      canUploadImages,
      canAddDish,
      canAcceptOrder,
      shouldBlurOrderDetails,
      orderCount,
      dishCount,
      imageCount,
    }
  }

  const daysRemaining = planEnd
    ? Math.max(
        0,
        Math.ceil((planEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      )
    : 999

  return {
    plan: restaurant.plan,
    daysRemaining,
    trialDaysRemaining: 0,
    isExpired: planEnd ? now > planEnd : false,
    isInGracePeriod: false,
    canUploadImages,
    canAddDish,
    canAcceptOrder: true,
    shouldBlurOrderDetails: false,
    orderCount,
    dishCount,
    imageCount,
  }
}

export function formatLimit(limit: number): string {
  return limit === Infinity ? "Unlimited" : limit.toString()
}

export function getPlanFeatures(plan: Plan): string[] {
  const limits = PLAN_LIMITS[plan]
  const features: string[] = []

  features.push(
    `${formatLimit(limits.maxDishes)} dish${limits.maxDishes === 1 ? "" : "es"}`
  )

  if (limits.maxImages === 0) {
    features.push("No images")
  } else {
    features.push(
      `${formatLimit(limits.maxImages)} image${limits.maxImages === 1 ? "" : "s"}`
    )
  }

  if (limits.maxOrders === Infinity) {
    features.push("Unlimited orders")
  } else {
    features.push(`${limits.maxOrders} orders`)
  }

  if (limits.analytics) features.push("Analytics dashboard")
  if (limits.canHaveQR) features.push("QR code generation")
  if (limits.canHaveWhatsapp) features.push("WhatsApp orders")
  if (limits.customBranding) features.push("Custom branding")

  return features
}
