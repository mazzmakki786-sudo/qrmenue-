export type LayoutType = "image-top-text-bottom" | "image-background-overlay" | "image-grid-2x2" | "image-text-side-by-side"

export interface TemplateConfig {
  id: string
  name: string
  description: string
  icon: string
  layouts: LayoutType[]
  defaults: {
    backgroundStyle: "gradient" | "solid"
    backgroundColors: string[]
    textColor: string
    accentColor: string
    fontStyle: "bold" | "modern" | "elegant"
    textPosition: "top" | "bottom" | "center" | "overlay" | "right"
    imageLayout: "single" | "grid-2" | "grid-4"
  }
}

export const ALL_LAYOUTS: { id: LayoutType; name: string; icon: string; description: string }[] = [
  {
    id: "image-top-text-bottom",
    name: "Image Top",
    icon: "▦",
    description: "Image upar, caption neeche",
  },
  {
    id: "image-background-overlay",
    name: "Full Overlay",
    icon: "▣",
    description: "Image background pe text overlay",
  },
  {
    id: "image-grid-2x2",
    name: "Grid (2x2)",
    icon: "⊞",
    description: "4 images in 2x2 grid",
  },
  {
    id: "image-text-side-by-side",
    name: "Side by Side",
    icon: "▐",
    description: "Left image, right text",
  },
]

export const TEMPLATES: Record<string, TemplateConfig> = {
  "minimal": {
    id: "minimal",
    name: "Minimal",
    description: "Clean look with white bg",
    icon: "◻",
    layouts: ["image-top-text-bottom", "image-text-side-by-side"],
    defaults: {
      backgroundStyle: "solid",
      backgroundColors: ["#FFFFFF", "#F9FAFB"],
      textColor: "#1a1a1a",
      accentColor: "#25D366",
      fontStyle: "modern",
      textPosition: "bottom",
      imageLayout: "single",
    },
  },
  "bold-offer": {
    id: "bold-offer",
    name: "Bold Offer",
    description: "Eye-catching gradient",
    icon: "⬛",
    layouts: ["image-background-overlay", "image-top-text-bottom"],
    defaults: {
      backgroundStyle: "gradient",
      backgroundColors: ["#DC2626", "#991B1B"],
      textColor: "#FFFFFF",
      accentColor: "#FCD34D",
      fontStyle: "bold",
      textPosition: "overlay",
      imageLayout: "single",
    },
  },
  "elegant": {
    id: "elegant",
    name: "Elegant",
    description: "Dark with gold accents",
    icon: "✦",
    layouts: ["image-text-side-by-side", "image-top-text-bottom"],
    defaults: {
      backgroundStyle: "gradient",
      backgroundColors: ["#1a1a1a", "#2d2d2d"],
      textColor: "#FFFFFF",
      accentColor: "#D4AF37",
      fontStyle: "elegant",
      textPosition: "bottom",
      imageLayout: "single",
    },
  },
  "seasonal": {
    id: "seasonal",
    name: "Seasonal",
    description: "Festive celebration look",
    icon: "🎉",
    layouts: ["image-grid-2x2", "image-background-overlay"],
    defaults: {
      backgroundStyle: "gradient",
      backgroundColors: ["#059669", "#047857"],
      textColor: "#FFFFFF",
      accentColor: "#FDE047",
      fontStyle: "modern",
      textPosition: "overlay",
      imageLayout: "grid-2",
    },
  },
  "new-arrival": {
    id: "new-arrival",
    name: "New Arrival",
    description: "Image-focused minimal",
    icon: "✦",
    layouts: ["image-top-text-bottom", "image-grid-2x2"],
    defaults: {
      backgroundStyle: "solid",
      backgroundColors: ["#F8FAFC", "#F1F5F9"],
      textColor: "#0F172A",
      accentColor: "#3B82F6",
      fontStyle: "elegant",
      textPosition: "bottom",
      imageLayout: "single",
    },
  },
}

export function getTemplate(id: string): TemplateConfig {
  return TEMPLATES[id] || TEMPLATES["minimal"]
}

export function getDefaultColors(templateId: string) {
  const t = getTemplate(templateId)
  return {
    backgroundColors: t.defaults.backgroundColors,
    textColor: t.defaults.textColor,
    accentColor: t.defaults.accentColor,
  }
}
