import type { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { JsonLd, BreadcrumbListJsonLd, FaqJsonLd } from "@/components/JsonLd"

export const metadata: Metadata = {
  title: "Digital Menu App for Restaurants — No App Download Needed | Digital QR Menue",
  description:
    "The best digital menu app for restaurants in Pakistan. Customers view your menu in their browser — no app download required. QR code menus with WhatsApp ordering. Free trial.",
  alternates: {
    canonical: "https://www.digitalmenue.com/digital-menu-app",
  },
  openGraph: {
    title: "Digital Menu App for Restaurants — No App Download Needed | Digital QR Menue",
    description:
      "The best digital menu app for restaurants in Pakistan. Customers view your menu in their browser — no app download required. QR code menus with WhatsApp ordering. Free trial.",
    url: "https://www.digitalmenue.com/digital-menu-app",
  },
}

export const revalidate = 3600

const faqs = [
  {
    question: "Do I need to download a digital menu app as a restaurant customer?",
    answer:
      "No. The digital menu app from Digital QR Menue works entirely in your phone's browser. Customers scan a QR code with their camera, and the menu opens instantly — no app store visit, no download, no installation. This is why it's called a web-based digital menu app: it works like an app but lives on the web.",
  },
  {
    question: "What is a digital menu app for restaurants?",
    answer:
      "A digital menu app is a web-based application that lets restaurant customers browse menu items, view photos and prices, and place orders — all from their phone. Unlike traditional restaurant apps that require installation from the App Store or Google Play, a QR menu app opens in the browser instantly after scanning a QR code. Digital QR Menue is the leading digital menu app platform for Pakistani restaurants.",
  },
  {
    question: "How is a web-based digital menu app different from a native app?",
    answer:
      "A native app must be downloaded from the App Store or Google Play, installed on the device, and updated regularly. A web-based digital menu app like Digital QR Menue lives on the web — customers access it through their browser with zero installation. Web-based apps are faster to set up, cheaper for restaurants (no native development costs), and update instantly without users needing to download new versions.",
  },
  {
    question: "Can customers place orders through the digital menu app?",
    answer:
      "Yes. After browsing the digital menu, customers add items to their cart and place orders directly through WhatsApp. The order is pre-filled as a WhatsApp message, so the customer simply taps send. The restaurant receives the order instantly on their phone — no third-party delivery app, no commission, no delay.",
  },
  {
    question: "Which devices does the QR menu app work on?",
    answer:
      "The digital menu app works on every device with a browser and internet connection — smartphones (iPhone, Android), tablets, laptops, and desktop computers. It's responsive and adapts to any screen size. Customers can scan a QR code with any phone camera, or restaurants can share the menu link on social media, email, or their website.",
  },
  {
    question: "How much does a digital menu app cost for a restaurant in Pakistan?",
    answer:
      "Digital QR Menue offers a 30-day free trial with full access to all features. Paid plans start from PKR 1,500 per month for the Starter plan. There are no setup fees, no hidden charges, and zero commission on orders. Compared to building a native restaurant app (which costs PKR 200,000–500,000+), a web-based digital menu app is thousands of times more affordable.",
  },
]

export default function DigitalMenuAppPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Digital Menu App for Restaurants — No App Download Needed | Digital QR Menue",
          description:
            "The best digital menu app for restaurants in Pakistan. Customers view your menu in their browser — no app download required. QR code menus with WhatsApp ordering. Free trial.",
          author: { "@type": "Organization", name: "Digital QR Menue" },
          datePublished: "2024-01-15",
          dateModified: "2026-07-21",
          publisher: { "@type": "Organization", name: "Digital QR Menue" },
          mainEntityOfPage: { "@type": "WebPage", "@id": "https://www.digitalmenue.com/digital-menu-app" },
        }}
      />
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://www.digitalmenue.com" },
          { name: "Digital Menu App", url: "https://www.digitalmenue.com/digital-menu-app" },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <div className="min-h-screen bg-white">
        <LandingHeader />

        {/* Hero */}
        <section className="bg-black text-white py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-5 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Digital Menu App for Restaurants
            </h1>
            <p className="text-base md:text-lg text-[#AAA] max-w-2xl mx-auto leading-relaxed">
              A powerful digital menu app that works in your customer&apos;s browser — no download
              required. QR code menus with instant WhatsApp ordering. Built for Pakistani restaurants.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/signup/restaurant"
                className="bg-white text-black px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#E5E5E5] transition-colors"
              >
                Start Your Free Trial
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

        {/* Why No App Download */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Why You Don&apos;t Need a Separate App
              </h2>
              <div className="space-y-5 text-sm md:text-base text-[#555] leading-relaxed">
                <p>
                  Most restaurant owners believe they need a native mobile app from the App Store or Google
                  Play to offer a modern digital ordering experience. That&apos;s no longer true. A{" "}
                  <strong>digital menu app</strong> like Digital QR Menue delivers the same experience —
                  beautiful menus, easy browsing, instant ordering — entirely through the web browser.
                </p>
                <p>
                  This is called a <strong>progressive web approach</strong> or <strong>web-based digital menu app</strong>.
                  Customers scan a QR code, and the menu opens in their browser as a full-screen, app-like
                  experience. No app store, no installation, no storage space taken up on their phone.
                </p>
                <p>
                  For restaurant owners, this means zero app development costs (saving PKR 200,000–500,000+),
                  instant updates (no app review process), and maximum reach (works on every phone with a
                  browser). The <strong>QR menu app</strong> approach is simply smarter for modern restaurants.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              What Makes Our Digital Menu App Different
            </h2>
            <p className="text-sm text-[#555] text-center mb-12 max-w-lg mx-auto">
              Everything you need to serve modern customers who expect speed and convenience.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Works on All Devices",
                  description:
                    "iPhone, Android, tablet, laptop — the digital menu app works perfectly on every screen size. No separate iOS or Android versions needed. One menu, every device.",
                },
                {
                  title: "Zero Installation",
                  description:
                    "Customers scan a QR code and the menu opens instantly in their browser. No app store visit, no download waiting, no storage space required. Instant access every time.",
                },
                {
                  title: "Always Up to Date",
                  description:
                    "Update prices, add new dishes, or remove sold-out items in seconds. Changes go live immediately — no app update submission, no review waiting, no user re-download needed.",
                },
                {
                  title: "WhatsApp Ordering Built In",
                  description:
                    "Every menu item connects to WhatsApp ordering. Customers tap to order, and the message pre-fills in WhatsApp. You receive the order instantly — no third-party app needed.",
                },
                {
                  title: "Beautiful Food Photos",
                  description:
                    "Showcase each dish with high-resolution photos. Digital menus with photos see 30% higher order values. Your menu app looks as good as a premium native app.",
                },
                {
                  title: "No Commission, Ever",
                  description:
                    "Unlike delivery platforms that take 25–35% of every order, a digital menu app sends orders directly to you. Keep 100% of every sale. Flat monthly fee, zero commission.",
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

        {/* Web App vs Native App Comparison */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Digital Menu App vs Native Restaurant App
            </h2>
            <p className="text-sm text-[#555] mb-8 max-w-xl">
              See why a web-based QR menu app beats a native restaurant app for most Pakistani restaurants.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E0E0E0]">
                    <th className="text-left py-3 font-semibold">Feature</th>
                    <th className="text-left py-3 font-semibold text-green-600">Digital QR Menue (Web App)</th>
                    <th className="text-left py-3 font-semibold text-[#999]">Native Mobile App</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {[
                    { feature: "Customer installation", web: "None — opens in browser", native: "Must download from App Store / Play Store" },
                    { feature: "Setup cost", web: "PKR 0 (free trial) then PKR 1,500/mo", native: "PKR 200,000 – 500,000+ development cost" },
                    { feature: "Update speed", web: "Instant — changes live in seconds", native: "1–7 days (app review process)" },
                    { feature: "Device compatibility", web: "Every device with a browser", native: "Separate iOS + Android versions needed" },
                    { feature: "Customer reach", web: "Anyone with a camera/QR scanner", native: "Only users who download the app" },
                    { feature: "Ongoing maintenance", web: "None — hosted and managed for you", native: "PKR 50,000–100,000/year for updates & hosting" },
                    { feature: "Storage on phone", web: "Zero — nothing installed", native: "50–200 MB per app" },
                    { feature: "Offline access", web: "Works on mobile data or WiFi", native: "Works offline (after initial download)" },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 font-medium text-black pr-4">{row.feature}</td>
                      <td className="py-3 text-green-600 font-medium pr-4">{row.web}</td>
                      <td className="py-3 text-[#999]">{row.native}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Customer Experience Flow */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              What Your Customers Experience
            </h2>
            <p className="text-sm text-[#555] text-center mb-12 max-w-lg mx-auto">
              From scanning the QR code to placing an order — it takes under 10 seconds.
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Scan QR Code", desc: "Customer points their phone camera at the QR code on your table or counter." },
                { step: "2", title: "Browse Menu", desc: "The digital menu app opens instantly in their browser. Beautiful photos, clear prices." },
                { step: "3", title: "Add to Cart", desc: "Customers select dishes, choose quantities, and review their cart." },
                { step: "4", title: "Order via WhatsApp", desc: "One tap opens WhatsApp with the order pre-filled. They send, you receive." },
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

        {/* Why Restaurants Choose Web-Based */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Why Pakistani Restaurants Choose a Web-Based Digital Menu App
            </h2>
            <div className="space-y-5 text-sm md:text-base text-[#555] leading-relaxed">
              <p>
                The restaurant industry in Pakistan is rapidly moving away from native apps and towards
                <strong> web-based digital menu apps</strong>. Here&apos;s why restaurant owners are making the switch:
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold shrink-0">✓</span>
                  <span><strong>Cost savings:</strong> A web-based digital menu app costs PKR 1,500/month compared to PKR 200,000+ for a native app. That&apos;s over 99% cheaper.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold shrink-0">✓</span>
                  <span><strong>Faster updates:</strong> Change prices or add dishes instantly. No app store review, no waiting days for approval.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold shrink-0">✓</span>
                  <span><strong>No app fatigue:</strong> Pakistani smartphone users already have too many apps. A QR menu app requires zero downloads — customers just scan and order.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold shrink-0">✓</span>
                  <span><strong>Larger reach:</strong> A native app only reaches customers willing to download it. A web-based digital menu app reaches every customer with a phone camera.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold shrink-0">✓</span>
                  <span><strong>WhatsApp integration:</strong> Over 50 million Pakistanis use WhatsApp. Our digital menu app connects directly to WhatsApp for seamless ordering.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
              Frequently Asked Questions About Digital Menu Apps
            </h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-md mx-auto">
              Everything you need to know about digital menu apps for restaurants.
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
        <section className="py-16 md:py-24 bg-black text-white">
          <div className="max-w-2xl mx-auto px-5 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Start Your Digital Menu App Today
            </h2>
            <p className="text-sm text-[#AAA] mb-8 max-w-md mx-auto">
              No app development needed. No credit card required. Join thousands of Pakistani restaurants
              using Digital QR Menue to serve customers faster and keep 100% of their revenue.
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
            <p className="text-xs text-[#666] mt-3">30-day free trial • Full access • Cancel anytime</p>
          </div>
        </section>
      </div>
    </>
  )
}
