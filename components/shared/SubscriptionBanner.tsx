"use client"

import { getSubscriptionStatus } from "@/lib/subscription"
import { Badge } from "@/components/ui/badge"

interface Props {
  restaurant: any
}

export function SubscriptionBanner({ restaurant }: Props) {
  const status = getSubscriptionStatus(restaurant)

  if (status.isExpired) {
    return (
      <div className="bg-[#DC2626]/10 border border-[#DC2626]/20 rounded-[10px] p-4 text-center">
        <p className="text-sm font-medium text-[#DC2626]">Your plan has expired</p>
        <p className="text-xs text-[#555] mt-1">Upgrade to continue using QRMenu</p>
      </div>
    )
  }

  if (status.isInGracePeriod) {
    return (
      <div className="bg-[#D97706]/10 border border-[#D97706]/20 rounded-[10px] p-4 text-center">
        <p className="text-sm font-medium text-[#D97706]">Trial ended — {status.daysRemaining} day grace remaining</p>
        <p className="text-xs text-[#555] mt-1">Upgrade to keep your menu active</p>
      </div>
    )
  }

  if (restaurant.plan === "trial") {
    return (
      <div className="bg-[#EFF6FF] border border-[#2563EB]/20 rounded-[10px] p-4 text-center">
        <p className="text-sm font-medium text-[#2563EB]">
          Free Trial — {status.daysRemaining} days remaining
        </p>
        <p className="text-xs text-[#555] mt-1">
          {status.canUploadImages ? "Image upload available" : "Image upload not available in trial"}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#DCFCE7]/50 border border-[#22C55E]/20 rounded-[10px] p-4 text-center">
      <p className="text-sm font-medium text-[#16A34A]">
        {restaurant.plan.charAt(0).toUpperCase() + restaurant.plan.slice(1)} Plan — {status.daysRemaining} days remaining
      </p>
    </div>
  )
}
