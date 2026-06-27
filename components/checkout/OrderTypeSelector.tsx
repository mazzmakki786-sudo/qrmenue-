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
      <h2 className="text-[13px] font-semibold text-text-primary mb-3">How would you like to receive it?</h2>
      <div className="grid grid-cols-3 gap-2">
        {options.map(({ type, label, desc, icon: Icon }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
              selected === type
                ? "bg-primary text-white border-primary"
                : "bg-white border-border text-text-secondary hover:border-primary/30 hover:bg-[#FAFAFA]"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[11px] font-semibold">{label}</span>
            <span className="text-[9px] opacity-70">{desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
