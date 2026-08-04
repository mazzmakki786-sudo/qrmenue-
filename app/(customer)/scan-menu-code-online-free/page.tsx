import type { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { JsonLd, BreadcrumbListJsonLd, FaqJsonLd } from "@/components/JsonLd"

export const metadata: Metadata = {
  title: "Scan Menu Code Online Free — Free QR Menu Scanner for Restaurants",
  description:
    "Scan restaurant menu codes online for free. No app download needed. Point your phone camera at any QR code to view menus instantly. Free for all customers. Works on iPhone and Android.",
  alternates: {
    canonical: "https://www.digitalmenue.com/scan-menu-code-online-free",
  },
  openGraph: {
    title: "Scan Menu Code Online Free — Free QR Menu Scanner",
    description:
      "Scan restaurant menu codes online for free. No app download needed. Point your phone camera at any QR code to view menus instantly.",
    url: "https://www.digitalmenue.com/scan-menu-code-online-free",
  },
}

export const revalidate = 3600

const faqs = [
  {
    question: "How do I scan a restaurant QR code for free?",
    answer:
      "Simply open your phone's camera app (iPhone or Android), point it at the QR code on the restaurant table or menu, and tap the notification that appears. The menu opens instantly in your browser — no app download, no signup, and completely free.",
  },
  {
    question: "Do I need a QR code scanner app to view restaurant menus?",
    answer:
      "No. Modern iPhones (iOS 11+) and Android phones (Android 9+) have built-in QR code scanning in the default camera app. You do not need to download any third-party QR scanner app. Just use your phone's camera.",
  },
  {
    question: "What is a QR menu code?",
    answer:
      "A QR menu code is a square barcode that restaurants print on tables, walls, or counters. When you scan it with your phone camera, it opens the restaurant's digital menu in your web browser. You can browse dishes, view photos, check prices, and sometimes order directly through WhatsApp.",
  },
  {
    question: "Does scanning a restaurant QR code cost money?",
    answer:
      "Scanning a restaurant QR code is completely free for customers. There is no charge, no subscription, and no hidden fee. The restaurant pays a small monthly fee for the digital menu service, but scanning is always free.",
  },
  {
    question: "What if the QR code doesn't scan?",
    answer:
      "If the QR code doesn't scan, try these steps: 1) Make sure your phone camera is focused on the code. 2) Hold your phone steady for 2-3 seconds. 3) Ensure you have good lighting. 4) Try moving your phone slightly closer or further away. 5) Ask the restaurant staff for a menu link instead — they can share it via WhatsApp.",
  },
  {
    question: "Can I scan a restaurant QR code without internet?",
    answer:
      "No. You need an internet connection (WiFi or mobile data) to view the digital menu after scanning. The QR code itself is just a link — your phone needs internet to open that link and load the menu page.",
  },
]

export default function ScanMenuCodeOnlineFreePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Scan Menu Code Online Free — Free QR Menu Scanner for Restaurants",
          description:
            "Scan restaurant menu codes online for free. No app download needed. Point your phone camera at any QR code to view menus instantly.",
          author: { "@type": "Organization", name: "Digital QR Menue" },
          datePublished: "2026-08-04",
          dateModified: "2026-08-04",
          publisher: { "@type": "Organization", name: "Digital QR Menue" },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://www.digitalmenue.com/scan-menu-code-online-free",
          },
        }}
      />
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://www.digitalmenue.com" },
          {
            name: "Scan Menu Code Online Free",
            url: "https://www.digitalmenue.com/scan-menu-code-online-free",
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
              Scan Restaurant Menu Code Online — Free
            </h1>
            <p className="text-base md:text-lg text-[#AAA] max-w-2xl mx-auto leading-relaxed">
              No app download. No signup. Just point your phone camera at any QR code and view the
              restaurant menu instantly. Works on every iPhone and Android phone.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/menu"
                className="bg-white text-black px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#E5E5E5] transition-colors"
              >
                Browse Demo Menu
              </Link>
              <Link
                href="/signup/restaurant"
                className="px-6 py-3.5 rounded-xl border border-[#333] text-sm font-medium text-white hover:bg-[#1A1A1A] transition-colors"
              >
                Create Free QR Menu
              </Link>
            </div>
            <p className="text-xs text-[#666] mt-3">
              100% free for customers • No app needed • Works on all phones
            </p>
          </div>
        </section>

        {/* How to Scan */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              How to Scan a Restaurant QR Menu Code
            </h2>
            <p className="text-sm text-[#555] text-center mb-12 max-w-lg mx-auto">
              Scanning a restaurant QR code takes 3 seconds. Here&apos;s exactly how to do it.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: "1",
                  title: "Open Your Phone Camera",
                  desc: "Unlock your phone and open the default camera app. On iPhone, just swipe left from the lock screen. On Android, tap the camera icon.",
                },
                {
                  step: "2",
                  title: "Point at the QR Code",
                  desc: "Point your camera at the QR code on the table, wall, or menu card. Hold it steady for 1-2 seconds. The code should be fully visible in the camera frame.",
                },
                {
                  step: "3",
                  title: "Tap the Notification",
                  desc: "A yellow notification banner appears on iPhone. On Android, a popup appears. Tap it and the restaurant menu opens instantly in your browser.",
                },
              ].map((item, i) => (
                <div key={i} className="text-center p-6">
                  <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                  <p className="text-sm text-[#555] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why No App Needed */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Why You Don&apos;t Need a QR Scanner App
              </h2>
              <div className="space-y-5 text-sm md:text-base text-[#555] leading-relaxed">
                <p>
                  Many people still think they need to download a QR code scanner app from the App Store
                  or Google Play. That was true five years ago, but not anymore. Modern smartphones have
                  built-in QR code scanning right in the default camera app.
                </p>
                <p>
                  <strong>iPhone users:</strong> Since iOS 11 (2017), the iPhone camera automatically
                  detects QR codes. Just open the camera, point at the code, and tap the notification
                  banner. Safari opens the menu link instantly.
                </p>
                <p>
                  <strong>Android users:</strong> Since Android 9 (2018), most Android phones (Samsung,
                  Xiaomi, Huawei, Oppo, Vivo) detect QR codes in the default camera app. Some older
                  phones may need Google Lens (built into the Google app) to scan.
                </p>
                <p>
                  <strong>In summary:</strong> If your phone was made after 2018, you can scan QR codes
                  with your camera. No app download, no extra storage, no hassle. This is why QR menus
                  have become the standard for restaurants worldwide.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Happens After Scanning */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              What Happens After You Scan a Restaurant QR Code
            </h2>
            <p className="text-sm text-[#555] text-center mb-12 max-w-lg mx-auto">
              A step-by-step look at the full experience from scan to order.
            </p>
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { step: "1", title: "Scan Code", desc: "Point camera at QR code on table or counter." },
                { step: "2", title: "View Menu", desc: "Digital menu opens in browser with photos, prices, and descriptions." },
                { step: "3", title: "Choose Dishes", desc: "Browse categories, tap items to see details, add to your order." },
                { step: "4", title: "Place Order", desc: "Tap the order button. Your order goes directly to the restaurant via WhatsApp." },
                { step: "5", title: "Receive Food", desc: "The restaurant prepares your order. No waiting for a waiter to take your order." },
              ].map((item, i) => (
                <div key={i} className="text-center p-3">
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold mx-auto mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-[#555] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits for Customers */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Benefits of Scanning QR Menu Codes
            </h2>
            <p className="text-sm text-[#555] text-center mb-12 max-w-lg mx-auto">
              QR menus make dining out faster, easier, and more convenient for you.
            </p>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                {
                  title: "No App Download Required",
                  desc: "Just use your phone's camera. No storage space used, no app to update, no account to create.",
                },
                {
                  title: "Browse at Your Own Pace",
                  desc: "No pressure from waiters standing nearby. Take your time browsing photos, reading descriptions, and deciding what to order.",
                },
                {
                  title: "See Photos Before Ordering",
                  desc: "Digital menus show high-quality photos of every dish. You know exactly what you're getting before you order.",
                },
                {
                  title: "Order Directly via WhatsApp",
                  desc: "Many restaurants let you order through WhatsApp right from the menu. No need to flag down a waiter or wait in line.",
                },
                {
                  title: "Always Up-to-Date Prices",
                  desc: "Digital menus show current prices. No surprises when the bill arrives. Restaurants update prices in real-time.",
                },
                {
                  title: "Works in Any Language",
                  desc: "Many digital menus support multiple languages. Switch between English, Urdu, or other languages with one tap.",
                },
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white rounded-2xl border border-[#F0F0F0]">
                  <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                  <p className="text-sm text-[#555] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              QR Code Not Scanning? Troubleshooting Guide
            </h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-md mx-auto">
              If the restaurant QR code isn&apos;t working, try these solutions.
            </p>
            <div className="space-y-3">
              {[
                {
                  problem: "Camera doesn't detect the QR code",
                  solution:
                    "Make sure the QR code is fully visible in the camera frame. Hold your phone 6-12 inches away from the code. Ensure the code is well-lit and not in shadow.",
                },
                {
                  problem: "Notification doesn't appear",
                  solution:
                    "On iPhone: Go to Settings > Camera and make sure 'Scan QR Codes' is enabled. On Android: Try using Google Lens (tap the Google Lens icon in the Google app or camera).",
                },
                {
                  problem: "Menu page doesn't load",
                  solution:
                    "Check your internet connection (WiFi or mobile data). The QR code is just a link — you need internet to load the menu page. Try switching between WiFi and mobile data.",
                },
                {
                  problem: "QR code is damaged or unreadable",
                  solution:
                    "Ask the restaurant staff for a menu link. Most restaurants can share the menu URL via WhatsApp or show it on their phone. You can also try scanning from a different angle.",
                },
                {
                  problem: "Menu appears in wrong language",
                  solution:
                    "Look for a language toggle button (usually a flag icon or 'EN/UR' button) at the top of the menu page. Tap it to switch languages.",
                },
              ].map((item, i) => (
                <div key={i} className="p-4 md:p-5 bg-white rounded-xl border border-[#F0F0F0]">
                  <h3 className="font-semibold text-sm text-red-600 mb-1">{item.problem}</h3>
                  <p className="text-sm text-[#555] leading-relaxed">{item.solution}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Restaurant Owners */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Are You a Restaurant Owner?
              </h2>
              <p className="text-sm text-[#555] mb-8 max-w-lg mx-auto">
                Create your own free QR menu code in 5 minutes. Customers scan your code and order
                directly via WhatsApp. Zero commission. Free 30-day trial.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href="/signup/restaurant"
                  className="bg-black text-white px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#1A1A1A] transition-colors"
                >
                  Create Free QR Menu
                </Link>
                <Link
                  href="/pricing"
                  className="px-6 py-3.5 rounded-xl border border-[#E0E0E0] text-sm font-medium text-[#333] hover:bg-[#F5F5F5] transition-colors"
                >
                  View Pricing
                </Link>
              </div>
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
              Everything you need to know about scanning restaurant QR menu codes.
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
              Want to Create Your Own QR Menu?
            </h2>
            <p className="text-sm text-[#AAA] mb-8 max-w-md mx-auto">
              Join thousands of restaurants using Digital QR Menue. Free 30-day trial. No credit card needed.
              Customers scan your QR code and order via WhatsApp — zero commission.
            </p>
            <Link
              href="/signup/restaurant"
              className="inline-block bg-white text-black px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#E5E5E5] transition-colors"
            >
              Start Free Trial →
            </Link>
            <p className="text-xs text-[#666] mt-3">Free 30-day trial • Full access • No credit card required</p>
          </div>
        </section>
      </div>
    </>
  )
}
