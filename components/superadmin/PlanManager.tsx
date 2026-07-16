"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Save, RotateCcw, GripVertical, Plus, X, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"

interface Plan {
  id: string
  slug: string
  name: string
  price_pkr: number
  interval: "monthly" | "yearly"
  yearly_price_pkr: number | null
  max_dishes: number
  max_images: number
  max_orders: number
  max_categories: number
  ai_posts_per_month: number
  analytics: boolean
  custom_branding: boolean
  can_have_qr: boolean
  can_have_whatsapp: boolean
  description: string
  sort_order: number
  is_active: boolean
  custom_features: string[]
}

const defaultLimits: Omit<Plan, "id" | "slug" | "sort_order" | "is_active"> = {
  name: "",
  price_pkr: 0,
  interval: "monthly",
  yearly_price_pkr: null,
  max_dishes: 20,
  max_images: 10,
  max_orders: 10,
  max_categories: 20,
  ai_posts_per_month: 0,
  analytics: true,
  custom_branding: false,
  can_have_qr: true,
  can_have_whatsapp: true,
  description: "",
  custom_features: [],
}

export function PlanManager() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/superadmin/plans")
      if (res.ok) {
        const data = await res.json()
        const mapped = (data.plans || []).map((p: any) => ({
          ...p,
          interval: p.interval || "monthly",
          yearly_price_pkr: p.yearly_price_pkr ?? null,
          custom_features: Array.isArray(p.custom_features) ? p.custom_features : [],
          ai_posts_per_month: p.ai_posts_per_month ?? 0,
        }))
        setPlans(mapped)
      }
    } catch (e) {
      console.error("Failed to fetch plans", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPlans() }, [fetchPlans])

  // Real-time subscription for plan changes
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(uid("superadmin-plans"))
      .on("postgres_changes", { event: "*", schema: "public", table: "plans" }, () => {
        fetchPlans()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchPlans])

  const updatePlan = async (slug: string, updates: Partial<Plan>) => {
    setSaving(slug)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/superadmin/plans/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        setPlans((prev) => prev.map((p) => p.slug === slug ? { ...p, ...updates } : p))
        setSuccess(`${slug} plan updated`)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const data = await res.json()
        setError(data.error || "Failed to update")
      }
    } catch {
      setError("Network error")
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-[#F0F0F0] rounded animate-pulse" />
        <div className="h-64 bg-[#F0F0F0] rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold">Plans Management</h2>
          <p className="text-xs text-[#555] mt-1">Edit plan prices, limits, and features. Changes apply in real-time.</p>
        </div>
        {success && (
          <span className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg font-medium">{success}</span>
        )}
        {error && (
          <span className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg font-medium">{error}</span>
        )}
      </div>

      <div className="space-y-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.slug}
            plan={plan}
            saving={saving === plan.slug}
            onSave={(updates) => updatePlan(plan.slug, updates)}
          />
        ))}
      </div>
    </div>
  )
}

function PlanCard({ plan, saving, onSave }: { plan: Plan; saving: boolean; onSave: (updates: Partial<Plan>) => void }) {
  const [edited, setEdited] = useState<Partial<Plan>>({})
  const [expanded, setExpanded] = useState(false)
  const hasChanges = Object.keys(edited).length > 0

  const handleChange = (key: keyof Plan, value: unknown) => {
    setEdited((prev) => ({ ...prev, [key]: value }))
  }

  const current = { ...plan, ...edited }

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between p-3 md:p-4 cursor-pointer hover:bg-[#FAFAFA] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <GripVertical className="w-4 h-4 text-[#CCC] flex-shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm truncate">{current.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${current.is_active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                {current.is_active ? "Active" : "Inactive"}
              </span>
              {current.interval === "yearly" && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600">Yearly</span>
              )}
            </div>
            <p className="text-xs text-[#555] mt-0.5">
              {current.interval === "yearly" && current.yearly_price_pkr
                ? `PKR ${current.yearly_price_pkr.toLocaleString()}/yr`
                : `PKR ${current.price_pkr.toLocaleString()}/mo`
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {hasChanges && (
            <>
                <button
                  onClick={(e) => { e.stopPropagation(); onSave(edited); setEdited({}) }}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span className="hidden md:inline">{saving ? "Saving..." : "Save"}</span>
                </button>
              <button
                onClick={(e) => { e.stopPropagation(); setEdited({}) }}
                className="p-1.5 text-[#999] hover:text-black transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#F0F0F0] p-3 md:p-4 space-y-4 bg-[#FAFAFA]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Display Name" value={current.name} onChange={(v) => handleChange("name", v)} />
            <Field label="Price (PKR/mo)" type="number" value={current.price_pkr} onChange={(v) => handleChange("price_pkr", Number(v))} />
            <div>
              <label className="block text-[11px] font-medium text-[#555] mb-1">Interval</label>
              <div className="flex rounded-lg border border-[#E8E8E8] overflow-hidden bg-white">
                <button
                  onClick={() => handleChange("interval", "monthly")}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${current.interval === "monthly" ? "bg-black text-white" : "bg-white text-[#555] hover:bg-[#F5F5F5]"}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => handleChange("interval", "yearly")}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${current.interval === "yearly" ? "bg-black text-white" : "bg-white text-[#555] hover:bg-[#F5F5F5]"}`}
                >
                  Yearly
                </button>
              </div>
            </div>
            {current.interval === "yearly" && (
              <Field label="Yearly Price (PKR)" type="number" value={current.yearly_price_pkr ?? current.price_pkr * 12} onChange={(v) => handleChange("yearly_price_pkr", Number(v))} hint="Leave empty for auto (12x monthly)" />
            )}
            <Field label="Max Dishes" type="number" value={current.max_dishes} onChange={(v) => handleChange("max_dishes", Number(v))} hint="-1 for unlimited" />
            <Field label="Max Images" type="number" value={current.max_images} onChange={(v) => handleChange("max_images", Number(v))} hint="-1 for unlimited" />
            <Field label="Max Orders/mo" type="number" value={current.max_orders} onChange={(v) => handleChange("max_orders", Number(v))} hint="-1 for unlimited" />
            <Field label="Max Categories" type="number" value={current.max_categories} onChange={(v) => handleChange("max_categories", Number(v))} hint="-1 for unlimited" />
            <Field label="AI Posts/mo" type="number" value={current.ai_posts_per_month} onChange={(v) => handleChange("ai_posts_per_month", Number(v))} hint="0 to disable" />
            <Field label="Sort Order" type="number" value={current.sort_order} onChange={(v) => handleChange("sort_order", Number(v))} />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#555] mb-1">Description</label>
            <textarea
              value={current.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E8E8E8] rounded-lg bg-white outline-none focus:border-black transition-colors resize-none"
              rows={2}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Toggle label="Analytics" checked={current.analytics} onChange={(v) => handleChange("analytics", v)} />
            <Toggle label="Custom Branding" checked={current.custom_branding} onChange={(v) => handleChange("custom_branding", v)} />
            <Toggle label="QR Code" checked={current.can_have_qr} onChange={(v) => handleChange("can_have_qr", v)} />
            <Toggle label="WhatsApp" checked={current.can_have_whatsapp} onChange={(v) => handleChange("can_have_whatsapp", v)} />
            <Toggle label="Active" checked={current.is_active} onChange={(v) => handleChange("is_active", v)} />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#555] mb-1.5">Custom Features</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(current.custom_features || []).map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-black text-white text-xs rounded-full">
                  {f}
                  <button
                    onClick={() => {
                      const next = [...(current.custom_features || [])]
                      next.splice(i, 1)
                      handleChange("custom_features", next)
                    }}
                    className="hover:text-[#CCC] transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a feature..."
                className="flex-1 px-3 py-2 text-sm border border-[#E8E8E8] rounded-lg bg-white outline-none focus:border-black transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const input = e.currentTarget
                    const val = input.value.trim()
                    if (val) {
                      handleChange("custom_features", [...(current.custom_features || []), val])
                      input.value = ""
                    }
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement
                  const val = input?.value?.trim()
                  if (val) {
                    handleChange("custom_features", [...(current.custom_features || []), val])
                    input.value = ""
                  }
                }}
                className="px-3 py-2 bg-[#F0F0F0] text-[#555] text-xs font-medium rounded-lg hover:bg-[#E8E8E8] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, type = "text", hint }: { label: string; value: string | number; onChange: (v: string) => void; type?: string; hint?: string }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-[#555] mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-[#E8E8E8] rounded-lg bg-white outline-none focus:border-black transition-colors"
      />
      {hint && <p className="text-[10px] text-[#999] mt-0.5">{hint}</p>}
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? "bg-black" : "bg-[#DDD]"}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : ""}`} />
      </div>
      <span className="text-xs text-[#555]">{label}</span>
    </label>
  )
}
