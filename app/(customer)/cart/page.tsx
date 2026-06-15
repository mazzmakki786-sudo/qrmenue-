"use client"

import { useCartStore } from "@/stores/cartStore"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ArrowLeft, Store, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/utils"

export default function CartPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const getTotalPrice = useCartStore((s) => s.getTotalPrice)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const restaurantName = useCartStore((s) => s.restaurantName)

  if (items.length === 0 || !restaurantName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-14 h-14 rounded-2xl bg-[#F9FAFB] flex items-center justify-center mb-4">
          <Store className="w-6 h-6 text-[#999]" />
        </div>
        <p className="font-semibold mb-1">Your cart is empty</p>
        <p className="text-sm text-[#555] mb-6">Add items from a restaurant menu</p>
        <Link href="/restaurants">
          <Button variant="primary">Browse Restaurants</Button>
        </Link>
      </div>
    )
  }

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const subtotal = getTotalPrice()

  return (
    <div className="min-h-screen bg-white pb-40">
      <div className="flex items-center justify-between px-4 h-14 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Your Cart</h1>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-[#DC2626] font-medium active:scale-95 transition-transform"
        >
          Clear All
        </button>
      </div>

      <div className="px-4 py-3 border-b border-[#F0F0F0] bg-[#F9FAFB]">
        <div className="flex items-center gap-2 text-sm">
          <Store className="w-4 h-4 text-[#555]" />
          <span className="font-medium">{restaurantName}</span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {items.map((item) => (
          <div key={item.dish.id} className="flex items-center gap-3 py-3 border-b border-[#F0F0F0] last:border-b-0">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#F5F5F5]">
              {item.dish.image_url ? (
                <Image
                  src={item.dish.image_url}
                  alt={item.dish.name_en}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#CCC]" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.dish.name_en}</p>
              <p className="text-xs text-[#555] mt-0.5">
                {formatPrice(item.dish.price)} × {item.quantity} = {formatPrice(item.dish.price * item.quantity)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-[#F9FAFB] flex items-center justify-center hover:bg-[#F0F0F0] transition-colors"
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

      <div className="px-4 py-4 border-t border-[#F0F0F0] bg-[#FAFAFA] space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#555]">Subtotal ({totalItems} items)</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#555]">Delivery Fee</span>
          <span className="text-[#999] text-xs">To be confirmed</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-[#F0F0F0]">
          <span className="font-bold">Total</span>
          <span className="font-bold text-lg">{formatPrice(subtotal)}</span>
        </div>
      </div>

      <button
        onClick={() => router.back()}
        className="w-full mt-4 mx-4 py-3 rounded-xl text-sm text-[#555] font-semibold border border-[#F0F0F0] hover:bg-[#F5F5F5] transition-colors text-center"
      >
        Continue Browsing →
      </button>

      <div className="fixed bottom-[60px] left-0 right-0 bg-white border-t border-[#F0F0F0] p-4 z-40">
        <Link href="/checkout">
          <Button variant="primary" fullWidth size="lg">
            Checkout →
          </Button>
        </Link>
      </div>
    </div>
  )
}
