"use client"

import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { SignUpToCancelDialogProps } from "./types"

export default function SignUpToCancelDialog({
  open,
  onOpenChange,
  orderId,
}: SignUpToCancelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-error" />
            Sign in to Cancel Order
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            To cancel this order, please sign up or log in to your account.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border border-border text-text-secondary hover:bg-[#FAFAFA] transition-all"
            >
              Not Now
            </button>
            <Link
              href={`/login/customer?redirect=/order-confirm/${orderId}`}
              onClick={() => onOpenChange(false)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover flex items-center justify-center gap-2 transition-all text-center"
            >
              Sign in / Sign up
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
