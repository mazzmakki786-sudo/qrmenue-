"use client"

import Link from "next/link"
import { PLAN_LIMITS, type Plan } from "@/lib/subscription"
import { AlertTriangle, Sparkles, TrendingUp, XCircle, ArrowRight, Lock, Eye, ShoppingBag } from "lucide-react"

interface Props {
  restaurant: any
  orderCount?: number
}

export function SubscriptionBanner({ restaurant, orderCount = 0 }: Props) {
  if (!restaurant) return null

  const plan = (restaurant.plan as Plan) || "trial"
  const trialEnd = new Date(restaurant.trial_end)
  const planEnd = restaurant.plan_end_date
    ? new Date(restaurant.plan_end_date)
    : null
  const now = new Date()
  const msPerDay = 1000 * 60 * 60 * 24

  const trialDaysRemaining = Math.max(
    0,
    Math.ceil((trialEnd.getTime() - now.getTime()) / msPerDay)
  )
  const graceEnd = new Date(trialEnd.getTime() + 3 * msPerDay)
  const isInGracePeriod =
    plan === "trial" && now > trialEnd && now < graceEnd
  const isExpired = plan === "trial" ? now > graceEnd : planEnd ? now > planEnd : false
  const limits = PLAN_LIMITS[plan]

  const orderLimit = limits.maxOrders
  const orderLimitPercent =
    orderLimit === Infinity ? 0 : Math.min(100, (orderCount / orderLimit) * 100)
  const isOrderLimitNear =
    orderLimit !== Infinity && orderCount >= orderLimit
  const isOrderLimitWarning =
    orderLimit !== Infinity && orderCount >= orderLimit * 0.7

  if (isExpired) {
    return (
      <div className="bg-[#DC2626]/10 border border-[#DC2626]/30 rounded-[14px] p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[#DC2626] text-white flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#DC2626]">
              Trial expired — upgrade to continue
            </p>
            <p className="text-xs text-[#555] mt-1">
              Your data is saved. Pick a plan to restore your menu.
            </p>
            <Link
              href="/dashboard/subscription"
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-[#DC2626] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Upgrade Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isInGracePeriod) {
    const graceDaysLeft = Math.max(
      0,
      Math.ceil((graceEnd.getTime() - now.getTime()) / msPerDay)
    )
    return (
      <div className="bg-[#D97706]/10 border border-[#D97706]/30 rounded-[14px] p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[#D97706] text-white flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#D97706]">
              Trial ended — {graceDaysLeft} day{graceDaysLeft === 1 ? "" : "s"} of grace left
            </p>
            <p className="text-xs text-[#555] mt-1">
              Upgrade now to keep your menu live and avoid interruption.
            </p>
            <Link
              href="/dashboard/subscription"
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-[#D97706] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Choose Plan <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (plan === "trial") {
    const showOrderWarning = isOrderLimitNear || isOrderLimitWarning

    return (
      <div className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] border border-[#2563EB]/20 rounded-[14px] p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1E40AF]">
              Free Trial — {trialDaysRemaining} day{trialDaysRemaining === 1 ? "" : "s"} left
            </p>
            <p className="text-xs text-[#555] mt-0.5">
              {showOrderWarning
                ? isOrderLimitNear
                  ? "Order limit reached — upgrade to keep accepting orders"
                  : "Approaching your order limit"
                : "Enjoying your free trial?"}
            </p>
          </div>
        </div>

        {orderLimit !== Infinity && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-[#1E40AF] mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                Orders
              </span>
              <span>
                {orderCount} / {orderLimit}
              </span>
            </div>
            <div className="h-2 bg-white/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isOrderLimitNear
                    ? "bg-[#DC2626]"
                    : isOrderLimitWarning
                      ? "bg-[#D97706]"
                      : "bg-[#2563EB]"
                }`}
                style={{ width: `${orderLimitPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/dashboard/subscription"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <TrendingUp className="w-3.5 h-3.5" /> Upgrade
          </Link>
          {showOrderWarning && (
            <span className="text-xs text-[#D97706] font-medium flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Details blur at limit
            </span>
          )}
        </div>
      </div>
    )
  }

  const remainingDays = planEnd
    ? Math.max(0, Math.ceil((planEnd.getTime() - now.getTime()) / msPerDay))
    : 999

  return (
    <div className="bg-[#DCFCE7]/50 border border-[#22C55E]/20 rounded-[14px] p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-[#16A34A] text-white flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold capitalize text-[#15803D]">
          {plan} Plan
        </p>
        <p className="text-xs text-[#555]">
          {remainingDays === 999
            ? "Active"
            : `Renews in ${remainingDays} day${remainingDays === 1 ? "" : "s"}`}
        </p>
      </div>
      <Link
        href="/dashboard/subscription"
        className="text-xs font-medium text-[#15803D] hover:underline flex items-center gap-1"
      >
        Manage <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  )
}
