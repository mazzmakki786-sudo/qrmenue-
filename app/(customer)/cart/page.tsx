"use client"

import { useState } from "react"
import { useCartStore } from "@/stores/cartStore"
import { Minus, Plus, Trash2, ArrowLeft, Store, ShoppingBag, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/utils"

export default function CartPage() {
  const router = useRouter()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const items = useCartStore((s) => s.items)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const getTotalPrice = useCartStore((s) => s.getTotalPrice)
  const deliveryFee = useCartStore((s) => s.deliveryFee)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const restaurantName = useCartStore((s) => s.restaurantName)

  if (items.length === 0 || !restaurantName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6">
        <div className="w-20 h-20 rounded-3xl bg-[#F5F5F5] flex items-center justify-center mb-5">
          <ShoppingBag className="w-9 h-9 text-black/20" />
        </div>
        <h2 className="text-lg font-bold text-text-primary mb-1">Your cart is empty</h2>
        <p className="text-sm text-text-secondary mb-8 text-center">Add items from a restaurant menu to get started</p>
        <Link
          href="/restaurants"
          className="bg-primary text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all"
        >
          Browse Restaurants
        </Link>
      </div>
    )
  }

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-[600px] mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-4 h-4 text-text-primary" />
            </button>
            <div>
              <h1 className="text-[15px] font-bold text-text-primary">Your Cart</h1>
              <p className="text-[11px] text-text-muted">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
            </div>
          </div>
          {showClearConfirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  clearCart()
                  setShowClearConfirm(false)
                }}
                className="text-xs text-error font-semibold px-3 py-1.5 rounded-lg bg-error/10 hover:bg-error/20 transition-colors"
              >
                Confirm Clear
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="text-xs text-text-muted font-medium px-3 py-1.5 rounded-lg hover:bg-[#F5F5F5] transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-xs text-text-muted font-medium px-3 py-1.5 rounded-lg hover:bg-[#F5F5F5] transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Restaurant Banner */}
      <div className="px-4 pt-3 pb-2 max-w-[600px] mx-auto">
        <div className="flex items-center gap-2.5 bg-white rounded-xl border border-border p-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Store className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-text-primary truncate">{restaurantName}</p>
          </div>
          <Link href="/restaurants" className="text-[11px] text-primary font-semibold shrink-0">
            Change
          </Link>
        </div>
      </div>

      {/* Items */}
      <div className="px-4 py-3 space-y-2 max-w-[600px] mx-auto">
        {items.map((item) => (
          <div key={item.dish.id} className="bg-white rounded-2xl border border-border p-3 flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#F9FAFB]">
              {item.dish.image_url ? (
                <Image
                  src={item.dish.image_url}
                  alt={item.dish.name_en}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-text-muted" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-text-primary truncate">{item.dish.name_en}</p>
              <p className="text-[12px] text-text-muted mt-0.5">
                {formatPrice(item.dish.price)} each
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <p className="text-[13px] font-bold text-text-primary">{formatPrice(item.dish.price * item.quantity)}</p>
              <div className="flex items-center gap-1 bg-[#F5F5F5] rounded-full">
                <button
                  onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-text-primary hover:bg-black/5 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-[12px] font-bold min-w-[18px] text-center text-text-primary">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.dish.id, item.quantity + 1)}
                  className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Summary */}
      <div className="px-4 py-3 max-w-[600px] mx-auto">
        <div className="bg-white rounded-2xl border border-border p-4 space-y-3">
          <h3 className="text-[13px] font-semibold text-text-primary">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-secondary">Subtotal ({totalItems} items)</span>
              <span className="font-medium text-text-primary">{formatPrice(getSubtotal())}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-secondary">Delivery Fee</span>
              <span className={`font-medium ${deliveryFee === 0 ? "text-accent" : "text-text-primary"}`}>
                {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
              </span>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-[14px] font-bold text-text-primary">Total</span>
              <span className="text-[16px] font-bold text-text-primary">{formatPrice(getTotalPrice())}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Browsing */}
      <div className="px-4 pb-24 max-w-[600px] mx-auto">
        <Link
          href="/restaurants"
          className="block w-full py-3 rounded-xl text-[13px] text-text-secondary font-medium border border-border hover:bg-white transition-colors text-center"
        >
          Continue Browsing
        </Link>
      </div>

      {/* Fixed Checkout Bar */}
      <div className="fixed bottom-[60px] left-0 right-0 bg-white border-t border-border p-4 z-40">
        <div className="max-w-[600px] mx-auto">
          <Link href="/checkout" className="block">
            <div className="bg-primary text-white rounded-xl h-12 flex items-center justify-between px-5 hover:bg-primary-hover active:scale-[0.99] transition-all">
              <span className="text-[13px] font-semibold">Checkout</span>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold">{formatPrice(getTotalPrice())}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
