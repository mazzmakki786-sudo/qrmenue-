"use client"

import { ClipboardList, Copy } from "lucide-react"
import { useState } from "react"
import type { CustomerDetailsCardProps } from "./types"

export default function CustomerDetailsCard({
  customerName,
  customerPhone,
  tableNumber,
  orderType,
  paymentMethod,
  deliveryAddress,
}: CustomerDetailsCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyPhone = async () => {
    if (!customerPhone) return
    try {
      await navigator.clipboard.writeText(customerPhone)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const details = [
    { label: "Customer", value: customerName },
    ...(customerPhone
      ? [
          {
            label: "Phone",
            value: customerPhone,
            action: (
              <button
                onClick={handleCopyPhone}
                className="text-[11px] text-accent font-semibold flex items-center gap-0.5 hover:underline"
              >
                <Copy className="w-3 h-3" />
                {copied ? "Copied!" : "Copy"}
              </button>
            ),
          },
        ]
      : []),
    ...(tableNumber ? [{ label: "Table", value: `Table ${tableNumber}` }] : []),
    { label: "Type", value: orderType?.replace("_", " ")?.replace(/\b\w/g, (c) => c.toUpperCase()) || "-" },
    {
      label: "Payment",
      value:
        paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "bank_transfer" ? "Bank Transfer" : paymentMethod,
    },
    ...(deliveryAddress ? [{ label: "Address", value: deliveryAddress }] : []),
  ].filter(Boolean) as { label: string; value: string; action?: React.ReactNode }[]

  return (
    <section className="bg-white border border-border rounded-2xl p-5 md:p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-5 h-5 text-text-secondary" />
        <h3 className="text-[13px] md:text-[15px] font-bold text-text-primary">Order Details</h3>
      </div>

      <div className="space-y-3">
        {details.map((d) => (
          <div key={d.label} className="flex items-center justify-between text-[13px]">
            <span className="text-text-secondary">{d.label}</span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-text-primary text-right">{d.value}</span>
              {d.action}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
