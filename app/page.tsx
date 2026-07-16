import { createClient, createAdminClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ContactSection } from "@/components/shared/ContactSection"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { PricingSection } from "@/components/pricing/PricingSection"
import { AppFooter } from "@/components/shared/AppFooter"
import { mapPlan, type DBPlan } from "@/lib/map-plans"

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

  // Server-side fetch -- zero client loading for pricing section
  const admin = createAdminClient()
  const { data: dbPlans } = await admin
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  const initialPlans = (dbPlans as DBPlan[] | null)?.map(mapPlan) || []

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAFA] to-white pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-black/[0.03] to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-5 pt-24 pb-12 md:pt-36 md:pb-20">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6">
                Pakistan&apos;s #1 QR Code Menu &amp; WhatsApp Ordering System for Restaurants
              </h1>
              <p className="text-base md:text-lg text-[#888] max-w-xl mx-auto md:mx-0 leading-relaxed mb-10">
                Ab menu print karne ka kharcha khatam! Apne customers ko dein behtareen digital menu card aur orders receive karein seedha apne WhatsApp par. Aaj hi free trial shuru karein.
              </p>
              <div className="flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-3">
                <Link
                  href="/signup/restaurant"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-[#1A1A1A] transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/restaurants"
                  data-testid="browse-restaurants-btn"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-[#E8E8E8] text-sm font-semibold text-[#555] hover:border-[#CCC] hover:text-black transition-all text-center"
                >
                  Browse Restaurants
                </Link>
              </div>
            </div>
            {/* Hero visual -- phone scanning QR code on a restaurant table */}
            <div className="hidden md:flex justify-center items-center">
              <div className="relative w-72 h-[500px]">
                {/* Phone body */}
                <div className="absolute inset-0 bg-black rounded-[40px] shadow-2xl overflow-hidden border-4 border-[#222]">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10" />
                  {/* Screen */}
                  <div className="absolute inset-x-1.5 top-2 bottom-2 bg-white rounded-[32px] overflow-hidden">
                    {/* Status bar */}
                    <div className="bg-[#FAFAFA] pt-8 pb-3 px-4 text-[10px] font-semibold text-[#555] flex justify-between border-b border-[#F0F0F0]">
                      <span>9:41</span>
                      <span>&#x1F4F6; &#x1F50B;</span>
                    </div>
                    {/* Menu items */}
                    <div className="p-3 space-y-2.5">
                      <div className="text-center text-[10px] font-bold text-black border-b border-[#F0F0F0] pb-2">Chicken Corner</div>
                      {["Chicken Biryani", "Zinger Burger", "Chicken Karahi", "Cold Drink"].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-[#F5F5F5] flex items-center justify-center text-[8px] text-[#CCC]">&#x1F357;</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-medium text-black truncate">{item}</div>
                            <div className="text-[9px] text-[#999]">PKR {["250", "350", "450", "80"][i]}</div>
                          </div>
                          <div className="w-5 h-5 rounded bg-[#25D366] flex items-center justify-center text-white text-[9px] font-bold">+</div>
                        </div>
                      ))}
                      {/* Order button */}
                      <div className="mt-2 bg-[#25D366] rounded-lg py-2 text-center text-white text-[11px] font-bold tracking-wide">
                        Order via WhatsApp
                      </div>
                    </div>
                  </div>
                </div>
                {/* QR code floating beside phone */}
                <div className="absolute -right-8 top-32 w-20 h-20 bg-white rounded-xl shadow-lg border border-[#E8E8E8] p-1.5 flex items-center justify-center rotate-6">
                  <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label="QR code">
                    <rect x="10" y="10" width="30" height="30" fill="black" rx="3" />
                    <rect x="60" y="10" width="30" height="30" fill="black" rx="3" />
                    <rect x="10" y="60" width="30" height="30" fill="black" rx="3" />
                    <rect x="60" y="60" width="15" height="15" fill="black" rx="2" />
                    <rect x="80" y="60" width="10" height="15" fill="black" rx="2" />
                    <rect x="60" y="80" width="15" height="10" fill="black" rx="2" />
                    <rect x="80" y="80" width="10" height="10" fill="black" rx="2" />
                    <rect x="45" y="10" width="10" height="10" fill="black" rx="2" />
                    <rect x="45" y="45" width="10" height="10" fill="black" rx="2" />
                    <rect x="10" y="45" width="15" height="10" fill="black" rx="2" />
                    <rect x="30" y="60" width="10" height="10" fill="black" rx="2" />
                    <rect x="10" y="30" width="10" height="10" fill="black" rx="2" />
                  </svg>
                </div>
                {/* Scan line */}
                <div className="absolute -left-4 top-44 w-8 h-8 bg-white rounded-full shadow-md border border-[#E8E8E8] flex items-center justify-center text-[14px]">&#x1F4F7;</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SEO Content Section ─── */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            What Is a QR Code Menu and How Does It Work for Restaurants?
          </h2>
          <div className="text-sm md:text-base text-[#555] leading-relaxed space-y-4">
            <p>
              Digital QR Menue is Pakistan&apos;s first QR-based digital menu platform built
              specifically for local restaurants. We help you go digital in under 5
              minutes &mdash; no technical skills required. Simply create your menu, print
              the QR code, and place it on your tables.
            </p>
            <p>
              Your customers scan the QR code with their phone camera, browse your
              full menu with photos and prices, and place orders directly through
              WhatsApp. There&apos;s no app to download, no commission on orders, and
              no monthly hardware costs.
            </p>
            <p>
              Whether you run a <Link href="/restaurants?city=lahore" className="text-black underline underline-offset-2 hover:no-underline font-medium">small caf&eacute; in Lahore</Link>, a <Link href="/restaurants?city=karachi" className="text-black underline underline-offset-2 hover:no-underline font-medium">fine dining restaurant in Karachi</Link>, or a <Link href="/restaurants?city=islamabad" className="text-black underline underline-offset-2 hover:no-underline font-medium">fast-food chain in Islamabad</Link> &mdash; Digital QR Menue works for every
              type of restaurant in Pakistan. Our platform supports English and Urdu
              menus, multiple payment methods including JazzCash and Easypaisa, and
              real-time order notifications.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Why Choose Us -- 4 Pillars ─── */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-24 bg-[#FAFAFA] rounded-3xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Why Pakistani Restaurants Choose Digital QR Menue
          </h2>
          <p className="text-sm text-[#555] max-w-lg mx-auto">
            Save money, reduce errors, and grow your restaurant &mdash; without food delivery app commissions.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
          <div className="bg-white p-6 md:p-7 rounded-2xl border border-[#F0F0F0] hover:border-[#D0D0D0] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center text-lg font-bold mb-4">1</div>
            <h3 className="font-semibold text-base mb-2">Save 30% on Delivery Commissions</h3>
            <p className="text-sm text-[#555] leading-relaxed">
              <strong>Foodpanda charges 25-35% per order.</strong> With Digital QR Menue, every order goes directly through your customer&apos;s WhatsApp &mdash; no middleman, no commission. A restaurant doing PKR 200,000/month in orders saves over PKR 50,000 every month. Keep your margins where they belong: <strong>with you.</strong>
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[#555]">
              <li className="flex items-start gap-2">&bull; Zero commission on every order</li>
              <li className="flex items-start gap-2">&bull; No listing fees or hidden charges</li>
              <li className="flex items-start gap-2">&bull; Customers order direct &mdash; full bill amount is yours</li>
            </ul>
          </div>
          <div className="bg-white p-6 md:p-7 rounded-2xl border border-[#F0F0F0] hover:border-[#D0D0D0] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center text-lg font-bold mb-4">2</div>
            <h3 className="font-semibold text-base mb-2">Say Goodbye to Menu Re-printing Costs</h3>
            <p className="text-sm text-[#555] leading-relaxed">
              <strong>Paper menus cost PKR 2,000&ndash;8,000+ per batch</strong> &mdash; and they&apos;re outdated the moment chicken, oil, or vegetable prices change. Stop burning cash on reprints. Update your prices, add new dishes, or swap seasonal items <strong>in real-time</strong> from your dashboard. Zero printing cost. Zero waste.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[#555]">
              <li className="flex items-start gap-2">&bull; Instant price updates &mdash; no reprinting needed</li>
              <li className="flex items-start gap-2">&bull; Save PKR 6,000&ndash;24,000 per year on menu reprints</li>
              <li className="flex items-start gap-2">&bull; Eco-friendly &mdash; eliminate paper and plastic waste</li>
            </ul>
          </div>
          <div className="bg-white p-6 md:p-7 rounded-2xl border border-[#F0F0F0] hover:border-[#D0D0D0] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center text-lg font-bold mb-4">3</div>
            <h3 className="font-semibold text-base mb-2">100% Error-Free Orders</h3>
            <p className="text-sm text-[#555] leading-relaxed">
              Phone call orders are a nightmare &mdash; wrong items, misheard quantities, confused customers. <strong>&ldquo;Main ne kaha hi nahi tha&rdquo;</strong> disputes disappear when customers build their own cart. They see the menu, pick their items, and send a perfectly formatted WhatsApp order. Your kitchen gets <strong>the exact order, every time.</strong>
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[#555]">
              <li className="flex items-start gap-2">&bull; Customers type their own order &mdash; zero miscommunication</li>
              <li className="flex items-start gap-2">&bull; Item name, quantity, price, and special instructions in writing</li>
              <li className="flex items-start gap-2">&bull; No more &ldquo;I ordered something else&rdquo; disputes</li>
            </ul>
          </div>
          <div className="bg-white p-6 md:p-7 rounded-2xl border border-[#F0F0F0] hover:border-[#D0D0D0] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center text-lg font-bold mb-4">4</div>
            <h3 className="font-semibold text-base mb-2">No App Downloads for Customers</h3>
            <p className="text-sm text-[#555] leading-relaxed">
              No app store. No sign-up. No OTP. No friction. Your customer <strong>scans the QR code</strong> on their table &mdash; that&apos;s it. The menu opens instantly in their phone browser. Works on <strong>every phone</strong> &mdash; Android, iPhone, even basic smartphones. Your customers love it because it takes 3 seconds, not 3 minutes.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[#555]">
              <li className="flex items-start gap-2">&bull; Scan with the phone camera &mdash; no app installation</li>
              <li className="flex items-start gap-2">&bull; Works on every smartphone in Pakistan</li>
              <li className="flex items-start gap-2">&bull; Higher engagement, faster orders, happier guests</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── How It Works -- Horizontal Timeline ─── */}
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
        initialPlans={initialPlans}
      />

      {/* ─── Blog ─── */}
      <section className="py-16 md:py-24 bg-[#FAFAFA]">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Restaurant Tips &amp; Guides</h2>
          <p className="text-sm text-[#555] mb-8 max-w-md mx-auto">
            Learn how to grow your restaurant with QR menus, WhatsApp ordering, and smart marketing strategies.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-[#1A1A1A] transition-all"
          >
            Read Our Blog
          </Link>
        </div>
      </section>

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
              href="/signup/restaurant"
              className="inline-block px-10 py-3.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-[#25D366] hover:text-black transition-all"
            >
              Start Free Trial &mdash; No Credit Card
            </Link>
          </div>
        </div>
      </section>

      <AppFooter />
    </div>
  )
}
