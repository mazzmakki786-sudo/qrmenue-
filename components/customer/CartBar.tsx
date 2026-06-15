"use client"

import { useCartStore } from "@/stores/cartStore"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"

export function CartBar() {
  const items = useCartStore((s) => s.items)
  const getTotalItems = useCartStore((s) => s.getTotalItems)
  const getTotalPrice = useCartStore((s) => s.getTotalPrice)
  const restaurantName = useCartStore((s) => s.restaurantName)
  const totalItems = getTotalItems()

  if (totalItems === 0) return null

  return (
    <Link
      href="/cart"
      className="fixed bottom-[60px] left-0 right-0 z-40 mx-4 mb-3 animate-slide-up"
    >
      <div className="bg-black text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl shadow-black/20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="absolute -top-1 -right-1 bg-[#25D366] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
              {totalItems}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight">
              {totalItems} item{totalItems > 1 ? "s" : ""}
            </p>
            {restaurantName && (
              <p className="text-[11px] text-white/60 truncate">{restaurantName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-bold text-lg">Rs {getTotalPrice().toLocaleString("en-PK")}</span>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
