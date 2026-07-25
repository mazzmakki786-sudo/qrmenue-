"use client"

import { RotateCcw, X, ClipboardList, Store } from "lucide-react"
import Link from "next/link"
import type { OrderActionsBarProps } from "./types"

export default function OrderActionsBar({
  isPending,
  isLoggedIn,
  onReorder,
  onCancelClick,
  user,
}: OrderActionsBarProps) {
  // Show cancel button for pending orders:
  // - Logged-in users who own the order
  // - Guest orders (no customer_id) — can always cancel
  const showCancel = isPending

  return (
    <div className="space-y-3 pt-4 pb-8 md:flex md:items-stretch md:gap-3 md:space-y-0 md:pt-2 animate-fade-in">
      {/* Reorder — primary action */}
      <button
        onClick={onReorder}
        className="md:flex-1 w-full flex items-center justify-center gap-2 py-3 md:py-3.5 rounded-xl text-sm md:text-[14px] text-white font-semibold bg-primary hover:bg-primary-hover active:scale-[0.98] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
      >
        <RotateCcw className="w-4 h-4" />
        Reorder
      </button>

      {/* Cancel Order — only for pending orders */}
      {showCancel && (
        <button
          onClick={onCancelClick}
          className="md:flex-1 w-full flex items-center justify-center gap-2 py-3 md:py-3.5 rounded-xl text-sm md:text-[14px] text-error font-semibold border-2 border-error/30 hover:bg-error/5 active:scale-[0.98] transition-all"
        >
          <X className="w-4 h-4" />
          Cancel Order
        </button>
      )}

      {/* My Orders — only for logged-in users */}
      {user && (
        <Link
          href="/account"
          className="md:flex-1 w-full flex items-center justify-center gap-2 py-3 md:py-3.5 rounded-xl text-sm md:text-[14px] text-text-secondary font-semibold border border-border hover:bg-[#FAFAFA] hover:border-border-strong active:scale-[0.98] transition-all"
        >
          <ClipboardList className="w-4 h-4" />
          My Orders
        </Link>
      )}

      {/* Browse More — fallback or secondary */}
      <Link
        href="/restaurants"
        className="md:flex-1 w-full flex items-center justify-center gap-2 py-3 md:py-3.5 rounded-xl text-sm md:text-[14px] text-text-secondary font-semibold border border-border hover:bg-[#FAFAFA] hover:border-border-strong active:scale-[0.98] transition-all"
      >
        <Store className="w-4 h-4" />
        Browse More
      </Link>
    </div>
  )
}
