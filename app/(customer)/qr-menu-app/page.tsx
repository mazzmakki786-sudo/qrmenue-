import type { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { JsonLd, BreadcrumbListJsonLd, FaqJsonLd } from "@/components/JsonLd"

export const metadata: Metadata = {
  title: "QR Menu App for Restaurants — Scan & Order via WhatsApp | Digital QR Menue",
  description:
    "The easiest QR menu app for restaurants in Pakistan. Customers scan the QR code, view your menu, and order via WhatsApp. No app download needed. Free trial available.",
  alternates: {
    canonical: "https://www.digitalmenue.com/qr-menu-app",
  },
  openGraph: {
    title: "QR Menu App for Restaurants — Scan & Order via WhatsApp",
    description:
      "The easiest QR menu app for restaurants. Customers scan the QR code, view your menu, and order via WhatsApp. No app download.",
    url: "https://www.digitalmenue.com/qr-menu-app",
  },
}

export const revalidate = 3600

const faqs = [
  {
    question: "What is a QR menu app?",
    answer: "A QR menu app lets restaurants create a digital menu that customers access by scanning a QR code. Unlike traditional apps that require installation, Digital QR Menue works through any phone browser — no download needed. Customers scan, browse, and order via WhatsApp in seconds.",
  },
  {
    question: "Does Digital QR Menue have a mobile app?",
    answer: "Digital QR Menue is a web-based platform that works like an app on any device. Customers access your menu through their phone browser — no app store download required. Restaurant owners can manage everything through the web dashboard on any device.",
  },
  {
    question: "Can customers order through the QR menu app?",
    answer: "Yes. Customers browse your digital menu, select dishes, add them to cart, and place orders directly through WhatsApp. The order arrives on your phone instantly with all details.",
  },
  {
    question: "Do customers need to create an account to order?",
    answer: "No. Customers simply scan the QR code, browse the menu, and order. No account creation, no login, no personal information required. Just scan, select, and order.",
  },
  {
    question: "Is there a monthly fee for the QR menu app?",
    answer: "Digital QR Menue offers a 30-day free trial with full access. After the trial, paid plans start from PKR 1,500 per month. There are no transaction fees, no commission on orders, and no hidden charges.",
  },
]

export default function QrMenuAppPage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "QR Menu App for Restaurants — Scan & Order via WhatsApp",
        description: "The easiest QR menu app for restaurants. Customers scan, view your menu, and order via WhatsApp.",
        author: { "@type": "Organization", name: "Digital QR Menue" },
        datePublished: "2024-01-15",
        dateModified: "2026-07-21",
        publisher: { "@type": "Organization", name: "Digital QR Menue" },
        mainEntityOfPage: { "@type": "WebPage", "@id": "https://www.digitalmenue.com/qr-menu-app" },
      }} />
      <BreadcrumbListJsonLd items={[
        { name: "Home", url: "https://www.digitalmenue.com" },
        { name: "QR Menu App", url: "https://www.digitalmenue.com/qr-menu-app" },
      ]} />
      <FaqJsonLd faqs={faqs} />
      <div className="min-h-screen bg-white">
        <LandingHeader />
        <section className="bg-black text-white py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-5 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">QR Menu App for Restaurants</h1>
            <p className="text-base md:text-lg text-[#AAA] max-w-2xl mx-auto leading-relaxed">
              The simplest QR menu app for Pakistani restaurants. Customers scan a QR code, view your complete
              digital menu with photos, and order directly on WhatsApp. No app download required.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <Link href="/signup/restaurant" className="bg-white text-black px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#E5E5E5] transition-colors">
                Create Your QR Menu
              </Link>
              <Link href="/pricing" className="px-6 py-3.5 rounded-xl border border-[#333] text-sm font-medium text-white hover:bg-[#1A1A1A] transition-colors">
                View Plans
              </Link>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Why Choose a QR Menu App?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "No App Download Needed", desc: "Customers use their phone camera and browser. Nothing to install, no storage space needed, no account to create." },
                { title: "Works on All Phones", desc: "Whether iPhone, Android, or any smartphone — the QR menu works on every device. No compatibility issues." },
                { title: "Instant Setup", desc: "Create your QR menu in under 5 minutes. No technical skills, no coding, no developer needed." },
                { title: "Zero Commission", desc: "Unlike Foodpanda and other delivery apps that charge 25-35%, you keep 100% of every order." },
                { title: "Real-Time Updates", desc: "Update prices, add dishes, or change photos from your phone. Changes appear instantly on the menu." },
                { title: "WhatsApp Integration", desc: "Over 50 million Pakistanis use WhatsApp daily. Orders come directly to your WhatsApp — familiar and instant." },
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
            <h2 className="text-2xl md:text-3xl font-bold mb-6">How the QR Menu App Works</h2>
            <div className="space-y-4">
              {[
                { num: "1", title: "Restaurant Creates Menu", desc: "You add your dishes, prices, and photos to the Digital QR Menue dashboard." },
                { num: "2", title: "QR Code is Generated", desc: "A unique QR code is created for your restaurant. Download and print it." },
                { num: "3", title: "Customer Scans Code", desc: "Using any phone camera, customers scan the QR code at their table." },
                { num: "4", title: "Menu Opens in Browser", desc: "Your full digital menu with photos and prices appears instantly." },
                { num: "5", title: "Order via WhatsApp", desc: "Customers select dishes and order with one tap. You receive it on WhatsApp." },
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
        <section className="py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Frequently Asked Questions</h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-md mx-auto">Common questions about the QR menu app.</p>
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
        <section className="py-16 md:py-24 bg-black text-white">
          <div className="max-w-2xl mx-auto px-5 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Create Your QR Menu App Today</h2>
            <p className="text-sm text-[#AAA] mb-8">Free 30-day trial. No credit card required. No app download for your customers.</p>
            <Link href="/signup/restaurant" className="inline-block bg-white text-black px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#E5E5E5] transition-colors">
              Get Started Free →
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
