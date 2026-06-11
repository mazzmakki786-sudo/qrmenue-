import { createClient } from "@/lib/supabase/server"
import { DEFAULT_TRIAL_LIMITS, type TrialLimitConfig, type PlanLimits } from "@/lib/subscription"

export async function loadTrialLimitsFromDB(): Promise<TrialLimitConfig> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("company_settings")
      .select("value")
      .eq("key", "trial_limits")
      .single()
    if (data?.value) {
      const parsed = JSON.parse(data.value)
      return {
        maxDishes: parsed.maxDishes ?? DEFAULT_TRIAL_LIMITS.maxDishes,
        maxCategories: parsed.maxCategories ?? DEFAULT_TRIAL_LIMITS.maxCategories,
        maxOrders: parsed.maxOrders ?? DEFAULT_TRIAL_LIMITS.maxOrders,
        trialDurationDays: parsed.trialDurationDays ?? DEFAULT_TRIAL_LIMITS.trialDurationDays,
        gracePeriodDays: parsed.gracePeriodDays ?? DEFAULT_TRIAL_LIMITS.gracePeriodDays,
      }
    }
  } catch {
    // fall through to defaults
  }
  return { ...DEFAULT_TRIAL_LIMITS }
}

export function buildTrialLimitsFromConfig(config: TrialLimitConfig): PlanLimits {
  return {
    maxDishes: config.maxDishes,
    maxImages: 20,
    maxOrders: config.maxOrders,
    maxCategories: config.maxCategories,
    analytics: true,
    customBranding: false,
    canHaveQR: true,
    canHaveWhatsapp: true,
  }
}