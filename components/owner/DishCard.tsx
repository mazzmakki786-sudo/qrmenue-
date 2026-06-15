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
    <div className="flex items-center gap-4 py-3 border-b border-[#F0F0F0] last:border-b-0">
      {onSelect && (
        <input
          type="checkbox"
          checked={selected || false}
          onChange={() => onSelect(dish.id)}
          className="w-4 h-4 rounded flex-shrink-0 accent-black"
        />
      )}
      {dish.image_url && !imgError ? (
        <div className="w-14 h-14 rounded-[10px] overflow-hidden flex-shrink-0 relative">
          <Image
            src={dish.image_url}
            alt={dish.name_en}
            fill
            className="object-cover"
            sizes="56px"
            onError={() => setImgError(true)}
          />
        </div>
      ) : dish.image_url && imgError ? (
        <div className="w-14 h-14 rounded-[10px] bg-[#F8F8F8] flex items-center justify-center flex-shrink-0">
          <ImageOff className="w-5 h-5 text-[#999]" />
        </div>
      ) : (
        <div className="w-14 h-14 rounded-[10px] bg-[#F8F8F8] flex items-center justify-center flex-shrink-0">
          <ImageOff className="w-5 h-5 text-[#999]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${!dish.is_available ? "text-[#999] line-through" : ""}`}>
            {dish.name_en}
          </span>
          {dish.name_ur && (
            <span className="text-sm text-[#555] font-urdu">{dish.name_ur}</span>
          )}
        </div>
        <p className="text-sm text-[#555]">{formatPrice(dish.price)}</p>
        <DishBadges tags={dish.tags || []} />
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onToggleAvailability(dish.id, !dish.is_available)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            dish.is_available ? "bg-[#16A34A]" : "bg-[#E5E7EB]"
          }`}
          aria-label={dish.is_available ? "Mark as unavailable" : "Mark as available"}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
              dish.is_available ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <button onClick={() => onEdit(dish)} className="p-1.5 hover:bg-[#F8F8F8] rounded-lg">
          <Pencil className="w-3.5 h-3.5 text-[#555]" />
        </button>
        <button onClick={() => onDelete(dish.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
          <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
        </button>
      </div>
    </div>
  )
}
