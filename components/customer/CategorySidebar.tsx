"use client"

import type { Category, Dish } from "@/types"
import { UtensilsCrossed } from "lucide-react"

interface Props {
  categories: (Category & { dishes: Dish[] })[]
  activeCategory: string | null
  onSelect: (categoryId: string | null) => void
  lang?: "en" | "ur"
}

export function CategorySidebar({ categories, activeCategory, onSelect, lang = "en" }: Props) {
  return (
    <div className="space-y-1">
      <button
        onClick={() => onSelect(null)}
        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
          !activeCategory
            ? "bg-black text-white shadow-sm"
            : "text-[#555] hover:bg-[#F8F8F8]"
        } ${lang === "ur" ? "font-urdu" : ""}`}
      >
        {lang === "ur" ? "تمام" : "All Menu"}
        <span className="ml-2 text-xs opacity-60">{categories.length}</span>
      </button>
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id
        const label = lang === "ur" && cat.name_ur ? cat.name_ur : cat.name_en
        const count = cat.dishes.filter((d) => d.is_available).length
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(isActive ? null : cat.id)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
              isActive
                ? "bg-black text-white shadow-sm"
                : "text-[#555] hover:bg-[#F8F8F8]"
            } ${lang === "ur" ? "font-urdu" : ""}`}
          >
            <span>{label}</span>
            <span className={`text-xs ${isActive ? "text-white/60" : "text-[#BBB]"}`}>{count}</span>
          </button>
        )
      })}
      {categories.length === 0 && (
        <div className="text-center py-8">
          <UtensilsCrossed className="w-6 h-6 text-[#DDD] mx-auto mb-2" />
          <p className="text-xs text-[#999]">{lang === "ur" ? "کوئی زمرہ نہیں" : "No categories"}</p>
        </div>
      )}
    </div>
  )
}
