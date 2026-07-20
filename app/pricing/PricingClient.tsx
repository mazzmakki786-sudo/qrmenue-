"use client"

import { useEffect, useState } from "react"
import { Pricing2 } from "@/components/ui/pricing-cards"
import { mergeYearlyPlans, type DBPlan } from "@/lib/map-plans"
import Link from "next/link"
import Image from "next/image"
import { Check, X } from "lucide-react"
import { AppFooter } from "@/components/shared/AppFooter"
import { useCompanySettings } from "@/lib/hooks/useCompanySettings"

const comparisonFeatures = [
  { label: "Menu Items", trial: "20", starter: "30", growth: "50", premium: "100" },
  { label: "Categories", trial: "20", starter: "Unlimited", growth: "Unlimited", premium: "Unlimited" },
  { label: "Menu Images", trial: "20", starter: "10", growth: "20", premium: "100" },
  { label: "Orders/mo", trial: "10", starter: "Unlimited", growth: "Unlimited", premium: "Unlimited" },
  { label: "Custom Branding", trial: false, starter: false, growth: true, premium: true },
  { label: "WhatsApp Orders", trial: true, starter: true, growth: true, premium: true },
  { label: "QR Code", trial: true, starter: true, growth: true, premium: true },
  { label: "Analytics", trial: "Basic", starter: "Basic", growth: "Advanced", premium: "Advanced" },
  { label: "Priority Support", trial: false, starter: false, growth: false, premium: true },
]

export function PricingClient() {
  const { settings, loading } = useCompanySettings()
  const [plans, setPlans] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.plans) {
          setPlans(mergeYearlyPlans(data.plans))
        }
      })
      .catch(() => {})
  }, [])

  const whatsapp = settings.whatsapp_support || "03001234567"
  const whatsappDigits = whatsapp.replace(/[^0-9]/g, "")
  const whatsappLink = `https://wa.me/${whatsappDigits.startsWith("0") ? "92" + whatsappDigits.slice(1) : whatsappDigits}`

  return (
    <>
      {/* Reusable Pricing2 component with Monthly/Yearly toggle, offer badges, strikethrough pricing */}
      <Pricing2
        heading="Simple, Transparent Pricing"
        description="No hidden fees. No commission on orders. Cancel anytime."
        plans={plans}
      />

      {/* Comparison Table */}
      <section className="py-16 md:py-24 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Compare Plans</h2>
            <p className="text-sm text-[#888]">All plans include WhatsApp order integration</p>
          </div>

          {/* Mobile */}
          <div className="md:hidden overflow-x-auto -mx-5 px-5">
            <div className="min-w-[500px] bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F0F0F0]">
                    <th className="text-left px-4 py-3.5 font-semibold text-[#555] text-xs">Feature</th>
                    <th className="text-center px-3 py-3.5 font-semibold text-xs">Free Trial</th>
                    <th className="text-center px-3 py-3.5 font-semibold text-xs bg-[#FAFAFA]">Starter</th>
                    <th className="text-center px-3 py-3.5 font-semibold text-xs text-black">Growth</th>
                    <th className="text-center px-3 py-3.5 font-semibold text-xs">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((f, i) => {
                    const render = (val: boolean | string) => {
                      if (typeof val === "boolean") {
                        return val
                          ? <Check className="w-3.5 h-3.5 text-[#16A34A] mx-auto" />
                          : <X className="w-3.5 h-3.5 text-[#DDD] mx-auto" />
                      }
                      return <span className="font-medium text-[10px]">{val}</span>
                    }
                    return (
                      <tr key={f.label} className={`border-b border-[#F0F0F0] last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}`}>
                        <td className="px-4 py-3 text-[#111] text-[11px]">{f.label}</td>
                        <td className="px-3 py-3 text-center">{render(f.trial)}</td>
                        <td className="px-3 py-3 text-center bg-[#FAFAFA]">{render(f.starter)}</td>
                        <td className="px-3 py-3 text-center">{render(f.growth)}</td>
                        <td className="px-3 py-3 text-center bg-[#FAFAFA]">{render(f.premium)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
            <div className="min-w-[640px] bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F0F0F0]">
                    <th className="text-left px-5 py-4 font-semibold text-[#555]">Feature</th>
                    <th className="text-center px-4 py-4 font-semibold w-[120px]">Free Trial</th>
                    <th className="text-center px-4 py-4 font-semibold w-[120px]">Starter</th>
                    <th className="text-center px-4 py-4 font-semibold w-[120px] bg-[#FAFAFA] text-black">Growth</th>
                    <th className="text-center px-4 py-4 font-semibold w-[120px]">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((f, i) => {
                    const render = (val: boolean | string) => {
                      if (typeof val === "boolean") {
                        return val
                          ? <Check className="w-4 h-4 text-[#16A34A] mx-auto" />
                          : <X className="w-4 h-4 text-[#DDD] mx-auto" />
                      }
                      return <span className="font-medium text-xs">{val}</span>
                    }
                    return (
                      <tr key={f.label} className={`border-b border-[#F0F0F0] last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}`}>
                        <td className="px-5 py-3.5 text-[#111] text-xs md:text-sm">{f.label}</td>
                        <td className="px-4 py-3.5 text-center">{render(f.trial)}</td>
                        <td className="px-4 py-3.5 text-center">{render(f.starter)}</td>
                        <td className="px-4 py-3.5 text-center bg-[#FAFAFA]">{render(f.growth)}</td>
                        <td className="px-4 py-3.5 text-center">{render(f.premium)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-xs text-[#999]">
              All plans include free setup and basic support. Need help?{" "}
              <a href={whatsappLink} target="_blank" rel="noopener" className="text-black underline underline-offset-2 hover:no-underline">
                Contact us
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 pb-16 md:pb-24">
        <div className="bg-black rounded-3xl p-10 md:p-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#25D366]/10 to-transparent pointer-events-none" />
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 relative z-10">
            Ready to go digital?
          </h2>
          <p className="text-sm md:text-base text-white/70 mb-8 max-w-md mx-auto relative z-10">
            Join hundreds of restaurants in Pakistan using Digital QR Menue to streamline their ordering process.
          </p>
          <div className="relative z-10">
            <Link
              href="/signup"
              className="inline-block px-10 py-3.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-[#25D366] hover:text-black transition-all"
            >
              Start Free Trial — No Credit Card
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#F0F0F0]">
        <div className="max-w-6xl mx-auto px-5 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-2 font-bold text-base">
                <Image
                  src="/icon.svg"
                  alt="Digital QR Menue"
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-lg"
                />
                Digital QR Menue
              </div>
              <p className="text-xs text-[#999]">Made in Pakistan</p>
            </div>
            <div className="flex gap-6 text-xs text-[#555]">
              <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
              <Link href="/restaurants" className="hover:text-black transition-colors">Restaurants</Link>
            </div>
          </div>
          <div className="text-center mt-6 text-[10px] text-[#BBB]">
            &copy; 2026 Digital QR Menue. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  )
}
