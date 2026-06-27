"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, Check, X } from "lucide-react"

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  showRequirements?: boolean
}

const checks = [
  { label: "Lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "Uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Number", test: (v: string) => /[0-9]/.test(v) },
  { label: "Special character", test: (v: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/.test(v) },
]

function PasswordRequirements({ value }: { value: string }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
      {checks.map((c) => {
        const pass = c.test(value)
        return (
          <div key={c.label} className="flex items-center gap-1.5">
            {pass ? (
              <Check className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-[#999] shrink-0" />
            )}
            <span className={cn("text-[11px]", pass ? "text-[#25D366]" : "text-[#999]")}>
              {c.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function validatePassword(value: string): string | null {
  if (value.length < 6) return "Password must be at least 6 characters"
  if (!/[a-z]/.test(value)) return "Must contain a lowercase letter"
  if (!/[A-Z]/.test(value)) return "Must contain an uppercase letter"
  if (!/[0-9]/.test(value)) return "Must contain a number"
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/.test(value)) return "Must contain a special character"
  return null
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, id, showRequirements = false, value, onChange, ...props }, ref) => {
    const [show, setShow] = React.useState(false)
    const val = typeof value === "string" ? value : ""

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={id}
            ref={ref}
            type={show ? "text" : "password"}
            value={value}
            onChange={onChange}
            className={cn(
              "flex h-12 w-full rounded-[10px] bg-[#F9FAFB] border border-border px-4 py-3 pr-11 text-base text-text-primary",
              "placeholder:text-text-muted",
              "focus:outline-none focus:border-primary transition-colors",
              error && "border-error",
              className
            )}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#555] transition-colors p-0.5"
          >
            {show ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
          </button>
        </div>
        {error && <p id={`${id}-error`} role="alert" className="text-xs text-error">{error}</p>}
        {showRequirements && val.length > 0 && <PasswordRequirements value={val} />}
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput, validatePassword, PasswordRequirements }
