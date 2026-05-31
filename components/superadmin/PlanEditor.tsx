"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  currentPlan: string
  onSave: (plan: string, endDate: string) => void
}

const plans = ["starter", "growth", "premium"]

export function PlanEditor({ currentPlan, onSave }: Props) {
  const [plan, setPlan] = useState(currentPlan)
  const [endDate, setEndDate] = useState("")

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Plan</label>
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="flex h-12 w-full rounded-[10px] bg-[#F8F8F8] border border-[#E8E8E8] px-4 text-base focus:outline-none focus:border-black transition-colors"
        >
          {plans.map((p) => (
            <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Plan End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="flex h-12 w-full rounded-[10px] bg-[#F8F8F8] border border-[#E8E8E8] px-4 text-base focus:outline-none focus:border-black transition-colors"
        />
      </div>
      <Button onClick={() => onSave(plan, endDate)} disabled={!endDate}>
        Save Plan
      </Button>
    </div>
  )
}
