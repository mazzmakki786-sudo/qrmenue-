"use client"

import { useRef, useEffect } from "react"
import type { Category, Dish } from "@/types"

interface Props {
  categories: (Category & { dishes: Dish[] })[]
  activeCategory: string | null
  onSelect: (categoryId: string | null) => void
  lang?: "en" | "ur"
}

export function CategoryTabs({ categories, activeCategory, onSelect, lang = "en" }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    }
  }, [activeCategory])

  return (
    <div ref={scrollRef} className="overflow-x-auto scrollbar-hide [mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent_100%)]">
      <div className="flex gap-1.5 px-4 pb-3">
        <button
          onClick={() => onSelect(null)}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !activeCategory
              ? "bg-black text-white shadow-sm"
              : "bg-[#F8F8F8] text-[#555] hover:bg-[#F0F0F0]"
          } ${lang === "ur" ? "font-urdu" : ""}`}
        >
          {lang === "ur" ? "تمام" : "All"}
          <span className="ml-1.5 text-xs opacity-60">({categories.length})</span>
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
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-black text-white shadow-sm"
                  : "bg-[#F8F8F8] text-[#555] hover:bg-[#F0F0F0]"
              } ${lang === "ur" ? "font-urdu" : ""}`}
            >
              {label}
              <span className="ml-1.5 text-xs opacity-60">({count})</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
