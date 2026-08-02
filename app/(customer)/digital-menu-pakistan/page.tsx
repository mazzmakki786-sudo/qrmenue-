import type { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { JsonLd, BreadcrumbListJsonLd, FaqJsonLd, SpeakableJsonLd } from "@/components/JsonLd"

export const metadata: Metadata = {
  title: "Digital Menu for Restaurants in Pakistan — QR & WhatsApp Ordering",
  description:
    "Create a digital menu for your restaurant in Pakistan. Free QR code menu, WhatsApp orders, zero commission, and instant price updates. Serving Lahore, Karachi, Islamabad & more. Start free trial.",
  alternates: {
    canonical: "https://www.digitalmenue.com/digital-menu-pakistan",
  },
  openGraph: {
    title: "Digital Menu for Restaurants in Pakistan — QR & WhatsApp Ordering",
    description:
      "Create a digital menu for your restaurant in Pakistan. Free QR code menu, WhatsApp orders, zero commission, and instant price updates.",
    url: "https://www.digitalmenue.com/digital-menu-pakistan",
  },
}

export const revalidate = 3600

const faqs = [
  {
    question: "What is a digital menu for restaurants in Pakistan?",
    answer:
      "A digital menu for restaurants in Pakistan is an interactive, web-based menu customers open by scanning a QR code with their phone. It replaces printed menu cards and lets customers browse dishes, view photos, check prices, and order directly through WhatsApp — no app download, no commission on orders.",
  },
  {
    question: "How much does a digital menu cost in Pakistan?",
    answer:
      "Digital QR Menue offers a 30-day free trial with full access. Paid plans start from PKR 1,500 per month for the Starter plan, PKR 2,500 for Growth, and PKR 4,500 for Premium. There are no setup fees, no hidden charges, and zero commission on any order — compared to printing menu cards that cost thousands every time prices change.",
  },
  {
    question: "Can a digital menu work for delivery and takeaway?",
    answer:
      "Yes. Digital QR Menue supports dine-in, takeaway, and delivery. Customers scan your QR code at the table, or you share your menu link on WhatsApp, social media, or your website for home delivery. Every order arrives directly on your WhatsApp with the customer's name, items, and total.",
  },
  {
    question: "Do customers need an app to view a digital menu?",
    answer:
      "No. Customers scan the QR code with any phone camera and the menu opens instantly in their browser. There is no app store, no signup, and no password. This works on every smartphone in Pakistan, from the latest iPhone to budget Android phones.",
  },
  {
    question: "Which cities in Pakistan does Digital QR Menue serve?",
    answer:
      "Digital QR Menue serves restaurants across all of Pakistan, including Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, and Gujranwala. Because your digital menu lives online, a restaurant anywhere in Pakistan can create its menu in minutes and start accepting WhatsApp orders the same day.",
  },
  {
    question: "Is a digital menu better than a printed menu?",
    answer:
      "Yes. A digital menu saves printing and reprint costs, updates instantly when prices change, shows beautiful food photos that lift order values, and connects directly to WhatsApp ordering. Pakistani restaurants save thousands of rupees every month on reprints and third-party commissions.",
  },
]

export default function DigitalMenuPakistanPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Digital Menu for Restaurants in Pakistan — QR & WhatsApp Ordering",
          description:
            "Complete guide to digital menus for restaurants in Pakistan. Create a free QR code menu, accept WhatsApp orders, and save on printing costs.",
          author: { "@type": "Organization", name: "Digital QR Menue" },
          datePublished: "2026-08-01",
          dateModified: "2026-08-01",
          publisher: { "@type": "Organization", name: "Digital QR Menue" },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://www.digitalmenue.com/digital-menu-pakistan",
          },
        }}
      />
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://www.digitalmenue.com" },
          { name: "Digital Menu Pakistan", url: "https://www.digitalmenue.com/digital-menu-pakistan" },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <SpeakableJsonLd
        cssSelector={[".speakable-hero", ".speakable-summary"]}
        url="https://www.digitalmenue.com/digital-menu-pakistan"
      />
      <div className="min-h-screen bg-white">
        <LandingHeader />

        {/* Hero */}
        <section className="bg-black text-white py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-5 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Digital Menu for Restaurants in Pakistan
            </h1>
            <p className="speakable-hero text-base md:text-lg text-[#AAA] max-w-2xl mx-auto leading-relaxed">
              Replace printed menus with a free QR code digital menu. Customers scan, browse, and
              order directly on WhatsApp. Zero commission. No app download. Instant price updates.
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
                <strong className="text-black">Digital Menu for Restaurants in Pakistan:</strong>{' '}
                A digital menu is an interactive, web-based menu that replaces printed restaurant menus.
                Customers scan a QR code with their phone to browse dishes, view photos, check prices, and
                order directly via WhatsApp. No app download needed. Zero commission on orders. Updates go
                live instantly. Restaurants across Lahore, Karachi, Islamabad, and Faisalabad use
                Digital QR Menue to save money and streamline ordering.
              </p>
            </div>
          </div>
        </section>

        {/* What is a Digital Menu */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                What is a Digital Menu for Restaurants in Pakistan?
              </h2>
              <div className="space-y-5 text-sm md:text-base text-[#555] leading-relaxed">
                <p>
                  A <strong>digital menu for restaurants in Pakistan</strong> is an online, interactive menu that
                  customers open by scanning a QR code with their smartphone camera. Unlike traditional printed
                  cards that need reprinting every time prices or dishes change, a digital menu updates instantly
                  and costs nothing to maintain after setup.
                </p>
                <p>
                  Also called a <strong>QR code menu</strong>, <strong>online restaurant menu</strong>, or{" "}
                  <strong>e-menu</strong>, it has become the standard for modern restaurants across Pakistan. From
                  fine dining in <Link href="/digital-menu-islamabad" className="underline underline-offset-2 hover:no-underline">Islamabad</Link> to
                  food streets in <Link href="/digital-menu-lahore" className="underline underline-offset-2 hover:no-underline">Lahore</Link> and
                  BBQ houses in <Link href="/digital-menu-karachi" className="underline underline-offset-2 hover:no-underline">Karachi</Link>,
                  thousands of food businesses have switched to digital menus to save money and serve customers better.
                </p>
                <p>
                  With Digital QR Menue, your <strong>digital restaurant menu</strong> includes photos of each dish,
                  clear PKR pricing, descriptions, and category organization. Customers browse your full menu and
                  place orders directly through WhatsApp — all without downloading a single app.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Why Switch to a Digital Menu in Pakistan?
            </h2>
            <p className="text-sm text-[#555] text-center mb-12 max-w-lg mx-auto">
              Thousands of Pakistani restaurants have already made the switch. Here&apos;s why.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Save Thousands on Printing",
                  description:
                    "Paper menus cost PKR 500–2,000 per print, and most restaurants reprint every 2-3 months when prices or dishes change. A digital menu updates instantly — zero printing costs forever.",
                },
                {
                  title: "Zero Commission on Orders",
                  description:
                    "Food delivery apps charge restaurants 25–35% per order. With a digital menu and WhatsApp ordering, customers order directly from you. You keep 100% of every sale.",
                },
                {
                  title: "Instant Price Updates",
                  description:
                    "Chicken, oil, or vegetable prices changed? Update your digital menu in seconds from your phone. Changes go live immediately — no waiting for reprints, no crossed-out prices.",
                },
                {
                  title: "Beautiful Food Photos",
                  description:
                    "Digital menus let you show high-quality photos of every dish. Restaurants using photos see up to 30% higher order values compared to text-only menus.",
                },
                {
                  title: "Urdu + English Support",
                  description:
                    "Over 230 million Pakistanis speak Urdu. Add Urdu dish names and descriptions alongside English so every customer can read your menu comfortably.",
                },
                {
                  title: "Order Directly on WhatsApp",
                  description:
                    "Over 50 million Pakistanis use WhatsApp daily. Your customers can browse your menu and place orders through WhatsApp in under 10 seconds. No third-party apps needed.",
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
              How to Create a Digital Menu for Your Restaurant
            </h2>
            <p className="text-sm text-[#555] text-center mb-12 max-w-lg mx-auto">
              Setting up your digital restaurant menu takes less than 5 minutes.
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Sign Up Free", desc: "Create your account in 30 seconds. No credit card needed for the free trial." },
                { step: "2", title: "Add Your Menu", desc: "Add dishes, prices, photos, and categories in English and Urdu." },
                { step: "3", title: "Print QR Code", desc: "Download your unique QR code. Print it on table cards, posters, or stickers." },
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

        {/* Cities we serve */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Digital Menus Across Pakistan
            </h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-lg mx-auto">
              Find a digital menu solution built for your city.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { href: "/digital-menu-islamabad", title: "Digital Menu Islamabad", desc: "QR menus for restaurants in the capital." },
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

        {/* Digital Menu vs Food Delivery Apps */}
        <section className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
              Digital Menu vs Food Delivery Apps — Which Is Better?
            </h2>
            <p className="text-sm text-[#555] text-center mb-8 max-w-xl mx-auto">
              Compare costs, customer control, and convenience between digital menus and third-party delivery platforms.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E0E0E0]">
                    <th className="text-left py-3 font-semibold">Feature</th>
                    <th className="text-left py-3 font-semibold text-green-700">Digital QR Menue</th>
                    <th className="text-left py-3 font-semibold text-red-600">Foodpanda / Delivery Apps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {[
                    { feature: "Commission per order", digital: "0% — you keep 100%", delivery: "25–35% per order" },
                    { feature: "Monthly cost", digital: "PKR 1,500 flat", delivery: "No fixed fee, but 25-35% on every order" },
                    { feature: "Customer app needed", digital: "No — opens in phone browser", delivery: "Yes — must download app and create account" },
                    { feature: "Menu updates", digital: "Instant from your dashboard", delivery: "Controlled by aggregator, takes days" },
                    { feature: "Customer relationship", digital: "Direct — orders on your WhatsApp", delivery: "Indirect — aggregator owns the customer" },
                    { feature: "Payment processing", digital: "JazzCash, Easypaisa, Cash — you get paid directly", delivery: "Via aggregator — delayed settlements" },
                    { feature: "Suitable for", digital: "Dine-in, takeaway, and delivery", delivery: "Delivery only" },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 font-medium">{row.feature}</td>
                      <td className="py-3 text-green-700">{row.digital}</td>
                      <td className="py-3 text-red-600">{row.delivery}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[#888] mt-4 text-center">
              Many Pakistani restaurants use both: Foodpanda for discovery and Digital QR Menue for commission-free direct orders from regular customers.
            </p>
          </div>
        </section>

        {/* Digital Menu Pricing */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Digital Menu Pricing in Pakistan — How Much Does It Cost?
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

        {/* Industries */}
        <section className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Who Can Use a Digital Menu in Pakistan?
            </h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-lg mx-auto">
              Digital menus work for every type of food business in Pakistan.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                "Restaurants", "Cafes & Coffee Shops", "Dhabas & Diner", "Cloud Kitchens",
                "Home-Based Bakers", "Food Trucks", "Hotels & Resorts", "Fast Food Chains",
              ].map((item, i) => (
                <div key={i} className="p-4 bg-[#F9FAFB] rounded-xl text-center text-sm font-medium">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
              Frequently Asked Questions About Digital Menus in Pakistan
            </h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-md mx-auto">
              Everything you need to know about digital menus for Pakistani restaurants.
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
              Ready to Create Your Digital Menu?
            </h2>
            <p className="text-sm text-[#555] mb-8 max-w-md mx-auto">
              Join thousands of Pakistani restaurants using Digital QR Menue. Start your free trial today — no credit card needed.
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
