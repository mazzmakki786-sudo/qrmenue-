"use client"

import { useState, useEffect } from "react"
import { CategoryTabs } from "./CategoryTabs"
import { DishGrid } from "./DishGrid"
import { CartBar } from "./CartBar"
import { useCartStore } from "@/stores/cartStore"
import { Search, Languages } from "lucide-react"
import type { Category, Dish } from "@/types"

interface Props {
  categories: (Category & { dishes: Dish[] })[]
  restaurantId: string
  restaurantName: string
}

export function MenuContent({ categories, restaurantId, restaurantName }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [lang, setLang] = useState<"en" | "ur">("en")
  const [search, setSearch] = useState("")
  const setRestaurant = useCartStore((s) => s.setRestaurant)
  const clearCart = useCartStore((s) => s.clearCart)
  const currentRestaurantId = useCartStore((s) => s.restaurantId)

  useEffect(() => {
    if (currentRestaurantId && currentRestaurantId !== restaurantId) {
      clearCart()
    }
    setRestaurant(restaurantId, restaurantName)
  }, [restaurantId, restaurantName])

  const filtered = activeCategory
    ? categories.filter((c) => c.id === activeCategory)
    : categories

  const searched = search.trim()
    ? filtered
        .map((cat) => ({
          ...cat,
          dishes: cat.dishes.filter((d) => {
            const name = lang === "ur" && d.name_ur ? d.name_ur : d.name_en
            const desc = lang === "ur" && d.description_ur ? d.description_ur : d.description_en
            const q = search.toLowerCase()
            return name.toLowerCase().includes(q) || (desc || "").toLowerCase().includes(q)
          }),
        }))
        .filter((cat) => cat.dishes.length > 0)
    : filtered

  const noResults = search && searched.length === 0

  return (
    <div>
      {/* Sticky top bar: search + lang toggle + category pills */}
      <div className="sticky top-0 z-20 bg-white border-b border-[#F0F0F0]">
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "ur" ? "ڈش تلاش کریں..." : "Search dishes..."}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#F8F8F8] text-sm placeholder:text-[#999] focus:outline-none focus:bg-[#F0F0F0] transition-colors"
            />
          </div>
          <button
            onClick={() => setLang((prev) => (prev === "en" ? "ur" : "en"))}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#F8F8F8] text-xs font-medium text-[#555] hover:bg-[#F0F0F0] transition-colors shrink-0"
          >
            <Languages className="w-3.5 h-3.5" />
            <span className={lang === "en" ? "text-black font-semibold" : ""}>EN</span>
            <span className="text-[#CCC]">/</span>
            <span className={`${lang === "ur" ? "text-black font-semibold font-urdu" : ""}`}>UR</span>
          </button>
        </div>
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelect={(id) => setActiveCategory(id === activeCategory ? null : id)}
          lang={lang}
        />
      </div>

      {/* Dish grid (Photo-First Card Grid - Zomato style) */}
      <div className="px-4 py-4">
        {noResults ? (
          <div className="py-16 text-center">
            <Search className="w-8 h-8 text-[#DDD] mx-auto mb-3" />
            <p className="text-sm text-[#999]">
              {lang === "ur" ? "کوئی ڈش نہیں ملی" : "No dishes found"}
            </p>
            <button onClick={() => setSearch("")} className="text-sm text-[#FF6B35] font-medium mt-2 hover:underline">
              {lang === "ur" ? "صاف کریں" : "Clear search"}
            </button>
          </div>
        ) : (
          <DishGrid categories={searched} lang={lang} />
        )}
      </div>

      <CartBar />
    </div>
  )
}
