"use client"

import { ExternalLink } from "lucide-react"
import Link from "next/link"

interface SignInPromptBannerProps {
  orderId: string
}

export default function SignInPromptBanner({ orderId }: SignInPromptBannerProps) {
  return (
    <section className="bg-white border border-border rounded-2xl p-4 md:p-5 flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#F5F5F5] rounded-lg md:rounded-xl flex items-center justify-center">
          <ExternalLink className="w-5 h-5 text-text-muted" />
        </div>
        <span className="text-sm font-medium text-text-primary">Track your order</span>
      </div>
      <Link
        href={`/login/customer?redirect=/order-confirm/${orderId}`}
        className="text-sm font-bold text-accent hover:underline shrink-0"
      >
        Sign in
      </Link>
    </section>
  )
}
