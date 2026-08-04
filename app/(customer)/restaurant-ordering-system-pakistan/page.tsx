import type { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { JsonLd, BreadcrumbListJsonLd, FaqJsonLd } from "@/components/JsonLd"

export const metadata: Metadata = {
  title: "Restaurant Ordering System Pakistan — Free WhatsApp Orders | Digital QR Menue",
  description:
    "Best restaurant ordering system in Pakistan. QR menu with WhatsApp orders, JazzCash/Easypaisa payments, zero commission. Free trial. Trusted by 1,000+ restaurants across Pakistan.",
  alternates: {
    canonical: "https://www.digitalmenue.com/restaurant-ordering-system-pakistan",
  },
  openGraph: {
    title: "Restaurant Ordering System Pakistan — Free WhatsApp Orders",
    description:
      "Best restaurant ordering system in Pakistan. QR menu with WhatsApp orders, zero commission. Free trial.",
    url: "https://www.digitalmenue.com/restaurant-ordering-system-pakistan",
  },
}

export const revalidate = 3600

const faqs = [
  {
    question: "What is the best restaurant ordering system in Pakistan?",
    answer:
      "Digital QR Menue is the leading restaurant ordering system in Pakistan. It offers QR code menus with WhatsApp ordering, zero commission, JazzCash and Easypaisa payment support, and starts at PKR 1,500/month. Over 1,000 restaurants across Pakistan use it for dine-in, takeaway, and delivery ordering.",
  },
  {
    question: "How does a restaurant ordering system work?",
    answer:
      "A restaurant ordering system lets customers browse your menu, select dishes, and place orders digitally. With Digital QR Menue, customers scan a QR code on their phone, browse your menu with photos and prices, and send their order directly to your WhatsApp. No app download needed.",
  },
  {
    question: "Can I accept payments through JazzCash or Easypaisa?",
    answer:
      "Yes. Digital QR Menue integrates with JazzCash and Easypaisa for digital payments. Customers can pay via QR code payment, bank transfer, or cash on delivery. The payment flow is built into the ordering system.",
  },
  {
    question: "How much does a restaurant ordering system cost in Pakistan?",
    answer:
      "Digital QR Menue offers a free 30-day trial with full access. Paid plans start at PKR 1,500/month (Starter), PKR 2,500/month (Growth), and PKR 4,500/month (Premium). There is zero commission on orders — you keep 100% of every sale.",
  },
  {
    question: "Can I use a restaurant ordering system for delivery?",
    answer:
      "Yes. Place your QR code on takeaway bags and delivery packaging so customers can reorder. You can also share your menu link on WhatsApp, social media, or your website for home delivery orders. Every order arrives directly on your WhatsApp.",
  },
  {
    question: "Do I need a website for a restaurant ordering system?",
    answer:
      "No. Digital QR Menue provides your restaurant with a hosted menu page (yourrestaurant.digitalmenue.com). You don't need a separate website. The menu page works on all devices and is optimized for mobile ordering.",
  },
]

export default function RestaurantOrderingSystemPakistanPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Restaurant Ordering System Pakistan — Free WhatsApp Orders",
          description:
            "Best restaurant ordering system in Pakistan. QR menu with WhatsApp orders, zero commission. Free trial.",
          author: { "@type": "Organization", name: "Digital QR Menue" },
          datePublished: "2026-08-04",
          dateModified: "2026-08-04",
          publisher: { "@type": "Organization", name: "Digital QR Menue" },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://www.digitalmenue.com/restaurant-ordering-system-pakistan",
          },
        }}
      />
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://www.digitalmenue.com" },
          {
            name: "Restaurant Ordering System Pakistan",
            url: "https://www.digitalmenue.com/restaurant-ordering-system-pakistan",
          },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <div className="min-h-screen bg-white">
        <LandingHeader />

        {/* Hero */}
        <section className="bg-black text-white py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#AAA] mb-4">
              Pakistan&apos;s #1 Restaurant Ordering System
            </p>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Restaurant Ordering System for Pakistan
            </h1>
            <p className="text-base md:text-lg text-[#AAA] max-w-2xl mx-auto leading-relaxed">
              The complete ordering system for Pakistani restaurants. QR menus, WhatsApp orders,
              JazzCash/Easypaisa payments, and zero commission. Trusted by 1,000+ restaurants
              from Karachi to Peshawar.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/signup/restaurant"
                className="bg-white text-black px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#E5E5E5] transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                className="px-6 py-3.5 rounded-xl border border-[#333] text-sm font-medium text-white hover:bg-[#1A1A1A] transition-colors"
              >
                View Plans
              </Link>
            </div>
            <p className="text-xs text-[#666] mt-3">
              30-day free trial • No credit card • Zero commission on orders
            </p>
          </div>
        </section>

        {/* Why Pakistan */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Why Pakistani Restaurants Need a Digital Ordering System
              </h2>
              <div className="space-y-5 text-sm md:text-base text-[#555] leading-relaxed">
                <p>
                  Pakistan&apos;s restaurant industry is growing rapidly, but so is the competition.
                  In every city — Karachi, Lahore, Islamabad, Faisalabad, Rawalpindi, Peshawar,
                  Multan — restaurants are fighting for the same customers. The restaurants that
                  adopt technology early win.
                </p>
                <p>
                  A <strong>restaurant ordering system in Pakistan</strong> isn&apos;t just about going
                  digital — it&apos;s about saving money, serving faster, and keeping customers coming back.
                  Paper menus cost PKR 500-2,000 to print and become outdated the moment prices change.
                  Delivery apps like Foodpanda take 25-35% of every order. Neither option is sustainable
                  for a growing restaurant.
                </p>
                <p>
                  Digital QR Menue solves both problems. Your menu updates instantly (zero reprint costs),
                  orders go directly to your WhatsApp (zero commission), and customers get a modern,
                  app-like experience without downloading anything. It&apos;s the smartest investment a
                  Pakistani restaurant can make in 2026.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Features Built for Pakistani Restaurants
            </h2>
            <p className="text-sm text-[#555] text-center mb-12 max-w-lg mx-auto">
              Every feature is designed for the Pakistani market.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "WhatsApp Ordering",
                  description:
                    "Every order arrives on your WhatsApp as a formatted message. Customer name, items, quantities, total, and order type. No missed orders, even at rush hour.",
                },
                {
                  title: "Urdu + English Menus",
                  description:
                    "Create menus in both languages. Customers switch with one tap. Serve diverse customers without printing separate menus.",
                },
                {
                  title: "JazzCash & Easypaisa",
                  description:
                    "Accept digital payments through Pakistan's most popular mobile wallets. Customers pay via QR code or bank transfer.",
                },
                {
                  title: "QR Code on Tables",
                  description:
                    "Print your QR code on table tents, stickers, or posters. Customers scan and order without waiting for a waiter.",
                },
                {
                  title: "Zero Commission",
                  description:
                    "Unlike Foodpanda (25-35%), you keep 100% of every order. Flat monthly fee starting at PKR 1,500.",
                },
                {
                  title: "City-Specific Pages",
                  description:
                    "Your restaurant gets a dedicated page optimized for your city. Customers searching for restaurants in your area find you.",
                },
              ].map((feature, i) => (
                <div key={i} className="p-6 md:p-8 bg-white rounded-2xl border border-[#F0F0F0]">
                  <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#555] leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Get Started in 5 Minutes
            </h2>
            <p className="text-sm text-[#555] text-center mb-12 max-w-lg mx-auto">
              From sign up to live orders — the fastest restaurant ordering system setup in Pakistan.
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Sign Up Free", desc: "Create your account in 30 seconds. No credit card needed." },
                { step: "2", title: "Add Menu Items", desc: "Add dishes, prices, photos, and descriptions. Urdu and English supported." },
                { step: "3", title: "Print QR Code", desc: "Download your unique QR code. Print on table tents or stickers." },
                { step: "4", title: "Receive Orders", desc: "Customers scan, browse, and order via WhatsApp. Orders arrive instantly." },
              ].map((item, i) => (
                <div key={i} className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-lg font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{item.title}</h3>
                  <p className="text-xs text-[#555] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cities */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Serving Restaurants Across Pakistan
            </h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-lg mx-auto">
              Digital QR Menue works for restaurants in every city.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { href: "/digital-menu-karachi", title: "Karachi", desc: "Ordering system for Karachi restaurants" },
                { href: "/digital-menu-lahore", title: "Lahore", desc: "Ordering system for Lahore restaurants" },
                { href: "/digital-menu-islamabad", title: "Islamabad", desc: "Ordering system for Islamabad restaurants" },
                { href: "/digital-menu-faisalabad", title: "Faisalabad", desc: "Ordering system for Faisalabad restaurants" },
                { href: "/digital-menu-rawalpindi", title: "Rawalpindi", desc: "Ordering system for Rawalpindi restaurants" },
                { href: "/digital-menu-peshawar", title: "Peshawar", desc: "Ordering system for Peshawar restaurants" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="p-5 bg-white border border-[#F0F0F0] rounded-2xl hover:border-[#CCC] hover:shadow-sm transition-all group"
                >
                  <h3 className="font-semibold text-sm mb-1 group-hover:underline">{item.title}</h3>
                  <p className="text-xs text-[#555] leading-relaxed">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-md mx-auto">
              Common questions about restaurant ordering systems in Pakistan.
            </p>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group p-4 md:p-5 bg-white rounded-xl border border-[#F0F0F0] open:shadow-sm transition-shadow"
                >
                  <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                    {faq.question}
                    <span className="text-[#999] text-lg group-open:rotate-180 transition-transform">
                      ▾
                    </span>
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
        <section className="py-16 md:py-24 bg-black text-white">
          <div className="max-w-2xl mx-auto px-5 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Start Your Restaurant Ordering System Today
            </h2>
            <p className="text-sm text-[#AAA] mb-8 max-w-md mx-auto">
              Join 1,000+ Pakistani restaurants using Digital QR Menue. Free 30-day trial. No credit
              card needed. Zero commission on orders.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/signup/restaurant"
                className="bg-white text-black px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#E5E5E5] transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                className="px-6 py-3.5 rounded-xl border border-[#555] text-sm font-medium text-white hover:bg-[#1A1A1A] transition-colors"
              >
                View Plans
              </Link>
            </div>
            <p className="text-xs text-[#666] mt-3">
              Free 30-day trial • Full access • Cancel anytime
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
