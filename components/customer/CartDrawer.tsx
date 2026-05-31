"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCartStore } from "@/stores/cartStore"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ open, onOpenChange }: Props) {
  const { items, getTotalPrice, updateQuantity, removeItem } = useCartStore()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your Cart</DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <p className="text-center text-[#999] py-8">Your cart is empty</p>
        ) : (
          <>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.dish.id} className="flex items-center justify-between py-2 border-b border-[#F0F0F0]">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.dish.name_en}</p>
                    <p className="text-sm text-[#555]">Rs {item.dish.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-[#F8F8F8] flex items-center justify-center hover:bg-[#F0F0F0]"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-medium min-w-[20px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.dish.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#1A1A1A]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeItem(item.dish.id)}
                      className="text-[#DC2626] hover:text-[#B91C1C] ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#F0F0F0] mt-4">
              <span className="text-lg font-bold">Rs {getTotalPrice().toLocaleString("en-PK")}</span>
              <Link href="/checkout" onClick={() => onOpenChange(false)}>
                <Button variant="accent">Checkout</Button>
              </Link>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
