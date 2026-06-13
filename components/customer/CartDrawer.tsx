"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCartStore } from "@/stores/cartStore"
import { DishBadges } from "./DishBadges"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ open, onOpenChange }: Props) {
  const { items, getTotalPrice, updateQuantity, removeItem, restaurantName } = useCartStore()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Your Cart
          </DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-xl bg-[#F8F8F8] flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6 text-[#999]" />
            </div>
            <p className="text-sm text-[#999]">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {items.map((item) => (
                <div key={item.dish.id} className="flex items-center gap-3 py-3 border-b border-[#F0F0F0]">
                  {item.dish.image_url && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative">
                      <img
                        src={item.dish.image_url}
                        alt={item.dish.name_en}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.dish.name_en}</p>
                    <p className="text-sm text-[#555]">Rs {item.dish.price}</p>
                    <DishBadges tags={item.dish.tags || []} />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-[#F8F8F8] flex items-center justify-center hover:bg-[#F0F0F0] transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-semibold min-w-[20px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.dish.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#1A1A1A] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeItem(item.dish.id)}
                      className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-[#DC2626] hover:bg-red-100 ml-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {restaurantName && (
              <p className="text-xs text-[#999] text-center mt-2">{restaurantName}</p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-[#F0F0F0] mt-4">
              <div>
                <span className="text-lg font-bold">Rs {getTotalPrice().toLocaleString("en-PK")}</span>
                <p className="text-xs text-[#999]">Total</p>
              </div>
              <Link href="/checkout" onClick={() => onOpenChange(false)}>
                <Button variant="accent">Proceed to Checkout</Button>
              </Link>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
