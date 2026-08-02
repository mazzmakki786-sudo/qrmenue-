import type { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { JsonLd, BreadcrumbListJsonLd, FaqJsonLd, SpeakableJsonLd } from "@/components/JsonLd"

export const metadata: Metadata = {
  title: "QR Menu Pakistan for Restaurants — Free QR Code Menu",
  description:
    "Create a free QR menu for your restaurant in Pakistan. Customers scan, browse, and order via WhatsApp. Zero commission, instant updates, Urdu + English. Start free trial.",
  alternates: {
    canonical: "https://www.digitalmenue.com/qr-menu-pakistan",
  },
  openGraph: {
    title: "QR Menu Pakistan for Restaurants — Free QR Code Menu",
    description:
      "Create a free QR menu for your restaurant in Pakistan. Customers scan, browse, and order via WhatsApp. Zero commission, instant updates.",
    url: "https://www.digitalmenue.com/qr-menu-pakistan",
  },
}

export const revalidate = 3600

const faqs = [
  {
    question: "What is a QR menu for restaurants in Pakistan?",
    answer:
      "A QR menu is a digital version of your restaurant menu that customers open by scanning a QR code with their phone camera. It is live, interactive, and connected to your WhatsApp for ordering. Customers scan the code at their table, browse your dishes with photos and prices, and place an order directly — no app download needed.",
  },
  {
    question: "How much does a QR code menu cost in Pakistan?",
    answer:
      "Digital QR Menue gives every restaurant a free 30-day trial with full access. Paid plans start at PKR 1,500 per month for Starter, PKR 2,500 for Growth, and PKR 4,500 for Premium. All plans include unlimited orders and zero commission — compared to the 25-35% commission delivery apps charge per order.",
  },
  {
    question: "Do customers need to download an app to scan my QR menu?",
    answer:
      "No. Customers scan the QR code with the camera on any Android or iPhone and the menu opens instantly in their browser. No app store, no signup, no OTP. This works on every smartphone in Pakistan, from the latest iPhone to budget Android phones.",
  },
  {
    question: "Can I update my QR menu after printing the code?",
    answer:
      "Yes. Your QR code never changes — it always points to your live menu. Edit prices, add or remove dishes, and change descriptions from your dashboard. Every table in your restaurant sees the updated menu immediately, with no reprinting.",
  },
  {
    question: "How do orders come through a QR menu?",
    answer:
      "When a customer places an order, it arrives on your WhatsApp as a cleanly formatted message with the customer's name, items, quantities, total, order type (dine-in, delivery, or takeaway), and any special instructions. You confirm, prepare, and serve — no middleman and no commission.",
  },
  {
    question: "Can a QR menu work for delivery and takeaway too?",
    answer:
      "Yes. Place your QR code on tables for dine-in, print it on takeaway bags and delivery packaging so customers can reorder, and share your menu link on WhatsApp or social media for home delivery. All orders come directly to your WhatsApp.",
  },
]

export default function QrMenuPakistanPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "QR Menu Pakistan for Restaurants — Free QR Code Menu",
          description:
            "Complete guide to QR menus for restaurants in Pakistan. Create a free QR code menu, accept WhatsApp orders, and save on commissions.",
          author: { "@type": "Organization", name: "Digital QR Menue" },
          datePublished: "2026-08-01",
          dateModified: "2026-08-01",
          publisher: { "@type": "Organization", name: "Digital QR Menue" },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://www.digitalmenue.com/qr-menu-pakistan",
          },
        }}
      />
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://www.digitalmenue.com" },
          { name: "QR Menu Pakistan", url: "https://www.digitalmenue.com/qr-menu-pakistan" },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <SpeakableJsonLd
        cssSelector={[".speakable-hero", ".speakable-summary"]}
        url="https://www.digitalmenue.com/qr-menu-pakistan"
      />
      <div className="min-h-screen bg-white">
        <LandingHeader />

        {/* Hero */}
        <section className="bg-black text-white py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-5 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              QR Menu for Restaurants in Pakistan
            </h1>
            <p className="speakable-hero text-base md:text-lg text-[#AAA] max-w-2xl mx-auto leading-relaxed">
              Free QR code menu for your Pakistani restaurant. Customers scan, browse, and order on
              WhatsApp. Zero commission. No app download. Instant updates.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/signup/restaurant"
                className="bg-white text-black px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#E5E5E5] transition-colors"
              >
                Create Your Free QR Menu
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
                <strong className="text-black">QR Menu for Restaurants in Pakistan:</strong>{' '}
                A QR menu is a live, digital version of your restaurant menu that customers open by scanning
                a QR code with their phone camera. They browse dishes, view photos, check PKR prices, and
                order directly through WhatsApp. No app download, no commission on orders, and updates go
                live instantly. Restaurants in Lahore, Karachi, Islamabad, and cities across Pakistan use
                Digital QR Menue to accept direct WhatsApp orders.
              </p>
            </div>
          </div>
        </section>

        {/* What is a QR Menu */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                What is a QR Code Menu and Why Do You Need One?
              </h2>
              <div className="space-y-5 text-sm md:text-base text-[#555] leading-relaxed">
                <p>
                  A <strong>QR code menu</strong> is a digital version of your restaurant menu that customers access
                  by scanning a QR code with their phone camera. Unlike a printed menu card or a static PDF, a QR menu
                  is live, interactive, and connected directly to your WhatsApp for ordering.
                </p>
                <p>
                  When a customer scans your code, they see your full menu with dish names, descriptions, prices, and
                  photos — organized into categories like Appetizers, Main Course, BBQ, and Beverages. They select
                  what they want, and the order is sent directly to your WhatsApp with their name, items, and total.
                </p>
                <p>
                  QR menus are the fastest-growing way for Pakistani restaurants to take orders. Learn more on our{" "}
                  <Link href="/digital-menu-pakistan" className="underline underline-offset-2 hover:no-underline">digital menu Pakistan</Link> page,
                  or find a <Link href="/digital-menu-islamabad" className="underline underline-offset-2 hover:no-underline">QR menu in Islamabad</Link>,{" "}
                  <Link href="/digital-menu-lahore" className="underline underline-offset-2 hover:no-underline">Lahore</Link>, or{" "}
                  <Link href="/digital-menu-karachi" className="underline underline-offset-2 hover:no-underline">Karachi</Link>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Why Pakistani Restaurants Are Switching to QR Menus
            </h2>
            <p className="text-sm text-[#555] text-center mb-12 max-w-lg mx-auto">
              The smartest restaurants in Pakistan are replacing printed cards and delivery apps with QR menus.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Zero Commission on Orders",
                  description:
                    "Food delivery apps charge 25-35% per order. A QR menu costs a flat PKR 1,500/month — and you keep 100% of every order that comes through WhatsApp.",
                },
                {
                  title: "Instant Menu Updates",
                  description:
                    "Prices change in Pakistan — chicken, oil, and vegetables go up frequently. Update your QR menu in seconds from your phone instead of paying PKR 500-2,000 per reprint.",
                },
                {
                  title: "No App Download for Customers",
                  description:
                    "Customers scan with their phone camera and everything works in the browser. No app store, no signup, no password. It works on every smartphone in Pakistan.",
                },
                {
                  title: "Urdu + English Support",
                  description:
                    "Add dish names and descriptions in both Urdu and English. Customers who prefer reading menus in Urdu can switch instantly — more accessible, more welcoming.",
                },
                {
                  title: "Higher Average Orders",
                  description:
                    "QR menus with food photos report 20-30% higher order values. Visual menus are more tempting, and easy upselling boosts what each customer spends.",
                },
                {
                  title: "Order Notifications on WhatsApp",
                  description:
                    "Every order arrives on your WhatsApp as a formatted message — customer name, items, total, order type, and special instructions. No missed orders, even at rush hour.",
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
              How a QR Code Menu Works
            </h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-lg mx-auto">
              From scan to order in under 10 seconds.
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Print QR Code", desc: "Place the QR code on tables, counters, or windows." },
                { step: "2", title: "Customer Scans", desc: "Opens camera, points at QR code, taps notification." },
                { step: "3", title: "Menu Opens", desc: "Full digital menu with photos, prices, and categories." },
                { step: "4", title: "Order via WhatsApp", desc: "Selects dishes, taps order. You receive it instantly." },
              ].map((item, i) => (
                <div key={i} className="text-center p-5 bg-white rounded-2xl border border-[#F0F0F0]">
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold mx-auto mb-3">{item.step}</div>
                  <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-[#555]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* QR Menu vs Printed Menu vs Delivery Apps */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
              QR Menu vs Printed Menu vs Delivery Apps
            </h2>
            <p className="text-sm text-[#555] text-center mb-8 max-w-xl mx-auto">
              See how a QR menu stacks up against the alternatives Pakistani restaurants use today.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E0E0E0]">
                    <th className="text-left py-3 font-semibold">Feature</th>
                    <th className="text-left py-3 font-semibold text-green-700">QR Menu</th>
                    <th className="text-left py-3 font-semibold">Printed Menu</th>
                    <th className="text-left py-3 font-semibold text-red-600">Delivery Apps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {[
                    { feature: "Cost after setup", qr: "PKR 1,500/month", printed: "PKR 500-2,000 per reprint", delivery: "25-35% per order" },
                    { feature: "Price updates", qr: "Instant from dashboard", printed: "Requires reprint", delivery: "Takes days, aggregator-controlled" },
                    { feature: "Photos", qr: "Yes — every dish", printed: "Expensive to print", delivery: "Limited control" },
                    { feature: "Customer app", qr: "None needed", printed: "None needed", delivery: "Must download app" },
                    { feature: "Orders", qr: "Direct to your WhatsApp", printed: "Waiter takes order", delivery: "Through the platform" },
                    { feature: "Urdu + English", qr: "Yes", printed: "Possible but costly", delivery: "No" },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 font-medium">{row.feature}</td>
                      <td className="py-3 text-green-700">{row.qr}</td>
                      <td className="py-3">{row.printed}</td>
                      <td className="py-3 text-red-600">{row.delivery}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              QR Code Menu Price in Pakistan
            </h2>
            <p className="text-sm text-[#555] text-center mb-8 max-w-xl mx-auto">
              Flat monthly pricing with zero commission. No setup fees, no hidden charges.
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
              Frequently Asked Questions About QR Menus
            </h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-md mx-auto">
              Everything you need to know about QR code menus in Pakistan.
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
              Ready to Create Your QR Menu?
            </h2>
            <p className="text-sm text-[#555] mb-8 max-w-md mx-auto">
              Join thousands of Pakistani restaurants accepting direct WhatsApp orders. Start your free trial today — no credit card needed.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/signup/restaurant"
                className="bg-black text-white px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#1A1A1A] transition-colors"
              >
                Create Your Free QR Menu
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
