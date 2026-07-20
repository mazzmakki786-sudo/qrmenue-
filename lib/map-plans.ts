export interface DBPlan {
  id: string
  slug: string
  name: string
  price_pkr: number
  yearly_price_pkr: number | null
  billing_interval?: "monthly" | "yearly"
  max_dishes: number
  max_images: number
  max_orders: number
  max_categories: number
  analytics: boolean
  custom_branding: boolean
  can_have_qr: boolean
  can_have_whatsapp: boolean
  description: string
  custom_features: string[]
  offer_price_pkr?: number | null
  offer_label?: string | null
  original_price_pkr?: number | null
}

export interface PricingPlan {
  id: string
  name: string
  description: string
  monthlyPrice: string
  yearlyPrice: string
  features: { text: string }[]
  button: { text: string; url: string }
  /** e.g. "40% OFF" — shown as badge when yearly toggle is on */
  offerLabel?: string | null
  /** Original price before discount — shown with strikethrough */
  originalPrice?: string | null
  /** Savings message e.g. "Save PKR 6,000/year" */
  savings?: string | null
}

function formatLimit(val: number): string {
  if (val === -1 || val === Infinity) return "Unlimited"
  return val.toString()
}

/**
 * Takes all DB plans (both monthly and yearly rows) and merges them into
 * PricingPlan[] showing only base plans (trial, starter, growth, premium)
 * with both monthly and yearly prices set correctly from their respective rows.
 */
export function mergeYearlyPlans(dbPlans: DBPlan[]): PricingPlan[] {
  const baseSlugs = ["trial", "starter", "growth", "premium"]

  // Index yearly plans by their base slug (e.g. "starter-yearly" -> "starter")
  const yearlyByBase: Record<string, DBPlan> = {}
  for (const p of dbPlans) {
    if (p.slug.endsWith("-yearly")) {
      const base = p.slug.replace("-yearly", "")
      yearlyByBase[base] = p
    }
  }

  return baseSlugs
    .map((slug) => {
      const plan = dbPlans.find((p) => p.slug === slug)
      if (!plan) return null

      const yearlyPlan = yearlyByBase[slug]
      let yearlyPrice = yearlyPlan
        ? yearlyPlan.price_pkr
        : (plan.yearly_price_pkr ?? plan.price_pkr * 12)

      // Compute offer / savings info from the yearly plan row
      let offerLabel: string | null = null
      let originalPrice: string | null = null
      let savings: string | null = null

      if (yearlyPlan?.offer_label) {
        offerLabel = yearlyPlan.offer_label
      }
      if (yearlyPlan?.offer_price_pkr && yearlyPlan.offer_price_pkr > 0) {
        originalPrice = `PKR ${yearlyPrice.toLocaleString("en-PK")}`
        // Use offer price as the displayed yearly price
        yearlyPrice = yearlyPlan.offer_price_pkr
        // Calculate savings
        const savingAmount = (yearlyPlan.price_pkr ?? 0) - yearlyPlan.offer_price_pkr
        if (savingAmount > 0) {
          savings = `Save PKR ${savingAmount.toLocaleString("en-PK")}/year`
        }
      } else if (yearlyPlan?.original_price_pkr) {
        originalPrice = `PKR ${yearlyPlan.original_price_pkr.toLocaleString("en-PK")}`
        const savingAmount = yearlyPlan.original_price_pkr - yearlyPrice
        if (savingAmount > 0) {
          savings = `Save PKR ${savingAmount.toLocaleString("en-PK")}/year`
        }
      }

      return {
        id: plan.slug,
        name: plan.name,
        description: plan.description || "",
        monthlyPrice:
          plan.price_pkr === 0 ? "Free" : `PKR ${plan.price_pkr.toLocaleString("en-PK")}`,
        yearlyPrice:
          plan.price_pkr === 0
            ? "Free"
            : `PKR ${yearlyPrice.toLocaleString("en-PK")}`,
        originalPrice,
        offerLabel,
        savings,
        features: buildFeatures(plan),
        button: {
          text: plan.slug === "trial" ? "Start Free Trial" : "Choose Plan",
          url:
            plan.slug === "trial"
              ? "/signup/restaurant"
              : `/signup/restaurant?plan=${plan.slug}`,
        },
      }
    })
    .filter(Boolean) as PricingPlan[]
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

  if (Array.isArray(plan.custom_features)) {
    for (const f of plan.custom_features) {
      if (f.trim()) features.push({ text: f.trim() })
    }
  }

  return features
}

/**
 * Legacy mapper — maps a single DBPlan row to PricingPlan.
 * Used by the real-time sub in the carousel-based PricingClient.
 */
export function mapPlan(plan: DBPlan): PricingPlan {
  const monthlyPrice = `PKR ${plan.price_pkr.toLocaleString("en-PK")}`
  const yearlyRaw = plan.yearly_price_pkr ?? plan.price_pkr * 12
  return {
    id: plan.slug,
    name: plan.name,
    description: plan.description || "",
    monthlyPrice: plan.price_pkr === 0 ? "Free" : monthlyPrice,
    yearlyPrice: plan.price_pkr === 0 ? "Free" : `PKR ${yearlyRaw.toLocaleString("en-PK")}`,
    features: buildFeatures(plan),
    button: {
      text: plan.slug === "trial" ? "Start Free Trial" : "Choose Plan",
      url: plan.slug === "trial"
        ? "/signup/restaurant"
        : `/signup/restaurant?plan=${plan.slug}`,
    },
  }
}
