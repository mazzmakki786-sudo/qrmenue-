"use client"

import { AlertCircle, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { CancelOrderDialogProps } from "./types"

export default function CancelOrderDialog({
  open,
  onOpenChange,
  onConfirm,
  cancelling,
  cancelError,
  orderNumber,
}: CancelOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!cancelling) onOpenChange(o) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-error" />
            Cancel Order
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to cancel order{" "}
            <span className="font-semibold text-text-primary">#{orderNumber}</span>?
            This action cannot be undone.
          </p>

          {cancelError && (
            <div className="bg-error/5 border border-error/10 rounded-xl px-4 py-3">
              <p className="text-xs text-error font-medium">{cancelError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onOpenChange(false)}
              disabled={cancelling}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border border-border text-text-secondary hover:bg-[#FAFAFA] disabled:opacity-50 transition-all"
            >
              Keep Order
            </button>
            <button
              onClick={onConfirm}
              disabled={cancelling}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-error hover:bg-error/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {cancelling ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                  </svg>
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  Yes, Cancel Order
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
