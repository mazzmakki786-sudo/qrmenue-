import type { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { JsonLd } from "@/components/JsonLd"
import { COMPANY_INFO } from "@/lib/company-info"

export const metadata: Metadata = {
  title: "About Us — Pakistan's Free QR Menu & WhatsApp Ordering Platform",
  description:
    "Learn about Digital QR Menue — Pakistan's no-commission digital QR menu platform. We help restaurants create free digital menus, eliminate printing costs, and get orders directly on WhatsApp. Founded in Lahore, serving restaurants across Pakistan.",
  alternates: {
    canonical: "https://www.digitalmenue.com/about",
  },
  openGraph: {
    title: "About Digital QR Menue — Free QR Menu Platform for Restaurants in Pakistan",
    description:
      "Digital QR Menue helps Pakistani restaurants create digital QR menus, eliminate costly paper reprints, and receive commission-free orders via WhatsApp. Serving Lahore, Karachi, Islamabad, and all of Pakistan.",
    url: "https://www.digitalmenue.com/about",
  },
}

export const revalidate = 3600

const milestones = [
  { year: "2024", title: "Founded in Lahore", description: "Digital QR Menue was launched with a simple mission: help Pakistani restaurants go digital without expensive apps or hefty commissions." },
  { year: "2025", title: "1,000+ Restaurants Onboarded", description: "Grew to serve restaurants, cafes, dhabas, cloud kitchens, and home-based food businesses across 20+ cities in Pakistan." },
  { year: "2026", title: "Pakistan's Leading QR Menu Platform", description: "Trusted by thousands of restaurants nationwide. Zero-commission WhatsApp ordering, free QR codes, and a complete digital ordering ecosystem." },
]

const values = [
  { icon: "🇵🇰", title: "Made in Pakistan", description: "Built by Pakistani developers for Pakistani restaurants. We understand local needs: Urdu/English bilingual support, local payment methods like JazzCash & Easypaisa, and pricing in PKR." },
  { icon: "💰", title: "Zero Commission, Always", description: "Unlike Foodpanda (25-35% commission) and other delivery apps, we charge a flat monthly fee. Restaurants keep 100% of their revenue." },
  { icon: "📱", title: "No App Required", description: "Customers don't need to download anything. Scan a QR code with any phone camera, see the full digital menu in your browser, and order on WhatsApp in under 10 seconds." },
  { icon: "⚡", title: "Real-Time Updates", description: "Restaurants can update prices, add dishes, and change their menu from the dashboard. Changes are live instantly — no reprinting menus, no delays." },
]

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About Digital QR Menue",
          description:
            "Digital QR Menue is Pakistan's leading no-commission QR menu and WhatsApp ordering platform for restaurants, cafes, and food businesses.",
          url: "https://www.digitalmenue.com/about",
          mainEntity: {
            "@type": "Organization",
            name: "Digital QR Menue",
            url: "https://digitalmenue.com",
            foundingDate: "2024",
            foundingLocation: "Lahore, Pakistan",
            areaServed: "PK",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Lahore",
              addressRegion: "Punjab",
              addressCountry: "PK",
            },
            description:
              "Pakistan's leading free digital QR menu and WhatsApp online ordering platform for restaurants. No commissions, no app download, instant updates.",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.digitalmenue.com" },
            { "@type": "ListItem", position: 2, name: "About", item: "https://www.digitalmenue.com/about" },
          ],
        }}
      />
      <div className="min-h-screen bg-white">
        <LandingHeader />

        {/* Hero */}
        <section className="bg-black text-white py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-5 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              About Digital QR Menue
            </h1>
            <p className="text-sm md:text-base text-[#AAA] max-w-xl mx-auto">
              Pakistan&apos;s no-commission QR menu and WhatsApp ordering platform.
              Built in Lahore, for Pakistani restaurants.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-5">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-sm md:text-base text-[#555] leading-relaxed max-w-2xl mx-auto">
                We help every restaurant in Pakistan create a free digital menu — no
                commission, no app download, no technical skills needed. Restaurants
                save thousands on printing and third-party commissions, while customers
                enjoy a seamless ordering experience through WhatsApp.
              </p>
            </div>

            {/* Story */}
            <div className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Our Story</h2>
              <div className="space-y-5 text-sm text-[#555] leading-relaxed">
                <p>
                  Digital QR Menue was born from a simple observation: restaurants in Pakistan were
                  paying 25-35% of every order to delivery apps, spending thousands on printing paper
                  menus that went out of date the next week, and struggling to keep up with digital
                  transformation. Meanwhile, customers were tired of downloading yet another app just
                  to order food.
                </p>
                <p>
                  We realized the answer was already in everyone&apos;s pocket — WhatsApp. With over 50
                  million users in Pakistan, WhatsApp is the country&apos;s most-used messaging app. And
                  every phone has a camera that can scan QR codes. By combining the two, we created
                  a digital ordering system that works for everyone: no app download, no commission,
                  no complexity.
                </p>
                <p>
                  Today, thousands of restaurants across Lahore, Karachi, Islamabad, Faisalabad,
                  Rawalpindi, and every major city in Pakistan use Digital QR Menue to manage their
                  digital menus and receive orders directly on WhatsApp. From small home-based
                  bakers to multi-branch restaurant chains, our platform serves them all.
                </p>
              </div>
            </div>

            {/* Milestones */}
            <div className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Our Journey</h2>
              <div className="space-y-6">
                {milestones.map((m, i) => (
                  <div key={i} className="flex gap-4 md:gap-6 items-start">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {m.year}
                      </div>
                      {i < milestones.length - 1 && (
                        <div className="w-px h-full min-h-[60px] bg-[#E0E0E0]" />
                      )}
                    </div>
                    <div className="pt-1.5">
                      <h3 className="font-semibold text-black mb-1">{m.title}</h3>
                      <p className="text-sm text-[#555] leading-relaxed">{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Information */}
            <div className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Company Information</h2>
              <p className="text-sm text-[#555] text-center mb-8 max-w-md mx-auto">
                Details about the company behind Digital QR Menue.
              </p>
              <div className="p-6 md:p-8 bg-[#F9FAFB] rounded-2xl border border-[#E8E8E8]">
                <p className="text-sm font-semibold text-black mb-6 text-center">{COMPANY_INFO.ownershipStatement}</p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  {[
                    { label: "Owner", value: COMPANY_INFO.owner },
                    { label: "Founded", value: COMPANY_INFO.founding.year },
                    { label: "Location", value: COMPANY_INFO.founding.location },
                    { label: "Address", value: COMPANY_INFO.address },
                    { label: "Email", value: COMPANY_INFO.support.email },
                    { label: "WhatsApp", value: COMPANY_INFO.support.whatsapp },
                    { label: "Operational Hours (Mon–Fri)", value: COMPANY_INFO.hours.weekday },
                    { label: "Saturday", value: COMPANY_INFO.hours.saturday },
                    { label: "Sunday", value: COMPANY_INFO.hours.sunday },
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-white rounded-xl border border-[#F0F0F0]">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#999] mb-1">{item.label}</p>
                      <p className="text-sm font-medium text-black">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Values */}
            <div className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">What We Stand For</h2>
              <p className="text-sm text-[#555] text-center mb-8 max-w-md mx-auto">
                The principles that guide everything we build.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {values.map((v, i) => (
                  <div key={i} className="p-5 md:p-6 border border-[#F0F0F0] rounded-2xl hover:bg-[#FAFAFA] transition-colors">
                    <span className="text-2xl mb-3 block">{v.icon}</span>
                    <h3 className="font-semibold mb-2 text-sm">{v.title}</h3>
                    <p className="text-xs text-[#555] leading-relaxed">{v.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Why QR Menu Section - SEO rich content */}
            <div className="mb-16 p-6 md:p-8 bg-[#F9FAFB] rounded-2xl">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">
                Why Choose a QR Code Menu for Your Restaurant?
              </h2>
              <div className="space-y-4 text-sm text-[#555] leading-relaxed">
                <p>
                  A <strong>QR code menu</strong> — also called a <strong>digital food menu</strong>, <strong>online restaurant menu</strong>, or <strong>contactless menu</strong> — replaces traditional printed menus with a scannable barcode that opens your menu on any phone. In Pakistan, restaurants using QR menus save thousands of rupees monthly on printing costs and eliminate the hassle of updating paper menus when prices change.
                </p>
                <p>
                  Unlike ordering through apps like Foodpanda — which charge restaurants 25-35% per order — a <strong>QR code ordering system</strong> lets customers order directly through WhatsApp. There&apos;s no middleman, no commission, and no need for customers to download an app. Simply scan, browse, and order. Restaurants keep 100% of their revenue.
                </p>
                <p>
                  Digital QR Menue makes it easy for any restaurant, cafe, dhaba, cloud kitchen, or home-based food business in Pakistan to create a <strong>free digital menu with QR code</strong> in under 5 minutes. No technical skills needed. Update prices, add new dishes, or change photos anytime from your phone or computer — changes go live instantly.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold mb-3">Ready to create your free QR menu?</h2>
              <p className="text-sm text-[#555] mb-6">Join thousands of Pakistani restaurants already using Digital QR Menue.</p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/signup/restaurant"
                  className="bg-black text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#1A1A1A] transition-colors"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/pricing"
                  className="px-6 py-3 rounded-xl border border-[#E0E0E0] text-sm font-medium text-[#333] hover:bg-[#F5F5F5] transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
