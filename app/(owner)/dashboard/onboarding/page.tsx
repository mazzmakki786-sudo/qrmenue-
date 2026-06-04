"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { QRCodeDisplay } from "@/components/shared/QRCodeDisplay"
import { Button } from "@/components/ui/button"
import { Check, Copy, ArrowRight } from "lucide-react"
import { useSubscription } from "@/lib/hooks/useSubscription"

export default function OnboardingPage() {
  const router = useRouter()
  const sub = useSubscription()
  const { restaurant, loading } = sub
  const [copied, setCopied] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-[#999]">Loading...</div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-lg font-medium mb-4">No restaurant found</p>
          <Button onClick={() => router.push("/signup/restaurant")}>Register your restaurant</Button>
        </div>
      </div>
    )
  }

  const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://qr-menue-one.vercel.app"}/menu/${restaurant.slug}`

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(menuUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 md:space-y-8 py-6 md:py-8 px-2">
      <div className="text-center">
        <div className="w-14 h-14 md:w-16 md:h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-7 h-7 md:w-8 md:h-8" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">Welcome, {restaurant.name}!</h1>
        <p className="text-[#555] mt-2 text-sm md:text-base">
          Your restaurant is all set. Here's what you need to know.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 md:p-6 space-y-3">
        <h2 className="font-semibold">Your Restaurant</h2>
        <div className="flex items-center gap-3">
          {restaurant.logo_url ? (
            <img src={restaurant.logo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#F8F8F8] flex items-center justify-center">
              <span className="text-lg font-bold text-[#555]">{restaurant.name[0]}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium truncate">{restaurant.name}</p>
            <p className="text-sm text-[#555] truncate">{restaurant.city}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 md:p-6 space-y-3">
        <h2 className="font-semibold">Your Menu URL</h2>
        <p className="text-sm text-[#555]">Share this link with your customers:</p>
        <div className="flex items-center gap-2 p-3 bg-[#F8F8F8] rounded-xl">
          <code className="text-xs md:text-sm flex-1 break-all">{menuUrl}</code>
          <button
            onClick={handleCopyUrl}
            className="flex-shrink-0 p-2 hover:bg-[#E8E8E8] rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4 text-[#555]" />}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 md:p-6">
        <h2 className="font-semibold mb-4">Your QR Code</h2>
        <QRCodeDisplay restaurantSlug={restaurant.slug} restaurantName={restaurant.name} />
      </div>

      <div className="bg-[#F8F8F8] rounded-2xl p-5 md:p-6 space-y-3">
        <h2 className="font-semibold">Next Steps</h2>
        <ol className="space-y-2 text-sm text-[#555]">
          <li className="flex items-start gap-2">
            <span className="font-bold text-black">1.</span>
            <span>Add your menu categories and dishes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-black">2.</span>
            <span>Print the QR code and place it on your tables</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-black">3.</span>
            <span>Customers scan, browse, and order via WhatsApp</span>
          </li>
        </ol>
      </div>

      <Button
        variant="primary"
        fullWidth
        size="lg"
        onClick={() => router.push("/dashboard")}
      >
        Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  )
}
