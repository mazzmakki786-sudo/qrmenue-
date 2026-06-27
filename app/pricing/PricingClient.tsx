"use client"

import Link from "next/link"
import { Check, X } from "lucide-react"
import { useCompanySettings } from "@/lib/hooks/useCompanySettings"
import { useEffect, useState } from "react"
import { PLAN_LIMITS, PLAN_PRICES, PLAN_NAMES, DEFAULT_TRIAL_LIMITS, type Plan } from "@/lib/subscription"

interface DBPlan {
  slug: string
  name: string
  price: number
  limits: {
    maxDishes: number
    maxImages: number
    maxOrders: number
    maxCategories: number
    analytics: boolean
    customBranding: boolean
    canHaveQR: boolean
    canHaveWhatsapp: boolean
  }
  description: string
}

const planKeys: Plan[] = ["trial", "starter", "growth", "premium"]

interface PlanCard {
  key: string
  name: string
  price: string
  period: string
  badge: string | null
  popular: boolean
  features: { label: string; inc: boolean }[]
}

function buildPlanData(key: Plan, dbPlan?: DBPlan): PlanCard {
  const name = dbPlan?.name || PLAN_NAMES[key]
  const price = dbPlan?.price ?? PLAN_PRICES[key]

  const limits = dbPlan?.limits ? {
    maxDishes: dbPlan.limits.maxDishes === -1 ? Infinity : dbPlan.limits.maxDishes,
    maxImages: dbPlan.limits.maxImages === -1 ? Infinity : dbPlan.limits.maxImages,
    maxOrders: dbPlan.limits.maxOrders === -1 ? Infinity : dbPlan.limits.maxOrders,
    maxCategories: dbPlan.limits.maxCategories === -1 ? Infinity : dbPlan.limits.maxCategories,
  } : null

  const features: { label: string; inc: boolean }[] = []

  if (key === "trial") {
    features.push(
      { label: `${limits?.maxDishes ?? DEFAULT_TRIAL_LIMITS.maxDishes} dishes`, inc: true },
      { label: `${limits?.maxImages ?? 20} dish images`, inc: true },
      { label: `${limits?.maxOrders ?? DEFAULT_TRIAL_LIMITS.maxOrders} orders`, inc: true },
      { label: "QR code generation", inc: true },
      { label: "WhatsApp orders", inc: true },
      { label: "Analytics dashboard", inc: true },
    )
    return {
      key, name, price: "0", period: "7 days",
      badge: "7 days", popular: false, features,
    }
  }

  if (key === "starter") {
    features.push(
      { label: `${limits?.maxDishes ?? 30} dishes`, inc: true },
      { label: `${limits?.maxImages ?? 10} dish images`, inc: true },
      { label: "Unlimited orders", inc: true },
      { label: "QR code generation", inc: true },
      { label: "WhatsApp orders", inc: true },
      { label: "Analytics dashboard", inc: true },
    )
    return {
      key, name, price: price.toLocaleString(), period: "month",
      badge: null, popular: false, features,
    }
  }

  if (key === "growth") {
    features.push(
      { label: `${limits?.maxDishes ?? 50} dishes`, inc: true },
      { label: `${limits?.maxImages ?? 20} dish images`, inc: true },
      { label: "Unlimited orders", inc: true },
      { label: "Priority support", inc: true },
      { label: "Everything in Starter", inc: true },
    )
    return {
      key, name, price: price.toLocaleString(), period: "month",
      badge: "Most Popular", popular: true, features,
    }
  }

  features.push(
    { label: `${limits?.maxDishes ?? 100} dishes`, inc: true },
    { label: `${limits?.maxImages ?? 100} dish images`, inc: true },
    { label: "Unlimited orders", inc: true },
    { label: "Priority support", inc: true },
    { label: "Everything in Growth", inc: true },
  )
  return {
    key, name, price: price.toLocaleString(), period: "month",
    badge: null, popular: false, features,
  }
}

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

const faqs = [
  { q: "Is the Free Trial really free?", a: "Yes! No credit card required. You get 7 days with full access to test QRMenu for your restaurant." },
  { q: "What happens after my Free Trial ends?", a: "Your data is safe. Pick any plan to keep your menu live. If you don't, you have a 3-day grace period before the menu goes offline." },
  { q: "Can I change plans later?", a: "Yes, upgrade or downgrade anytime. Just contact us on WhatsApp and we'll switch you in minutes." },
  { q: "How do I pay?", a: "JazzCash, Easypaisa, or bank transfer. After payment, message us on WhatsApp and we'll activate your plan within minutes." },
  { q: "Is there a commission on orders?", a: "Never. We charge a flat monthly fee. You keep 100% of your revenue." },
]

export function PricingClient() {
  const { settings, loading } = useCompanySettings()
  const [dbPlans, setDbPlans] = useState<DBPlan[]>([])

  useEffect(() => {
    fetch("/api/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.plans) {
          setDbPlans(data.plans.map((p: any) => ({
            slug: p.slug,
            name: p.name,
            price: p.price_pkr,
            limits: {
              maxDishes: p.max_dishes,
              maxImages: p.max_images,
              maxOrders: p.max_orders,
              maxCategories: p.max_categories,
              analytics: p.analytics,
              customBranding: p.custom_branding,
              canHaveQR: p.can_have_qr,
              canHaveWhatsapp: p.can_have_whatsapp,
            },
            description: p.description,
          })))
        }
      })
      .catch(() => {})
  }, [])

  const plans: PlanCard[] = planKeys.map((key) => {
    const dbPlan = dbPlans.find((p) => p.slug === key)
    return buildPlanData(key, dbPlan)
  })

  const whatsapp = settings.whatsapp_support || "03001234567"
  const whatsappDigits = whatsapp.replace(/[^0-9]/g, "")
  const whatsappLink = `https://wa.me/${whatsappDigits.startsWith("0") ? "92" + whatsappDigits.slice(1) : whatsappDigits}`

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#F0F0F0]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-base">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center text-xs">Q</div>
            QRMenu.pk
          </Link>
          <div className="flex items-center gap-1 max-md:hidden">
            <Link href="/pricing" className="text-sm text-[#555] font-medium px-3 py-1.5 hover:text-black transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-[#555] font-medium px-3 py-1.5 hover:text-black transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="text-sm font-medium px-4 py-1.5 rounded-full bg-black text-white hover:bg-[#1A1A1A] transition-colors">
              Get Started
            </Link>
          </div>
          <div className="flex md:hidden items-center gap-1.5">
            <Link href="/signup" className="text-sm font-medium px-3 py-1.5 rounded-full bg-black text-white">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-12 md:pt-20 pb-8 md:pb-12 text-center">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 md:mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-sm md:text-base text-[#888] max-w-md mx-auto">
          No hidden fees. No commission on orders. Cancel anytime.
        </p>
      </section>

      {/* Plan Cards */}
      <section className="max-w-6xl mx-auto px-5 pb-16 md:pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-6">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-xl md:rounded-2xl border p-2.5 md:p-6 flex flex-col transition-all hover:shadow-lg ${
                plan.popular
                  ? "bg-black text-white border-black shadow-xl scale-[1.02] md:scale-105 z-10"
                  : "bg-white border-[#F0F0F0]"
              }`}
            >
              {plan.badge && (
                <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] md:text-[11px] font-bold px-2 md:px-4 py-0.5 md:py-1 rounded-full whitespace-nowrap uppercase tracking-wider ${
                  plan.popular ? "bg-[#25D366] text-black" : "bg-black text-white"
                }`}>
                  {plan.popular ? "MOST POPULAR" : plan.badge}
                </span>
              )}
              <div className="mb-2 md:mb-6">
                <h3 className="text-[11px] md:text-lg font-bold">{plan.name}</h3>
                <div className="mt-0.5 md:mt-2 flex items-baseline gap-0.5 md:gap-1">
                  <span className="text-sm md:text-3xl font-bold">PKR {plan.price}</span>
                  <span className={`text-[9px] md:text-sm ${plan.popular ? "text-white/60" : "text-[#888]"}`}>/{plan.period}</span>
                </div>
              </div>

              <div className="flex-1 space-y-1 md:space-y-3 mb-2 md:mb-6">
                {plan.features.map((f) => (
                  <div key={f.label} className="flex items-start gap-1 md:gap-2.5 text-[9px] md:text-sm">
                    {f.inc ? (
                      <Check className={`w-2.5 h-2.5 md:w-4 md:h-4 ${plan.popular ? "text-[#25D366]" : "text-[#16A34A]"} flex-shrink-0 mt-0.5`} />
                    ) : (
                      <X className={`w-2.5 h-2.5 md:w-4 md:h-4 ${plan.popular ? "text-white/30" : "text-[#CCC]"} flex-shrink-0 mt-0.5`} />
                    )}
                    <span className={f.inc ? (plan.popular ? "text-white/90" : "") : (plan.popular ? "text-white/40" : "text-[#BBB]")}>{f.label}</span>
                  </div>
                ))}
              </div>

              <Link
                href={plan.key === "trial" ? "/signup" : "/signup/restaurant"}
                className={`block w-full py-1 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-sm font-semibold text-center transition-all ${
                  plan.popular
                    ? "bg-white text-black hover:bg-[#F0F0F0]"
                    : "border border-[#F0F0F0] text-[#555] hover:border-black hover:text-black"
                }`}
              >
                {plan.key === "trial" ? "Start Free Trial" : "Choose Plan"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 md:py-24 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Compare Plans</h2>
            <p className="text-sm text-[#888]">All plans include WhatsApp order integration</p>
          </div>

          {/* Mobile */}
          <div className="md:hidden overflow-x-auto -mx-5 px-5">
            <div className="min-w-[280px] bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F0F0F0]">
                    <th className="text-left px-4 py-3.5 font-semibold text-[#555] text-xs">Feature</th>
                    <th className="text-center px-3 py-3.5 font-semibold text-xs">Free Trial</th>
                    <th className="text-center px-3 py-3.5 font-semibold text-xs bg-[#FAFAFA] text-black">Starter</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.slice(0, 5).map((f, i) => {
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

      {/* FAQs */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-5">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-white border border-[#E8E8E8] rounded-xl p-4 md:p-5 open:bg-[#FAFAFA] transition-colors"
              >
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-sm md:text-base list-none">
                  <span>{faq.q}</span>
                  <span className="text-[#999] group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-[#555] leading-relaxed">{faq.a}</p>
              </details>
            ))}
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
            Join hundreds of restaurants in Pakistan using QRMenu.pk to streamline their ordering process.
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
                <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center text-xs">Q</div>
                QRMenu.pk
              </div>
              <p className="text-xs text-[#999]">Made in Pakistan</p>
            </div>
            <div className="flex gap-6 text-xs text-[#555]">
              <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
              <Link href="/restaurants" className="hover:text-black transition-colors">Restaurants</Link>
            </div>
          </div>
          <div className="text-center mt-6 text-[10px] text-[#BBB]">
            &copy; 2026 QRMenu.pk. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
