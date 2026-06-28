"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Percent, IndianRupee, Package } from "lucide-react"
import type { DealFormData, Dish } from "@/types"

interface Props {
  dishes: Dish[]
  initialData?: Partial<DealFormData>
  submitting?: boolean
  onSubmit: (data: DealFormData) => void
  onCancel: () => void
}

const dealTypeOptions = [
  { id: "percentage" as const, label: "% Off", icon: Percent, desc: "e.g. 20% off" },
  { id: "flat" as const, label: "Rs Off", icon: IndianRupee, desc: "e.g. Rs 500 off" },
  { id: "bundle" as const, label: "Bundle", icon: Package, desc: "Fixed price deal" },
]

export function AddDealForm({ dishes, initialData, submitting, onSubmit, onCancel }: Props) {
  const [titleEn, setTitleEn] = useState(initialData?.title_en || "")
  const [dealType, setDealType] = useState<"percentage" | "flat" | "bundle">(initialData?.deal_type || "percentage")
  const [dealValue, setDealValue] = useState(initialData?.deal_value?.toString() || "")
  const [dishId, setDishId] = useState(initialData?.dish_id || "")
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!titleEn.trim()) { setError("Title is required"); return }
    if (!dealValue || parseFloat(dealValue) <= 0) { setError("Value must be greater than 0"); return }

    onSubmit({
      title_en: titleEn.trim(),
      dish_id: dishId || undefined,
      deal_type: dealType,
      deal_value: parseFloat(dealValue),
      is_active: isActive,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Step 1: Title */}
      <Input
        label="Deal Title *"
        id="deal_title_en"
        value={titleEn}
        onChange={(e) => { setTitleEn(e.target.value); if (error) setError(null) }}
        placeholder="e.g. Weekend Special, 20% OFF"
        error={error || undefined}
        autoFocus
      />

      {/* Step 2: Type & Value */}
      <div>
        <label className="block text-sm font-medium text-[#111] mb-2">Discount *</label>
        <div className="flex gap-2 mb-2">
          {dealTypeOptions.map((opt) => {
            const isSelected = dealType === opt.id
            const Icon = opt.icon
            return (
              <button key={opt.id} type="button" onClick={() => setDealType(opt.id)}
                className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl text-sm transition-all ${
                  isSelected ? "bg-black text-white shadow-sm" : "bg-[#F8F8F8] text-[#555] hover:bg-[#F0F0F0]"
                }`}>
                <Icon className="w-4 h-4" />
                <span className="text-xs font-semibold">{opt.label}</span>
                <span className="text-[9px] opacity-70">{opt.desc}</span>
              </button>
            )
          })}
        </div>
        <Input
          id="deal_value"
          type="number"
          value={dealValue}
          onChange={(e) => setDealValue(e.target.value)}
          placeholder={dealType === "percentage" ? "20" : dealType === "flat" ? "500" : "999"}
          label={dealType === "percentage" ? "Percentage %" : "Amount (PKR)"}
        />
      </div>

      {/* Step 3: Linked Dish (optional) */}
      <div className="space-y-1.5">
        <label htmlFor="deal_dish" className="block text-sm font-medium text-[#111]">Linked Dish</label>
        <select id="deal_dish" value={dishId} onChange={(e) => setDishId(e.target.value)}
          className="flex h-12 w-full rounded-[10px] bg-[#F8F8F8] border border-[#E8E8E8] px-4 text-base focus:outline-none focus:border-black transition-colors">
          <option value="">All items (no specific dish)</option>
          {dishes.map((dish) => (
            <option key={dish.id} value={dish.id}>{dish.name_en} — Rs {dish.price}</option>
          ))}
        </select>
        <p className="text-[10px] text-[#999]">Optional: link to a specific dish</p>
      </div>

      {/* Active Toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 rounded accent-black" />
        <span className="text-sm font-medium text-[#111]">{isActive ? "Active" : "Inactive"}</span>
      </label>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : initialData ? "Update Deal" : "Create Deal"}
        </Button>
      </div>
    </form>
  )
}
