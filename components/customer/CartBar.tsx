"use client"

import { useCartStore } from "@/stores/cartStore"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"

export function CartBar() {
  const { items, getTotalItems, getTotalPrice } = useCartStore()
  const totalItems = getTotalItems()

  if (totalItems === 0) return null

  return (
    <Link
      href="/cart"
      className="fixed bottom-[60px] left-0 right-0 z-40 mx-4 mb-3"
    >
      <div className="bg-black text-white rounded-[12px] px-5 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-[#FF6B35] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <span className="text-sm">{totalItems} item{totalItems > 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Rs {getTotalPrice().toLocaleString("en-PK")}</span>
          <span className="text-sm opacity-70">View →</span>
        </div>
      </div>
    </Link>
  )
}
