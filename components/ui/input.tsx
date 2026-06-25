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
          <label htmlFor={id} className="block text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input
          id={id}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "flex h-12 w-full rounded-[10px] bg-[#F9FAFB] border border-border px-4 py-3 text-base text-text-primary",
            "placeholder:text-text-muted",
            "focus:outline-none focus:border-primary transition-colors",
            error && "border-error",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p id={`${id}-error`} role="alert" className="text-xs text-error">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
