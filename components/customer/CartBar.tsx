"use client"

import { useCartStore } from "@/stores/cartStore"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"

export function CartBar() {
  const items = useCartStore((s) => s.items)
  const getTotalItems = useCartStore((s) => s.getTotalItems)
  const getTotalPrice = useCartStore((s) => s.getTotalPrice)
  const totalItems = getTotalItems()

  if (totalItems === 0) return null

  return (
    <Link
      href="/cart"
      className="fixed bottom-6 left-4 right-4 z-50 max-w-[568px] mx-auto animate-slide-up"
    >
      <div className="bg-black text-white p-4 rounded-2xl shadow-xl flex items-center justify-between active:scale-[0.98] transition-transform">
        <div className="flex items-center gap-4">
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-[#25D366] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-black">
              {totalItems}
            </span>
          </div>
          <div className="text-left">
            <p className="text-[12px] opacity-70 uppercase tracking-widest font-medium">View Cart</p>
            <p className="text-[20px] font-semibold leading-none">Rs {getTotalPrice().toLocaleString("en-PK")}</p>
          </div>
        </div>
        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
