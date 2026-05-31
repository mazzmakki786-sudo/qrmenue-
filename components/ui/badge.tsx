import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "available" | "unavailable" | "trial" | "starter" | "growth" | "premium"
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "available", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
          variant === "available" && "bg-[#DCFCE7] text-[#16A34A]",
          variant === "unavailable" && "bg-[#F5F5F5] text-[#999]",
          variant === "trial" && "bg-[#FEF3C7] text-[#D97706]",
          variant === "starter" && "bg-[#F0F0F0] text-[#555]",
          variant === "growth" && "bg-[#EFF6FF] text-[#2563EB]",
          variant === "premium" && "bg-[#FFF7ED] text-[#EA580C]",
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
