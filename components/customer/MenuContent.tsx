"use client"

import { useState, useEffect, useRef } from "react"
import { CategoryTabs } from "./CategoryTabs"
import { DishGrid } from "./DishGrid"
import { CartBar } from "./CartBar"
import { useCartStore } from "@/stores/cartStore"
import { Search } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import type { Category, Dish } from "@/types"

interface Props {
  categories: (Category & { dishes: Dish[] })[]
  restaurantId: string
  restaurantName: string
}

export function MenuContent({ categories, restaurantId, restaurantName }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const { lang, setLang, t } = useI18n()
  const setRestaurant = useCartStore((s) => s.setRestaurant)
  const clearCart = useCartStore((s) => s.clearCart)
  const currentRestaurantId = useCartStore((s) => s.restaurantId)
  const searchRef = useRef<HTMLInputElement>(null)

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
      {/* Sticky Search & Filter */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md">
        <div className="px-4 pt-4 pb-0">
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555] group-focus-within:text-black transition-colors" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("customer.searchDishes")}
                className="w-full bg-[#F9FAFB] border border-[#F0F0F0] rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-black transition-all placeholder:text-[#999]"
              />
            </div>
            <button
              onClick={() => setLang(lang === "en" ? "ur" : "en")}
              className="bg-[#F9FAFB] border border-[#F0F0F0] px-4 rounded-xl flex items-center gap-2 hover:bg-[#F0F0F0] transition-colors text-sm font-semibold"
            >
              <span className={lang === "en" ? "text-black" : "text-[#555]"}>EN</span>
              <span className="w-px h-4 bg-[#F0F0F0]" />
              <span className={lang === "ur" ? "text-black font-urdu" : "text-[#555]"}>اردو</span>
            </button>
          </div>
        </div>
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelect={(id) => setActiveCategory(id === activeCategory ? null : id)}
        />
      </div>

      {/* Dish List */}
      <div className="px-4 py-4">
        {noResults ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#E1E3E4] flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-[#999]" />
            </div>
            <h4 className="text-lg font-semibold text-black">No results found</h4>
            <p className="text-sm text-[#555] mt-2">Try searching for something else or browse categories.</p>
          </div>
        ) : (
          <DishGrid categories={searched} />
        )}
      </div>

      <CartBar />
    </div>
  )
}
