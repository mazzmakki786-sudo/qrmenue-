"use client"

import { useCartStore } from "@/stores/cartStore"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"

export function CartBar() {
  const items = useCartStore((s) => s.items)
  const deliveryFee = useCartStore((s) => s.deliveryFee)
  const restaurantId = useCartStore((s) => s.restaurantId)

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const totalPrice = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0)
    return subtotal + deliveryFee
  }, [items, deliveryFee])

  if (totalItems === 0 || !restaurantId) return null

  return (
    <Link
      href="/cart"
      className="fixed bottom-12 left-3 right-3 z-[60] max-w-[568px] mx-auto animate-slide-up"
    >
      <div className="bg-black text-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden ring-1 ring-white/10">
        <div className="flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full border-2 border-black px-1 animate-scale-up">
                {totalItems}
              </span>
            </div>
            <div>
              <p className={`text-[11px] text-white/60 uppercase tracking-widest font-medium`}>
                {totalItems === 1 ? "1 item" : `${totalItems} items`}
              </p>
              <p className="text-[18px] font-bold leading-tight">Rs {totalPrice.toLocaleString("en-PK")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/60 font-medium">View Cart</span>
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
