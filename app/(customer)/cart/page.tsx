"use client"

import { useCartStore } from "@/stores/cartStore"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ArrowLeft, Store } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/utils"

export default function CartPage() {
  const router = useRouter()
  const { items, getTotalPrice, updateQuantity, removeItem, restaurantName } = useCartStore()

  if (items.length === 0 || !restaurantName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-14 h-14 rounded-2xl bg-[#F5F5F5] flex items-center justify-center mb-4">
          <Store className="w-6 h-6 text-[#999]" />
        </div>
        <p className="font-semibold mb-1">Your cart is empty</p>
        <p className="text-sm text-[#888] mb-6">Add items from a restaurant menu</p>
        <Link href="/restaurants">
          <Button variant="primary">Browse Restaurants</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-[180px]">
      <div className="flex items-center gap-3 px-4 h-14 border-b border-[#F0F0F0]">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Your Cart</h1>
      </div>

      <div className="px-4 py-3 border-b border-[#F0F0F0] bg-[#FAFAFA]">
        <div className="flex items-center gap-2 text-sm">
          <Store className="w-4 h-4 text-[#888]" />
          <span className="font-medium">{restaurantName}</span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {items.map((item) => (
          <div key={item.dish.id} className="flex items-center gap-4 py-3 border-b border-[#F0F0F0]">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.dish.name_en}</p>
              <p className="text-sm text-[#888] mt-0.5">{formatPrice(item.dish.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center hover:bg-[#EEE] transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold min-w-[24px] text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.dish.id, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#1A1A1A] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => removeItem(item.dish.id)}
                className="p-2 text-[#DC2626] hover:bg-red-50 rounded-lg ml-1 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-[60px] left-0 right-0 bg-white border-t border-[#F0F0F0] p-4 z-40 md:max-w-app md:mx-auto md:left-[calc(50%-240px)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[#888]">{items.reduce((s, i) => s + i.quantity, 0)} items</span>
          <span className="text-lg font-bold">{formatPrice(getTotalPrice())}</span>
        </div>
        <Link href="/checkout">
          <Button variant="primary" fullWidth size="lg">
            Checkout →
          </Button>
        </Link>
      </div>
    </div>
  )
}
