import type { Metadata } from "next"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { FaqJsonLd } from "@/components/JsonLd"

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Everything you need to know about Digital QR Menue — Pakistan's no-commission QR menu platform. Pricing, setup, WhatsApp ordering, and support FAQs.",
  alternates: {
    canonical: "https://www.digitalmenue.com/faq",
  },
}

interface FaqItem {
  q: string
  a: string
}

const categories: Array<{ title: string; faqs: FaqItem[] }> = [
  {
    title: "Getting Started",
    faqs: [
      {
        q: "What is Digital QR Menue and how does it work?",
        a: "Digital QR Menue is Pakistan's QR code menu platform. Create a menu in under 5 minutes, get a QR code, and customers scan it to browse dishes and order via WhatsApp. No app download needed.",
      },
      {
        q: "Which cities does it work in?",
        a: "Everywhere in Pakistan — Lahore, Karachi, Islamabad, Faisalabad, and all other cities. Since it runs on QR codes and WhatsApp, there's no location restriction.",
      },
      {
        q: "Which types of restaurants can use it?",
        a: "All types — cafes, dhabas, food trucks, cloud kitchens, fine dining, home bakers, and tiffin services. Works for single outlets and multi-branch chains alike.",
      },
      {
        q: "Do customers need to download an app?",
        a: "No. Customers scan the QR code with their phone camera (iPhone or Android), the menu opens in the browser, and they order directly on WhatsApp.",
      },
    ],
  },
  {
    title: "Pricing & Plans",
    faqs: [
      {
        q: "Is the free trial really free?",
        a: "Yes. 30 days, no credit card required. You get full access with up to 20 dishes. Your menu goes live immediately.",
      },
      {
        q: "What are the pricing plans?",
        a: "Free Trial (PKR 0, 30 days), Starter (PKR 1,500/mo), Growth (PKR 2,500/mo), Premium (PKR 4,500/mo). All paid plans include unlimited orders, QR codes, WhatsApp ordering, and zero commission.",
      },
      {
        q: "Can I upgrade or downgrade anytime?",
        a: "Yes. Message us on WhatsApp and we'll switch your plan within minutes. No contracts, no penalties.",
      },
      {
        q: "What happens when my trial ends?",
        a: "You get a 3-day grace period where your menu stays live. After that it goes offline but your data is preserved. Subscribe anytime to reactivate.",
      },
    ],
  },
  {
    title: "QR Code & Menu Setup",
    faqs: [
      {
        q: "How do I create a QR code menu?",
        a: "Sign up, add your restaurant details and dishes with prices, and your QR code is generated automatically. Download and print it — takes under 5 minutes.",
      },
      {
        q: "Can I update my menu in real time?",
        a: "Yes. Edit any dish, price, photo, or category from your dashboard. Changes are live instantly — customers see the updated menu on their next scan.",
      },
      {
        q: "How do I print the QR code?",
        a: "Download the high-resolution QR code from your dashboard (free on all plans). Print on table tents, posters, stickers, or your storefront. You can also share the link on social media.",
      },
    ],
  },
  {
    title: "WhatsApp Ordering & Payments",
    faqs: [
      {
        q: "How does WhatsApp ordering work?",
        a: "When a customer taps 'Order', a formatted message with their name, items, quantities, and total is sent to your WhatsApp. You reply to confirm — just like any WhatsApp chat.",
      },
      {
        q: "Is there a commission on orders?",
        a: "No. Zero commission. We charge a flat monthly fee and you keep 100% of your revenue. Payments are handled directly between you and the customer.",
      },
      {
        q: "How do customers pay?",
        a: "You share your JazzCash, Easypaisa, or bank details via WhatsApp. Customers pay you directly — no middleman, no transaction fees.",
      },
    ],
  },
  {
    title: "Support & Account",
    faqs: [
      {
        q: "How do I contact support?",
        a: "Message us on WhatsApp at +92-314-6325823 or email support@digitalmenue.com. Paid plans include priority support with faster response times.",
      },
      {
        q: "Is my data safe?",
        a: "Yes. We use industry-standard encryption. Your dishes, images, and order history are private and never shared. Data is preserved even if your plan expires.",
      },
      {
        q: "Can I pause my menu without deleting it?",
        a: "Yes. Toggle your restaurant to 'closed' from the dashboard. Your menu stays hidden until you toggle it back on. All data remains intact.",
      },
    ],
  },
]

const allFaqs: FaqItem[] = categories.flatMap((c) => c.faqs)
const faqLd = allFaqs.map((f) => ({ question: f.q, answer: f.a }))

export default function FaqPage() {
  return (
    <>
      <FaqJsonLd faqs={faqLd} />
      <div className="min-h-screen bg-white">
        <LandingHeader />
        <section className="bg-black text-white py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-5 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-sm md:text-base text-[#AAA] max-w-xl mx-auto">
              Everything you need to know about Digital QR Menue — Pakistan&apos;s
              no-commission QR menu and WhatsApp ordering platform.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-5 space-y-16">
            <p className="text-xs text-[#888]">Last updated: July 16, 2026</p>
            {categories.map((cat, ci) => (
              <div key={ci}>
                <h2 className="text-xl md:text-2xl font-bold mb-6">{cat.title}</h2>
                <div className="space-y-3">
                  {cat.faqs.map((faq, fi) => (
                    <details
                      key={fi}
                      className="group bg-white border border-[#E8E8E8] rounded-xl p-4 md:p-5 open:bg-[#FAFAFA] transition-colors"
                    >
                      <summary className="flex items-center justify-between cursor-pointer font-semibold text-sm md:text-base list-none">
                        <span>{faq.q}</span>
                        <span className="text-[#999] group-open:rotate-45 transition-transform text-xl leading-none shrink-0 ml-4">+</span>
                      </summary>
                      <p className="mt-3 text-sm text-[#555] leading-relaxed">{faq.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#F9FAFB] py-16 md:py-20">
          <div className="max-w-xl mx-auto px-5 text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-3">Still have questions?</h2>
            <p className="text-sm text-[#555] mb-6">Message us on WhatsApp and we&apos;ll help you within minutes.</p>
            <a
              href="https://wa.me/923146325823"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Chat on WhatsApp
            </a>
          </div>
        </section>
      </div>
    </>
  )
}
