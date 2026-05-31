import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Check, X } from "lucide-react"

const plans = [
  {
    name: "Starter", price: "800", badge: null,
    features: [
      { label: "Unlimited dishes", inc: true },
      { label: "QR code generation", inc: true },
      { label: "WhatsApp orders", inc: true },
      { label: "Analytics dashboard", inc: true },
      { label: "Dish images", inc: false },
      { label: "Custom branding", inc: false },
    ],
  },
  {
    name: "Growth", price: "1,800", badge: "⭐ Popular",
    features: [
      { label: "Everything in Starter", inc: true },
      { label: "Up to 50 dish images", inc: true },
      { label: "Custom branding", inc: true },
      { label: "Priority support", inc: true },
    ],
  },
  {
    name: "Premium", price: "2,500", badge: null,
    features: [
      { label: "Everything in Growth", inc: true },
      { label: "Unlimited images", inc: true },
      { label: "Priority support", inc: true },
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 h-16 border-b border-[#F0F0F0]">
        <Link href="/" className="font-bold text-lg">QRMenu.pk</Link>
        <Link href="/signup/restaurant">
          <Button size="sm" variant="primary">Get Started</Button>
        </Link>
      </header>

      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Simple, transparent pricing</h1>
          <p className="text-[#555]">No hidden fees. No commission on orders.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-[14px] border border-[#E8E8E8] p-6 flex flex-col">
              {plan.badge && (
                <span className="text-xs font-semibold text-[#D97706] bg-[#FEF3C7] px-3 py-1 rounded-full self-start mb-3">
                  {plan.badge}
                </span>
              )}
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="text-3xl font-bold mt-2">
                PKR {plan.price}<span className="text-sm font-normal text-[#555]">/month</span>
              </p>
              <div className="mt-6 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <div key={f.label} className="flex items-center gap-3 text-sm">
                    {f.inc ? (
                      <Check className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-[#999] flex-shrink-0" />
                    )}
                    <span className={f.inc ? "" : "text-[#999]"}>{f.label}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup/restaurant" className="mt-6 block">
                <Button variant={plan.name === "Growth" ? "accent" : "primary"} fullWidth>
                  Get Started
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-[#F8F8F8] rounded-[14px] p-6 text-center">
          <h2 className="text-lg font-bold mb-2">How to Pay</h2>
          <p className="text-sm text-[#555] mb-4">Send payment to any of these accounts, then WhatsApp us to activate.</p>
          <div className="space-y-1 text-sm">
            <p><strong>JazzCash:</strong> 0300-1234567 (QRMenu Pakistan)</p>
            <p><strong>Easypaisa:</strong> 0300-1234567</p>
            <p><strong>Bank:</strong> Meezan Bank — 01234567890123</p>
            <p><strong>WhatsApp Support:</strong> 0300-1234567</p>
          </div>
        </div>
      </section>
    </div>
  )
}
