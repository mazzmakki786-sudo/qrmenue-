import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ContactSection } from "@/components/shared/ContactSection"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { PricingSection } from "@/components/pricing/PricingSection"

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
      <LandingHeader />
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAFA] to-white pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-black/[0.03] to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-5 py-24 md:py-36 text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6">
            Pakistan&apos;s #1 QR Code Menu Platform for Restaurants
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
            Why Pakistan&apos;s Restaurants Choose Digital QR Menue
          </h2>
          <div className="text-sm md:text-base text-[#555] leading-relaxed space-y-4">
            <p>
              Digital QR Menue is Pakistan&apos;s first QR-based digital menu platform built
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
              Whether you run a <Link href="/restaurants?city=lahore" className="text-black underline underline-offset-2 hover:no-underline font-medium">small café in Lahore</Link>, a <Link href="/restaurants?city=karachi" className="text-black underline underline-offset-2 hover:no-underline font-medium">fine dining restaurant in Karachi</Link>, or a <Link href="/restaurants?city=islamabad" className="text-black underline underline-offset-2 hover:no-underline font-medium">fast-food chain in Islamabad</Link> — Digital QR Menue works for every
              type of restaurant in Pakistan. Our platform supports English and Urdu
              menus, multiple payment methods including JazzCash and Easypaisa, and
              real-time order notifications.
            </p>
          </div>
        </div>
      </section>

      {/* ─── How It Works – Horizontal Timeline ─── */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">How It Works</h2>
          <p className="text-sm md:text-base text-[#555] max-w-md mx-auto">
            Get your restaurant online in under 5 minutes
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative">
          <div className="hidden md:block absolute top-9 left-[15%] right-[15%] h-[2px] bg-[#E8E8E8]">
            <div className="absolute top-1/2 left-1/3 w-2 h-2 rounded-full bg-black -translate-y-1/2" />
            <div className="absolute top-1/2 right-1/3 w-2 h-2 rounded-full bg-black -translate-y-1/2" />
          </div>
          {[
            { step: "01", title: "Create Menu", desc: "Add your dishes, prices, and photos through our simple dashboard." },
            { step: "02", title: "Print QR Code", desc: "We generate a unique QR code for your restaurant. Print and place on tables." },
            { step: "03", title: "Get Orders", desc: "Customers scan, browse, and order via WhatsApp. No app download needed." },
          ].map((s, i) => (
            <div key={s.step} className="relative flex md:flex-col items-start md:items-center gap-5 md:gap-0 md:text-center">
              {i < 2 && (
                <div className="md:hidden absolute left-[23px] top-12 w-[2px] h-[calc(100%+8px)] bg-[#E8E8E8]" />
              )}
              <div className="relative z-10 w-14 h-14 md:w-16 md:h-16 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-lg md:text-xl font-bold">{s.step}</span>
              </div>
              <div className="flex-1 md:mt-5">
                <h3 className="text-base md:text-xl font-bold mt-1 mb-2">{s.title}</h3>
                <p className="text-sm text-[#555] leading-relaxed md:max-w-xs md:mx-auto">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <PricingSection
        heading="Simple, Transparent Pricing"
        description="No hidden fees. No commission on orders. Cancel anytime."
      />

      {/* ─── FAQs ─── */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-sm text-[#888] mb-8">Got questions? We have answers.</p>
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-[#1A1A1A] transition-all"
          >
            View All FAQs
          </Link>
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

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#F0F0F0]">
        <div className="max-w-6xl mx-auto px-5 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-2 font-bold text-base">
                <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center text-xs">Q</div>
                Digital QR Menue
              </div>
              <p className="text-xs text-[#999]">Made in Pakistan with 💚</p>
            </div>
            <div className="flex gap-6 text-xs text-[#555]">
              <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
              <Link href="/restaurants" className="hover:text-black transition-colors">Restaurants</Link>
              <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
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
