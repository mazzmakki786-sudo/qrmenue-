export interface BrandingConfig {
  primaryColor: string
  accentColor: string
  bannerEnabled: boolean
  bannerImageUrl: string | null
  bannerLinkUrl: string | null
  hasCustomBranding: boolean
  isPremium: boolean
}

export const DEFAULT_BRANDING: BrandingConfig = {
  primaryColor: "#25D366",
  accentColor: "#000000",
  bannerEnabled: false,
  bannerImageUrl: null,
  bannerLinkUrl: null,
  hasCustomBranding: false,
  isPremium: false,
}

export function buildBrandingConfig(
  plan: string,
  planLimits: { customBranding: boolean },
  dbRow?: {
    banner_enabled?: boolean | null
    banner_image_url?: string | null
    banner_link_url?: string | null
  } | null
): BrandingConfig {
  const isPremium = plan === "premium"

  return {
    primaryColor: DEFAULT_BRANDING.primaryColor,
    accentColor: DEFAULT_BRANDING.accentColor,
    bannerEnabled: isPremium ? (dbRow?.banner_enabled ?? false) : false,
    bannerImageUrl: isPremium ? (dbRow?.banner_image_url || null) : null,
    bannerLinkUrl: isPremium ? (dbRow?.banner_link_url || null) : null,
    hasCustomBranding: false,
    isPremium,
  }
}
