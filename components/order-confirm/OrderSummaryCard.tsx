"use client"

import { useState } from "react"
import { ShoppingBag, ChevronDown, ChevronUp, Tag } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import type { OrderSummaryCardProps } from "./types"

export default function OrderSummaryCard({
  items,
  deliveryFee,
  totalPrice,
  discountAmount = 0,
  dealTitle,
}: OrderSummaryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const totalItems = items.reduce((s, i) => s + (i.quantity || 1), 0)

  return (
    <section className="bg-white border border-border rounded-2xl overflow-hidden animate-fade-in">
      {/* Mobile: collapsible header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="md:hidden w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAFAFA] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="text-[13px] font-semibold text-text-primary">Order Summary</h3>
            <p className="text-[11px] text-text-muted">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-text-muted">
          <span>{expanded ? "Hide" : "View"}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Desktop: always visible header */}
      <div className="hidden md:flex items-center gap-2 px-6 py-4 border-b border-border">
        <ShoppingBag className="w-5 h-5 text-text-secondary" />
        <h3 className="text-[15px] font-bold text-text-primary">Order Summary</h3>
        <span className="text-xs text-text-muted ml-auto">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
      </div>

      {/* Items list */}
      <div className={`${expanded || "md:block"} ${!expanded ? "hidden" : ""}`}>
        <div className="px-5 md:px-6 py-4 space-y-3">
          {(items || []).map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between py-0.5">
              <span className="text-[13px] md:text-[14px] text-text-primary">
                {item.name_en || item.name}{" "}
                <span className="text-text-muted">×{item.quantity}</span>
              </span>
              <span className="text-[13px] md:text-[14px] text-text-primary font-medium">
                {formatPrice(item.subtotal || item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="px-5 md:px-6 py-4 bg-[#FAFAFA] border-t border-border space-y-2">
          {discountAmount > 0 && dealTitle && (
            <div className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-1 text-primary font-medium">
                <Tag className="w-3.5 h-3.5" />
                <span>{dealTitle}</span>
              </div>
              <span className="text-primary font-semibold">-{formatPrice(discountAmount)}</span>
            </div>
          )}
          {(deliveryFee ?? 0) > 0 && (
            <div className="flex items-center justify-between text-[13px] md:text-[14px]">
              <span className="text-text-secondary">Delivery Fee</span>
              <span className="text-text-primary">{formatPrice(deliveryFee)}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1 border-t border-border">
            <span className="text-[15px] md:text-[15px] font-bold text-text-primary">Total</span>
            <span className="text-[16px] md:text-[18px] font-bold text-text-primary">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
