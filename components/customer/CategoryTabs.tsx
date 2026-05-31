"use client"

import { useRef } from "react"
import type { Category } from "@/types"

interface Props {
  categories: Category[]
  activeCategory: string | null
  onSelect: (categoryId: string) => void
  lang?: "en" | "ur"
}

export function CategoryTabs({ categories, activeCategory, onSelect, lang = "en" }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={scrollRef}
      className="sticky top-0 z-10 bg-white border-b border-[#F0F0F0] overflow-x-auto scrollbar-hide"
    >
      <div className="flex gap-1 px-4 py-3">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id
          const label = lang === "ur" && cat.name_ur ? cat.name_ur : cat.name_en
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-black text-white"
                  : "bg-[#F8F8F8] text-[#555] hover:bg-[#F0F0F0]"
              } ${lang === "ur" ? "font-urdu" : ""}`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
