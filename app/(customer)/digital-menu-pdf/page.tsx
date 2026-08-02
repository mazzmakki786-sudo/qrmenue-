import type { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { JsonLd, BreadcrumbListJsonLd, FaqJsonLd } from "@/components/JsonLd"

export const metadata: Metadata = {
  title: "Digital Menu PDF — Convert Your PDF Menu to QR Code | Digital QR Menue",
  description:
    "Convert your restaurant's PDF menu into a digital QR code menu. Upload your PDF and get a scannable QR code. Customers view your menu on their phone. Free trial in Pakistan.",
  alternates: {
    canonical: "https://www.digitalmenue.com/digital-menu-pdf",
  },
  openGraph: {
    title: "Digital Menu PDF — Convert Your PDF Menu to QR Code",
    description: "Convert your restaurant's PDF menu into a digital QR code menu. Upload your PDF and get a scannable QR code. Free trial.",
    url: "https://www.digitalmenue.com/digital-menu-pdf",
  },
}

export const revalidate = 3600

const faqs = [
  {
    question: "Can I convert my existing PDF menu to a digital QR menu?",
    answer: "Yes. Digital QR Menue lets you either upload your PDF to display it digitally, or use it as a reference to build an interactive menu with photos, prices, and WhatsApp ordering. The interactive option is recommended as it gives customers a better experience.",
  },
  {
    question: "Is a PDF digital menu the same as an interactive QR menu?",
    answer: "No. A PDF digital menu is a static document displayed on screen — customers can read it but can't order from it directly. An interactive QR menu lets customers browse by category, view photos, and order via WhatsApp. We recommend interactive menus for better conversion.",
  },
  {
    question: "How do I upload my PDF menu?",
    answer: "After signing up for Digital QR Menue, you can upload your PDF menu from the dashboard. Our system will help you convert it into an interactive digital menu with clickable items and order buttons.",
  },
  {
    question: "Will my PDF menu look good on phones?",
    answer: "Standard PDFs often don't display well on small phone screens. That's why we recommend converting your PDF into our responsive digital menu format that automatically adjusts to any screen size for the best customer experience.",
  },
]

export default function DigitalMenuPdfPage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Digital Menu PDF — Convert Your PDF Menu to QR Code",
        description: "Convert your restaurant's PDF menu into a digital QR code menu.",
        author: { "@type": "Organization", name: "Digital QR Menue" },
        datePublished: "2024-01-15",
        dateModified: "2026-07-21",
        publisher: { "@type": "Organization", name: "Digital QR Menue" },
        mainEntityOfPage: { "@type": "WebPage", "@id": "https://www.digitalmenue.com/digital-menu-pdf" },
      }} />
      <BreadcrumbListJsonLd items={[
        { name: "Home", url: "https://www.digitalmenue.com" },
        { name: "Digital Menu PDF", url: "https://www.digitalmenue.com/digital-menu-pdf" },
      ]} />
      <FaqJsonLd faqs={faqs} />
      <div className="min-h-screen bg-white">
        <LandingHeader />
        <section className="bg-black text-white py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-5 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">Digital Menu PDF — Convert to QR Menu</h1>
            <p className="text-base md:text-lg text-[#AAA] max-w-2xl mx-auto leading-relaxed">
              Turn your existing PDF menu into an interactive digital QR code menu. Upload your PDF,
              add photos and prices, and let customers browse and order from their phones.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <Link href="/signup/restaurant" className="bg-white text-black px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#E5E5E5] transition-colors">
                Convert Your PDF Menu
              </Link>
              <Link href="/pricing" className="px-6 py-3.5 rounded-xl border border-[#333] text-sm font-medium text-white hover:bg-[#1A1A1A] transition-colors">
                View Plans
              </Link>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">From PDF to Interactive Digital Menu</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "Upload Your PDF", desc: "Upload your existing PDF menu. We'll help you convert it into an interactive format." },
                { title: "Add Photos & Prices", desc: "Enhance your menu with dish photos, updated prices, and descriptions." },
                { title: "Generate QR Code", desc: "Get a unique QR code that links to your interactive digital menu." },
                { title: "Start Receiving Orders", desc: "Customers view your menu and order directly via WhatsApp." },
              ].map((item, i) => (
                <div key={i} className="p-5 bg-[#F9FAFB] rounded-2xl">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-[#555]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">PDF Menu vs Interactive Digital Menu</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E0E0E0]">
                    <th className="text-left py-3 font-semibold">Feature</th>
                    <th className="text-left py-3 font-semibold">PDF Menu</th>
                    <th className="text-left py-3 font-semibold text-green-600">Interactive QR Menu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {[
                    { feature: "View on phone", pdf: "Hard to read (zooming needed)", digital: "Perfect fit, auto-adjusted" },
                    { feature: "Photos", pdf: "Limited (file size)", digital: "HD photos per dish" },
                    { feature: "Ordering", pdf: "Manual (customer calls)", digital: "1-tap WhatsApp order" },
                    { feature: "Price updates", pdf: "Re-export and re-upload", digital: "Instant from dashboard" },
                    { feature: "Categories", pdf: "Linear list only", digital: "Browse by category" },
                    { feature: "Search", pdf: "No", digital: "Search dishes instantly" },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 font-medium">{row.feature}</td>
                      <td className="py-3 text-[#999]">{row.pdf}</td>
                      <td className="py-3 text-green-600 font-medium">{row.digital}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Frequently Asked Questions</h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-md mx-auto">Common questions about converting PDF menus to digital QR menus.</p>
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
              <Link href="/digital-menu-tablet" className="px-4 py-2 rounded-full bg-[#F5F5F5] text-sm font-medium hover:bg-black hover:text-white transition-colors">
                Tablet Menu
              </Link>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24 bg-black text-white">
          <div className="max-w-2xl mx-auto px-5 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Convert Your PDF Menu Today</h2>
            <p className="text-sm text-[#AAA] mb-8">Upload your PDF and get an interactive digital menu with QR code. Free trial available.</p>
            <Link href="/signup/restaurant" className="inline-block bg-white text-black px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#E5E5E5] transition-colors">
              Start Free Trial →
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
