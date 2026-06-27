import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Check, X } from "lucide-react"
import { ContactSection } from "@/components/shared/ContactSection"

const plans = [
  {
    key: "trial",
    name: "Free Trial",
    price: "0",
    period: "7 days",
    badge: "7 days",
    popular: false,
    features: [
      { label: "5 dishes", inc: true },
      { label: "5 dish images", inc: true },
      { label: "10 orders", inc: true },
      { label: "QR code generation", inc: true },
      { label: "WhatsApp orders", inc: true },
      { label: "Analytics dashboard", inc: true },
    ],
  },
  {
    key: "starter",
    name: "Starter",
    price: "1,200",
    period: "month",
    badge: null,
    popular: false,
    features: [
      { label: "30 dishes", inc: true },
      { label: "10 dish images", inc: true },
      { label: "Unlimited orders", inc: true },
      { label: "QR code generation", inc: true },
      { label: "WhatsApp orders", inc: true },
      { label: "Analytics dashboard", inc: true },
    ],
  },
  {
    key: "growth",
    name: "Growth",
    price: "2,500",
    period: "month",
    badge: "Most Popular",
    popular: true,
    features: [
      { label: "50 dishes", inc: true },
      { label: "20 dish images", inc: true },
      { label: "Unlimited orders", inc: true },
      { label: "Priority support", inc: true },
      { label: "Everything in Starter", inc: true },
    ],
  },
  {
    key: "premium",
    name: "Premium",
    price: "4,500",
    period: "month",
    badge: null,
    popular: false,
    features: [
      { label: "100 dishes", inc: true },
      { label: "100 dish images", inc: true },
      { label: "Unlimited orders", inc: true },
      { label: "Priority support", inc: true },
      { label: "Everything in Growth", inc: true },
    ],
  },
]

const comparisonFeatures = [
  { label: "Unlimited dishes", trial: "5", starter: "30", growth: "50", premium: "100" },
  { label: "QR code generation", trial: true, starter: true, growth: true, premium: true },
  { label: "WhatsApp order notifications", trial: true, starter: true, growth: true, premium: true },
  { label: "Analytics dashboard", trial: true, starter: true, growth: true, premium: true },
  { label: "Dish images", trial: "5", starter: "10", growth: "20", premium: "100" },
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

  const { data: settingsData } = await supabase
    .from("company_settings")
    .select("key, value")

  const settings: Record<string, string> = {}
  ;(settingsData || []).forEach((s: any) => { settings[s.key] = s.value })

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#F0F0F0]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-base">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center text-xs">Q</div>
            QRMenu.pk
          </Link>
          <div className="flex items-center gap-1 max-md:hidden">
            <Link href="#pricing" className="text-sm text-[#555] font-medium px-3 py-1.5 hover:text-black transition-colors">
              Pricing
            </Link>
            <Link href="#contact" className="text-sm text-[#555] font-medium px-3 py-1.5 hover:text-black transition-colors">
              Contact
            </Link>
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
          <div className="flex md:hidden items-center gap-1.5">
            <Link
              href="/signup"
              className="text-sm font-medium px-3 py-1.5 rounded-full bg-black text-white"
            >
              Get Started
            </Link>
            <Link href="/login" className="text-sm text-[#555] font-medium px-3 py-1.5">
              Sign In
            </Link>
          </div>
        </div>
      </header>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAFA] to-white pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-black/[0.03] to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-5 py-24 md:py-36 text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6">
            Digital Menu for
            <br />
            <span>Every Restaurant</span>
          </h1>
          <p className="text-base md:text-lg text-[#888] max-w-xl mx-auto leading-relaxed mb-10">
            No app. No commission. Just a QR code — customers scan, browse your menu, and order directly on WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-[#1A1A1A] transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
            >
              Start Free Trial
            </Link>
            <Link
              href="/restaurants"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-[#E8E8E8] text-sm font-semibold text-[#555] hover:border-[#CCC] hover:text-black transition-all text-center"
            >
              Browse Restaurants
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SEO Content Section ─── */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Why Pakistan&apos;s Restaurants Choose QRMenu.pk
          </h2>
          <div className="text-sm md:text-base text-[#555] leading-relaxed space-y-4">
            <p>
              QRMenu.pk is Pakistan&apos;s first QR-based digital menu platform built
              specifically for local restaurants. We help you go digital in under 5
              minutes — no technical skills required. Simply create your menu, print
              the QR code, and place it on your tables.
            </p>
            <p>
              Your customers scan the QR code with their phone camera, browse your
              full menu with photos and prices, and place orders directly through
              WhatsApp. There&apos;s no app to download, no commission on orders, and
              no monthly hardware costs.
            </p>
            <p>
              Whether you run a small café in Lahore, a fine dining restaurant in
              Karachi, or a fast-food chain in Islamabad — QRMenu.pk works for every
              type of restaurant in Pakistan. Our platform supports English and Urdu
              menus, multiple payment methods including JazzCash and Easypaisa, and
              real-time order notifications.
            </p>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">How It Works</h2>
          <p className="text-sm md:text-base text-[#555] max-w-md mx-auto">
            Get your restaurant online in under 5 minutes
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {[
            { step: "01", title: "Create Menu", desc: "Add your dishes, prices, and photos through our simple dashboard." },
            { step: "02", title: "Print QR Code", desc: "We generate a unique QR code for your restaurant. Print and place on tables." },
            { step: "03", title: "Get Orders", desc: "Customers scan, browse, and order via WhatsApp. No app download needed." },
          ].map((s) => (
            <div key={s.step} className="text-center group">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-black text-white text-lg md:text-xl font-bold flex items-center justify-center mx-auto mb-5 md:mb-6 group-hover:scale-105 transition-transform">
                {s.step}
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3">{s.title}</h3>
              <p className="text-sm md:text-base text-[#555] leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="bg-[#F9FAFB] py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Simple, Transparent Pricing</h2>
            <p className="text-sm text-[#888] max-w-md mx-auto">
              No hidden fees. No commission on orders. Cancel anytime.
            </p>
          </div>

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
                  href="/pricing"
                  className={`block w-full py-1 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-sm font-semibold text-center transition-all ${
                    plan.popular
                      ? "bg-white text-black hover:bg-[#F0F0F0]"
                      : "border border-[#F0F0F0] text-[#555] hover:border-black hover:text-black"
                  }`}
                >
                  {plan.key === "trial" ? "Start Free Trial" : "View Plan"}
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

          {/* Mobile: simplified 2-plan view */}
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
            <div className="text-center mt-3">
              <p className="text-[10px] text-[#999]">
                <Link href="/pricing" className="text-black underline underline-offset-2 font-medium">View full comparison →</Link>
              </p>
            </div>
          </div>

          {/* md+: full comparison */}
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
               <a href={`mailto:${settings.company_email || "support@qrmenu.pk"}`} className="text-black underline underline-offset-2 hover:no-underline">
                Contact us
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ─── FAQs ─── */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Frequently Asked Questions</h2>
            <p className="text-sm text-[#888]">Everything you need to know about QRMenu.pk</p>
          </div>
          <div className="space-y-3">
            {[
              { q: "Is the Free Trial really free?", a: "Yes! No credit card required. You get 7 days with full access to test QRMenu for your restaurant." },
              { q: "What happens after my Free Trial ends?", a: "Your data is safe. Pick any plan to keep your menu live. If you don't, you have a 3-day grace period before the menu goes offline." },
              { q: "Can I change plans later?", a: "Yes, upgrade or downgrade anytime. Just contact us on WhatsApp and we'll switch you in minutes." },
              { q: "How do I pay?", a: "JazzCash, Easypaisa, or bank transfer. After payment, message us on WhatsApp and we'll activate your plan within minutes." },
              { q: "Is there a commission on orders?", a: "Never. We charge a flat monthly fee. You keep 100% of your revenue." },
            ].map((faq, i) => (
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
          <div className="text-center mt-6">
            <p className="text-xs text-[#999]">
              Still have questions?{" "}
              <Link href="/pricing" className="text-black underline underline-offset-2 hover:no-underline font-medium">
                View full pricing page →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ─── Contact ─── */}
      <ContactSection settings={settings} />

      {/* ─── CTA ─── */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-24">
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

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#F0F0F0]">
        <div className="max-w-6xl mx-auto px-5 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-2 font-bold text-base">
                <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center text-xs">Q</div>
                QRMenu.pk
              </div>
              <p className="text-xs text-[#999]">Made in Pakistan with 💚</p>
            </div>
            <div className="flex gap-6 text-xs text-[#555]">
              <Link href="#pricing" className="hover:text-black transition-colors">Pricing</Link>
              <Link href="/restaurants" className="hover:text-black transition-colors">Restaurants</Link>
              <Link href="#contact" className="hover:text-black transition-colors">Contact</Link>
            </div>
            <div className="flex gap-4 text-xs text-[#555]">
              <Link href="/privacy" className="hover:text-black underline transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-black underline transition-colors">Terms of Service</Link>
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
