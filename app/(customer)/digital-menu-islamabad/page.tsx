import type { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { JsonLd, BreadcrumbListJsonLd, FaqJsonLd, SpeakableJsonLd } from "@/components/JsonLd"

export const metadata: Metadata = {
  title: "Digital Menu Islamabad — QR Menu for Restaurants",
  description:
    "Create a digital menu for your restaurant in Islamabad. Free QR code menu, WhatsApp ordering, zero commission, and instant price updates. Trusted by restaurants across Islamabad. Start free trial.",
  alternates: {
    canonical: "https://www.digitalmenue.com/digital-menu-islamabad",
  },
  openGraph: {
    title: "Digital Menu Islamabad — QR Menu for Restaurants",
    description:
      "Create a digital menu for your restaurant in Islamabad. Free QR code menu, WhatsApp ordering, zero commission, and instant price updates.",
    url: "https://www.digitalmenue.com/digital-menu-islamabad",
  },
}

export const revalidate = 3600

const faqs = [
  {
    question: "What is a digital menu for restaurants in Islamabad?",
    answer:
      "A digital menu for restaurants in Islamabad is an interactive, web-based menu customers open by scanning a QR code with their phone. It replaces printed menu cards and lets customers browse dishes, view photos, check prices, and order directly through WhatsApp — no app download and no commission on orders.",
  },
  {
    question: "How much does a digital menu cost in Islamabad?",
    answer:
      "Digital QR Menue offers a 30-day free trial with full access. Paid plans start from PKR 1,500 per month for Starter, PKR 2,500 for Growth, and PKR 4,500 for Premium. There are no setup fees and zero commission on orders.",
  },
  {
    question: "Where can Islamabad restaurants print their QR code?",
    answer:
      "You can print your QR code at any local print shop in Islamabad, or print it in-house on regular A4 paper or stickers. Many restaurants use table tents, acrylic stands, or counter signs. Because the QR code never changes, you print it once and it works forever.",
  },
  {
    question: "Do customers in Islamabad need an app to use a QR menu?",
    answer:
      "No. Customers scan the QR code with the camera on any Android or iPhone and the menu opens instantly in their browser. No app store, no signup, no OTP. It works on every smartphone.",
  },
  {
    question: "Can a digital menu work for delivery in Islamabad?",
    answer:
      "Yes. Place your QR code on tables for dine-in and print it on takeaway bags and delivery packaging so customers can reorder. You can also share your menu link on WhatsApp or social media for home delivery. Every order arrives directly on your WhatsApp.",
  },
]

export default function DigitalMenuIslamabadPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Digital Menu Islamabad — QR Menu for Restaurants",
          description:
            "Create a digital menu for your restaurant in Islamabad. Free QR code menu, WhatsApp ordering, zero commission, and instant price updates.",
          author: { "@type": "Organization", name: "Digital QR Menue" },
          datePublished: "2026-08-01",
          dateModified: "2026-08-01",
          publisher: { "@type": "Organization", name: "Digital QR Menue" },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://www.digitalmenue.com/digital-menu-islamabad",
          },
        }}
      />
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://www.digitalmenue.com" },
          { name: "Digital Menu Pakistan", url: "https://www.digitalmenue.com/digital-menu-pakistan" },
          { name: "Digital Menu Islamabad", url: "https://www.digitalmenue.com/digital-menu-islamabad" },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <SpeakableJsonLd
        cssSelector={[".speakable-hero", ".speakable-summary"]}
        url="https://www.digitalmenue.com/digital-menu-islamabad"
      />
      <div className="min-h-screen bg-white">
        <LandingHeader />

        {/* Hero */}
        <section className="bg-black text-white py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-5 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Digital Menu for Restaurants in Islamabad
            </h1>
            <p className="speakable-hero text-base md:text-lg text-[#AAA] max-w-2xl mx-auto leading-relaxed">
              Replace printed menus with a free QR code digital menu. Islamabad customers scan, browse,
              and order directly on WhatsApp. Zero commission. No app download. Instant updates.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/signup/restaurant"
                className="bg-white text-black px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#E5E5E5] transition-colors"
              >
                Create Your Free Digital Menu
              </Link>
              <Link
                href="/pricing"
                className="px-6 py-3 rounded-xl border border-[#333] text-sm font-medium text-white hover:bg-[#1A1A1A] transition-colors"
              >
                View Plans
              </Link>
            </div>
          </div>
        </section>

        {/* Direct Answer Summary Block — AEO / Featured Snippet */}
        <section className="py-8 md:py-10">
          <div className="max-w-4xl mx-auto px-5">
            <div className="bg-[#F9FAFB] border border-[#E8E8E8] rounded-2xl p-6 md:p-8">
              <p className="speakable-summary text-sm md:text-base text-[#333] leading-relaxed">
                <strong className="text-black">Digital Menu for Restaurants in Islamabad:</strong>{' '}
                A digital menu is an interactive, web-based menu that replaces printed restaurant menus. Customers
                scan a QR code with their phone to browse dishes, view photos, check prices, and order directly via
                WhatsApp. No app download needed. Zero commission on orders. Updates go live instantly. Restaurants
                across Islamabad — from F-7 and Blue Area to the food streets — use Digital QR Menue to save money
                and streamline ordering.
              </p>
            </div>
          </div>
        </section>

        {/* Why Islamabad */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Why Islamabad Restaurants Are Switching to Digital Menus
              </h2>
              <div className="space-y-5 text-sm md:text-base text-[#555] leading-relaxed">
                <p>
                  Islamabad is one of Pakistan&rsquo;s fastest-growing food markets. From the cafés of F-7 and
                  F-6 to the fine dining in the Blue Area and the busy eateries on the city&rsquo;s food streets,
                  competition for customers is intense. A <strong>digital menu in Islamabad</strong> helps
                  restaurants stand out, serve faster, and keep more of every order.
                </p>
                <p>
                  Islamabad customers are tech-savvy and value convenience. They scan your QR code with their phone
                  camera, browse your full menu with photos and PKR prices, and order through WhatsApp in seconds —
                  no waiting for a waiter, no app to install, no printed cards to handle.
                </p>
                <p>
                  Digital QR Menue is built for the Pakistani market: Urdu and English support, JazzCash and
                  Easypaisa payment guidance, and flat monthly pricing in PKR. It&rsquo;s the same{" "}
                  <Link href="/digital-menu-pakistan" className="underline underline-offset-2 hover:no-underline">digital menu platform used across Pakistan</Link>,
                  trusted by restaurants in every major city.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              How Digital Menus Help Islamabad Restaurants
            </h2>
            <p className="text-sm text-[#555] text-center mb-12 max-w-lg mx-auto">
              Real benefits for restaurants across the capital.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Save on Printing & Reprints",
                  description:
                    "Printed menus cost PKR 500-2,000 per card, and prices in Islamabad change often. A digital menu updates in seconds — zero reprint costs forever.",
                },
                {
                  title: "Zero Commission on Orders",
                  description:
                    "Delivery apps charge 25-35% per order. With a digital menu and WhatsApp ordering, you keep 100% of every sale — dine-in, takeaway, or delivery.",
                },
                {
                  title: "Faster Table Service",
                  description:
                    "Customers scan and order without waiting for a waiter. Faster ordering means faster table turns — especially during the lunch rush in Blue Area and F-7.",
                },
                {
                  title: "Beautiful Food Photos",
                  description:
                    "Show high-quality photos of your signature dishes. Islamabad restaurants using photo-rich digital menus report 20-30% higher average order values.",
                },
                {
                  title: "Urdu + English Menus",
                  description:
                    "Many customers prefer reading menus in Urdu. Add both languages side by side and make every guest feel welcome.",
                },
                {
                  title: "Orders Straight to WhatsApp",
                  description:
                    "Every order arrives on your WhatsApp as a formatted message — customer name, items, total, and order type. No missed orders, even at rush hour.",
                },
              ].map((benefit, i) => (
                <div key={i} className="p-6 md:p-8 bg-white rounded-2xl border border-[#F0F0F0]">
                  <h3 className="font-semibold text-base mb-2">{benefit.title}</h3>
                  <p className="text-sm text-[#555] leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              How to Create Your Digital Menu in Islamabad
            </h2>
            <p className="text-sm text-[#555] text-center mb-12 max-w-lg mx-auto">
              Setting up your digital restaurant menu takes less than 5 minutes.
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Sign Up Free", desc: "Create your account in 30 seconds. No credit card needed for the free trial." },
                { step: "2", title: "Add Your Menu", desc: "Add dishes, prices, photos, and categories in English and Urdu." },
                { step: "3", title: "Print QR Code", desc: "Download your unique QR code. Print it on table tents, posters, or stickers." },
                { step: "4", title: "Start Receiving Orders", desc: "Customers scan, browse, and order via WhatsApp. Orders come directly to your phone." },
              ].map((step, i) => (
                <div key={i} className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-lg font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{step.title}</h3>
                  <p className="text-xs text-[#555] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* QR Menus for Islamabad */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                QR Menus for Restaurants in Islamabad
              </h2>
              <div className="space-y-5 text-sm md:text-base text-[#555] leading-relaxed">
                <p>
                  A QR menu is the fastest way to go digital. Your customers scan a code at their table, browse your
                  menu, and order through WhatsApp. Learn everything on our{" "}
                  <Link href="/qr-menu-pakistan" className="underline underline-offset-2 hover:no-underline">QR menu Pakistan</Link> page —
                  the same system works for every restaurant in Islamabad.
                </p>
                <p>
                  Print your QR code once at any local print shop in Islamabad, place it on tables or the counter,
                  and it works forever. When prices change, update your menu from your phone — the code never needs
                  to be reprinted.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Restaurants We Support */}
        <section className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Restaurants We Support in Islamabad
            </h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-lg mx-auto">
              Digital menus work for every type of food business in the capital.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                "Restaurants", "Cafes & Coffee Shops", "Bakery & Desserts", "Fast Food",
                "BBQ & Desi", "Hotels & Resorts", "Food Courts", "Cloud Kitchens",
              ].map((item, i) => (
                <div key={i} className="p-4 bg-[#F9FAFB] rounded-xl text-center text-sm font-medium">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cities across Pakistan */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Digital Menus Across Pakistan
            </h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-lg mx-auto">
              Digital QR Menue serves restaurants in cities across the country.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { href: "/digital-menu-pakistan", title: "Digital Menu Pakistan", desc: "Digital menus for restaurants across the country." },
                { href: "/digital-menu-lahore", title: "Digital Menu Lahore", desc: "Digital menus for Lahore's food streets." },
                { href: "/digital-menu-karachi", title: "Digital Menu Karachi", desc: "QR menus for Karachi's restaurants and cafés." },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="p-6 bg-white border border-[#F0F0F0] rounded-2xl hover:border-[#CCC] hover:shadow-sm transition-all group"
                >
                  <h3 className="font-semibold text-sm mb-1.5 group-hover:underline">{item.title}</h3>
                  <p className="text-xs text-[#555] leading-relaxed">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              How Much Does a Digital Menu Cost in Islamabad?
            </h2>
            <p className="text-sm text-[#555] text-center mb-8 max-w-xl mx-auto">
              Affordable plans for every type of restaurant. No hidden fees. No commission on orders.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  name: "Free Trial",
                  price: "PKR 0",
                  period: "for 30 days",
                  features: ["Full access to all features", "QR code menu", "WhatsApp ordering", "Up to 50 menu items", "Basic analytics"],
                },
                {
                  name: "Starter",
                  price: "PKR 1,500",
                  period: "per month",
                  features: ["Everything in Free Trial", "Unlimited menu items", "Multiple QR codes", "Photo uploads", "Order notifications"],
                  popular: true,
                },
                {
                  name: "Growth",
                  price: "PKR 2,500",
                  period: "per month",
                  features: ["Everything in Starter", "Advanced analytics", "Multi-language menu", "Custom branding", "Priority support"],
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className={`p-6 rounded-2xl border ${plan.popular ? "bg-black text-white border-black" : "bg-white border-[#F0F0F0]"}`}
                >
                  {plan.popular && (
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#AAA] mb-2">Most Popular</p>
                  )}
                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <p className={`text-2xl font-bold mb-1 ${plan.popular ? "text-white" : "text-black"}`}>{plan.price}</p>
                  <p className={`text-xs mb-5 ${plan.popular ? "text-[#AAA]" : "text-[#999]"}`}>{plan.period}</p>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex gap-2 text-xs items-start">
                        <span className={plan.popular ? "text-green-400" : "text-green-600"}>✓</span>
                        <span className={plan.popular ? "text-[#CCC]" : "text-[#555]"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup/restaurant"
                    className={`block text-center py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      plan.popular
                        ? "bg-white text-black hover:bg-[#E5E5E5]"
                        : "bg-black text-white hover:bg-[#1A1A1A]"
                    }`}
                  >
                    {plan.name === "Free Trial" ? "Start Free Trial" : "Get Started"}
                  </Link>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#999] text-center mt-6">
              Premium plan available at PKR 4,500/month for large restaurants.{" "}
              <Link href="/pricing" className="underline">View full pricing</Link>
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
              Frequently Asked Questions — Digital Menus in Islamabad
            </h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-md mx-auto">
              Everything you need to know about digital menus for Islamabad restaurants.
            </p>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="group p-4 md:p-5 bg-white rounded-xl border border-[#F0F0F0] open:shadow-sm transition-shadow">
                  <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                    {faq.question}
                    <span className="text-[#999] text-lg group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <p className="text-sm text-[#555] leading-relaxed mt-3 pt-3 border-t border-[#F0F0F0]">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="max-w-2xl mx-auto px-5 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Create Your Digital Menu in Islamabad?
            </h2>
            <p className="text-sm text-[#555] mb-8 max-w-md mx-auto">
              Join Islamabad restaurants using Digital QR Menue to accept direct WhatsApp orders. Start your free trial today — no credit card needed.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/signup/restaurant"
                className="bg-black text-white px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#1A1A1A] transition-colors"
              >
                Create Your Free Digital Menu
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3.5 rounded-xl border border-[#E0E0E0] text-sm font-medium text-[#333] hover:bg-[#F5F5F5] transition-colors"
              >
                Talk to Us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
