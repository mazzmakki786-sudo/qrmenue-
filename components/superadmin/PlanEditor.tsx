"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PLAN_LIMITS, PLAN_PRICES, PLAN_NAMES, type Plan, formatLimit } from "@/lib/subscription"
import { Info } from "lucide-react"

interface Props {
  currentPlan: string
  currentTrialEnd?: string | null
  onSave: (plan: string, endDate: string) => void
}

const plans: Plan[] = ["trial", "starter", "growth", "premium"]

export function PlanEditor({ currentPlan, currentTrialEnd, onSave }: Props) {
  const [plan, setPlan] = useState(currentPlan)
  const [endDate, setEndDate] = useState("")
  const [autoTrialEnd, setAutoTrialEnd] = useState<string>("")

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
