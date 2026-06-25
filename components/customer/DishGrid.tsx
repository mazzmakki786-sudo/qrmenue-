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
            <h2 className={`text-lg font-bold text-text-primary mb-6 border-l-4 border-primary pl-3 ${lang === "ur" ? "font-urdu" : ""}`}>
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
              <p className="text-sm text-[#999] py-8 text-center"><span className="text-text-secondary">{lang === "ur" ? "کوئی ڈش نہیں" : "No dishes in this category"}</span></p>
            )}
          </section>
        )
      })}
    </div>
  )
}

export const Card = React.memo(function Card({ dish, unavailable = false }: { dish: Dish; unavailable?: boolean }) {
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
    <div className={`group flex gap-4 p-4 bg-white rounded-2xl border border-border hover:border-[#E8E8E8] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ${unavailable ? "opacity-50" : ""}`}>
      {/* Image */}
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
          <div className="w-full h-full bg-[#E1E3E4] flex items-center justify-center">
            <ImageOff className="w-6 h-6 text-[#BBB]" />
          </div>
        )}
        {badges.length > 0 && (
          <div className="absolute top-1 left-1 z-10">
            <DishBadges tags={badges} />
          </div>
        )}
        {unavailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
            <span className="text-white text-[10px] font-semibold bg-black/60 px-2 py-0.5 rounded-full">Unavailable</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-start mb-1 gap-2">
          <div className="min-w-0 flex-1">
            <h3 className={`text-sm font-semibold text-text-primary line-clamp-1 ${lang === "ur" ? "font-urdu" : ""}`}>
              {name}
            </h3>
            {nameSecondary && (
              <p className={`text-xs text-text-secondary line-clamp-1 ${lang !== "ur" ? "font-urdu" : ""}`}>
                {nameSecondary}
              </p>
            )}

          </div>
          <span className="text-sm font-bold text-text-primary shrink-0">
            Rs {dish.price.toLocaleString("en-PK")}
          </span>
        </div>

        {description && (
          <p className="text-xs text-text-secondary line-clamp-2 mb-2">
            {description}
          </p>
        )}

        <div className="mt-auto flex justify-end">
          {cartItem ? (
            <div className="flex items-center gap-3 bg-[#F5F5F5] rounded-full px-3 py-1.5">
              <button
                onClick={() => updateQuantity(dish.id, cartItem.quantity - 1)}
                className="min-h-[32px] min-w-[32px] flex items-center justify-center hover:opacity-70 transition-opacity text-[16px] text-primary"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="text-[14px] font-bold min-w-[20px] text-center text-text-primary">{cartItem.quantity}</span>
              <button
                onClick={() => addItem(dish)}
                className="min-h-[32px] min-w-[32px] flex items-center justify-center hover:opacity-70 transition-opacity text-[16px] text-primary"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => addItem(dish)}
              disabled={unavailable}
              className="bg-primary text-white rounded-full px-4 py-1.5 text-xs font-semibold hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50"
            >
              + Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
})
