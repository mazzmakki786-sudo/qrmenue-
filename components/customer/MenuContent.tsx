"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { CategoryTabs } from "./CategoryTabs"
import { DishGrid } from "./DishGrid"
import { useCartStore } from "@/stores/cartStore"
import { Search, X } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import type { Category, Dish } from "@/types"

interface Props {
  categories: (Category & { dishes: Dish[] })[]
  restaurantId: string
  restaurantName: string
  deliveryFee?: number
  restaurantSlug?: string
}

export function MenuContent({ categories, restaurantId, restaurantName, deliveryFee, restaurantSlug }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const { lang, setLang, t } = useI18n()
  const setRestaurant = useCartStore((s) => s.setRestaurant)
  const clearCart = useCartStore((s) => s.clearCart)
  const currentRestaurantId = useCartStore((s) => s.restaurantId)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (currentRestaurantId && currentRestaurantId !== restaurantId) {
      clearCart()
    }
    setRestaurant(restaurantId, restaurantName, restaurantSlug ?? '', deliveryFee ?? 0)
  }, [restaurantId, restaurantName, restaurantSlug, deliveryFee])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleClearSearch = useCallback(() => {
    setSearchInput("")
    setDebouncedSearch("")
    searchRef.current?.focus()
  }, [])

  const filtered = activeCategory
    ? categories.filter((c) => c.id === activeCategory)
    : categories

  const searched = debouncedSearch.trim()
    ? filtered
        .map((cat) => ({
          ...cat,
          dishes: cat.dishes.filter((d) => {
            const name = lang === "ur" && d.name_ur ? d.name_ur : d.name_en
            const desc = lang === "ur" && d.description_ur ? d.description_ur : d.description_en
            const q = debouncedSearch.toLowerCase()
            return name.toLowerCase().includes(q) || (desc || "").toLowerCase().includes(q)
          }),
        }))
        .filter((cat) => cat.dishes.length > 0)
    : filtered

  const noResults = debouncedSearch && searched.length === 0

  return (
    <div>
      {/* Sticky Search & Filter */}
      <div className="sticky top-0 z-40 bg-white/90" style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
        <div className="pt-4 pb-0">
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
              <input
                ref={searchRef}
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("customer.searchDishes")}
                className="w-full bg-[#F9FAFB] border border-border rounded-xl py-3 pl-12 pr-4 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#F5F5F5] flex items-center justify-center hover:bg-[#E8E8E8] transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3 text-primary" />
                </button>
              )}
            </div>
            <button
              onClick={() => setLang(lang === "en" ? "ur" : "en")}
              className="bg-[#F9FAFB] border border-border px-4 rounded-xl flex items-center gap-2 hover:bg-[#F5F5F5] transition-colors text-[14px] font-semibold"
            >
              <span className={lang === "en" ? "text-primary" : "text-text-muted"}>EN</span>
              <span className="w-px h-4 bg-border" />
              <span className={lang === "ur" ? "text-primary font-urdu" : "text-text-muted"}>اردو</span>
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
      <div className="mt-4">
        {noResults ? (
          <div className="py-20 text-center">
            <Search className="w-10 h-10 text-[#999] mx-auto mb-4" />
            <h4 className="text-[16px] font-semibold text-text-primary">No results found</h4>
            <p className="text-[14px] text-text-secondary mt-2">Try searching for something else or browse categories.</p>
          </div>
        ) : (
          <DishGrid categories={searched} />
        )}
      </div>
    </div>
  )
}
