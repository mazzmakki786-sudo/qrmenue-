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
      <div className="text-center py-12 animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center mx-auto mb-3">
          <UtensilsCrossed className="w-6 h-6 text-text-muted" />
        </div>
        <p className="text-sm text-text-muted">No menu items available</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryLabel = lang === "ur" && category.name_ur ? category.name_ur : category.name_en
        const availableDishes = category.dishes.filter((d) => d.is_available)
        const unavailableDishes = category.dishes.filter((d) => !d.is_available)

        return (
          <section key={category.id} id={`cat-${category.id}`}>
            <h2 className={`text-base font-bold text-text-primary mb-4 border-l-[3px] border-primary pl-3 leading-tight ${lang === "ur" ? "font-urdu" : ""}`}>
              {categoryLabel}
            </h2>
            <div className="space-y-3">
              {availableDishes.map((dish) => (
                <Card key={dish.id} dish={dish} />
              ))}
              {unavailableDishes.map((dish) => (
                <Card key={dish.id} dish={dish} unavailable />
              ))}
            </div>
            {availableDishes.length === 0 && unavailableDishes.length === 0 && (
              <p className="text-sm text-text-muted py-6 text-center">{lang === "ur" ? "کوئی ڈش نہیں" : "No dishes in this category"}</p>
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
    <div className={`group flex gap-3.5 p-3.5 bg-white rounded-2xl border border-border hover:border-border-strong hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 ${unavailable ? "opacity-50" : ""}`}>
      {/* Image */}
      <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl bg-surface">
        {dish.image_url && !imgError ? (
          <Image
            src={dish.image_url}
            alt={dish.name_en}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="96px"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-6 h-6 text-text-muted/40" />
          </div>
        )}
        {badges.length > 0 && (
          <div className="absolute top-1 left-1 z-10">
            <DishBadges tags={badges} />
          </div>
        )}
        {unavailable && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
            <span className="text-white text-[10px] font-semibold bg-black/60 px-2.5 py-1 rounded-full">Unavailable</span>
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
              <p className={`text-[11px] text-text-secondary line-clamp-1 mt-0.5 ${lang !== "ur" ? "font-urdu" : ""}`}>
                {nameSecondary}
              </p>
            )}
          </div>
          <span className="text-sm font-bold text-text-primary shrink-0 mt-0.5">
            Rs {dish.price.toLocaleString("en-PK")}
          </span>
        </div>

        {description && (
          <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-2 mb-2">
            {description}
          </p>
        )}

        <div className="mt-auto flex justify-end">
          {cartItem ? (
            <div className="flex items-center gap-2 bg-surface-dark rounded-full px-2.5 py-1 min-h-[36px] animate-scale-up">
              <button
                onClick={() => updateQuantity(dish.id, cartItem.quantity - 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-primary font-bold hover:bg-white/50 transition-colors text-[18px]"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="text-[14px] font-bold min-w-[22px] text-center text-text-primary">{cartItem.quantity}</span>
              <button
                onClick={() => addItem(dish)}
                className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors text-[18px] font-bold"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => addItem(dish)}
              disabled={unavailable}
              className="bg-primary text-white rounded-full px-4 py-1.5 text-xs font-semibold hover:bg-primary-hover active:scale-[0.95] transition-all duration-200 disabled:opacity-50 flex items-center gap-1 min-h-[36px]"
            >
              + Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
})
