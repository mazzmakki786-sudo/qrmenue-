"use client"

import { useState } from "react"
import { CategoryTabs } from "./CategoryTabs"
import { DishList } from "./DishList"
import { CartBar } from "./CartBar"
import type { Category, Dish } from "@/types"

interface Props {
  categories: (Category & { dishes: Dish[] })[]
}

export function MenuContent({ categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = activeCategory
    ? categories.filter((c) => c.id === activeCategory)
    : categories

  return (
    <div>
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onSelect={(id) => setActiveCategory(id === activeCategory ? null : id)}
      />
      <DishList categories={filtered} />
      <CartBar />
    </div>
  )
}
