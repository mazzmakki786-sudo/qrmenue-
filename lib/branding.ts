export interface BrandingConfig {
  primaryColor: string
  accentColor: string
  bannerEnabled: boolean
  bannerImageUrl: string | null
  bannerLinkUrl: string | null
  hasCustomBranding: boolean
  isPremium: boolean
}

export type QRGradientPreset = "classic" | "sunset" | "ocean" | "midnight"

export interface QRGradientStyle {
  name: string
  label: string
  fgColor: string
  bgColor: string
}

export const QR_GRADIENT_PRESETS: Record<QRGradientPreset, QRGradientStyle> = {
  classic: {
    name: "classic",
    label: "Classic Black",
    fgColor: "#000000",
    bgColor: "#FFFFFF",
  },
  sunset: {
    name: "sunset",
    label: "Sunset",
    fgColor: "#E65100",
    bgColor: "#FFF3E0",
  },
  ocean: {
    name: "ocean",
    label: "Ocean",
    fgColor: "#0D47A1",
    bgColor: "#E3F2FD",
  },
  midnight: {
    name: "midnight",
    label: "Midnight",
    fgColor: "#1A237E",
    bgColor: "#E8EAF6",
  },
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
    brand_primary_color?: string | null
    brand_accent_color?: string | null
    banner_enabled?: boolean | null
    banner_image_url?: string | null
    banner_link_url?: string | null
  } | null
): BrandingConfig {
  const hasCustomBranding = planLimits.customBranding
  const isPremium = plan === "premium"

  if (!hasCustomBranding) {
    return { ...DEFAULT_BRANDING, hasCustomBranding: false, isPremium }
  }

  return {
    primaryColor: dbRow?.brand_primary_color || DEFAULT_BRANDING.primaryColor,
    accentColor: dbRow?.brand_accent_color || DEFAULT_BRANDING.accentColor,
    bannerEnabled: isPremium ? (dbRow?.banner_enabled ?? false) : false,
    bannerImageUrl: isPremium ? (dbRow?.banner_image_url || null) : null,
    bannerLinkUrl: isPremium ? (dbRow?.banner_link_url || null) : null,
    hasCustomBranding: true,
    isPremium,
  }
}
