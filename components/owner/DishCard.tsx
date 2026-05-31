"use client"

import type { Dish } from "@/types"
import { Pencil, Trash2 } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface Props {
  dish: Dish
  onEdit: (dish: Dish) => void
  onDelete: (id: string) => void
  onToggleAvailability: (id: string, available: boolean) => void
}

export function DishCard({ dish, onEdit, onDelete, onToggleAvailability }: Props) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-[#F0F0F0] last:border-b-0">
      {dish.image_url && (
        <div className="w-12 h-12 rounded-[10px] overflow-hidden flex-shrink-0">
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
          <span className={`text-sm font-medium ${!dish.is_available ? "text-[#999] line-through" : ""}`}>
            {dish.name_en}
          </span>
          {dish.name_ur && (
            <span className="text-sm text-[#555] font-urdu">{dish.name_ur}</span>
          )}
        </div>
        <p className="text-sm text-[#555]">{formatPrice(dish.price)}</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onToggleAvailability(dish.id, !dish.is_available)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            dish.is_available
              ? "bg-[#16A34A]/10 text-[#16A34A]"
              : "bg-[#DC2626]/10 text-[#DC2626]"
          }`}
        >
          {dish.is_available ? "Available" : "Hidden"}
        </button>
        <button onClick={() => onEdit(dish)} className="p-2 hover:bg-[#F8F8F8] rounded-lg">
          <Pencil className="w-4 h-4 text-[#555]" />
        </button>
        <button onClick={() => onDelete(dish.id)} className="p-2 hover:bg-red-50 rounded-lg">
          <Trash2 className="w-4 h-4 text-[#DC2626]" />
        </button>
      </div>
    </div>
  )
}
