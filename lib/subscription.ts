export type Plan = "trial" | "starter" | "growth" | "premium"

export interface PlanLimits {
  maxDishes: number
  maxImages: number
  maxOrders: number
  maxCategories: number
  analytics: boolean
  customBranding: boolean
  canHaveQR: boolean
  canHaveWhatsapp: boolean
}

export interface TrialLimitConfig {
  maxDishes: number
  maxCategories: number
  maxOrders: number
  trialDurationDays: number
  gracePeriodDays: number
}

export interface ExpiredTrialLimitConfig {
  maxDishes: number
  maxCategories: number
  maxOrders: number
  maxImages: number
  blockMenu: boolean
  blockOrders: boolean
}

export interface SubscriptionStatus {
  plan: Plan
  daysRemaining: number
  isExpired: boolean
  isInGracePeriod: boolean
  isSuspended: boolean
  blockMenu: boolean
  blockOrders: boolean
  canUploadImages: boolean
  canAddDish: boolean
  canAddCategory: boolean
  canAcceptOrder: boolean
  shouldBlurOrderDetails: boolean
  orderCount: number
  dishCount: number
  categoryCount: number
  imageCount: number
  trialDaysRemaining: number
}

export const DEFAULT_TRIAL_LIMITS: TrialLimitConfig = {
  maxDishes: 20,
  maxCategories: 20,
  maxOrders: 10,
  trialDurationDays: 7,
  gracePeriodDays: 3,
}

export const DEFAULT_EXPIRED_TRIAL_LIMITS: ExpiredTrialLimitConfig = {
  maxDishes: 0,
  maxCategories: 0,
  maxOrders: 0,
  maxImages: 0,
  blockMenu: true,
  blockOrders: true,
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  trial: {
    maxDishes: DEFAULT_TRIAL_LIMITS.maxDishes,
    maxImages: 20,
    maxOrders: DEFAULT_TRIAL_LIMITS.maxOrders,
    maxCategories: DEFAULT_TRIAL_LIMITS.maxCategories,
    analytics: true,
    customBranding: false,
    canHaveQR: true,
    canHaveWhatsapp: true,
  },
  starter: {
    maxDishes: 30,
    maxImages: 10,
    maxOrders: Infinity,
    maxCategories: Infinity,
    analytics: true,
    customBranding: false,
    canHaveQR: true,
    canHaveWhatsapp: true,
  },
  growth: {
    maxDishes: 50,
    maxImages: 20,
    maxOrders: Infinity,
    maxCategories: Infinity,
    analytics: true,
    customBranding: true,
    canHaveQR: true,
    canHaveWhatsapp: true,
  },
  premium: {
    maxDishes: 100,
    maxImages: 100,
    maxOrders: Infinity,
    maxCategories: Infinity,
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
  is_suspended?: boolean
  plan_limits_override?: PlanLimitsPartial | null
}

export interface PlanLimitsPartial {
  maxDishes?: number
  maxImages?: number
  maxOrders?: number
  maxCategories?: number
}

export interface StatusCounts {
  dishCount?: number
  imageCount?: number
  orderCount?: number
  categoryCount?: number
}

export function getEffectiveLimits(
  plan: Plan,
  override?: PlanLimitsPartial | null
): PlanLimits {
  const base = { ...PLAN_LIMITS[plan] }
  if (override) {
    if (override.maxDishes !== undefined) base.maxDishes = override.maxDishes
    if (override.maxImages !== undefined) base.maxImages = override.maxImages
    if (override.maxOrders !== undefined) base.maxOrders = override.maxOrders
    if (override.maxCategories !== undefined) base.maxCategories = override.maxCategories
  }
  return base
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
  const categoryCount = counts.categoryCount ?? 0

  const isActive = restaurant.is_active !== false
  const isSuspended = restaurant.is_suspended === true

  const limits = getEffectiveLimits(restaurant.plan, restaurant.plan_limits_override)

  const dishLimit = limits.maxDishes
  const imageLimit = limits.maxImages
  const orderLimit = limits.maxOrders
  const categoryLimit = limits.maxCategories

  const canAddDish = dishCount < dishLimit && isActive && !isSuspended
  const canUploadImages = imageCount < imageLimit && isActive && !isSuspended
  const canAddCategory = categoryCount < categoryLimit && isActive && !isSuspended
  const canAcceptOrder = orderCount < orderLimit && isActive && !isSuspended

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

    if (isExpired) {
      return {
        plan: "trial",
        daysRemaining: 0,
        trialDaysRemaining: 0,
        isExpired: true,
        isInGracePeriod: false,
        isSuspended,
        blockMenu: true,
        blockOrders: true,
        canUploadImages: false,
        canAddDish: false,
        canAddCategory: false,
        canAcceptOrder: false,
        shouldBlurOrderDetails: true,
        orderCount,
        dishCount,
        categoryCount,
        imageCount,
      }
    }

    return {
      plan: "trial",
      daysRemaining: trialDaysRemaining,
      trialDaysRemaining,
      isExpired: false,
      isInGracePeriod,
      isSuspended,
      blockMenu: false,
      blockOrders: false,
      canUploadImages,
      canAddDish,
      canAddCategory,
      canAcceptOrder,
      shouldBlurOrderDetails,
      orderCount,
      dishCount,
      categoryCount,
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
    isSuspended,
    blockMenu: false,
    blockOrders: false,
    canUploadImages,
    canAddDish,
    canAddCategory,
    canAcceptOrder,
    shouldBlurOrderDetails: false,
    orderCount,
    dishCount,
    categoryCount,
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

  features.push(
    `${formatLimit(limits.maxCategories)} categor${limits.maxCategories === 1 ? "y" : "ies"}`
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

  return features
}
