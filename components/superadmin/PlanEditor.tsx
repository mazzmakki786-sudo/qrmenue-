"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PLAN_LIMITS, PLAN_PRICES, PLAN_NAMES, DEFAULT_TRIAL_LIMITS, type Plan, type PlanLimitsPartial, formatLimit } from "@/lib/subscription"
import { Info } from "lucide-react"

interface Props {
  currentPlan: string
  currentTrialEnd?: string | null
  currentOverrides?: PlanLimitsPartial | null
  onSave: (plan: string, endDate: string) => void
  onSaveOverrides?: (overrides: PlanLimitsPartial | null) => void
}

const plans: Plan[] = ["trial", "starter", "growth", "premium"]

export function PlanEditor({ currentPlan, currentTrialEnd, currentOverrides, onSave, onSaveOverrides }: Props) {
  const [plan, setPlan] = useState(currentPlan)
  const [endDate, setEndDate] = useState("")
  const [autoTrialEnd, setAutoTrialEnd] = useState<string>("")

  const [overrideDishes, setOverrideDishes] = useState(currentOverrides?.maxDishes?.toString() ?? "")
  const [overrideCategories, setOverrideCategories] = useState(currentOverrides?.maxCategories?.toString() ?? "")
  const [overrideOrders, setOverrideOrders] = useState(currentOverrides?.maxOrders?.toString() ?? "")

  useEffect(() => {
    if (currentTrialEnd) {
      try {
        const d = new Date(currentTrialEnd).toISOString().slice(0, 10)
        setAutoTrialEnd(d)
      } catch {
        // ignore
      }
    }
  }, [currentTrialEnd])

  useEffect(() => {
    setOverrideDishes(currentOverrides?.maxDishes?.toString() ?? "")
    setOverrideCategories(currentOverrides?.maxCategories?.toString() ?? "")
    setOverrideOrders(currentOverrides?.maxOrders?.toString() ?? "")
  }, [currentOverrides])

  const handlePlanChange = (next: string) => {
    setPlan(next)
    if (next === "trial" && !endDate) {
      const today = new Date()
      today.setDate(today.getDate() + 7)
      setEndDate(today.toISOString().slice(0, 10))
    }
  }

  const limits = PLAN_LIMITS[plan as Plan]
  const price = PLAN_PRICES[plan as Plan]

  const handleSaveOverrides = () => {
    if (!onSaveOverrides) return
    const dishes = overrideDishes ? parseInt(overrideDishes) : undefined
    const categories = overrideCategories ? parseInt(overrideCategories) : undefined
    const orders = overrideOrders ? parseInt(overrideOrders) : undefined
    if (!dishes && !categories && !orders) {
      onSaveOverrides(null)
      return
    }
    const overrides: PlanLimitsPartial = {}
    if (dishes && dishes > 0) overrides.maxDishes = dishes
    if (categories && categories > 0) overrides.maxCategories = categories
    if (orders && orders > 0) overrides.maxOrders = orders
    onSaveOverrides(Object.keys(overrides).length > 0 ? overrides : null)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Plan</label>
        <select
          value={plan}
          onChange={(e) => handlePlanChange(e.target.value)}
          className="flex h-12 w-full rounded-[10px] bg-[#F8F8F8] border border-[#E8E8E8] px-4 text-base focus:outline-none focus:border-black transition-colors"
        >
          {plans.map((p) => (
            <option key={p} value={p}>
              {PLAN_NAMES[p]} {p !== "trial" && `(Rs ${PLAN_PRICES[p].toLocaleString()}/mo)`}
            </option>
          ))}
        </select>
      </div>

      {limits && (
        <div className="rounded-xl bg-[#F8F8F8] border border-[#E8E8E8] p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#555]">
            <Info className="w-3.5 h-3.5" /> Plan Limits
          </div>
          <ul className="text-xs text-[#555] grid grid-cols-2 gap-x-3 gap-y-1">
            <li>
              Dishes: <span className="font-semibold text-black">{formatLimit(limits.maxDishes)}</span>
            </li>
            <li>
              Categories: <span className="font-semibold text-black">{formatLimit(limits.maxCategories)}</span>
            </li>
            <li>
              Images: <span className="font-semibold text-black">{formatLimit(limits.maxImages)}</span>
            </li>
            <li>
              Orders: <span className="font-semibold text-black">{formatLimit(limits.maxOrders)}</span>
            </li>
            <li>
              Price: <span className="font-semibold text-black">
                {price === 0 ? "Free" : `Rs ${price.toLocaleString()}/mo`}
              </span>
            </li>
          </ul>
        </div>
      )}

      {onSaveOverrides && (
        <div className="rounded-xl bg-[#FFF7ED] border border-[#D97706]/20 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#9A3412]">
            <Info className="w-3.5 h-3.5" /> Per-Restaurant Limit Override
          </div>
          <p className="text-[10px] text-[#999]">Leave blank to use plan defaults</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-[#555] mb-0.5">Max Dishes</label>
              <input type="number" value={overrideDishes} onChange={(e) => setOverrideDishes(e.target.value)}
                className="w-full h-8 rounded-lg bg-white border border-[#E8E8E8] px-2 text-xs focus:outline-none focus:border-black" placeholder="Default" />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-[#555] mb-0.5">Max Categories</label>
              <input type="number" value={overrideCategories} onChange={(e) => setOverrideCategories(e.target.value)}
                className="w-full h-8 rounded-lg bg-white border border-[#E8E8E8] px-2 text-xs focus:outline-none focus:border-black" placeholder="Default" />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-[#555] mb-0.5">Max Orders</label>
              <input type="number" value={overrideOrders} onChange={(e) => setOverrideOrders(e.target.value)}
                className="w-full h-8 rounded-lg bg-white border border-[#E8E8E8] px-2 text-xs focus:outline-none focus:border-black" placeholder="Default" />
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={handleSaveOverrides} className="!bg-white !text-[#9A3412] !text-xs">
            Save Overrides
          </Button>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          {plan === "trial" ? "Trial End Date" : "Plan End Date"}
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="flex h-12 w-full rounded-[10px] bg-[#F8F8F8] border border-[#E8E8E8] px-4 text-base focus:outline-none focus:border-black transition-colors"
        />
        {plan === "trial" && autoTrialEnd && (
          <p className="text-[11px] text-[#999] mt-1">
            Current trial ends: {new Date(autoTrialEnd).toLocaleDateString()}
          </p>
        )}
      </div>
      <Button onClick={() => onSave(plan, endDate)} disabled={!endDate}>
        Save Plan
      </Button>
    </div>
  )
}
