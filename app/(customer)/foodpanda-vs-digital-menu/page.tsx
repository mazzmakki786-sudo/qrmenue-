import type { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { JsonLd, BreadcrumbListJsonLd, FaqJsonLd } from "@/components/JsonLd"

export const metadata: Metadata = {
  title: "Foodpanda vs Digital Menu — Why Restaurants Are Switching in 2026",
  description:
    "Foodpanda charges 25-35% commission per order. Digital QR Menue costs PKR 1,500/month with zero commission. Compare features, costs, and why Pakistani restaurants are switching to direct QR menus.",
  alternates: {
    canonical: "https://www.digitalmenue.com/foodpanda-vs-digital-menu",
  },
  openGraph: {
    title: "Foodpanda vs Digital Menu — Commission-Free Ordering for Restaurants",
    description:
      "Foodpanda charges 25-35% commission per order. Digital QR Menue costs PKR 1,500/month with zero commission. Compare now.",
    url: "https://www.digitalmenue.com/foodpanda-vs-digital-menu",
  },
}

export const revalidate = 3600

const faqs = [
  {
    question: "How much commission does Foodpanda charge restaurants?",
    answer:
      "Foodpanda typically charges 25-35% commission on every order. This means if a customer orders PKR 1,000 worth of food, Foodpanda keeps PKR 250-350. For restaurants with thin margins, this commission can be the difference between profit and loss.",
  },
  {
    question: "How does Digital QR Menue make money without commission?",
    answer:
      "Digital QR Menue charges a flat monthly fee starting from PKR 1,500/month. There is zero commission on orders. You keep 100% of every sale. This predictable pricing model is better for restaurant budgets than commission-based platforms.",
  },
  {
    question: "Can I use both Foodpanda and a digital menu at the same time?",
    answer:
      "Yes. Many restaurants use Foodpanda for discovery (new customers find them on the app) while using a digital QR menu for dine-in, takeaway, and repeat customers. This way you benefit from Foodpanda's reach without paying commission on every order.",
  },
  {
    question: "What is the difference between Foodpanda and a QR menu?",
    answer:
      "Foodpanda is a marketplace that lists your restaurant alongside competitors. A QR menu is YOUR own branded menu that sits on YOUR tables and goes directly to YOUR customers. With Foodpanda, you compete on price. With a QR menu, you own the customer relationship.",
  },
  {
    question: "Will I lose customers if I leave Foodpanda?",
    answer:
      "You don't have to leave Foodpanda entirely. Use it for discovery while building your own direct ordering channel via QR menu. Over time, as customers discover your restaurant through Foodpanda, they'll order directly through your QR menu — saving you commission on repeat orders.",
  },
  {
    question: "How do I switch from Foodpanda to a direct digital menu?",
    answer:
      "Sign up for Digital QR Menue (free 30-day trial), add your menu items and prices, print your QR code, and place it on tables. You can keep your Foodpanda listing for new customer discovery while building your direct ordering channel.",
  },
]

export default function FoodpandaVsDigitalMenuPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Foodpanda vs Digital Menu — Why Restaurants Are Switching in 2026",
          description:
            "Foodpanda charges 25-35% commission per order. Digital QR Menue costs PKR 1,500/month with zero commission. Compare features, costs, and why Pakistani restaurants are switching.",
          author: { "@type": "Organization", name: "Digital QR Menue" },
          datePublished: "2026-08-04",
          dateModified: "2026-08-04",
          publisher: { "@type": "Organization", name: "Digital QR Menue" },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://www.digitalmenue.com/foodpanda-vs-digital-menu",
          },
        }}
      />
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://www.digitalmenue.com" },
          {
            name: "Foodpanda vs Digital Menu",
            url: "https://www.digitalmenue.com/foodpanda-vs-digital-menu",
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
              Comparison Guide
            </p>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Foodpanda vs Digital Menu
            </h1>
            <p className="text-base md:text-lg text-[#AAA] max-w-2xl mx-auto leading-relaxed">
              Foodpanda charges 25-35% commission on every order. Digital QR Menue costs PKR 1,500/month
              with zero commission. See why thousands of Pakistani restaurants are switching to direct
              QR menus.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/signup/restaurant"
                className="bg-white text-black px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#E5E5E5] transition-colors"
              >
                Switch to Zero Commission
              </Link>
              <Link
                href="/pricing"
                className="px-6 py-3.5 rounded-xl border border-[#333] text-sm font-medium text-white hover:bg-[#1A1A1A] transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Comparison */}
        <section className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              At a Glance: Foodpanda vs Digital QR Menue
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Foodpanda Card */}
              <div className="p-6 md:p-8 rounded-2xl border border-[#F0F0F0] bg-[#F9FAFB]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#D70F64] flex items-center justify-center text-white text-sm font-bold">
                    F
                  </div>
                  <h3 className="text-lg font-bold">Foodpanda</h3>
                </div>
                <ul className="space-y-3 text-sm text-[#555]">
                  <li className="flex gap-2">
                    <span className="text-red-500 shrink-0">✗</span>
                    <span>25-35% commission on every order</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500 shrink-0">✗</span>
                    <span>Customers belong to Foodpanda, not you</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500 shrink-0">✗</span>
                    <span>You compete with 100+ restaurants in the same area</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500 shrink-0">✗</span>
                    <span>Foodpanda controls pricing and promotions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-500 shrink-0">✓</span>
                    <span>Good for new customer discovery</span>
                  </li>
                </ul>
              </div>

              {/* Digital QR Menue Card */}
              <div className="p-6 md:p-8 rounded-2xl border-2 border-black bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold">
                    QR
                  </div>
                  <h3 className="text-lg font-bold">Digital QR Menue</h3>
                </div>
                <ul className="space-y-3 text-sm text-[#555]">
                  <li className="flex gap-2">
                    <span className="text-green-500 shrink-0">✓</span>
                    <span>Zero commission — keep 100% of every order</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-500 shrink-0">✓</span>
                    <span>Customers belong to you — build your own list</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-500 shrink-0">✓</span>
                    <span>No competition — your menu is your own</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-500 shrink-0">✓</span>
                    <span>Full control over pricing and promotions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-500 shrink-0">✓</span>
                    <span>Flat monthly fee: PKR 1,500/month</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Cost Calculator */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Real Cost Comparison: Foodpanda vs Digital QR Menue
            </h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-xl mx-auto">
              See how much you actually pay based on monthly order volume.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E0E0E0]">
                    <th className="text-left py-3 font-semibold">Monthly Orders</th>
                    <th className="text-left py-3 font-semibold">Avg Order Value</th>
                    <th className="text-left py-3 font-semibold text-red-500">Foodpanda Cost (30%)</th>
                    <th className="text-left py-3 font-semibold text-green-600">Digital QR Menue Cost</th>
                    <th className="text-left py-3 font-semibold">You Save</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {[
                    { orders: "100", aov: "PKR 800", foodpanda: "PKR 24,000", dm: "PKR 1,500", save: "PKR 22,500" },
                    { orders: "300", aov: "PKR 800", foodpanda: "PKR 72,000", dm: "PKR 1,500", save: "PKR 70,500" },
                    { orders: "500", aov: "PKR 800", foodpanda: "PKR 120,000", dm: "PKR 2,500", save: "PKR 117,500" },
                    { orders: "1000", aov: "PKR 800", foodpanda: "PKR 240,000", dm: "PKR 4,500", save: "PKR 235,500" },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 font-medium">{row.orders}</td>
                      <td className="py-3 text-[#555]">{row.aov}</td>
                      <td className="py-3 text-red-500 font-medium">{row.foodpanda}</td>
                      <td className="py-3 text-green-600 font-medium">{row.dm}</td>
                      <td className="py-3 font-bold text-black">{row.save}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[#999] text-center mt-4">
              Based on 30% Foodpanda commission. Actual commission varies by plan and promotions.
            </p>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Feature-by-Feature Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E0E0E0]">
                    <th className="text-left py-3 font-semibold">Feature</th>
                    <th className="text-left py-3 font-semibold">Foodpanda</th>
                    <th className="text-left py-3 font-semibold text-green-600">Digital QR Menue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {[
                    { feature: "Commission per order", foodpanda: "25-35%", dm: "0%" },
                    { feature: "Monthly cost", foodpanda: "Varies (commission-based)", dm: "PKR 1,500 flat" },
                    { feature: "Customer data ownership", foodpanda: "Foodpanda owns it", dm: "You own it" },
                    { feature: "Menu control", foodpanda: "Limited by Foodpanda rules", dm: "Full control" },
                    { feature: "Pricing control", foodpanda: "Foodpanda can override", dm: "You set all prices" },
                    { feature: "Branding", foodpanda: "Foodpanda branded", dm: "Your restaurant branded" },
                    { feature: "WhatsApp ordering", foodpanda: "Not available", dm: "Built-in" },
                    { feature: "QR code on tables", foodpanda: "Not available", dm: "Core feature" },
                    { feature: "Dine-in ordering", foodpanda: "Delivery/takeaway only", dm: "Dine-in + delivery + takeaway" },
                    { feature: "Customer reach", foodpanda: "Large (marketplace)", dm: "Your existing customers" },
                    { feature: "Setup time", foodpanda: "1-2 weeks", dm: "5 minutes" },
                    { feature: "Contract required", foodpanda: "Yes (6-12 months)", dm: "No — cancel anytime" },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 font-medium text-black pr-4">{row.feature}</td>
                      <td className="py-3 text-[#999] pr-4">{row.foodpanda}</td>
                      <td className="py-3 text-green-600 font-medium">{row.dm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Strategy: Use Both */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              The Smart Strategy: Use Both Foodpanda and a Digital Menu
            </h2>
            <div className="space-y-5 text-sm md:text-base text-[#555] leading-relaxed">
              <p>
                You don&apos;t have to choose one or the other. The smartest restaurants in Pakistan use
                a <strong>hybrid strategy</strong>: Foodpanda for discovery, and a digital QR menu for
                repeat orders.
              </p>
              <p>
                <strong>Step 1:</strong> Keep your Foodpanda listing to attract new customers who search
                for food delivery in your area. Foodpanda&apos;s marketing budget brings customers to you.
              </p>
              <p>
                <strong>Step 2:</strong> When those customers visit your restaurant for dine-in, place
                your QR menu on the table. They scan it, see your full menu, and order directly via
                WhatsApp — no Foodpanda commission.
              </p>
              <p>
                <strong>Step 3:</strong> Over time, build your own customer list. Share your menu link
                on social media, print your QR code on takeaway bags, and give it to repeat customers.
                Within 6-12 months, 60-80% of your orders will come directly — saving you tens of
                thousands of rupees every month.
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
              Common questions about switching from Foodpanda to a direct digital menu.
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
              Start Saving Today — Switch to Zero Commission
            </h2>
            <p className="text-sm text-[#AAA] mb-8 max-w-md mx-auto">
              Join thousands of Pakistani restaurants saving PKR 20,000-100,000+ every month by ordering
              directly through Digital QR Menue. Free 30-day trial. No credit card needed.
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
                Compare Plans
              </Link>
            </div>
            <p className="text-xs text-[#666] mt-3">
              Free 30-day trial • Zero commission • Cancel anytime
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
