"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useCartStore } from "@/stores/cartStore"
import { Tag, Percent, IndianRupee, Package, Check, X } from "lucide-react"
import type { Deal } from "@/types"

interface Props {
  restaurantId: string
  slug: string
}

const dealIcons: Record<string, typeof Percent> = {
  percentage: Percent,
  flat: IndianRupee,
  bundle: Package,
}

export function DealBanner({ restaurantId, slug }: Props) {
  const [deals, setDeals] = useState<(Deal & { dish?: { name_en: string; name_ur: string | null; image_url: string | null; price: number } | null })[]>([])
  const selectedDealId = useCartStore((s) => s.selectedDealId)
  const selectDeal = useCartStore((s) => s.selectDeal)
  const clearDeal = useCartStore((s) => s.clearDeal)

  useEffect(() => {
    const supabase = createClient()
    supabase.from("deals")
      .select("*, dish:dishes!dish_id(id, name_en, name_ur, image_url, price)")
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .or(`start_date.is.null,start_date.lte.${new Date().toISOString()}`)
      .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setDeals(data)
      })
  }, [restaurantId])

  const handleToggle = useCallback((deal: Deal) => {
    if (selectedDealId === deal.id) {
      clearDeal()
    } else {
      selectDeal(deal)
    }
  }, [selectedDealId, selectDeal, clearDeal])

  if (deals.length === 0) return null

  return (
    <div className="space-y-2.5 mb-5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
        <Tag className="w-3.5 h-3.5" />
        Active Deals
      </div>
      <div className="space-y-2">
        {deals.map((deal) => {
          const Icon = dealIcons[deal.deal_type] || Tag
          const isSelected = selectedDealId === deal.id
          const isBundle = deal.deal_type === "bundle"
          const valueLabel = deal.deal_type === "percentage"
            ? `${deal.deal_value}% OFF`
            : `Rs ${deal.deal_value.toLocaleString("en-PK")} OFF`

          return (
            <div
              key={deal.id}
              className={`rounded-xl border p-3.5 transition-all cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-white hover:border-primary/30"
              }`}
              onClick={() => handleToggle(deal)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isSelected ? "bg-primary text-white" : "bg-[#F0F0F0] text-text-secondary"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-text-primary">{deal.title_en}</p>
                      {deal.description_en && (
                        <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{deal.description_en}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {valueLabel}
                      </span>
                      {!isBundle && (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected ? "bg-primary text-white" : "border-2 border-border"
                        }`}>
                          {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                        </div>
                      )}
                    </div>
                  </div>
                  {deal.dish && (
                    <p className="text-[11px] text-text-muted mt-1">
                      On {deal.dish.name_en} &middot; <span className="line-through">Rs {deal.dish.price.toLocaleString("en-PK")}</span>
                      {deal.deal_type === "percentage" && (
                        <span className="text-primary font-semibold ml-1">
                          Rs {Math.round(deal.dish.price * (1 - deal.deal_value / 100)).toLocaleString("en-PK")}
                        </span>
                      )}
                      {deal.deal_type === "flat" && (
                        <span className="text-primary font-semibold ml-1">
                          Rs {Math.max(0, deal.dish.price - deal.deal_value).toLocaleString("en-PK")}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              {isSelected && (
                <div className="mt-2.5 pt-2.5 border-t border-primary/20 flex items-center justify-between">
                  <p className="text-xs text-primary font-medium">Deal applied to your order</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); clearDeal() }}
                    className="text-xs text-text-muted hover:text-error flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
