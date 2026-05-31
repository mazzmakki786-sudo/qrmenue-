"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { getSubscriptionStatus, PLAN_PRICES, PLAN_LIMITS } from "@/lib/subscription"
import { SubscriptionBanner } from "@/components/shared/SubscriptionBanner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import type { Restaurant } from "@/types"

const plans = [
  { key: "starter", name: "Starter" },
  { key: "growth", name: "Growth" },
  { key: "premium", name: "Premium" },
]

export default function SubscriptionPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from("restaurants").select("*").eq("owner_id", user.id).single()
      setRestaurant(data)
    }
    fetch()
  }, [])

  if (!restaurant) {
    return (
      <div className="space-y-6 max-w-lg">
        <div className="h-8 w-40 bg-[#E8E8E8] rounded animate-pulse" />
        <div className="h-24 bg-[#E8E8E8] rounded-[14px] animate-pulse" />
        <div className="h-64 bg-[#E8E8E8] rounded-[14px] animate-pulse" />
      </div>
    )
  }

  const status = getSubscriptionStatus(restaurant)

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-xl font-bold">Subscription</h1>

      <SubscriptionBanner restaurant={restaurant} />

      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-[#555]">Current Plan</span>
          <Badge variant={(restaurant.plan as any) || "trial"} className="capitalize">
            {restaurant.plan}
          </Badge>
        </div>
        <p className="text-xs text-[#555]">
          {restaurant.plan === "trial"
            ? `${status.daysRemaining} days remaining in trial`
            : `Renews in ${status.daysRemaining} days`}
        </p>
      </div>

      <h2 className="text-lg font-semibold">Choose Your Plan</h2>

      <div className="space-y-4">
        {plans.map((plan) => {
          const price = PLAN_PRICES[plan.key as keyof typeof PLAN_PRICES]
          const limits = PLAN_LIMITS[plan.key as keyof typeof PLAN_LIMITS]
          return (
            <div
              key={plan.key}
              className={`rounded-[14px] border p-5 ${
                restaurant.plan === plan.key ? "border-black" : "border-[#E8E8E8]"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">{plan.name}</h3>
                <p className="text-lg font-bold">PKR {price.toLocaleString()}<span className="text-sm font-normal text-[#555]">/mo</span></p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#16A34A]" />
                  <span>Unlimited dishes</span>
                </div>
                <div className="flex items-center gap-2">
                  {limits.maxImages > 0 ? (
                    <Check className="w-4 h-4 text-[#16A34A]" />
                  ) : (
                    <X className="w-4 h-4 text-[#999]" />
                  )}
                  <span className={limits.maxImages > 0 ? "" : "text-[#999]"}>
                    {limits.maxImages === Infinity ? "Unlimited images" : limits.maxImages === 0 ? "No images" : `${limits.maxImages} images`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {limits.customBranding ? (
                    <Check className="w-4 h-4 text-[#16A34A]" />
                  ) : (
                    <X className="w-4 h-4 text-[#999]" />
                  )}
                  <span className={limits.customBranding ? "" : "text-[#999]"}>Custom branding</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-[#F8F8F8] rounded-[14px] p-5 text-center">
        <h3 className="text-sm font-semibold mb-3">How to Pay</h3>
        <div className="space-y-1 text-sm mb-4">
          <p>JazzCash: 0300-1234567 (QRMenu Pakistan)</p>
          <p>Easypaisa: 0300-1234567</p>
          <p>Bank: Meezan Bank — 01234567890123</p>
        </div>
        <Button variant="accent" fullWidth>
          Contact us on WhatsApp to upgrade
        </Button>
      </div>
    </div>
  )
}
