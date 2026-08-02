"use client"

import Image from "next/image"
import { Copy, Landmark } from "lucide-react"
import { useState } from "react"

interface PaymentTransferDetailsProps {
  tillId: string | null | undefined
  qrUrl: string | null | undefined
  /** Optional heading label — defaults to "Bank Transfer Details" */
  title?: string
  /** Compact variant for the order-confirm page */
  compact?: boolean
}

/**
 * Shows the restaurant's wallet/bank transfer details (TILL ID + QR image).
 * Rendered on checkout when the customer selects Bank Transfer, and on the
 * order-confirm screen only for orders placed with bank_transfer.
 */
export function PaymentTransferDetails({
  tillId,
  qrUrl,
  title = "Bank Transfer Details",
  compact = false,
}: PaymentTransferDetailsProps) {
  const [copied, setCopied] = useState(false)

  const hasDetails = tillId?.trim() || qrUrl?.trim()

  if (!hasDetails) return null

  const handleCopyTill = async () => {
    if (!tillId) return
    try {
      await navigator.clipboard.writeText(tillId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className={`bg-white rounded-2xl border border-border ${compact ? "p-4 md:p-5" : "p-5"} mt-3 animate-fade-in`}>
      <div className="flex items-center gap-2 mb-3">
        <Landmark className="w-4 h-4 text-text-secondary" />
        <h4 className="text-[13px] font-semibold text-text-primary">{title}</h4>
      </div>

      <div className={`flex ${compact ? "gap-4" : "gap-5"} items-center`}>
        {qrUrl && (
          <div className={`relative ${compact ? "w-20 h-20" : "w-24 h-24"} shrink-0 rounded-xl overflow-hidden bg-[#F9FAFB] border border-border`}>
            <Image
              src={qrUrl}
              alt="Payment QR code"
              fill
              className="object-contain p-1"
              sizes="96px"
              unoptimized
            />
          </div>
        )}

        {tillId?.trim() && (
          <div className="min-w-0">
            <p className="text-[11px] text-text-muted uppercase tracking-wide font-medium">TILL / Wallet ID</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm font-bold text-text-primary break-all">{tillId}</p>
              <button
                onClick={handleCopyTill}
                className="text-[11px] text-accent font-semibold flex items-center gap-0.5 hover:underline shrink-0"
                aria-label="Copy TILL ID"
              >
                <Copy className="w-3 h-3" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-[11px] text-text-muted mt-3">
        Scan the QR code or transfer to the TILL ID above. Your order stays pending until the restaurant confirms your payment.
      </p>
    </div>
  )
}
