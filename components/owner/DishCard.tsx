"use client"

import { useState } from "react"
import Image from "next/image"
import type { Dish } from "@/types"
import { Pencil, Trash2, ImageOff } from "lucide-react"
import { DishBadges } from "@/components/customer/DishBadges"
import { formatPrice } from "@/lib/utils"

interface Props {
  dish: Dish
  onEdit: (dish: Dish) => void
  onDelete: (id: string) => void
  onToggleAvailability: (id: string, available: boolean) => void
  selected?: boolean
  onSelect?: (id: string) => void
}

export function DishCard({ dish, onEdit, onDelete, onToggleAvailability, selected, onSelect }: Props) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b border-[#F0F0F0] last:border-b-0">
      {onSelect && (
        <input
          type="checkbox"
          checked={selected || false}
          onChange={() => onSelect(dish.id)}
          className="w-4 h-4 rounded flex-shrink-0 accent-black"
        />
      )}
      {dish.image_url && !imgError ? (
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative">
          <Image
            src={dish.image_url}
            alt={dish.name_en}
            fill
            className="object-cover"
            sizes="48px"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-xl bg-[#F8F8F8] flex items-center justify-center flex-shrink-0">
          <ImageOff className="w-4 h-4 text-[#999]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium truncate ${!dish.is_available ? "text-[#999] line-through" : ""}`}>
            {dish.name_en}
          </span>
          {dish.name_ur && (
            <span className="text-xs text-[#999] font-urdu shrink-0">{dish.name_ur}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-semibold text-black">{formatPrice(dish.price)}</span>
          <DishBadges tags={dish.tags || []} />
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => onToggleAvailability(dish.id, !dish.is_available)}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            dish.is_available ? "bg-[#16A34A]" : "bg-[#E5E7EB]"
          }`}
          aria-label={dish.is_available ? "Mark as unavailable" : "Mark as available"}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
              dish.is_available ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <button onClick={() => onEdit(dish)} className="p-1.5 hover:bg-[#F8F8F8] rounded-lg transition-colors">
          <Pencil className="w-3.5 h-3.5 text-[#555]" />
        </button>
        <button onClick={() => onDelete(dish.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
        </button>
      </div>
    </div>
  )
}
