import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-[#111]">
            {label}
          </label>
        )}
        <input
          id={id}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "flex h-12 w-full rounded-[10px] bg-[#F8F8F8] border border-[#E8E8E8] px-4 py-3 text-base",
            "placeholder:text-[#999]",
            "focus:outline-none focus:border-black transition-colors",
            error && "border-[#DC2626]",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p id={`${id}-error`} role="alert" className="text-xs text-[#DC2626]">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
