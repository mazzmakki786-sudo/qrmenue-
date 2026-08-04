import type { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { JsonLd, BreadcrumbListJsonLd, FaqJsonLd, SpeakableJsonLd } from "@/components/JsonLd"

export const metadata: Metadata = {
  title: "Digital Menu Tablet for Restaurants — iPad & Tablet Menu System | Digital QR Menue",
  description:
    "Create a digital menu for tablets and iPads in your restaurant. Display your menu on tablets, customers browse and order. No app needed. Free trial available in Pakistan.",
  alternates: {
    canonical: "https://www.digitalmenue.com/digital-menu-tablet",
  },
  openGraph: {
    title: "Digital Menu Tablet for Restaurants — iPad & Tablet Menu System",
    description: "Create a digital menu for tablets and iPads in your restaurant. Display on tablets, customers browse and order. No app needed.",
    url: "https://www.digitalmenue.com/digital-menu-tablet",
  },
}

export const revalidate = 3600

const faqs = [
  {
    question: "What is a digital menu tablet system?",
    answer: "A digital menu tablet system uses tablets or iPads placed on restaurant tables to display your menu. Customers browse dishes, view photos, and place orders directly through the tablet interface. With Digital QR Menue, the menu opens in the browser — no app installation needed on the tablet.",
  },
  {
    question: "Do I need special hardware for a tablet menu?",
    answer: "Any tablet or iPad with a web browser works. You can use existing tablets you already own, or purchase dedicated tablets. Simply open your digital menu URL in the browser and set the tablet to kiosk mode for a full-screen menu experience.",
  },
  {
    question: "Is a tablet menu better than a QR code menu?",
    answer: "Tablet menus offer a premium experience for fine dining restaurants and are always visible on the table. QR code menus are more affordable (no hardware cost) and work with customers' own phones. Many restaurants use both: table QR codes plus a few tablets for walk-in guests.",
  },
  {
    question: "Can customers order directly from the tablet?",
    answer: "Yes. Customers browse the menu on the tablet, select dishes, and place orders. Orders are sent directly to your WhatsApp or restaurant dashboard. No waiter needed for the ordering process.",
  },
  {
    question: "How much does a tablet menu system cost?",
    answer: "The Digital QR Menue software starts at PKR 0 (free trial) and PKR 1,500/month for the Starter plan. You'll need to provide your own tablets. This is significantly cheaper than dedicated tablet menu systems that require expensive proprietary hardware.",
  },
  {
    question: "What tablets are best for restaurant menus?",
    answer: "Any iPad (iPad mini, iPad, iPad Air) or Android tablet (Samsung Galaxy Tab, Lenovo Tab) with a modern web browser works well. For best results, use tablets with screens 8 inches or larger. Budget tablets from PKR 15,000–25,000 work perfectly for menu display.",
  },
  {
    question: "How do I set up kiosk mode on a tablet for menu display?",
    answer: "On iPad: Use Guided Access (Settings > Accessibility > Guided Access) to lock the tablet to the menu browser tab. On Android: Use Screen Pinning (Settings > Security > Screen Pinning) or install a free kiosk mode app. This prevents customers from exiting the menu.",
  },
]

export default function DigitalMenuTabletPage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Digital Menu Tablet for Restaurants — iPad & Tablet Menu System",
        description: "Create a digital menu for tablets and iPads in your restaurant. Customers browse and order directly.",
        author: { "@type": "Organization", name: "Digital QR Menue" },
        datePublished: "2024-01-15",
        dateModified: "2026-07-21",
        publisher: { "@type": "Organization", name: "Digital QR Menue" },
        mainEntityOfPage: { "@type": "WebPage", "@id": "https://www.digitalmenue.com/digital-menu-tablet" },
      }} />
      <BreadcrumbListJsonLd items={[
        { name: "Home", url: "https://www.digitalmenue.com" },
        { name: "Digital Menu Tablet", url: "https://www.digitalmenue.com/digital-menu-tablet" },
      ]} />
      <FaqJsonLd faqs={faqs} />
      <SpeakableJsonLd
        cssSelector={[".speakable-hero", ".speakable-summary"]}
        url="https://www.digitalmenue.com/digital-menu-tablet"
      />
      <div className="min-h-screen bg-white">
        <LandingHeader />
        <section className="bg-black text-white py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-5 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">Digital Menu Tablet for Restaurants</h1>
            <p className="speakable-hero text-base md:text-lg text-[#AAA] max-w-2xl mx-auto leading-relaxed">
              Turn any tablet or iPad into an interactive digital menu. Customers browse, view photos, and
              order directly. Perfect for fine dining, cafes, and fast-casual restaurants in Pakistan.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <Link href="/signup/restaurant" className="bg-white text-black px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#E5E5E5] transition-colors">
                Start Free Trial
              </Link>
              <Link href="/pricing" className="px-6 py-3.5 rounded-xl border border-[#333] text-sm font-medium text-white hover:bg-[#1A1A1A] transition-colors">
                View Pricing
              </Link>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Why Use a Tablet for Your Digital Menu?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "Premium Dining Experience", desc: "Tablets on every table create a modern, high-end impression that impresses guests and sets you apart from competitors." },
                { title: "Always Visible", desc: "Unlike QR codes that customers need to notice and scan, tablets are right there on the table — impossible to miss." },
                { title: "Beautiful Photo Display", desc: "Tablets showcase your dishes in stunning full color. Larger screens mean more appetizing food presentation." },
                { title: "Multi-Language Support", desc: "Switch between English, Urdu, and other languages instantly. Perfect for restaurants serving tourists and locals." },
                { title: "Easy to Update", desc: "Change prices, add new dishes, or update photos from your phone. All tablets display the updated menu immediately." },
                { title: "No App Download", desc: "The menu runs in the tablet's browser. No app installation, no updates, no compatibility issues." },
              ].map((item, i) => (
                <div key={i} className="p-5 border border-[#F0F0F0] rounded-2xl">
                  <h3 className="font-semibold text-sm mb-2">{item.title}</h3>
                  <p className="text-xs text-[#555]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">How to Set Up a Tablet Menu</h2>
            <div className="space-y-4">
              {[
                { num: "1", title: "Sign Up for Digital QR Menue", desc: "Create your free account. No credit card needed for the 30-day trial." },
                { num: "2", title: "Build Your Digital Menu", desc: "Add your dishes, prices, photos, and categories. Everything syncs automatically." },
                { num: "3", title: "Open on Tablet", desc: "Open your menu URL on any tablet or iPad browser. Set to full-screen or kiosk mode for best results." },
                { num: "4", title: "Start Serving", desc: "Place tablets on tables or mount them on stands. Customers browse and order directly." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start p-4 bg-white rounded-xl border border-[#F0F0F0]">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">{item.num}</div>
                  <div>
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <p className="text-xs text-[#555]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Tablet vs QR Code Comparison */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Tablet Menu vs QR Code Menu
            </h2>
            <p className="text-sm text-[#555] mb-8 max-w-xl">
              Both are digital menu solutions. Here&apos;s how they compare for different restaurant types.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E0E0E0]">
                    <th className="text-left py-3 font-semibold">Feature</th>
                    <th className="text-left py-3 font-semibold">Tablet Menu</th>
                    <th className="text-left py-3 font-semibold">QR Code Menu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {[
                    { feature: "Hardware cost", tablet: "PKR 15,000–40,000 per tablet", qr: "Free — customers use their own phone" },
                    { feature: "Setup time", tablet: "15–30 minutes per tablet", qr: "5 minutes total" },
                    { feature: "Best for", tablet: "Fine dining, upscale cafes", qr: "All restaurant types" },
                    { feature: "Visibility", tablet: "Always on the table — impossible to miss", qr: "Customer must notice and scan the code" },
                    { feature: "Photo quality", tablet: "Larger screen = bigger, more appetizing photos", qr: "Full-screen photos on customer's phone" },
                    { feature: "Maintenance", tablet: "Need to charge, clean, and replace if damaged", qr: "Zero maintenance — code never changes" },
                    { feature: "Customer experience", tablet: "Premium, high-tech impression", qr: "Familiar, works on every phone" },
                    { feature: "Multi-table scaling", tablet: "Buy one tablet per table", qr: "Print one QR code per table — zero marginal cost" },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 font-medium text-black pr-4">{row.feature}</td>
                      <td className="py-3 text-[#555] pr-4">{row.tablet}</td>
                      <td className="py-3 text-green-600 font-medium">{row.qr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Customer Experience */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Customer Experience on a Tablet Menu
            </h2>
            <p className="text-sm text-[#555] text-center mb-12 max-w-lg mx-auto">
              From sitting down to placing an order — the tablet menu flow.
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "See the Tablet", desc: "Customer sits down and sees the tablet already on the table, displaying the restaurant's menu." },
                { step: "2", title: "Browse & Scroll", desc: "Swipe through categories, tap items to see photos and descriptions. Larger screen makes browsing effortless." },
                { step: "3", title: "Select Dishes", desc: "Tap to add items to the order. Choose quantities and any customizations." },
                { step: "4", title: "Place Order", desc: "Tap the order button. The order is sent to the restaurant via WhatsApp or the restaurant dashboard." },
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

        {/* Use Cases */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Best Restaurants for Tablet Menus
            </h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-lg mx-auto">
              Tablet menus shine in specific restaurant environments.
            </p>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  title: "Fine Dining",
                  desc: "Upscale restaurants where presentation matters. Tablets on every table create a premium, modern impression that matches the dining experience.",
                },
                {
                  title: "Hotels & Resorts",
                  desc: "Room service and in-room dining via tablets. Guests browse the menu from their room and order without calling. High-end experience for hospitality.",
                },
                {
                  title: "Cafes & Bakeries",
                  desc: "Tablets on counter displays let customers browse the full menu while waiting. Great for bakeries with many items that need photos to sell.",
                },
              ].map((item, i) => (
                <div key={i} className="p-6 bg-[#F9FAFB] rounded-2xl border border-[#F0F0F0]">
                  <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                  <p className="text-sm text-[#555] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Frequently Asked Questions</h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-md mx-auto">Common questions about tablet digital menus.</p>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="group p-4 md:p-5 bg-white rounded-xl border border-[#F0F0F0] open:shadow-sm">
                  <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                    {faq.question}
                    <span className="text-[#999] text-lg group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <p className="text-sm text-[#555] leading-relaxed mt-3 pt-3 border-t border-[#F0F0F0]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section className="py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-5 text-center">
            <h2 className="text-lg font-bold mb-4">Explore More Digital Menu Solutions</h2>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link href="/digital-menu-for-restaurants" className="px-4 py-2 rounded-full bg-[#F5F5F5] text-sm font-medium hover:bg-black hover:text-white transition-colors">
                Digital Menu for Restaurants
              </Link>
              <Link href="/digital-menu-app" className="px-4 py-2 rounded-full bg-[#F5F5F5] text-sm font-medium hover:bg-black hover:text-white transition-colors">
                Digital Menu App
              </Link>
              <Link href="/digital-menu-pdf" className="px-4 py-2 rounded-full bg-[#F5F5F5] text-sm font-medium hover:bg-black hover:text-white transition-colors">
                PDF to QR Menu
              </Link>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24 bg-black text-white">
          <div className="max-w-2xl mx-auto px-5 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Start Your Tablet Menu Today</h2>
            <p className="text-sm text-[#AAA] mb-8">Free 30-day trial. No credit card needed. Works on any tablet or iPad.</p>
            <Link href="/signup/restaurant" className="inline-block bg-white text-black px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#E5E5E5] transition-colors">
              Start Free Trial →
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
