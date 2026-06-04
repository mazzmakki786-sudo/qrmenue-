"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SubscriptionBanner } from "@/components/shared/SubscriptionBanner"
import { useCompanySettings } from "@/lib/hooks/useCompanySettings"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { PLAN_LIMITS, PLAN_NAMES, PLAN_PRICES, type Plan, formatLimit } from "@/lib/subscription"
import { Check, X, Sparkles, ArrowRight, Clock, ShoppingBag, Image as ImageIcon, Utensils, MessageCircle, Star } from "lucide-react"

const planOrder: Plan[] = ["trial", "starter", "growth", "premium"]

export default function SubscriptionPage() {
  const sub = useSubscription()
  const { restaurant, orderCount, planLimits, loading } = sub
  const { settings } = useCompanySettings()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="h-8 w-40 bg-[#E8E8E8] rounded animate-pulse" />
        <div className="h-24 bg-[#E8E8E8] rounded-[14px] animate-pulse" />
        <div className="h-64 bg-[#E8E8E8] rounded-[14px] animate-pulse" />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="text-center text-[#999] py-12">
        No restaurant found.
      </div>
    )
  }

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
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Subscription</h1>
        <p className="text-sm text-[#555] mt-1">
          Manage your plan and billing
        </p>
      </div>

      <SubscriptionBanner restaurant={restaurant} orderCount={orderCount} />

      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#555]">Current Plan</span>
          <Badge variant={(restaurant.plan as any) || "trial"} className="capitalize">
            {PLAN_NAMES[currentPlan]}
          </Badge>
        </div>
        <p className="text-xs text-[#555] mb-4">
          {currentPlan === "trial"
            ? `${sub.trialDaysRemaining} days remaining in trial`
            : sub.status?.daysRemaining
              ? `Renews in ${sub.status.daysRemaining} days`
              : "Active"}
        </p>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#F0F0F0]">
          <UsageStat
            icon={<Utensils className="w-3.5 h-3.5" />}
            label="Dishes"
            used={sub.dishCount}
            limit={planLimits.maxDishes}
          />
          <UsageStat
            icon={<ImageIcon className="w-3.5 h-3.5" />}
            label="Images"
            used={sub.imageCount}
            limit={planLimits.maxImages}
          />
          <UsageStat
            icon={<ShoppingBag className="w-3.5 h-3.5" />}
            label="Orders"
            used={orderCount}
            limit={planLimits.maxOrders}
          />
        </div>
      </div>

      {!isCurrentPaid && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Choose Your Plan</h2>
          <div className="space-y-3">
            {upgradePlans.map((planKey) => {
              const price = PLAN_PRICES[planKey]
              const limits = PLAN_LIMITS[planKey]
              const isHighlight = planKey === "growth"
              return (
                <div
                  key={planKey}
                  className={`rounded-2xl border p-5 transition-all ${
                    isHighlight
                      ? "border-black bg-gradient-to-br from-white to-[#FAFAFA] shadow-sm"
                      : "border-[#E8E8E8] bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base">{PLAN_NAMES[planKey]}</h3>
                      {isHighlight && (
                        <span className="text-[10px] font-semibold bg-black text-white px-2 py-0.5 rounded-full">
                          POPULAR
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-bold">
                      PKR {price.toLocaleString()}
                      <span className="text-xs font-normal text-[#555]">/mo</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <UsageStat
                      icon={<Utensils className="w-3 h-3" />}
                      label="Dishes"
                      used={sub.dishCount}
                      limit={limits.maxDishes}
                      compact
                    />
                    <UsageStat
                      icon={<ImageIcon className="w-3 h-3" />}
                      label="Images"
                      used={sub.imageCount}
                      limit={limits.maxImages}
                      compact
                    />
                    <UsageStat
                      icon={<ShoppingBag className="w-3 h-3" />}
                      label="Orders"
                      used={orderCount}
                      limit={limits.maxOrders}
                      compact
                    />
                  </div>

                  <div className="space-y-1.5 text-sm mb-4">
                    <FeatureRow
                      label={`${formatLimit(limits.maxDishes)} dish${limits.maxDishes === 1 ? "" : "es"}`}
                      included
                    />
                    <FeatureRow
                      label={
                        limits.maxImages === 0
                          ? "No images"
                          : `${formatLimit(limits.maxImages)} image${limits.maxImages === 1 ? "" : "s"}`
                      }
                      included={limits.maxImages > 0}
                    />
                    <FeatureRow
                      label={
                        limits.maxOrders === Infinity
                          ? "Unlimited orders"
                          : `${limits.maxOrders} orders/mo`
                      }
                      included
                    />
                    <FeatureRow label="QR code generation" included />
                    <FeatureRow label="WhatsApp orders" included />
                    <FeatureRow label="Analytics dashboard" included={limits.analytics} />
                    <FeatureRow label="Custom branding" included={limits.customBranding} />
                    <FeatureRow label="Priority support" included={planKey !== "starter"} />
                  </div>

                  <a href={whatsappLink} target="_blank" rel="noopener" className="block">
                    <Button variant={isHighlight ? "accent" : "primary"} fullWidth>
                      <MessageCircle className="w-4 h-4 mr-1.5" />
                      Choose {PLAN_NAMES[planKey]} on WhatsApp
                    </Button>
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isCurrentPaid && (
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5">
          <h3 className="text-sm font-semibold mb-3">Need to change your plan?</h3>
          <p className="text-sm text-[#555] mb-4">
            Contact us on WhatsApp to upgrade, downgrade, or extend your subscription.
            Your data is preserved when you change plans.
          </p>
          <a href={whatsappLink} target="_blank" rel="noopener" className="block">
            <Button variant="accent" fullWidth>
              <MessageCircle className="w-4 h-4 mr-1.5" />
              Contact on WhatsApp
            </Button>
          </a>
        </div>
      )}

      <div className="bg-[#F8F8F8] rounded-2xl p-5 text-center">
        <h3 className="text-sm font-semibold mb-3 flex items-center justify-center gap-1.5">
          <Clock className="w-4 h-4" />
          How to Pay
        </h3>
        <div className="space-y-1 text-sm mb-4">
          <p>JazzCash: {jazzcash} ({accountTitle})</p>
          <p>Easypaisa: {easypaisa}</p>
          <p>Bank: {bankName} — {accountNumber}</p>
        </div>
        <p className="text-xs text-[#999]">
          After payment, message us on WhatsApp to activate your plan.
        </p>
      </div>
    </div>
  )
}

function UsageStat({
  icon,
  label,
  used,
  limit,
  compact = false,
}: {
  icon: React.ReactNode
  label: string
  used: number
  limit: number
  compact?: boolean
}) {
  const isUnlimited = limit === Infinity
  const percent = isUnlimited ? 0 : Math.min(100, (used / limit) * 100)
  const isNear = !isUnlimited && used >= limit
  const isWarning = !isUnlimited && used >= limit * 0.7

  return (
    <div className={`rounded-lg ${compact ? "p-2" : "p-2.5"} bg-[#FAFAFA]`}>
      <div className={`flex items-center gap-1 ${compact ? "text-[10px]" : "text-xs"} text-[#555] mb-1`}>
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className={`${compact ? "text-[11px]" : "text-xs"} font-semibold ${isNear ? "text-[#DC2626]" : isWarning ? "text-[#D97706]" : "text-black"}`}>
        {used} / {isUnlimited ? "∞" : limit}
      </div>
      {!isUnlimited && (
        <div className={`mt-1 ${compact ? "h-1" : "h-1.5"} bg-[#E8E8E8] rounded-full overflow-hidden`}>
          <div
            className={`h-full rounded-full transition-all ${
              isNear ? "bg-[#DC2626]" : isWarning ? "bg-[#D97706]" : "bg-black"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  )
}

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {included ? (
        <Check className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
      ) : (
        <X className="w-4 h-4 text-[#CCC] flex-shrink-0" />
      )}
      <span className={included ? "" : "text-[#999]"}>{label}</span>
    </div>
  )
}
