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

  const totalDishes = categories.reduce(
    (sum, cat) => sum + cat.dishes.filter((d) => d.is_available).length,
    0
  )

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    }
  }, [activeCategory])

  return (
    <div className="relative overflow-hidden pb-2 pt-6 px-4">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      <div ref={scrollRef} className="flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onSelect(null)}
          className={`relative flex-shrink-0 px-6 py-2 rounded-full text-[14px] font-semibold transition-colors ${
            !activeCategory
              ? "bg-black text-white"
              : "bg-[#F5F5F5] text-[#666] hover:bg-[#EEE]"
          } ${lang === "ur" ? "font-urdu" : ""}`}
        >
          {lang === "ur" ? "تمام" : "All"}
          <span className={`text-[10px] ml-2 ${!activeCategory ? "bg-white/20 text-white" : "bg-[#F0F0F0] text-[#666]"} px-1.5 rounded-full`}>
            {totalDishes}
          </span>
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
              className={`relative flex-shrink-0 px-6 py-2 rounded-full text-[14px] font-semibold transition-colors ${
                isActive
                  ? "bg-black text-white"
                  : "bg-[#F5F5F5] text-[#666] hover:bg-[#EEE]"
              } ${lang === "ur" ? "font-urdu" : ""}`}
            >
              {label}
              <span className={`text-[10px] ml-2 ${isActive ? "bg-white/20 text-white" : "bg-[#F0F0F0] text-[#666]"} px-1.5 rounded-full`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
