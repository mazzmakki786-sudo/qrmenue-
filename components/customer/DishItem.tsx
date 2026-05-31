"use client"

import type { Dish } from "@/types"
import { useCartStore } from "@/stores/cartStore"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus } from "lucide-react"

interface Props {
  dish: Dish
  lang?: "en" | "ur"
  unavailable?: boolean
}

export function DishItem({ dish, lang = "en", unavailable = false }: Props) {
  const { items, addItem, updateQuantity } = useCartStore()
  const cartItem = items.find((item) => item.dish.id === dish.id)

  const name = lang === "ur" && dish.name_ur ? dish.name_ur : dish.name_en
  const description = lang === "ur" && dish.description_ur ? dish.description_ur : dish.description_en

  return (
    <div className={`flex items-start gap-3 py-4 border-b border-[#F0F0F0] ${unavailable ? "opacity-50" : ""}`}>
      {dish.image_url && (
        <div className="w-16 h-16 rounded-[10px] overflow-hidden flex-shrink-0">
          <img
            src={dish.image_url}
            alt={dish.name_en}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={`text-base font-medium text-[#111] ${lang === "ur" ? "font-urdu" : ""}`}>
            {name}
          </h3>
          {unavailable && <Badge variant="unavailable">Unavailable</Badge>}
        </div>
        {description && (
          <p className={`text-sm text-[#555] mt-0.5 line-clamp-2 ${lang === "ur" ? "font-urdu" : ""}`}>
            {description}
          </p>
        )}
        <p className="text-sm font-semibold text-[#111] mt-1">Rs {dish.price}</p>
      </div>

      <div className="flex-shrink-0">
        {cartItem ? (
          <div className="flex items-center gap-3 bg-black text-white rounded-[8px] px-3 py-1.5">
            <button onClick={() => updateQuantity(dish.id, cartItem.quantity - 1)} className="text-white">
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold min-w-[20px] text-center">{cartItem.quantity}</span>
            <button onClick={() => addItem(dish)} className="text-white">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => addItem(dish)}
            disabled={unavailable}
            className="bg-[#FF6B35] text-white rounded-[8px] px-4 py-1.5 text-sm font-semibold hover:bg-[#E55A25] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Add
          </button>
        )}
      </div>
    </div>
  )
}
