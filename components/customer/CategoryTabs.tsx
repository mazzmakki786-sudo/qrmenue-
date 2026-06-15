"use client"

import { useRef, useEffect } from "react"
import { useI18n } from "@/lib/i18n/context"
import type { Category, Dish } from "@/types"

interface Props {
  categories: (Category & { dishes: Dish[] })[]
  activeCategory: string | null
  onSelect: (categoryId: string | null) => void
}

export function CategoryTabs({ categories, activeCategory, onSelect }: Props) {
  const { lang } = useI18n()
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    }
  }, [activeCategory])

  return (
    <div className="overflow-x-auto no-scrollbar pb-3 pt-6 px-4">
      <div className="flex gap-2">
        <button
          onClick={() => onSelect(null)}
          className={`flex-shrink-0 px-6 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 ${
            !activeCategory
              ? "bg-black text-white shadow-sm"
              : "bg-[#F9FAFB] text-[#555] hover:bg-[#F0F0F0]"
          } ${lang === "ur" ? "font-urdu" : ""}`}
        >
          {lang === "ur" ? "تمام" : "All"}
          <span className="text-[10px] bg-[#F0F0F0] px-1.5 rounded-full">{categories.length}</span>
        </button>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id
          const label = lang === "ur" && cat.name_ur ? cat.name_ur : cat.name_en
          const count = cat.dishes.filter((d) => d.is_available).length
          return (
            <button
              key={cat.id}
              ref={isActive ? activeRef : null}
              onClick={() => onSelect(isActive ? null : cat.id)}
              className={`flex-shrink-0 px-6 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 ${
                isActive
                  ? "bg-black text-white shadow-sm"
                  : "bg-[#F9FAFB] text-[#555] hover:bg-[#F0F0F0]"
              } ${lang === "ur" ? "font-urdu" : ""}`}
            >
              {label}
              <span className={`text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-[#F0F0F0] text-[#555]"} px-1.5 rounded-full`}>{count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
