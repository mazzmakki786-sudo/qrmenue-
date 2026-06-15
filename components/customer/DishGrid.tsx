"use client"

import React from "react"
import type { Category, Dish } from "@/types"
import { UtensilsCrossed, ImageOff } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { useCartStore } from "@/stores/cartStore"
import { useI18n } from "@/lib/i18n/context"
import { DishBadges } from "@/components/customer/DishBadges"

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
            <h2 className={`text-lg font-semibold mb-4 border-l-4 border-black pl-3 ${lang === "ur" ? "font-urdu" : ""}`}>
              {categoryLabel}
            </h2>
            <div className="grid grid-cols-2 gap-3">
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
  const items = useCartStore((s) => s.items)
  const addItem = useCartStore((s) => s.addItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const cartItem = items.find((item) => item.dish.id === dish.id)

  const name = lang === "ur" && dish.name_ur ? dish.name_ur : dish.name_en
  const nameSecondary = lang === "ur" ? dish.name_en : dish.name_ur
  const description = lang === "ur" && dish.description_ur ? dish.description_ur : dish.description_en

  const recognizedTags = ["popular", "chef_special", "spicy"]
  const badges = (dish.tags || []).filter((t) => recognizedTags.includes(t))

  return (
    <div className={`bg-white rounded-xl border border-[#E8E8E8] overflow-hidden flex flex-col ${unavailable ? "opacity-50" : ""}`}>
      <div className="relative aspect-square w-full overflow-hidden">
        {dish.image_url && !imgError ? (
          <Image
            src={dish.image_url}
            alt={dish.name_en}
            fill
            className="object-cover rounded-t-xl"
            sizes="(max-width: 768px) 50vw, 25vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#F9FAFB] to-[#EEE] flex items-center justify-center rounded-t-xl">
            <ImageOff className="w-8 h-8 text-[#BBB]" />
          </div>
        )}
        {badges.length > 0 && (
          <div className="absolute top-2 left-2 z-10">
            <DishBadges tags={badges} />
          </div>
        )}
        {unavailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-t-xl">
            <span className="text-white text-[10px] font-semibold bg-black/60 px-2 py-0.5 rounded-full">Unavailable</span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 p-3">
        <h3 className={`text-sm font-semibold text-black line-clamp-1 ${lang === "ur" ? "font-urdu" : ""}`}>
          {name}
        </h3>
        {nameSecondary && (
          <p className={`text-[11px] text-[#555] line-clamp-1 ${lang !== "ur" ? "font-urdu" : ""}`}>
            {nameSecondary}
          </p>
        )}
        <span className="text-sm font-bold text-black mt-1">Rs {dish.price}</span>
        <div className="mt-auto pt-2">
          {cartItem ? (
            <div className="flex items-center justify-between bg-black text-white rounded-full overflow-hidden">
              <button
                onClick={() => updateQuantity(dish.id, cartItem.quantity - 1)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:opacity-70 transition-opacity"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="text-sm font-semibold min-w-[24px] text-center">{cartItem.quantity}</span>
              <button
                onClick={() => addItem(dish)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:opacity-70 transition-opacity"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => addItem(dish)}
              disabled={unavailable}
              className="w-full bg-black text-white py-2.5 rounded-full text-xs font-semibold active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
            >
              + Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
})
