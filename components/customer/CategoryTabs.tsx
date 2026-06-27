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
    <div className="relative overflow-hidden pb-2 pt-5 px-4">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-2 w-10 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      <div ref={scrollRef} className="flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onSelect(null)}
          className={`relative flex-shrink-0 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-200 min-h-[40px] ${
            !activeCategory
              ? "bg-primary text-white shadow-sm"
              : "bg-surface border border-border text-text-secondary hover:bg-surface-dark hover:border-border-strong"
          } ${lang === "ur" ? "font-urdu" : ""}`}
        >
          {lang === "ur" ? "تمام" : "All"}
          <span className={`text-[10px] ml-1.5 ${
            !activeCategory
              ? "bg-white/15 text-white"
              : "bg-surface-dark text-text-secondary"
          } px-1.5 py-0.5 rounded-full`}>
            {totalDishes}
          </span>
        </button>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id
          const label = lang === "ur" && cat.name_ur ? cat.name_ur : cat.name_en
          const count = cat.dishes.filter((d) => d.is_available).length
          if (count === 0) return null // hide empty categories
          return (
            <button
              key={cat.id}
              ref={isActive ? activeRef : null}
              onClick={() => onSelect(isActive ? null : cat.id)}
              className={`relative flex-shrink-0 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-200 min-h-[40px] ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface border border-border text-text-secondary hover:bg-surface-dark hover:border-border-strong"
              } ${lang === "ur" ? "font-urdu" : ""}`}
            >
              {label}
              <span className={`text-[10px] ml-1.5 ${
                isActive
                  ? "bg-white/15 text-white"
                  : "bg-surface-dark text-text-secondary"
              } px-1.5 py-0.5 rounded-full`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
