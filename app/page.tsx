import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Check, X } from "lucide-react"

export const dynamic = "force-dynamic"

const plans = [
  {
    key: "trial",
    name: "Free Trial",
    price: "0",
    period: "7 days",
    badge: null,
    popular: false,
    features: [
      { label: "Unlimited dishes", inc: true },
      { label: "QR code generation", inc: true },
      { label: "WhatsApp orders", inc: true },
      { label: "Analytics dashboard", inc: true },
      { label: "Up to 4 dish images", inc: true },
      { label: "Custom branding", inc: false },
    ],
  },
  {
    key: "starter",
    name: "Starter",
    price: "800",
    period: "month",
    badge: null,
    popular: false,
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
    key: "growth",
    name: "Growth",
    price: "1,800",
    period: "month",
    badge: "Most Popular",
    popular: true,
    features: [
      { label: "Everything in Starter", inc: true },
      { label: "Up to 50 dish images", inc: true },
      { label: "Custom branding", inc: true },
      { label: "Priority support", inc: true },
    ],
  },
  {
    key: "premium",
    name: "Premium",
    price: "2,500",
    period: "month",
    badge: null,
    popular: false,
    features: [
      { label: "Everything in Growth", inc: true },
      { label: "Unlimited images", inc: true },
      { label: "Priority support", inc: true },
    ],
  },
]

const comparisonFeatures = [
  { label: "Unlimited dishes", trial: true, starter: true, growth: true, premium: true },
  { label: "QR code generation", trial: true, starter: true, growth: true, premium: true },
  { label: "WhatsApp order notifications", trial: true, starter: true, growth: true, premium: true },
  { label: "Analytics dashboard", trial: true, starter: true, growth: true, premium: true },
  { label: "Dish images", trial: "4", starter: false, growth: "50", premium: "Unlimited" },
  { label: "Custom restaurant branding", trial: false, starter: false, growth: true, premium: true },
  { label: "Priority support", trial: false, starter: false, growth: true, premium: true },
  { label: "Menu in Urdu (coming soon)", trial: true, starter: true, growth: true, premium: true },
]

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()
    if (restaurant) redirect("/dashboard")
    redirect("/restaurants")
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#F0F0F0]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-base">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center text-xs">Q</div>
            QRMenu.pk
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-[#555] font-medium px-3 py-1.5 hover:text-black transition-colors">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium px-4 py-1.5 rounded-full bg-black text-white hover:bg-[#1A1A1A] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAFA] to-white pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-5 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F0F0] text-xs font-medium text-[#555] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            Live in Pakistan
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-4">
            Digital Menu for{" "}
            <span className="bg-gradient-to-r from-black to-[#555] bg-clip-text text-transparent">
              Every Restaurant
            </span>
          </h1>
          <p className="text-base md:text-lg text-[#888] max-w-lg mx-auto leading-relaxed mb-8">
            No app. No commission. Just a QR code — customers scan, browse your menu, and order directly on WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-[#1A1A1A] transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
            >
              Start Free Trial
            </Link>
            <Link
              href="/restaurants"
              className="w-full sm:w-auto px-8 py-3 rounded-xl border border-[#E8E8E8] text-sm font-semibold text-[#555] hover:border-[#CCC] hover:text-black transition-all text-center"
            >
              Browse Restaurants
            </Link>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">How It Works</h2>
          <p className="text-sm text-[#888] max-w-md mx-auto">
            Get your restaurant online in under 5 minutes
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            { step: "01", title: "Create Menu", desc: "Add your dishes, prices, and photos through our simple dashboard." },
            { step: "02", title: "Print QR Code", desc: "We generate a unique QR code for your restaurant. Print and place on tables." },
            { step: "03", title: "Get Orders", desc: "Customers scan, browse, and order via WhatsApp. No app download needed." },
          ].map((s) => (
            <div key={s.step} className="text-center p-6 rounded-2xl border border-[#F0F0F0] hover:border-black/20 transition-colors">
              <div className="w-10 h-10 rounded-full bg-black text-white text-sm font-bold flex items-center justify-center mx-auto mb-4">
                {s.step}
              </div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-[#888] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="bg-[#FAFAFA] py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Simple, Transparent Pricing</h2>
            <p className="text-sm text-[#888] max-w-md mx-auto">
              No hidden fees. No commission on orders. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {plans.map((plan) => (
              <div
                key={plan.key}
                className={`relative rounded-2xl border p-6 flex flex-col bg-white transition-all hover:shadow-lg ${
                  plan.popular ? "border-black shadow-md ring-1 ring-black/5" : "border-[#E8E8E8]"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[11px] font-semibold bg-black text-white px-3 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">PKR {plan.price}</span>
                    <span className="text-sm text-[#888]">/{plan.period}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <div key={f.label} className="flex items-start gap-2.5 text-sm">
                      {f.inc ? (
                        <Check className="w-4 h-4 text-[#16A34A] flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-[#CCC] flex-shrink-0 mt-0.5" />
                      )}
                      <span className={f.inc ? "" : "text-[#BBB]"}>{f.label}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={plan.key === "trial" ? "/signup" : "/signup/restaurant"}
                  className={`block w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-all ${
                    plan.popular
                      ? "bg-black text-white hover:bg-[#1A1A1A]"
                      : "border border-[#E8E8E8] text-[#555] hover:border-black hover:text-black"
                  }`}
                >
                  {plan.key === "trial" ? "Start Free Trial" : "Choose Plan"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Comparison Table ─── */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Compare Plans</h2>
            <p className="text-sm text-[#888]">All plans include WhatsApp order integration</p>
          </div>

          <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
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
              <a href="mailto:support@qrmenu.pk" className="text-black underline underline-offset-2 hover:no-underline">
                Contact us
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-black py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Ready to go digital?
          </h2>
          <p className="text-sm text-[#999] mb-8 max-w-sm mx-auto">
            Join hundreds of restaurants in Pakistan using QRMenu.pk
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-3.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-[#F0F0F0] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Free Trial — No Credit Card
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#F0F0F0] py-10">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center text-xs">Q</div>
              QRMenu.pk
            </div>
            <div className="flex items-center gap-4 text-xs text-[#999]">
              <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
              <Link href="/restaurants" className="hover:text-black transition-colors">Restaurants</Link>
              <a href="mailto:support@qrmenu.pk" className="hover:text-black transition-colors">Contact</a>
            </div>
            <p className="text-xs text-[#BBB]">Made in Pakistan</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
