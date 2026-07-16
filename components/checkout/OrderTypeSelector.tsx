"use client"

import type { OrderType } from "@/types"
import { UtensilsCrossed, ShoppingBag, Truck } from "lucide-react"

interface Props {
  selected: OrderType | null
  onSelect: (type: OrderType) => void
  /** When false the dine-in option is greyed out / explained */
  hasTables?: boolean
}

const options: { type: OrderType; label: string; desc: string; icon: typeof UtensilsCrossed }[] = [
  { type: "dine_in", label: "Dine-in", desc: "Eat here", icon: UtensilsCrossed },
  { type: "takeaway", label: "Takeaway", desc: "Pick up", icon: ShoppingBag },
  { type: "delivery", label: "Delivery", desc: "Home delivery", icon: Truck },
]

export function OrderTypeSelector({ selected, onSelect, hasTables = true }: Props) {
  return (
    <div>
      <h2 className="text-[13px] font-semibold text-text-primary mb-3">How would you like to receive it?</h2>
      <div className="grid grid-cols-3 gap-2">
        {options.map(({ type, label, desc, icon: Icon }) => {
          const disabled = type === "dine_in" && !hasTables
          return (
            <button
              key={type}
              onClick={() => !disabled && onSelect(type)}
              data-testid={`order-type-${type}`}
              disabled={disabled}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
                disabled
                  ? "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
                  : selected === type
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-border text-text-secondary hover:border-primary/30 hover:bg-[#FAFAFA]"
              }`}
              title={disabled ? "Dine-in is not available — this restaurant has no tables set up yet" : label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-semibold">{label}</span>
              <span className="text-[9px] opacity-70">{disabled ? "Unavailable" : desc}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
