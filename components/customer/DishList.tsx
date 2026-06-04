import type { Category, Dish } from "@/types"
import { DishItem } from "./DishItem"
import { UtensilsCrossed } from "lucide-react"

interface Props {
  categories: (Category & { dishes: Dish[] })[]
  lang?: "en" | "ur"
  compact?: boolean
}

export function DishList({ categories, lang = "en", compact = false }: Props) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-xl bg-[#F8F8F8] flex items-center justify-center mx-auto mb-3">
          <UtensilsCrossed className="w-6 h-6 text-[#999]" />
        </div>
        <p className="text-sm text-[#999]">No menu items available</p>
      </div>
    )
  }

  return (
    <div>
      {categories.map((category) => {
        const categoryLabel = lang === "ur" && category.name_ur ? category.name_ur : category.name_en
        const availableDishes = category.dishes.filter((d) => d.is_available)
        const unavailableDishes = category.dishes.filter((d) => !d.is_available)

        return (
          <div key={category.id} id={`cat-${category.id}`} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-5 rounded-full bg-[#FF6B35]" />
              <h2 className={`text-sm font-bold uppercase tracking-wider text-[#111] ${lang === "ur" ? "font-urdu" : ""}`}>
                {categoryLabel}
              </h2>
              <span className="text-xs text-[#BBB]">({availableDishes.length})</span>
            </div>
            {availableDishes.map((dish) => (
              <DishItem key={dish.id} dish={dish} lang={lang} compact={compact} />
            ))}
            {unavailableDishes.map((dish) => (
              <DishItem key={dish.id} dish={dish} lang={lang} unavailable compact={compact} />
            ))}
            {availableDishes.length === 0 && unavailableDishes.length === 0 && (
              <p className="text-sm text-[#999] py-6 text-center">{lang === "ur" ? "کوئی ڈش نہیں" : "No dishes in this category"}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
