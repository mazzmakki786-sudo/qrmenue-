"use client"

import { useCartStore } from "@/stores/cartStore"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/utils"

export default function CartPage() {
  const router = useRouter()
  const { items, getTotalPrice, updateQuantity, removeItem } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-lg font-medium mb-2">Your cart is empty</p>
        <p className="text-sm text-[#555] mb-6">Add items from the menu to get started</p>
        <Link href="/">
          <Button variant="primary">Browse Menu</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center gap-3 px-4 h-14 border-b border-[#F0F0F0]">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Your Cart</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {items.map((item) => (
          <div key={item.dish.id} className="flex items-center justify-between py-3 border-b border-[#F0F0F0]">
            <div className="flex-1">
              <p className="text-sm font-medium">{item.dish.name_en}</p>
              <p className="text-sm text-[#555]">{formatPrice(item.dish.price)}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-[#F8F8F8] flex items-center justify-center hover:bg-[#F0F0F0]"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium min-w-[24px] text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.dish.id, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#1A1A1A]"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => removeItem(item.dish.id)}
                className="p-2 text-[#DC2626] hover:bg-red-50 rounded-lg ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0] p-4 pb-[calc(16px+env(safe-area-inset-bottom,0px))]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-[#555]">Total</span>
          <span className="text-xl font-bold">{formatPrice(getTotalPrice())}</span>
        </div>
        <Link href="/checkout" className="block w-full">
          <Button variant="primary" fullWidth size="lg">
            Checkout →
          </Button>
        </Link>
      </div>
    </div>
  )
}
