"use client"

import { useEffect, useState } from "react"
import { DEFAULT_TRIAL_LIMITS, type TrialLimitConfig } from "@/lib/subscription"
import { Check, Settings2 } from "lucide-react"

export function TrialLimitsEditor() {
  const [config, setConfig] = useState<TrialLimitConfig>({ ...DEFAULT_TRIAL_LIMITS })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/superadmin/trial-limits")
      if (res.ok) {
        const json = await res.json()
        if (json.config) setConfig(json.config)
      }
    } catch (e) {
      console.error("Failed to fetch trial limits", e)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/superadmin/trial-limits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (e) {
      console.error("Failed to save trial limits", e)
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="h-48 bg-white rounded-[14px] border border-[#E8E8E8] animate-pulse" />
  }

  return (
    <div className="space-y-6">
      {/* Active Trial Limits */}
      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4" />
          <h3 className="text-sm font-semibold">Active Trial Limits</h3>
        </div>
        <p className="text-xs text-[#555]">
          These limits apply when a restaurant is on an active trial (within trial period).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#555] mb-1">Max Dishes</label>
            <input type="number" value={config.maxDishes} onChange={(e) => setConfig({ ...config, maxDishes: parseInt(e.target.value) || 0 })}
              className="w-full h-10 rounded-xl border border-[#E8E8E8] bg-white px-3 text-sm outline-none focus:border-black transition-colors" min={0} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#555] mb-1">Max Categories</label>
            <input type="number" value={config.maxCategories} onChange={(e) => setConfig({ ...config, maxCategories: parseInt(e.target.value) || 0 })}
              className="w-full h-10 rounded-xl border border-[#E8E8E8] bg-white px-3 text-sm outline-none focus:border-black transition-colors" min={0} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#555] mb-1">Max Orders</label>
            <input type="number" value={config.maxOrders} onChange={(e) => setConfig({ ...config, maxOrders: parseInt(e.target.value) || 0 })}
              className="w-full h-10 rounded-xl border border-[#E8E8E8] bg-white px-3 text-sm outline-none focus:border-black transition-colors" min={0} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#555] mb-1">Trial Duration (days)</label>
            <input type="number" value={config.trialDurationDays} onChange={(e) => setConfig({ ...config, trialDurationDays: parseInt(e.target.value) || 0 })}
              className="w-full h-10 rounded-xl border border-[#E8E8E8] bg-white px-3 text-sm outline-none focus:border-black transition-colors" min={1} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#555] mb-1">Grace Period (days)</label>
            <input type="number" value={config.gracePeriodDays} onChange={(e) => setConfig({ ...config, gracePeriodDays: parseInt(e.target.value) || 0 })}
              className="w-full h-10 rounded-xl border border-[#E8E8E8] bg-white px-3 text-sm outline-none focus:border-black transition-colors" min={0} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving}
            className="h-10 px-5 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2">
            {saving ? "Saving..." : saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save Trial Limits"}
          </button>
          {saved && <span className="text-xs text-[#16A34A]">Updated</span>}
        </div>
        <div className="rounded-xl bg-[#F0F7FF] p-3">
          <p className="text-[10px] text-[#555] font-medium uppercase tracking-wide">Current</p>
          <p className="text-xs text-[#555] mt-1">
            Dishes: {config.maxDishes} | Categories: {config.maxCategories} | Orders: {config.maxOrders} | Trial: {config.trialDurationDays}d | Grace: {config.gracePeriodDays}d
          </p>
        </div>
      </div>

    </div>
  )
}