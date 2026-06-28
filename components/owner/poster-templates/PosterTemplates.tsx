import { forwardRef } from "react"
import Image from "next/image"
import type { PosterRendererProps, PosterTemplate, PosterColors, PosterLayout } from "./types"

export const TEMPLATES: PosterTemplate[] = [
  {
    id: "classic-menu", name: "Classic Menu", description: "Clean white menu with dish grid",
    icon: "📋", layouts: ["image-top", "image-grid"],
    defaultColors: { bgTop: "#FFFFFF", bgBottom: "#F8F8F8", textPrimary: "#1a1a1a", textSecondary: "#666", accent: "#25D366", cardBg: "#FFFFFF" },
    premium: false,
  },
  {
    id: "bold-deal", name: "Bold Offer", description: "Eye-catching gradient for deals",
    icon: "🔥", layouts: ["overlay", "image-top"],
    defaultColors: { bgTop: "#DC2626", bgBottom: "#991B1B", textPrimary: "#FFFFFF", textSecondary: "#FCA5A5", accent: "#FCD34D", cardBg: "rgba(255,255,255,0.1)" },
    premium: false,
  },
  {
    id: "elegant-dark", name: "Elegant Dark", description: "Dark with gold accents",
    icon: "✦", layouts: ["side-by-side", "split-grid"],
    defaultColors: { bgTop: "#1a1a1a", bgBottom: "#2d2d2d", textPrimary: "#FFFFFF", textSecondary: "#A0A0A0", accent: "#D4AF37", cardBg: "rgba(255,255,255,0.06)" },
    premium: true,
  },
  {
    id: "seasonal", name: "Seasonal Festive", description: "Green celebration theme",
    icon: "🎉", layouts: ["overlay", "split-grid"],
    defaultColors: { bgTop: "#059669", bgBottom: "#047857", textPrimary: "#FFFFFF", textSecondary: "#A7F3D0", accent: "#FDE047", cardBg: "rgba(255,255,255,0.08)" },
    premium: true,
  },
  {
    id: "new-arrival", name: "New Arrival", description: "Modern minimal blue",
    icon: "✨", layouts: ["image-top", "side-by-side"],
    defaultColors: { bgTop: "#F0F9FF", bgBottom: "#E0F2FE", textPrimary: "#0F172A", textSecondary: "#475569", accent: "#3B82F6", cardBg: "#FFFFFF" },
    premium: false,
  },
  {
    id: "social-square", name: "Social Square", description: "Instagram-optimized post",
    icon: "◻", layouts: ["image-top", "overlay"],
    defaultColors: { bgTop: "#0a0a0a", bgBottom: "#1a1a1a", textPrimary: "#FFFFFF", textSecondary: "#999", accent: "#FF6B35", cardBg: "rgba(255,255,255,0.05)" },
    premium: true,
  },
]

export function getTemplate(id: string): PosterTemplate {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0]
}

export function getDefaultColors(templateId: string): PosterColors {
  return getTemplate(templateId).defaultColors
}

function DishImage({ dish }: { dish: { image_url?: string | null; name_en: string } }) {
  if (dish.image_url) {
    return <Image src={dish.image_url} alt={dish.name_en} fill className="object-cover" sizes="160px" />
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#E8E8E8] text-3xl font-bold text-[#999]">
      {dish.name_en.charAt(0)}
    </div>
  )
}

export const PosterRenderer = forwardRef<HTMLDivElement, PosterRendererProps>(
  function PosterRenderer({ dishes, settings, restaurantName, restaurantLogo }, ref) {
    const { templateId, layout, caption, showPrices, textSize, colors } = settings
    const tpl = getTemplate(templateId)
    const isPremium = tpl.premium
    const sizeClass = textSize === "sm" ? "text-sm" : textSize === "lg" ? "text-lg" : "text-base"
    const sizeClassXs = textSize === "sm" ? "text-[10px]" : textSize === "lg" ? "text-xs" : "text-[11px]"

    const containerClass = "relative overflow-hidden w-full"
    const gradient = colors.bgTop !== colors.bgBottom
      ? `linear-gradient(135deg, ${colors.bgTop}, ${colors.bgBottom})`
      : colors.bgTop

    const renderDishGrid = (maxCols = 2) => (
      <div className={`grid gap-2 ${maxCols === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {dishes.slice(0, 4).map((dish) => (
          <div key={dish.id} className="rounded-xl overflow-hidden" style={{ backgroundColor: colors.cardBg }}>
            <div className="relative aspect-square">
              <DishImage dish={dish} />
            </div>
            <div className="p-2">
              <p className="text-xs font-semibold truncate" style={{ color: colors.textPrimary }}>{dish.name_en}</p>
              {showPrices && (
                <p className="text-[11px] font-bold mt-0.5" style={{ color: colors.accent }}>
                  Rs {dish.price.toLocaleString("en-PK")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    )

    const renderDishRow = () => (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {dishes.slice(0, 4).map((dish) => (
          <div key={dish.id} className="flex-shrink-0 w-24">
            <div className="relative aspect-square rounded-xl overflow-hidden" style={{ backgroundColor: colors.cardBg }}>
              <DishImage dish={dish} />
            </div>
            <p className="text-[10px] font-medium mt-1 truncate text-center" style={{ color: colors.textPrimary }}>{dish.name_en}</p>
            {showPrices && (
              <p className="text-[10px] font-bold text-center" style={{ color: colors.accent }}>Rs {dish.price.toLocaleString("en-PK")}</p>
            )}
          </div>
        ))}
      </div>
    )

    const renderCaption = () => {
      if (!caption) return null
      return (
        <p className={`font-bold leading-tight ${sizeClass}`} style={{ color: colors.textPrimary }}>
          {caption}
        </p>
      )
    }

    // Each ratio gets different outer dimensions
    const ratioClass = settings.ratio === "1:1" ? "aspect-square" : settings.ratio === "16:9" ? "aspect-video" : "aspect-[4/5]"

    if (layout === "overlay") {
      return (
        <div ref={ref} className={`${containerClass} ${ratioClass} rounded-2xl flex flex-col justify-end p-5 relative`} style={{ background: gradient }}>
          {dishes.length > 0 && (
            <div className="absolute inset-0 opacity-20">
              <div className="relative w-full h-full">
                <Image src={dishes[0].image_url || ""} alt="" fill className="object-cover" />
              </div>
            </div>
          )}
          <div className="absolute inset-0" style={{ background: `linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 50%)` }} />
          <div className="relative z-10 space-y-3">
            {renderCaption()}
            <div className="flex items-center gap-2">
              {showRestaurantName(settings.showRestaurantName, restaurantName, colors)}
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: colors.accent, color: colors.bgTop }}>
                {tpl.name}
              </span>
            </div>
          </div>
        </div>
      )
    }

    if (layout === "side-by-side") {
      return (
        <div ref={ref} className={`${containerClass} ${ratioClass} rounded-2xl flex`} style={{ background: gradient }}>
          <div className="w-1/2 p-4 flex flex-col justify-center space-y-3">
            {renderCaption()}
            {showRestaurantName(settings.showRestaurantName, restaurantName, colors)}
          </div>
          <div className="w-1/2 p-3 flex items-center">
            {dishes.length > 0 ? (
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden ring-2" style={{ borderColor: colors.accent }}>
                <DishImage dish={dishes[0]} />
              </div>
            ) : (
              <div className="w-full aspect-square rounded-2xl bg-white/10 flex items-center justify-center text-white/30 text-sm">
                No Image
              </div>
            )}
          </div>
        </div>
      )
    }

    if (layout === "split-grid") {
      return (
        <div ref={ref} className={`${containerClass} ${ratioClass} rounded-2xl p-4 flex flex-col`} style={{ background: gradient }}>
          <div className="mb-3">
            {renderCaption()}
            {showRestaurantName(settings.showRestaurantName, restaurantName, colors)}
          </div>
          <div className="flex-1">
            {renderDishGrid(3)}
          </div>
        </div>
      )
    }

    // Default: image-top
    return (
      <div ref={ref} className={`${containerClass} ${ratioClass} rounded-2xl flex flex-col`} style={{ background: gradient }}>
        <div className="flex-1 p-3 overflow-hidden">
          {layout === "image-grid" ? renderDishGrid() : renderDishRow()}
        </div>
        <div className="p-4 space-y-2 border-t" style={{ borderColor: `${colors.textPrimary}15` }}>
          {renderCaption()}
          {showRestaurantName(settings.showRestaurantName, restaurantName, colors)}
        </div>
      </div>
    )
  }
)

function showRestaurantName(enabled: boolean, name: string, colors: PosterColors) {
  if (!enabled) return null
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: colors.accent, color: colors.bgTop }}>
        {name.charAt(0)}
      </div>
      <p className="text-xs font-semibold" style={{ color: colors.textSecondary }}>{name}</p>
    </div>
  )
}
