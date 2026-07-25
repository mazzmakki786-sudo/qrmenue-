import type { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { JsonLd, BreadcrumbListJsonLd, FaqJsonLd } from "@/components/JsonLd"

export const metadata: Metadata = {
  title: "QR Menu Login — Restaurant Dashboard Access | Digital QR Menue",
  description:
    "Access your restaurant's QR menu dashboard. Login to Digital QR Menue to manage your digital menu, view orders, update dishes, and track performance.",
  alternates: {
    canonical: "https://www.digitalmenue.com/qr-menu-login",
  },
  openGraph: {
    title: "QR Menu Login — Restaurant Dashboard Access",
    description: "Access your restaurant's QR menu dashboard. Login to manage your digital menu, view orders, and update dishes.",
    url: "https://www.digitalmenue.com/qr-menu-login",
  },
}

export const revalidate = 3600

const faqs = [
  {
    question: "How do I log in to my QR menu dashboard?",
    answer: "Visit digitalmenue.com/login and enter your email and password. If you haven't signed up yet, create a free account at digitalmenue.com/signup/restaurant.",
  },
  {
    question: "I forgot my password. How do I reset it?",
    answer: "On the login page, click 'Forgot Password' and enter your email address. We'll send you a password reset link. Contact us on WhatsApp if you need immediate help.",
  },
  {
    question: "Can I log in from my phone?",
    answer: "Yes. The dashboard works on all devices — phone, tablet, and computer. Log in through any browser at digitalmenue.com/login.",
  },
  {
    question: "Can multiple staff members log in to manage the menu?",
    answer: "Yes. You can share login credentials with your team, or contact us about multi-user access options. Each person can manage orders and update the menu.",
  },
]

export default function QrMenuLoginPage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        headline: "QR Menu Login — Restaurant Dashboard Access",
        description: "Access your restaurant's QR menu dashboard to manage your digital menu and orders.",
        author: { "@type": "Organization", name: "Digital QR Menue" },
        publisher: { "@type": "Organization", name: "Digital QR Menue" },
        mainEntityOfPage: { "@type": "WebPage", "@id": "https://www.digitalmenue.com/qr-menu-login" },
      }} />
      <BreadcrumbListJsonLd items={[
        { name: "Home", url: "https://www.digitalmenue.com" },
        { name: "QR Menu Login", url: "https://www.digitalmenue.com/qr-menu-login" },
      ]} />
      <FaqJsonLd faqs={faqs} />
      <div className="min-h-screen bg-white">
        <LandingHeader />
        <section className="bg-black text-white py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-5 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">QR Menu Login</h1>
            <p className="text-base md:text-lg text-[#AAA] max-w-xl mx-auto">
              Access your Digital QR Menue dashboard to manage your menu, view orders, and update your restaurant profile.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <Link href="/login" className="bg-white text-black px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#E5E5E5] transition-colors">
                Login to Dashboard →
              </Link>
              <Link href="/signup/restaurant" className="px-6 py-3.5 rounded-xl border border-[#333] text-sm font-medium text-white hover:bg-[#1A1A1A] transition-colors">
                Create Account
              </Link>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">What You Can Do From Your Dashboard</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "Manage Menu Items", desc: "Add, edit, or remove dishes. Update prices, descriptions, and photos anytime." },
                { title: "View Orders", desc: "See all incoming orders in real-time. Track order status and history." },
                { title: "Download QR Code", desc: "Download your restaurant's QR code in high resolution for printing." },
                { title: "Update Settings", desc: "Change your restaurant name, logo, operating hours, and contact information." },
                { title: "View Analytics", desc: "See which dishes are popular, peak ordering times, and customer trends." },
                { title: "Manage Deals", desc: "Create and manage special offers, discounts, and promotions." },
              ].map((item, i) => (
                <div key={i} className="p-5 bg-[#F9FAFB] rounded-2xl">
                  <h3 className="font-semibold text-sm mb-2">{item.title}</h3>
                  <p className="text-xs text-[#555]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Frequently Asked Questions</h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-md mx-auto">Common questions about QR menu login and dashboard access.</p>
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
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-sm text-[#AAA] mb-8">Create your free QR menu account in under 30 seconds.</p>
            <Link href="/signup/restaurant" className="inline-block bg-white text-black px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#E5E5E5] transition-colors">
              Create Free Account →
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
