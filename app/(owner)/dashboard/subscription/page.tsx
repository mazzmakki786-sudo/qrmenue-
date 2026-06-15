"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SubscriptionBanner } from "@/components/shared/SubscriptionBanner"
import { useCompanySettings } from "@/lib/hooks/useCompanySettings"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { PLAN_LIMITS, PLAN_NAMES, PLAN_PRICES, type Plan, formatLimit } from "@/lib/subscription"
import { Check, X, MessageCircle, Clock, ShoppingBag, Image as ImageIcon, Utensils, AlertTriangle, HelpCircle } from "lucide-react"

const planOrder: Plan[] = ["trial", "starter", "growth", "premium"]

export default function SubscriptionPage() {
  const sub = useSubscription()
  const { restaurant, orderCount, planLimits, loading } = sub
  const { settings } = useCompanySettings()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="skeleton h-8 w-40 rounded" />
        <div className="skeleton h-24 rounded-xl" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    )
  }

  if (!restaurant) {
    return <div className="text-center text-[#999] py-12">No restaurant found.</div>
  }

  const isSuspended = "is_suspended" in restaurant ? (restaurant as any).is_suspended : false

  const jazzcash = settings.jazzcash_number || "03001234567"
  const easypaisa = settings.easypaisa_number || "03001234567"
  const bankName = settings.bank_name || "Meezan Bank"
  const accountTitle = settings.account_title || "QRMenu Pakistan"
  const accountNumber = settings.account_number || "01234567890123"
  const whatsapp = settings.whatsapp_support || "03001234567"

  const whatsappDigits = whatsapp.replace(/[^0-9]/g, "")
  const whatsappLink = `https://wa.me/${whatsappDigits.startsWith("0") ? "92" + whatsappDigits.slice(1) : whatsappDigits}`

  const upgradePlans = planOrder.filter((p) => p !== "trial" && p !== restaurant.plan)
  const currentPlan = restaurant.plan as Plan
  const isCurrentPaid = currentPlan !== "trial"

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold text-black">Subscription</h1>
        <p className="text-sm text-[#555] mt-1">Manage your plan and billing</p>
      </section>

      {/* Suspended Banner */}
      {isSuspended && (
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-900">Subscription Suspended</h4>
            <p className="text-xs text-amber-800 mt-1">Your account is currently in a restricted state. Please upgrade or renew your plan to continue receiving orders.</p>
          </div>
        </div>
      )}

      <SubscriptionBanner restaurant={restaurant} orderCount={orderCount} />

      {/* Current Plan Section */}
      <section className="bg-white border border-[#F0F0F0] rounded-[14px] p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#555] uppercase tracking-wider">Current Plan</span>
            <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{PLAN_NAMES[currentPlan]}</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-black">
              {currentPlan === "trial" ? `${sub.trialDaysRemaining} days remaining` : sub.status?.daysRemaining ? `Renews in ${sub.status.daysRemaining} days` : "Active"}
            </p>
            <p className="text-xs text-[#555]">{currentPlan === "trial" ? "Trial period" : "Billing cycle"}</p>
          </div>
        </div>

        {/* Usage Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-[#F0F0F0] pt-6">
          <UsageMeter icon={<Utensils className="w-3.5 h-3.5" />} label="Dishes" used={sub.dishCount} limit={planLimits.maxDishes} />
          <UsageMeter icon={<ImageIcon className="w-3.5 h-3.5" />} label="Images" used={sub.imageCount} limit={planLimits.maxImages} />
          <UsageMeter icon={<ShoppingBag className="w-3.5 h-3.5" />} label="Orders" used={orderCount} limit={planLimits.maxOrders} />
          <UsageMeter icon={<Utensils className="w-3.5 h-3.5" />} label="Categories" used={sub.categoryCount} limit={planLimits.maxCategories} />
        </div>
      </section>

      {/* Upgrade Plans */}
      {!isCurrentPaid && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-black">Upgrade Plans</h2>
          <div className="flex flex-col gap-4">
            {upgradePlans.map((planKey) => {
              const price = PLAN_PRICES[planKey]
              const limits = PLAN_LIMITS[planKey]
              const isHighlight = planKey === "growth"
              return (
                <div
                  key={planKey}
                  className={`bg-white border rounded-[14px] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
                    isHighlight ? "border-2 border-black shadow-xl relative" : "border-[#F0F0F0]"
                  }`}
                >
                  {isHighlight && (
                    <div className="absolute -top-3 left-3 md:left-6 bg-black text-white text-[10px] font-bold px-2 md:px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap z-10">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-black">{PLAN_NAMES[planKey]}</h3>
                    <p className="text-sm text-[#555] mb-4">{
                      planKey === "starter" ? "Perfect for small kiosks" :
                      planKey === "growth" ? "For growing restaurants" :
                      "Complete enterprise solution"
                    }</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <FeatureRow label={`${formatLimit(limits.maxDishes)} dishes`} included />
                      <FeatureRow label={limits.maxImages === 0 ? "No images" : `${formatLimit(limits.maxImages)} images`} included={limits.maxImages > 0} />
                      <FeatureRow label={limits.maxOrders === Infinity ? "Unlimited orders" : `${limits.maxOrders} orders/mo`} included />
                      <FeatureRow label={limits.analytics ? "Analytics dashboard" : "No analytics"} included={limits.analytics} />
                      <FeatureRow label={limits.customBranding ? "Custom branding" : "No branding"} included={limits.customBranding} />
                      <FeatureRow label="QR code generation" included />
                      <FeatureRow label="WhatsApp orders" included />
                      <FeatureRow label="Priority support" included={planKey !== "starter"} />
                    </div>
                  </div>
                  <div className="text-right w-full md:w-auto">
                    <div className="text-3xl font-bold text-black mb-2">PKR {price.toLocaleString()}<span className="text-sm font-normal text-[#555]">/mo</span></div>
                    <a href={whatsappLink} target="_blank" rel="noopener">
                      <Button variant={isHighlight ? "accent" : "primary"} fullWidth>
                        <MessageCircle className="w-4 h-4 mr-1.5" />
                        Choose {PLAN_NAMES[planKey]} on WhatsApp
                      </Button>
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {isCurrentPaid && (
        <div className="bg-white rounded-xl border border-[#F0F0F0] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h4 className="text-sm font-semibold text-black">Need to change your plan?</h4>
            <p className="text-sm text-[#555]">Talk to us if you have unique requirements or need a custom plan.</p>
          </div>
          <a href={whatsappLink} target="_blank" rel="noopener">
            <Button variant="accent">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </a>
        </div>
      )}

      {/* How to Pay */}
      <section className="bg-[#F9FAFB] border border-[#F0F0F0] rounded-xl p-8 space-y-6">
        <h3 className="text-xl font-bold text-black flex items-center gap-2">
          <Clock className="w-5 h-5" /> How to Pay
        </h3>
        <p className="text-sm text-[#555]">
          We currently accept manual payments via JazzCash, Easypaisa, and direct Bank Transfer. Please send the amount and share the screenshot with our support team.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-[#F0F0F0]">
            <p className="text-xs text-[#555] mb-1">JazzCash</p>
            <p className="text-sm font-bold text-black">{jazzcash}</p>
            <p className="text-[11px] text-[#555]">A/C Title: {accountTitle}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-[#F0F0F0]">
            <p className="text-xs text-[#555] mb-1">Easypaisa</p>
            <p className="text-sm font-bold text-black">{easypaisa}</p>
            <p className="text-[11px] text-[#555]">A/C Title: {accountTitle}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-[#F0F0F0]">
            <p className="text-xs text-[#555] mb-1">Bank Transfer</p>
            <p className="text-sm font-bold text-black">{accountNumber}</p>
            <p className="text-[11px] text-[#555]">{bankName}</p>
          </div>
        </div>
        <div className="bg-[#25D366]/5 border border-[#25D366]/10 p-4 rounded-lg flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-[#25D366] flex-shrink-0" />
          <p className="text-sm text-[#555]">After payment, send your proof of receipt to our WhatsApp support for instant activation.</p>
        </div>
      </section>
    </div>
  )
}

function UsageMeter({ icon, label, used, limit }: { icon: React.ReactNode; label: string; used: number; limit: number }) {
  const isUnlimited = limit === Infinity
  const percent = isUnlimited ? 0 : Math.min(100, (used / limit) * 100)
  const isNear = !isUnlimited && used >= limit
  const isWarning = !isUnlimited && used >= limit * 0.7

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 text-xs text-[#555]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex justify-between items-end">
        <span className="text-xl font-bold text-black">{used} <span className="text-sm font-normal text-[#555]">/ {isUnlimited ? "∞" : limit}</span></span>
      </div>
      {!isUnlimited && (
        <div className="w-full h-1.5 bg-[#EDEEEF] rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${isNear ? "bg-[#ba1a1a]" : isWarning ? "bg-[#D97706]" : "bg-black"}`} style={{ width: `${percent}%` }} />
        </div>
      )}
    </div>
  )
}

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {included ? (
        <Check className="w-4 h-4 text-[#25D366] flex-shrink-0" />
      ) : (
        <X className="w-4 h-4 text-[#C6C6C6] flex-shrink-0" />
      )}
      <span className={included ? "text-black" : "text-[#999]"}>{label}</span>
    </div>
  )
}
