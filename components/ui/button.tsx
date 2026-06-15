import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "ghost" | "google"
  size?: "default" | "sm" | "lg"
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", fullWidth = false, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-[10px] transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
          fullWidth && "w-full",
          variant === "primary" && "bg-black text-white hover:bg-[#1A1A1A]",
          variant === "accent" && "bg-[#25D366] text-white hover:bg-[#1ba94a]",
          variant === "ghost" && "bg-transparent border border-[#E8E8E8] text-[#111] hover:bg-[#F8F8F8]",
          variant === "google" && "bg-white border border-[#E8E8E8] text-[#111] hover:bg-[#F8F8F8] w-full",
          size === "sm" && "h-9 px-4 text-sm",
          size === "default" && "h-12 px-6 text-[15px]",
          size === "lg" && "h-14 px-8 text-base",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
