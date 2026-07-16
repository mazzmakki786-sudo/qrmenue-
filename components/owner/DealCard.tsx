"use client"

import { useEffect, useState } from "react"
import { Percent, DollarSign, Package, Pencil, Trash2, Power } from "lucide-react"
import type { Deal, Dish } from "@/types"

interface Props {
  deal: Deal
  linkedDish?: Dish | null
  onEdit: (deal: Deal) => void
  onDelete: (dealId: string) => void
  onToggleActive: (dealId: string, isActive: boolean) => void
}

const dealTypeIcons = {
  percentage: Percent,
  flat: DollarSign,
  bundle: Package,
}

const dealTypeLabels = {
  percentage: "% Off",
  flat: "Rs Off",
  bundle: "Bundle",
}

export function DealCard({ deal, linkedDish, onEdit, onDelete, onToggleActive }: Props) {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => { setNow(new Date()) }, [])

  const Icon = dealTypeIcons[deal.deal_type]
  const typeLabel = dealTypeLabels[deal.deal_type]

  const startDate = deal.start_date ? new Date(deal.start_date) : null
  const endDate = deal.end_date ? new Date(deal.end_date) : null
  const isExpired = now && endDate && endDate < now
  const isFuture = now && startDate && startDate > now

  return (
    <div className={`bg-white rounded-2xl border p-4 transition-all ${
      !deal.is_active ? "border-[#F0F0F0] opacity-60" :
      isExpired ? "border-[#F0F0F0] opacity-50" :
      "border-[#F0F0F0] hover:border-[#25D366]/30"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            deal.is_active && !isExpired ? "bg-[#25D366]/10" : "bg-[#F0F0F0]"
          }`}>
            <Icon className={`w-5 h-5 ${deal.is_active && !isExpired ? "text-[#25D366]" : "text-[#999]"}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#111] truncate">{deal.title_en}</h3>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                !deal.is_active ? "bg-[#F0F0F0] text-[#999]" :
                isExpired ? "bg-[#FEE2E2] text-[#DC2626]" :
                isFuture ? "bg-[#DBEAFE] text-[#2563EB]" :
                "bg-[#DCFCE7] text-[#16A34A]"
              }`}>
                {!deal.is_active ? "Disabled" :
                 isExpired ? "Expired" :
                 isFuture ? "Upcoming" :
                 "Active"}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold text-[#111]">
                {deal.deal_type === "percentage" ? `${deal.deal_value}%` : `Rs ${deal.deal_value.toLocaleString()}`}
              </span>
              <span className="text-[10px] text-[#999]">{typeLabel}</span>
            </div>
            {deal.title_ur && (
              <p className="text-xs text-[#999] font-urdu mt-0.5">{deal.title_ur}</p>
            )}
            {deal.description_en && (
              <p className="text-xs text-[#555] mt-1 line-clamp-2">{deal.description_en}</p>
            )}
            {linkedDish && (
              <p className="text-[10px] text-[#25D366] font-medium mt-1">
                Linked to: {linkedDish.name_en}
              </p>
            )}
            {(deal.start_date || deal.end_date) && (
              <p className="text-[10px] text-[#999] mt-1">
                {deal.start_date && `From ${new Date(deal.start_date).toLocaleDateString()}`}
                {deal.start_date && deal.end_date && " — "}
                {deal.end_date && `Till ${new Date(deal.end_date).toLocaleDateString()}`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleActive(deal.id, !deal.is_active)}
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-[#F0F0F0] transition-colors"
            title={deal.is_active ? "Disable" : "Enable"}
          >
            <Power className={`w-4 h-4 ${deal.is_active ? "text-[#25D366]" : "text-[#999]"}`} />
          </button>
          <button
            onClick={() => onEdit(deal)}
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-[#F0F0F0] transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4 text-[#555]" />
          </button>
          <button
            onClick={() => onDelete(deal.id)}
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-[#DC2626]" />
          </button>
        </div>
      </div>
    </div>
  )
}
