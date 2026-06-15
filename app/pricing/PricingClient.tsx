"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Check, X, Sparkles, Star, Shield, Zap, Heart } from "lucide-react"
import { useCompanySettings } from "@/lib/hooks/useCompanySettings"
import { useEffect, useState } from "react"
import { PLAN_LIMITS, PLAN_PRICES, PLAN_NAMES, DEFAULT_TRIAL_LIMITS, type Plan, getPlanFeatures } from "@/lib/subscription"

const planKeys: Plan[] = ["trial", "starter", "growth", "premium"]

function buildPlanData(key: Plan): {
  key: Plan; name: string; price: number; badge?: string; badgeColor?: string; features: { label: string; inc: boolean }[]; cta: string; highlight?: boolean
} {
  const features = getPlanFeatures(key).map((f) => ({ label: f, inc: true }))

  if (key === "trial") {
    return {
      key, name: PLAN_NAMES[key], price: 0,
      badge: `${DEFAULT_TRIAL_LIMITS.trialDurationDays} days`,
      badgeColor: "bg-[#FEF3C7] text-[#D97706]",
      features: [
        ...features,
        { label: "Analytics dashboard", inc: true },
      ],
      cta: "Start Free Trial",
    }
  }
  if (key === "starter") {
    return {
      key, name: PLAN_NAMES[key], price: PLAN_PRICES[key],
      features: [
        ...features,
        { label: "Analytics dashboard", inc: true },
      ],
      cta: `Choose ${PLAN_NAMES[key]}`,
    }
  }
  if (key === "growth") {
    return {
      key, name: PLAN_NAMES[key], price: PLAN_PRICES[key],
      badge: "⭐ Most Popular",
      badgeColor: "bg-black text-white",
      features: [
        ...features,
        { label: "Priority support", inc: true },
        { label: "Everything in Starter", inc: true },
      ],
      cta: `Choose ${PLAN_NAMES[key]}`,
      highlight: true,
    }
  }
  return {
    key, name: PLAN_NAMES[key], price: PLAN_PRICES[key],
    features: [
      ...features,
      { label: "Priority support", inc: true },
      { label: "Everything in Growth", inc: true },
    ],
    cta: `Choose ${PLAN_NAMES[key]}`,
  }
}

const plans: ReturnType<typeof buildPlanData>[] = planKeys.map(buildPlanData)

const faqs = [
  {
    q: "Is the Free Trial really free?",
    a: "Yes! No credit card required. You get 7 days with full access to test QRMenu for your restaurant.",
  },
  {
    q: "What happens after my Free Trial ends?",
    a: "Your data is safe. Pick any plan to keep your menu live. If you don't, you have a 3-day grace period before the menu goes offline.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes, upgrade or downgrade anytime. Just contact us on WhatsApp and we'll switch you in minutes.",
  },
  {
    q: "How do I pay?",
    a: "JazzCash, Easypaisa, or bank transfer. After payment, message us on WhatsApp and we'll activate your plan within minutes.",
  },
  {
    q: "Is there a commission on orders?",
    a: "Never. We charge a flat monthly fee. You keep 100% of your revenue.",
  },
]

export { faqs }

export function PricingClient() {
  const { settings, loading } = useCompanySettings()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 200)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const jazzcash = settings.jazzcash_number || "03001234567"
  const easypaisa = settings.easypaisa_number || "03001234567"
  const bankName = settings.bank_name || "Meezan Bank"
  const accountTitle = settings.account_title || "QRMenu Pakistan"
  const accountNumber = settings.account_number || "01234567890123"
  const whatsapp = settings.whatsapp_support || "03001234567"
  const companyEmail = settings.company_email || "support@qrmenu.pk"

  const whatsappDigits = whatsapp.replace(/[^0-9]/g, "")
  const whatsappLink = `https://wa.me/${whatsappDigits.startsWith("0") ? "92" + whatsappDigits.slice(1) : whatsappDigits}`

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-4 md:px-6 h-14 md:h-16 border-b border-[#F0F0F0] bg-white sticky top-0 z-40">
        <Link href="/" className="font-bold text-base md:text-lg tracking-tight">
          QRMenu.pk
        </Link>
        <Link href="/signup/restaurant">
          <Button size="sm" variant="primary">Get Started</Button>
        </Link>
      </header>

      <section className="px-4 md:px-6 py-12 md:py-20 max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF3C7] text-[#D97706] rounded-full text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            7-day free trial — no credit card
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-[#555] text-base md:text-lg max-w-xl mx-auto">
            Start free. Upgrade when you&apos;re ready. No commission on orders — ever.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`rounded-xl md:rounded-2xl border p-2.5 md:p-6 flex flex-col relative transition-all duration-200 ${
                plan.highlight
                  ? "border-black bg-gradient-to-br from-white to-[#FAFAFA] shadow-xl sm:scale-[1.02] lg:scale-105"
                  : "border-[#E8E8E8] bg-white hover:border-[#999] hover:shadow-md"
              }`}
            >
              {plan.badge && (
                <span
                  className={`text-[8px] md:text-xs font-semibold px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full self-start mb-1.5 md:mb-3 ${plan.badgeColor}`}
                >
                  {plan.badge}
                </span>
              )}
              <h3 className="text-[11px] md:text-xl font-bold">{plan.name}</h3>
              <div className="mt-1 md:mt-2 mb-2 md:mb-5">
                <span className="text-sm md:text-4xl font-bold tracking-tight">
                  PKR {plan.price.toLocaleString()}
                </span>
                {plan.price > 0 && (
                  <span className="text-[9px] md:text-sm text-[#555] ml-0.5 md:ml-1">/mo</span>
                )}
              </div>
              <div className="space-y-1 md:space-y-2.5 flex-1 mb-2 md:mb-5">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-1 md:gap-2.5 text-[9px] md:text-sm">
                    {f.inc ? (
                      <Check className="w-2.5 h-2.5 md:w-4 md:h-4 text-[#16A34A] flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-2.5 h-2.5 md:w-4 md:h-4 text-[#CCC] flex-shrink-0 mt-0.5" />
                    )}
                    <span className={f.inc ? "text-[#222]" : "text-[#999]"}>
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/signup/restaurant" className="block">
                <Button
                  variant={plan.highlight ? "accent" : "primary"}
                  fullWidth
                  size={plan.highlight ? "default" : "sm"}
                  className="!text-[9px] md:!text-sm !h-7 md:!h-12 !px-2 md:!px-6 !rounded-lg md:!rounded-xl"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12 md:mb-16 max-w-3xl mx-auto">
          <Benefit icon={<Zap className="w-4 h-4" />} text="Setup in 5 minutes" />
          <Benefit icon={<Shield className="w-4 h-4" />} text="No credit card" />
          <Benefit icon={<Heart className="w-4 h-4" />} text="No commission" />
          <Benefit icon={<Star className="w-4 h-4" />} text="Cancel anytime" />
        </div>

        <div className="bg-[#F8F8F8] rounded-2xl p-5 md:p-8 text-center mb-12 md:mb-16">
          <h2 className="text-xl md:text-2xl font-bold mb-2">How to pay</h2>
          <p className="text-sm text-[#555] mb-5 max-w-md mx-auto">
            Send payment to any account below, then WhatsApp us to activate your plan.
          </p>
          {loading ? (
            <div className="space-y-1 text-sm">
              <div className="h-4 w-48 bg-[#E8E8E8] rounded animate-pulse mx-auto" />
              <div className="h-4 w-48 bg-[#E8E8E8] rounded animate-pulse mx-auto" />
            </div>
          ) : (
            <div className="space-y-1.5 text-sm mb-5">
              <p>
                <strong>JazzCash:</strong> {jazzcash} ({accountTitle})
              </p>
              <p>
                <strong>Easypaisa:</strong> {easypaisa}
              </p>
              <p>
                <strong>Bank:</strong> {bankName} — {accountNumber}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href={`mailto:${companyEmail}`}
                  className="text-[#25D366] hover:underline"
                >
                  {companyEmail}
                </a>
              </p>
            </div>
          )}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener"
            className="inline-block"
          >
            <Button variant="accent" size="lg">
              Contact us on WhatsApp ({whatsapp})
            </Button>
          </a>
        </div>

        <div className="max-w-3xl mx-auto">
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
                  <span className="text-[#999] group-open:rotate-45 transition-transform text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-[#555] leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#F0F0F0] px-4 md:px-6 py-8 text-center text-xs text-[#999]">
        © 2026 QRMenu.pk — Made for restaurants in Pakistan
      </footer>

      <div
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur border-t border-[#E8E8E8] p-3 transition-transform duration-300 ${
          scrolled ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
      >
        <Link href="/signup/restaurant" className="block">
          <Button variant="accent" fullWidth size="lg">
            Start Free Trial →
          </Button>
        </Link>
      </div>
    </div>
  )
}

function Benefit({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-[#555]">
      <span className="text-[#16A34A]">{icon}</span>
      <span className="font-medium">{text}</span>
    </div>
  )
}
