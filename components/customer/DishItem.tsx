"use client"

import { useState } from "react"
import Image from "next/image"
import type { Dish } from "@/types"
import { useCartStore } from "@/stores/cartStore"
import { Badge } from "@/components/ui/badge"
import { DishBadges } from "./DishBadges"
import { Plus, Minus, ImageOff } from "lucide-react"

interface Props {
  dish: Dish
  lang?: "en" | "ur"
  unavailable?: boolean
  compact?: boolean
}

export function DishItem({ dish, lang = "en", unavailable = false, compact = false }: Props) {
  const [imgError, setImgError] = useState(false)
  const { items, addItem, updateQuantity } = useCartStore()
  const cartItem = items.find((item) => item.dish.id === dish.id)

  const name = lang === "ur" && dish.name_ur ? dish.name_ur : dish.name_en
  const description = lang === "ur" && dish.description_ur ? dish.description_ur : dish.description_en

  if (compact) {
    return (
      <div className={`group flex items-center gap-3 py-3 border-b border-[#F0F0F0] last:border-b-0 ${unavailable ? "opacity-50" : ""}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className={`text-sm font-semibold text-[#111] ${lang === "ur" ? "font-urdu" : ""}`}>
              {name}
            </h3>
            <span className="text-sm font-bold text-[#111] whitespace-nowrap">Rs {dish.price}</span>
          </div>
          <DishBadges tags={dish.tags || []} />
          {description && (
            <p className={`text-xs text-[#555] mt-0.5 leading-relaxed line-clamp-1 ${lang === "ur" ? "font-urdu" : ""}`}>
              {description}
            </p>
          )}
          {unavailable && <Badge variant="unavailable" className="mt-1">Unavailable</Badge>}
        </div>
        <div className="shrink-0">
          {cartItem ? (
            <div className="flex items-center gap-2 bg-black text-white rounded-[8px] px-2.5 py-1">
              <button onClick={() => updateQuantity(dish.id, cartItem.quantity - 1)} className="hover:opacity-70">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-semibold min-w-[18px] text-center">{cartItem.quantity}</span>
              <button onClick={() => addItem(dish)} className="hover:opacity-70">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addItem(dish)}
              disabled={unavailable}
              className="bg-[#FF6B35] text-white rounded-[8px] px-3 py-1 text-xs font-semibold hover:bg-[#E55A25] transition-colors disabled:opacity-50"
            >
              + Add
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`group flex gap-4 py-4 border-b border-[#F0F0F0] last:border-b-0 ${unavailable ? "opacity-50" : ""}`}>
      {dish.image_url && !imgError ? (
        <div className="w-[100px] h-[100px] rounded-xl overflow-hidden flex-shrink-0 relative">
          <Image
            src={dish.image_url}
            alt={dish.name_en}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="100px"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div className="w-[100px] h-[100px] rounded-xl bg-gradient-to-br from-[#F8F8F8] to-[#EEE] flex items-center justify-center flex-shrink-0 border border-[#E8E8E8]">
          <ImageOff className="w-6 h-6 text-[#BBB]" />
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className={`text-base font-semibold text-[#111] leading-snug ${lang === "ur" ? "font-urdu" : ""}`}>
              {name}
            </h3>
            <span className="text-base font-bold text-[#111] whitespace-nowrap">Rs {dish.price}</span>
          </div>
          <DishBadges tags={dish.tags || []} />
          {description && (
            <p className={`text-sm text-[#555] mt-1.5 leading-relaxed ${lang === "ur" ? "font-urdu" : ""}`}>
              {description}
            </p>
          )}
          {unavailable && <Badge variant="unavailable" className="mt-1.5">Unavailable</Badge>}
        </div>
        <div className="mt-2 self-start">
          {cartItem ? (
            <div className="flex items-center gap-3 bg-black text-white rounded-[10px] px-3 py-1.5">
              <button onClick={() => updateQuantity(dish.id, cartItem.quantity - 1)} className="hover:opacity-70 transition-opacity">
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold min-w-[24px] text-center">{cartItem.quantity}</span>
              <button onClick={() => addItem(dish)} className="hover:opacity-70 transition-opacity">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addItem(dish)}
              disabled={unavailable}
              className="flex items-center gap-1.5 bg-[#FF6B35] text-white rounded-[10px] px-4 py-1.5 text-sm font-semibold hover:bg-[#E55A25] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
