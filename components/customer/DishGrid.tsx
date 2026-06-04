import type { Category, Dish } from "@/types"
import { UtensilsCrossed, Plus, Minus, ImageOff } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { DishBadges } from "./DishBadges"
import { useCartStore } from "@/stores/cartStore"

interface Props {
  categories: (Category & { dishes: Dish[] })[]
  lang?: "en" | "ur"
}

export function DishGrid({ categories, lang = "en" }: Props) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-xl bg-[#F8F8F8] flex items-center justify-center mx-auto mb-3">
          <UtensilsCrossed className="w-6 h-6 text-[#999]" />
        </div>
        <p className="text-sm text-[#999]">No menu items available</p>
      </div>
    )
  }

  return (
    <div>
      {categories.map((category) => {
        const categoryLabel = lang === "ur" && category.name_ur ? category.name_ur : category.name_en
        const availableDishes = category.dishes.filter((d) => d.is_available)
        const unavailableDishes = category.dishes.filter((d) => !d.is_available)

        return (
          <div key={category.id} id={`cat-${category.id}`} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 rounded-full bg-[#FF6B35]" />
              <h2 className={`text-sm font-bold uppercase tracking-wider text-[#111] ${lang === "ur" ? "font-urdu" : ""}`}>
                {categoryLabel}
              </h2>
              <span className="text-xs text-[#BBB]">({availableDishes.length})</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {availableDishes.map((dish) => (
                <Card key={dish.id} dish={dish} lang={lang} />
              ))}
              {unavailableDishes.map((dish) => (
                <Card key={dish.id} dish={dish} lang={lang} unavailable />
              ))}
            </div>
            {availableDishes.length === 0 && unavailableDishes.length === 0 && (
              <p className="text-sm text-[#999] py-8 text-center">{lang === "ur" ? "کوئی ڈش نہیں" : "No dishes in this category"}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Card({ dish, lang = "en", unavailable = false }: { dish: Dish; lang?: "en" | "ur"; unavailable?: boolean }) {
  const [imgError, setImgError] = useState(false)
  const { items, addItem, updateQuantity } = useCartStore()
  const cartItem = items.find((item) => item.dish.id === dish.id)

  const name = lang === "ur" && dish.name_ur ? dish.name_ur : dish.name_en
  const description = lang === "ur" && dish.description_ur ? dish.description_ur : dish.description_en

  return (
    <div className={`group bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden hover:shadow-lg hover:border-[#DDD] transition-all ${unavailable ? "opacity-50" : ""}`}>
      <div className="relative">
        {dish.image_url && !imgError ? (
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <Image
              src={dish.image_url}
              alt={dish.name_en}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 250px"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        ) : (
          <div className="w-full aspect-[4/3] bg-gradient-to-br from-[#F8F8F8] to-[#EEE] flex items-center justify-center">
            <ImageOff className="w-8 h-8 text-[#BBB]" />
          </div>
        )}
        {dish.tags && dish.tags.length > 0 && (
          <div className="absolute top-2 left-2">
            <DishBadges tags={dish.tags.slice(0, 1)} />
          </div>
        )}
        {unavailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-semibold bg-black/60 px-3 py-1 rounded-full">Unavailable</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className={`text-sm font-semibold text-[#111] leading-snug line-clamp-2 ${lang === "ur" ? "font-urdu" : ""}`}>
            {name}
          </h3>
          <span className="text-sm font-bold text-[#111] whitespace-nowrap shrink-0">Rs {dish.price}</span>
        </div>
        {description && (
          <p className={`text-xs text-[#555] leading-relaxed line-clamp-2 mb-2 ${lang === "ur" ? "font-urdu" : ""}`}>
            {description}
          </p>
        )}
        <div className="mt-2">
          {cartItem ? (
            <div className="flex items-center justify-between bg-black text-white rounded-[10px] px-3 py-1.5">
              <button onClick={() => updateQuantity(dish.id, cartItem.quantity - 1)} className="hover:opacity-70">
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold">{cartItem.quantity} in cart</span>
              <button onClick={() => addItem(dish)} className="hover:opacity-70">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addItem(dish)}
              disabled={unavailable}
              className="w-full flex items-center justify-center gap-1.5 bg-[#FF6B35] hover:bg-[#E55A25] text-white rounded-[10px] px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
