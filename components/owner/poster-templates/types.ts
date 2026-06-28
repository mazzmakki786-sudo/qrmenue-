import type { Dish } from "@/types"

export type PosterRatio = "1:1" | "16:9" | "4:5"
export type PosterLayout = "image-top" | "image-grid" | "overlay" | "side-by-side" | "split-grid"

export interface PosterColors {
  bgTop: string
  bgBottom: string
  textPrimary: string
  textSecondary: string
  accent: string
  cardBg: string
}

export interface PosterSettings {
  templateId: string
  layout: PosterLayout
  ratio: PosterRatio
  caption: string
  showPrices: boolean
  showRestaurantName: boolean
  textSize: "sm" | "md" | "lg"
  colors: PosterColors
}

export interface PosterTemplate {
  id: string
  name: string
  description: string
  icon: string
  layouts: PosterLayout[]
  defaultColors: PosterColors
  premium: boolean
}

export interface PosterRendererProps {
  dishes: Dish[]
  settings: PosterSettings
  restaurantName: string
  restaurantLogo?: string | null
}
