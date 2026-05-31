import type { Category, Dish } from "@/types"
import { DishItem } from "./DishItem"

interface Props {
  categories: (Category & { dishes: Dish[] })[]
  lang?: "en" | "ur"
}

export function DishList({ categories, lang = "en" }: Props) {
  return (
    <div className="px-4 pb-4">
      {categories.map((category) => {
        const categoryLabel = lang === "ur" && category.name_ur ? category.name_ur : category.name_en
        const availableDishes = category.dishes.filter((d) => d.is_available)
        const unavailableDishes = category.dishes.filter((d) => !d.is_available)

        return (
          <div key={category.id} id={`cat-${category.id}`} className="mb-6">
            <h2 className={`text-xs font-semibold uppercase tracking-wider text-[#999] mb-2 ${lang === "ur" ? "font-urdu text-right" : ""}`}>
              {categoryLabel}
            </h2>
            {availableDishes.map((dish) => (
              <DishItem key={dish.id} dish={dish} lang={lang} />
            ))}
            {unavailableDishes.map((dish) => (
              <DishItem key={dish.id} dish={dish} lang={lang} unavailable />
            ))}
            {availableDishes.length === 0 && unavailableDishes.length === 0 && (
              <p className="text-sm text-[#999] py-4 text-center">No dishes in this category</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
