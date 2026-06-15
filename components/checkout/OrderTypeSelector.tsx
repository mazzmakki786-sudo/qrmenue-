"use client"

import type { OrderType } from "@/types"
import { UtensilsCrossed, ShoppingBag, Truck } from "lucide-react"

interface Props {
  selected: OrderType | null
  onSelect: (type: OrderType) => void
}

const options: { type: OrderType; label: string; desc: string; icon: typeof UtensilsCrossed }[] = [
  { type: "dine_in", label: "Dine-in", desc: "Eat here", icon: UtensilsCrossed },
  { type: "takeaway", label: "Takeaway", desc: "Pick up", icon: ShoppingBag },
  { type: "delivery", label: "Delivery", desc: "Home delivery", icon: Truck },
]

export function OrderTypeSelector({ selected, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">How would you like to receive it?</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {options.map(({ type, label, desc, icon: Icon }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-[12px] border transition-all ${
              selected === type
                ? "border-black bg-black text-white"
                : "border-[#F0F0F0] bg-white text-[#555] hover:border-[#CCC]"
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs opacity-70">{desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
