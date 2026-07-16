"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback, startTransition } from "react"
import { Button } from "@/components/ui/button"
import { Pricing2 } from "@/components/ui/pricing-cards"
import { SubscriptionBanner } from "@/components/shared/SubscriptionBanner"
import { useCompanySettings } from "@/lib/hooks/useCompanySettings"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { PLAN_NAMES, type Plan } from "@/lib/subscription"
import { mapPlan, type PricingPlan } from "@/lib/map-plans"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { MessageCircle, Clock, ShoppingBag, Image as ImageIcon, Utensils, AlertTriangle, HelpCircle, Calendar, Sparkles, ShieldCheck } from "lucide-react"

const planOrder: Plan[] = ["trial", "starter", "growth", "premium"]

export default function SubscriptionPage() {
  const sub = useSubscription()
  const { restaurant, orderCount, planLimits, loading } = sub
  const { settings, loading: settingsLoading } = useCompanySettings()
  const [error, setError] = useState<string | null>(null)
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [buyingPlan, setBuyingPlan] = useState<string | null>(null)
  const [buyError, setBuyError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !restaurant) {
      setError("Failed to load subscription data.")
    }
  }, [loading, restaurant])

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/plans")
      if (res.ok) {
        const data = await res.json()
        if (data.plans && Array.isArray(data.plans)) {
          setPlans(data.plans.map(mapPlan))
        }
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => { fetchPlans() }, [fetchPlans])

  // Real-time subscription — instantly reflects superadmin changes
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(uid("sub-page-plans"))
      .on("postgres_changes", { event: "*", schema: "public", table: "plans" }, () => {
        startTransition(() => fetchPlans())
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchPlans])

  const handleSelectPlan = async (planId: string) => {
    if (planId === "trial") return
    if (planId === currentPlan) return
    setBuyError(null)
    setBuyingPlan(planId)
    try {
      const res = await fetch("/api/payments/jazzcash/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Payment initiation failed" }))
        setBuyError(err.error || "Payment initiation failed. Please try again or contact support.")
        return
      }
      const html = await res.text()
      const blob = new Blob([html], { type: "text/html" })
      window.open(URL.createObjectURL(blob), "_self")
    } catch {
      setBuyError("Unable to connect to payment gateway. Please try again.")
    } finally {
      setBuyingPlan(null)
    }
  }

  if (loading || settingsLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="skeleton h-8 w-40 rounded" />
        <div className="skeleton h-24 rounded-xl" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return <div className="text-center text-[#999] py-12">No restaurant found.</div>
  }

  const isSuspended = "is_suspended" in restaurant ? (restaurant as any).is_suspended : false
  const currentPlan = restaurant.plan as Plan
  const currentPlanIndex = planOrder.indexOf(currentPlan)
  const isExpired = sub.isExpired

  const jazzcashNumber = settings.jazzcash_number || ""
  const easypaisa = settings.easypaisa_number || ""
  const bankName = settings.bank_name || ""
  const accountTitle = settings.account_title || ""
  const accountNumber = settings.account_number || ""
  const whatsapp = settings.whatsapp_support || ""

  const whatsappDigits = whatsapp.replace(/[^0-9]/g, "")
  const whatsappLink = whatsappDigits
    ? `https://wa.me/${whatsappDigits.startsWith("0") ? "92" + whatsappDigits.slice(1) : whatsappDigits}`
    : ""

  const trialEnd = restaurant.trial_end ? new Date(restaurant.trial_end) : null
  const planEnd = restaurant.plan_end_date ? new Date(restaurant.plan_end_date) : null
  const now = new Date()
  const msPerDay = 1000 * 60 * 60 * 24

  const trialDaysRemaining = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / msPerDay)) : 0
  const planDaysRemaining = planEnd ? Math.max(0, Math.ceil((planEnd.getTime() - now.getTime()) / msPerDay)) : null

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })

  // Show all paid plans — mark current plan with badge text, disable its button
  const showPlans = plans
    .filter(p => p.id !== "trial")
    .map(p => ({
      ...p,
      button: {
        text: p.id === currentPlan
          ? (isExpired ? "Expired — Renew" : "Current Plan")
          : p.button.text,
        url: p.button.url,
      },
    }))

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-black">Subscription</h1>
          <p className="text-xs text-[#999] mt-0.5">Manage your plan and billing</p>
        </div>
      </div>

      {/* Suspended Banner */}
      {isSuspended && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-900">Subscription Suspended</h4>
            <p className="text-xs text-amber-800 mt-1">Your account is restricted. Please renew your plan to continue.</p>
          </div>
        </div>
      )}

      <SubscriptionBanner restaurant={restaurant} orderCount={orderCount} />

      {/* Payment Error */}
      {buyError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900">Payment Error</p>
            <p className="text-xs text-red-700 mt-1">{buyError}</p>
          </div>
          <button onClick={() => setBuyError(null)} className="text-red-400 hover:text-red-600 text-sm">&times;</button>
        </div>
      )}

      {/* Current Plan Card */}
      <div className={`relative overflow-hidden bg-white border rounded-2xl shadow-sm ${isExpired ? "border-[#DC2626]/30" : "border-[#F0F0F0]"}`}>
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl rounded-bl-full ${isExpired ? "from-[#DC2626]/[0.04]" : "from-black/[0.02]"}`} />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isExpired ? "bg-[#DC2626]/10" : currentPlan === "trial" ? "bg-[#2563EB]/10" : currentPlan === "starter" ? "bg-[#8B5CF6]/10" : currentPlan === "growth" ? "bg-black/10" : "bg-[#25D366]/10"}`}>
                {isExpired ? (
                  <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
                ) : (
                  <Sparkles className={`w-5 h-5 ${currentPlan === "trial" ? "text-[#2563EB]" : currentPlan === "starter" ? "text-[#8B5CF6]" : currentPlan === "growth" ? "text-black" : "text-[#25D366]"}`} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#555] uppercase tracking-wider">Current Plan</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${isExpired ? "bg-[#DC2626]/10 text-[#DC2626]" : currentPlan === "trial" ? "bg-[#2563EB]/10 text-[#2563EB]" : currentPlan === "starter" ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" : currentPlan === "growth" ? "bg-black/10 text-black" : "bg-[#25D366]/10 text-[#25D366]"}`}>
                    {PLAN_NAMES[currentPlan]}
                  </span>
                  {isExpired && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#DC2626]/10 text-[#DC2626]">Expired</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                  {!isExpired && (
                    <span className="text-xs text-[#999] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {currentPlan === "trial"
                        ? `Started ${restaurant.trial_start ? formatDate(new Date(restaurant.trial_start)) : "recently"}`
                        : planEnd ? `Started ${restaurant.plan_start_date ? formatDate(new Date(restaurant.plan_start_date)) : "recently"}` : "Active plan"}
                    </span>
                  )}
                  {currentPlan !== "trial" && planEnd && !isExpired && (
                    <span className="text-xs text-[#999] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Ends {formatDate(planEnd)}
                    </span>
                  )}
                  {isExpired && planEnd && (
                    <span className="text-xs text-[#DC2626] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expired on {formatDate(planEnd)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              {isExpired ? (
                <>
                  <p className="text-lg font-bold text-[#DC2626]">Expired</p>
                  <p className="text-[10px] text-[#DC2626] font-medium">renew to continue</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-black">
                    {currentPlan === "trial"
                      ? `${trialDaysRemaining} day${trialDaysRemaining === 1 ? "" : "s"}`
                      : planDaysRemaining !== null
                        ? `${planDaysRemaining} day${planDaysRemaining === 1 ? "" : "s"}`
                        : "Active"}
                  </p>
                  <p className="text-[10px] text-[#999] font-medium">
                    {currentPlan === "trial" ? "remaining in trial" : "remaining"}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Usage Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 border-t border-[#F0F0F0] pt-5">
            <UsageMeter icon={<Utensils className="w-3.5 h-3.5" />} label="Dishes" used={sub.dishCount} limit={planLimits.maxDishes} />
            <UsageMeter icon={<ImageIcon className="w-3.5 h-3.5" />} label="Images" used={sub.imageCount} limit={planLimits.maxImages} />
            <UsageMeter icon={<ShoppingBag className="w-3.5 h-3.5" />} label="Orders" used={orderCount} limit={planLimits.maxOrders} />
            <UsageMeter icon={<Utensils className="w-3.5 h-3.5" />} label="Categories" used={sub.categoryCount} limit={planLimits.maxCategories} />
          </div>
        </div>
      </div>

      {/* All Plans — like pricing page */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-black">All Plans</h2>
          <div className="h-px flex-1 bg-[#F0F0F0]" />
        </div>

        <Pricing2
          heading=""
          description=""
          plans={showPlans}
          onSelectPlan={handleSelectPlan}
        />
      </div>

      {/* Premium user — contact support */}
      {currentPlan !== "trial" && currentPlanIndex === planOrder.length - 1 && !isExpired && (
        <div className="bg-white border border-[#F0F0F0] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
              <ShieldCheck className="w-5 h-5 text-[#25D366]" />
              <h4 className="text-sm font-semibold text-black">You&apos;re on our top plan</h4>
            </div>
            <p className="text-xs text-[#999]">Need custom requirements? We&apos;re here to help.</p>
          </div>
          <a href={whatsappLink} target="_blank" rel="noopener">
            <Button variant="accent">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </a>
        </div>
      )}

      {/* How to Pay / Renew */}
      <div className="bg-[#F9FAFB] border border-[#F0F0F0] rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-black flex items-center gap-2">
          {isExpired ? <AlertTriangle className="w-4 h-4 text-[#DC2626]" /> : <Clock className="w-4 h-4" />}
          {isExpired ? "Renew Your Plan" : "How to Pay"}
        </h3>
        {isExpired ? (
          <p className="text-xs text-[#555] leading-relaxed">
            Your plan has expired. Choose a plan above to make a payment via JazzCash, Easypaisa, or Bank Transfer.
          </p>
        ) : (
          <p className="text-xs text-[#555] leading-relaxed">
            Choose a plan above to pay securely via JazzCash. You can also send manual payment via the options below.
          </p>
        )}
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-[#F0F0F0]">
            <p className="text-[10px] text-[#999] font-medium mb-0.5">JazzCash</p>
            <p className="text-sm font-bold text-black">{jazzcashNumber || "—"}</p>
            {accountTitle && <p className="text-[10px] text-[#555]">{accountTitle}</p>}
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#F0F0F0]">
            <p className="text-[10px] text-[#999] font-medium mb-0.5">Easypaisa</p>
            <p className="text-sm font-bold text-black">{easypaisa || "—"}</p>
            {accountTitle && <p className="text-[10px] text-[#555]">{accountTitle}</p>}
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#F0F0F0]">
            <p className="text-[10px] text-[#999] font-medium mb-0.5">Bank Transfer</p>
            <p className="text-sm font-bold text-black">{accountNumber || "—"}</p>
            {bankName && <p className="text-[10px] text-[#555]">{bankName}</p>}
          </div>
        </div>
        {whatsappLink && (
          <div className="bg-[#25D366]/5 border border-[#25D366]/10 rounded-xl px-4 py-3 flex items-center gap-3">
            <HelpCircle className="w-4 h-4 text-[#25D366] shrink-0" />
            <p className="text-xs text-[#555]">
              After manual payment, send proof to our{" "}
              <a href={whatsappLink} target="_blank" rel="noopener" className="text-[#25D366] font-semibold hover:underline">WhatsApp</a>{" "}
              for instant activation.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function UsageMeter({ icon, label, used, limit }: { icon: React.ReactNode; label: string; used: number; limit: number }) {
  const isUnlimited = limit === Infinity
  const percent = isUnlimited ? 0 : Math.min(100, (used / limit) * 100)
  const isNear = !isUnlimited && used >= limit
  const isWarning = !isUnlimited && used >= limit * 0.7

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1 text-[10px] text-[#555] font-medium">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-lg font-bold text-black">{used}</span>
        <span className="text-[11px] text-[#999]">/ {isUnlimited ? "∞" : limit}</span>
      </div>
      {!isUnlimited && (
        <div className="w-full h-1.5 bg-[#EDEEEF] rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${isNear ? "bg-[#DC2626]" : isWarning ? "bg-[#D97706]" : "bg-black"}`} style={{ width: `${percent}%` }} />
        </div>
      )}
    </div>
  )
}
