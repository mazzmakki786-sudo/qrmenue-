"use client"

import React from "react"
import type { Category, Dish } from "@/types"
import { UtensilsCrossed, ImageOff, ArrowUpRight } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { useCartStore } from "@/stores/cartStore"
import { useI18n } from "@/lib/i18n/context"

interface Props {
  categories: (Category & { dishes: Dish[] })[]
}

export function DishGrid({ categories }: Props) {
  const { lang, t } = useI18n()
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-xl bg-[#F9FAFB] flex items-center justify-center mx-auto mb-3">
          <UtensilsCrossed className="w-6 h-6 text-[#999]" />
        </div>
        <p className="text-sm text-[#999]">No menu items available</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {categories.map((category) => {
        const categoryLabel = lang === "ur" && category.name_ur ? category.name_ur : category.name_en
        const availableDishes = category.dishes.filter((d) => d.is_available)
        const unavailableDishes = category.dishes.filter((d) => !d.is_available)

        return (
          <section key={category.id} id={`cat-${category.id}`}>
            <h2 className={`text-lg font-semibold mb-6 border-l-4 border-black pl-3 ${lang === "ur" ? "font-urdu" : ""}`}>
              {categoryLabel}
            </h2>
            <div className="space-y-4">
              {availableDishes.map((dish) => (
                <Card key={dish.id} dish={dish} />
              ))}
              {unavailableDishes.map((dish) => (
                <Card key={dish.id} dish={dish} unavailable />
              ))}
            </div>
            {availableDishes.length === 0 && unavailableDishes.length === 0 && (
              <p className="text-sm text-[#999] py-8 text-center">{lang === "ur" ? "کوئی ڈش نہیں" : "No dishes in this category"}</p>
            )}
          </section>
        )
      })}
    </div>
  )
}

const Card = React.memo(function Card({ dish, unavailable = false }: { dish: Dish; unavailable?: boolean }) {
  const { lang } = useI18n()
  const [imgError, setImgError] = useState(false)
  const { items, addItem, updateQuantity } = useCartStore()
  const cartItem = items.find((item) => item.dish.id === dish.id)

  const name = lang === "ur" && dish.name_ur ? dish.name_ur : dish.name_en
  const nameSecondary = lang === "ur" ? dish.name_en : dish.name_ur
  const description = lang === "ur" && dish.description_ur ? dish.description_ur : dish.description_en
  const isPopular = dish.tags?.includes("popular")

  return (
    <div className={`group flex gap-4 p-4 bg-[#F9FAFB] rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-[#F0F0F0] ${unavailable ? "opacity-50" : ""}`}>
      <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl">
        {dish.image_url && !imgError ? (
          <Image
            src={dish.image_url}
            alt={dish.name_en}
            fill
            className="object-cover"
            sizes="96px"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#F9FAFB] to-[#EEE] flex items-center justify-center">
            <ImageOff className="w-6 h-6 text-[#BBB]" />
          </div>
        )}
        {isPopular && (
          <div className="absolute top-1 right-1 bg-[#25D366] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
            Popular
          </div>
        )}
        {unavailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-[10px] font-semibold bg-black/60 px-2 py-0.5 rounded-full">Unavailable</span>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-start mb-1">
          <div className="min-w-0 mr-2">
            <h3 className={`text-sm font-semibold text-black truncate ${lang === "ur" ? "font-urdu" : ""}`}>
              {name}
            </h3>
            {nameSecondary && (
              <p className={`text-xs text-[#555] truncate ${lang !== "ur" ? "font-urdu" : ""}`}>
                {nameSecondary}
              </p>
            )}
          </div>
          <span className="text-sm font-bold text-black whitespace-nowrap flex-shrink-0">Rs {dish.price}</span>
        </div>
        {description && (
          <p className={`text-xs text-[#555] leading-relaxed line-clamp-2 mb-2 ${lang === "ur" ? "font-urdu" : ""}`}>
            {description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between">
          {dish.tags && dish.tags.length > 0 && !isPopular && (
            <span className="text-[11px] text-[#555] capitalize">{dish.tags[0]}</span>
          )}
          <div className={dish.tags && dish.tags.length > 0 && !isPopular ? "" : "ml-auto"}>
            {cartItem ? (
              <div className="flex items-center gap-3 bg-black text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                <button onClick={() => updateQuantity(dish.id, cartItem.quantity - 1)} className="hover:opacity-70 leading-none">-</button>
                <span>{cartItem.quantity}</span>
                <button onClick={() => addItem(dish)} className="hover:opacity-70 leading-none">+</button>
              </div>
            ) : (
              <button
                onClick={() => addItem(dish)}
                disabled={unavailable}
                className="bg-black text-white px-4 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1"
              >
                + Add
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
