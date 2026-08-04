import type { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { JsonLd, BreadcrumbListJsonLd, FaqJsonLd } from "@/components/JsonLd"

export const metadata: Metadata = {
  title: "QR Code Menu for Restaurants — Free Setup Guide | Digital QR Menue",
  description:
    "Create a QR code menu for your restaurant in 5 minutes. Customers scan with their phone camera, browse your menu, and order via WhatsApp. Zero commission. Free trial. Works on all phones.",
  alternates: {
    canonical: "https://www.digitalmenue.com/qr-code-menu-restaurant",
  },
  openGraph: {
    title: "QR Code Menu for Restaurants — Free Setup Guide",
    description:
      "Create a QR code menu for your restaurant in 5 minutes. Customers scan with their phone camera, browse your menu, and order via WhatsApp.",
    url: "https://www.digitalmenue.com/qr-code-menu-restaurant",
  },
}

export const revalidate = 3600

const faqs = [
  {
    question: "What is a QR code menu for restaurants?",
    answer:
      "A QR code menu is a digital restaurant menu that customers access by scanning a QR code with their phone camera. The code links to your online menu where customers can browse dishes, view photos, check prices, and place orders directly through WhatsApp. It replaces printed paper menus.",
  },
  {
    question: "How do I create a QR code menu for my restaurant?",
    answer:
      "Sign up for Digital QR Menue (free 30-day trial), add your dishes with prices and photos, and the platform generates a unique QR code automatically. Download the QR code, print it on table tents or stickers, and place it on your tables. Customers scan it and your menu opens instantly.",
  },
  {
    question: "Do customers need an app to scan a QR menu?",
    answer:
      "No. Customers use their phone's built-in camera app. On iPhone (iOS 11+) and Android (Android 9+), the camera automatically detects QR codes. No app download needed. Just point the camera at the code and tap the notification.",
  },
  {
    question: "How much does a QR code menu cost?",
    answer:
      "Digital QR Menue offers a free 30-day trial with full access. After the trial, plans start at PKR 1,500/month (Starter), PKR 2,500/month (Growth), and PKR 4,500/month (Premium). There is zero commission on orders.",
  },
  {
    question: "Can I update my QR menu after printing the code?",
    answer:
      "Yes. The QR code never changes — it always points to your menu. You can update dishes, prices, photos, and categories anytime from your dashboard. Changes go live instantly. The printed QR code never needs to be reprinted.",
  },
  {
    question: "What type of QR code should a restaurant use?",
    answer:
      "Use a static QR code that links to your menu URL. This type never expires and works forever. Dynamic QR codes (that redirect) can break if the service goes down. Digital QR Menue generates a permanent static QR code tied to your restaurant's menu page.",
  },
]

export default function QrCodeMenuRestaurantPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "QR Code Menu for Restaurants — Free Setup Guide",
          description:
            "Create a QR code menu for your restaurant in 5 minutes. Customers scan with their phone camera, browse your menu, and order via WhatsApp.",
          author: { "@type": "Organization", name: "Digital QR Menue" },
          datePublished: "2026-08-04",
          dateModified: "2026-08-04",
          publisher: { "@type": "Organization", name: "Digital QR Menue" },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://www.digitalmenue.com/qr-code-menu-restaurant",
          },
        }}
      />
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://www.digitalmenue.com" },
          {
            name: "QR Code Menu for Restaurants",
            url: "https://www.digitalmenue.com/qr-code-menu-restaurant",
          },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <div className="min-h-screen bg-white">
        <LandingHeader />

        {/* Hero */}
        <section className="bg-black text-white py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-5 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              QR Code Menu for Restaurants
            </h1>
            <p className="text-base md:text-lg text-[#AAA] max-w-2xl mx-auto leading-relaxed">
              Create a free QR code menu in 5 minutes. Customers scan with their phone camera, browse
              your full menu with photos, and order directly via WhatsApp. Zero commission. Works on
              every phone.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/signup/restaurant"
                className="bg-white text-black px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#E5E5E5] transition-colors"
              >
                Create Free QR Menu
              </Link>
              <Link
                href="/pricing"
                className="px-6 py-3.5 rounded-xl border border-[#333] text-sm font-medium text-white hover:bg-[#1A1A1A] transition-colors"
              >
                View Pricing
              </Link>
            </div>
            <p className="text-xs text-[#666] mt-3">
              30-day free trial • No credit card • Zero commission on orders
            </p>
          </div>
        </section>

        {/* What Is */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                What Is a QR Code Menu?
              </h2>
              <div className="space-y-5 text-sm md:text-base text-[#555] leading-relaxed">
                <p>
                  A <strong>QR code menu</strong> is a modern replacement for printed restaurant menus.
                  Instead of handing customers a physical menu card, you place a QR code (a small square
                  barcode) on the table. Customers scan it with their phone camera, and your digital
                  menu opens instantly in their browser.
                </p>
                <p>
                  The QR code links to a web page showing your complete menu — dish names, descriptions,
                  photos, and prices. Customers browse at their own pace, and when they&apos;re ready to
                  order, they tap a button to send their order directly to your WhatsApp. No waiter
                  needed, no app to install, no paper to print.
                </p>
                <p>
                  QR code menus have exploded in popularity since 2020. Restaurants across Pakistan — from
                  Karachi to Lahore, Islamabad to Peshawar — are adopting them because they&apos;re cheaper
                  than printed menus, always up to date, and give customers a better experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              How a QR Code Menu Works
            </h2>
            <p className="text-sm text-[#555] text-center mb-12 max-w-lg mx-auto">
              From creating your menu to receiving orders — here&apos;s the complete flow.
            </p>
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { step: "1", title: "Create Menu", desc: "Add dishes, prices, photos, and categories in your dashboard." },
                { step: "2", title: "Get QR Code", desc: "Your unique QR code is generated automatically. Download it in high resolution." },
                { step: "3", title: "Print & Place", desc: "Print on table tents, posters, or stickers. Place on tables and counters." },
                { step: "4", title: "Customer Scans", desc: "Customer points phone camera at QR code. Menu opens in browser instantly." },
                { step: "5", title: "Order via WhatsApp", desc: "Customer selects dishes and sends order directly to your WhatsApp." },
              ].map((item, i) => (
                <div key={i} className="text-center p-3">
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

        {/* Benefits */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Benefits of a QR Code Menu
            </h2>
            <p className="text-sm text-[#555] text-center mb-12 max-w-lg mx-auto">
              Why thousands of restaurants are switching to QR menus.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Zero Commission",
                  description:
                    "Unlike Foodpanda (25-35%) or other delivery apps, a QR code menu sends orders directly to your WhatsApp. You keep 100% of every sale. No middleman, no commission, no hidden fees.",
                },
                {
                  title: "Instant Updates",
                  description:
                    "Change prices, add new dishes, or remove sold-out items in seconds. Updates go live immediately. No reprinted menus sitting in a drawer.",
                },
                {
                  title: "Beautiful Food Photos",
                  description:
                    "Showcase each dish with high-resolution photos. Digital menus with photos see 20-30% higher order values. Your menu looks professional without hiring a designer.",
                },
                {
                  title: "Works on Every Phone",
                  description:
                    "iPhone, Android, old phone, new phone — QR code scanning is built into every modern phone camera. No app download needed for your customers.",
                },
                {
                  title: "Faster Table Service",
                  description:
                    "Customers scan and order without waiting for a waiter. Faster ordering means faster table turns — especially during the dinner rush.",
                },
                {
                  title: "Multi-Language Support",
                  description:
                    "Create menus in English, Urdu, or both. Serve diverse customers without printing separate menus. Switch languages with one tap.",
                },
              ].map((benefit, i) => (
                <div key={i} className="p-6 md:p-8 bg-[#F9FAFB] rounded-2xl border border-[#F0F0F0]">
                  <h3 className="font-semibold text-base mb-2">{benefit.title}</h3>
                  <p className="text-sm text-[#555] leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Where to Print */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Where to Print Your QR Code
            </h2>
            <div className="space-y-5 text-sm md:text-base text-[#555] leading-relaxed">
              <p>
                Once you download your QR code from the dashboard, you can print it anywhere. Here are
                the most popular options for Pakistani restaurants:
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-black font-bold shrink-0">•</span>
                  <span><strong>Table tents:</strong> Print on A6 or A5 card stock, fold into a triangle stand. Place on each table. Cost: PKR 20-50 per piece at any local print shop.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-black font-bold shrink-0">•</span>
                  <span><strong>Acrylic stands:</strong> Professional look. Order from Amazon.pk or local signage shops. Cost: PKR 200-500 per stand.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-black font-bold shrink-0">•</span>
                  <span><strong>Stickers:</strong> Print QR code as stickers for tables, walls, or takeaway bags. Cost: PKR 10-30 per sticker.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-black font-bold shrink-0">•</span>
                  <span><strong>Posters:</strong> Print large QR codes for your storefront or entrance. Cost: PKR 100-300 per poster.</span>
                </li>
              </ul>
              <p>
                <strong>Pro tip:</strong> Print your QR code on takeaway bags and delivery packaging.
                Every customer who orders takeaway sees the code and can reorder directly next time.
              </p>
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
              Everything you need to know about QR code menus for restaurants.
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
              Create Your QR Code Menu Today
            </h2>
            <p className="text-sm text-[#AAA] mb-8 max-w-md mx-auto">
              Join thousands of restaurants using QR code menus to serve customers faster and save
              thousands in commission fees. Free 30-day trial. No credit card needed.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/signup/restaurant"
                className="bg-white text-black px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#E5E5E5] transition-colors"
              >
                Create Free QR Menu
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
