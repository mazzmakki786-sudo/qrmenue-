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
  {
    question: "What is the restaurant dashboard?",
    answer: "The restaurant dashboard is your control center for managing your digital menu. From the dashboard, you can add or edit menu items, upload food photos, download your QR code, view incoming orders, track analytics, create deals, and update your restaurant profile — all from your phone or computer.",
  },
  {
    question: "How do I download my QR code after logging in?",
    answer: "After logging in, go to the QR Code section in your dashboard. You can download your unique QR code in high resolution (PNG or SVG format). Print it on table tents, posters, or stickers. The QR code never changes, so you only need to print it once.",
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
        {/* Dashboard Walkthrough */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Inside Your Restaurant Dashboard
            </h2>
            <p className="text-sm text-[#555] text-center mb-12 max-w-lg mx-auto">
              Everything you need to manage your digital menu — one login, total control.
            </p>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                {
                  title: "Menu Management",
                  desc: "Add unlimited dishes, organize by categories (starters, mains, desserts, drinks), set prices in PKR, upload HD food photos, and write compelling descriptions. Changes go live instantly.",
                },
                {
                  title: "QR Code Generator",
                  desc: "Your unique QR code is generated automatically. Download it in high resolution for printing. Place it on tables, counters, takeaway bags, or share the menu link digitally.",
                },
                {
                  title: "Order Management",
                  desc: "See all incoming orders in real-time on your dashboard. Orders also arrive on your WhatsApp as formatted messages with customer name, items, total, and order type.",
                },
                {
                  title: "Analytics & Insights",
                  desc: "Track which dishes are most popular, see peak ordering hours, monitor total orders, and understand customer preferences. Use data to optimize your menu and increase revenue.",
                },
                {
                  title: "Deals & Promotions",
                  desc: "Create special offers, discounts, and limited-time deals directly from your dashboard. Highlight featured items and drive more orders during slow periods.",
                },
                {
                  title: "Restaurant Profile",
                  desc: "Update your restaurant name, logo, phone number, address, operating hours, and social media links. All changes reflect instantly on your customer-facing menu.",
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

        {/* Getting Started Flow */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              From Sign Up to Live Menu in 5 Minutes
            </h2>
            <p className="text-sm text-[#555] text-center mb-12 max-w-lg mx-auto">
              New to Digital QR Menue? Here&apos;s how to get your restaurant online fast.
            </p>
            <div className="space-y-4">
              {[
                { num: "1", title: "Create Your Free Account", desc: "Go to digitalmenue.com/signup/restaurant. Enter your email, restaurant name, and phone number. No credit card needed for the 30-day free trial." },
                { num: "2", title: "Add Your First Menu Items", desc: "In the dashboard, click 'Add Menu Item'. Enter the dish name, price in PKR, a description, and optionally upload a photo. Repeat for each dish." },
                { num: "3", title: "Organize Categories", desc: "Create categories like Starters, Main Course, BBQ, Drinks, and Desserts. Drag and drop dishes into categories for a clean, organized menu." },
                { num: "4", title: "Download Your QR Code", desc: "Go to the QR Code section. Download your unique QR code in high resolution. Print it on table tents, posters, or counter signs." },
                { num: "5", title: "Go Live", desc: "Place your QR codes on tables. Customers scan, browse, and order via WhatsApp. You receive orders instantly on your phone." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start p-5 bg-white rounded-xl border border-[#F0F0F0]">
                  <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {item.num}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-[#555] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security & Access */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Dashboard Security & Access
            </h2>
            <div className="space-y-5 text-sm md:text-base text-[#555] leading-relaxed">
              <p>
                Your restaurant dashboard is protected with industry-standard security. All data is encrypted
                in transit (HTTPS) and at rest. Your login credentials are securely stored — we never see
                or share your password.
              </p>
              <p>
                The dashboard works on any device with a web browser. Log in from your phone to check orders
                on the go, from a tablet at the restaurant for a larger view, or from your computer for
                bulk menu editing. Your session stays active until you log out.
              </p>
              <p>
                If you need to give your manager or staff access to the dashboard, you can share your login
                credentials or contact our support team for multi-user access options. Each person can manage
                orders, update menu items, and view analytics independently.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
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
