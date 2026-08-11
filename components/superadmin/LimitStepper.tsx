"use client"

import { useState } from "react"

interface Props {
  label: string
  /** Effective limit (the plan default merged with any override). May be Infinity. */
  value: number
  /** Live usage count for this limit (e.g. AI credits used this month). */
  used?: number
  /** Highlight the row (used for AI credits). */
  accent?: boolean
  disabled?: boolean
  onChange: (next: number) => void
}

/**
 * Quick "credit" stepper used by the superadmin panel.
 * Show the effective limit, allow − / + / typed value; each commit persists
 * via the parent's API call. Infinity (unlimited) is displayed as "∞".
 */
export function LimitStepper({ label, value, used, accent, disabled, onChange }: Props) {
  const [draft, setDraft] = useState("")
  const isUnlimited = value === Infinity
  const display = isUnlimited ? "∞" : String(value)

  const commit = (v: number) => {
    const n = Math.max(0, Math.round(v))
    onChange(n)
  }

  const commitDraft = () => {
    if (draft !== "") {
      const n = parseInt(draft, 10)
      if (!Number.isNaN(n)) commit(n)
    }
    setDraft("")
  }

  return (
    <div
      className={`flex items-center gap-1.5 ${accent ? "bg-[#F3F4F5] rounded-xl px-2.5 py-2" : ""}`}
    >
      <span className={`text-[11px] font-medium w-24 flex-shrink-0 truncate ${accent ? "text-black" : "text-[#555]"}`}>
        {label}
      </span>

      <button
        type="button"
        disabled={disabled}
        onClick={() => commit(isUnlimited ? 0 : value - 1)}
        className="w-6 h-6 rounded-md border border-[#E8E8E8] text-sm font-bold text-[#333] hover:bg-[#F0F0F0] disabled:opacity-40 transition-colors leading-none"
        aria-label={`Decrease ${label}`}
      >
        −
      </button>

      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitDraft}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur()
        }}
        placeholder={display}
        inputMode="numeric"
        disabled={disabled}
        className="w-14 h-6 rounded-md border border-[#E8E8E8] text-center text-xs font-semibold bg-white outline-none focus:border-black disabled:opacity-50 transition-colors"
        title={`Current: ${display}`}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => commit(isUnlimited ? 1 : value + 1)}
        className="w-6 h-6 rounded-md border border-[#E8E8E8] text-sm font-bold text-[#333] hover:bg-[#F0F0F0] disabled:opacity-40 transition-colors leading-none"
        aria-label={`Increase ${label}`}
      >
        +
      </button>

      {used !== undefined && (
        <span className="text-[10px] text-[#999] font-medium w-16 text-right tabular-nums">
          {used}/<b className="text-black">{display}</b>
        </span>
      )}
    </div>
  )
}