import type { Metadata } from "next"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { FaqJsonLd, JsonLd } from "@/components/JsonLd"

export const metadata: Metadata = {
  title: "Frequently Asked Questions — Digital QR Menue | QR Menu & WhatsApp Ordering Help",
  description:
    "Everything you need to know about Digital QR Menue — Pakistan's no-commission QR menu platform. Pricing, setup, WhatsApp ordering, and support FAQs.",
  alternates: {
    canonical: "https://www.digitalmenue.com/faq",
  },
  openGraph: {
    title: "FAQ — Digital QR Menue | QR Menu, Pricing & WhatsApp Ordering Help for Restaurants in Pakistan",
    description:
      "Get answers to common questions about Digital QR Menue — free QR menu setup, pricing plans, WhatsApp ordering, and support for restaurants in Pakistan.",
    url: "https://www.digitalmenue.com/faq",
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
        q: "What are your operational hours?",
        a: "Our team is available during business hours: Monday to Friday 9:00 AM - 6:00 PM, Saturday 9:00 AM - 2:00 PM. We are closed on Sundays. For urgent issues, you can always message us on WhatsApp and we'll respond as soon as possible.",
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
  {
    title: "Orders, Returns & Refunds",
    faqs: [
      {
        q: "Can I cancel an order after placing it?",
        a: "You can cancel an order within 5 minutes of placing it, provided the restaurant hasn't confirmed it yet. Go to your order confirmation page to cancel. If the restaurant has already started preparing, please contact them directly via WhatsApp — cancellation is at their discretion.",
      },
      {
        q: "How do I get a refund for my order?",
        a: "Since payments for food orders are handled directly between you and the restaurant (cash, JazzCash, Easypaisa), refunds are arranged directly with the restaurant. Contact them via the WhatsApp link in your order confirmation. If the issue is not resolved, contact Digital QR Menue support and we will mediate in good faith.",
      },
      {
        q: "How long does delivery take?",
        a: "Typical dispatch times are 20–45 minutes from order confirmation. This depends on the restaurant's workload and order complexity. The restaurant provides an estimated time on your order confirmation page and will notify you of any delays.",
      },
      {
        q: "Can I change my delivery address after placing an order?",
        a: "Contact the restaurant directly via the WhatsApp link in your order confirmation as soon as possible. The restaurant may be able to update the address if the order hasn't been dispatched yet.",
      },
    ],
  },
  {
    title: "Online Ordering & Food Delivery",
    faqs: [
      {
        q: "How can I order food online?",
        a: "Ordering food online is simple with Digital QR Menue. Find a restaurant near you in our restaurant directory, or scan their QR code if you're dining in. Browse their digital menu, select your dishes, add customizations, and tap 'Order via WhatsApp.' The restaurant receives your order instantly on their WhatsApp and confirms back to you. No app download, no account creation, and no OTP verification needed. You can pay via JazzCash, Easypaisa, or cash on delivery — whatever the restaurant offers.",
      },
      {
        q: "Which delivery app is best for food in Pakistan?",
        a: "Foodpanda is the most popular delivery app in Pakistan, but it charges restaurants 25-35% commission per order — costs that are often passed on to customers through higher prices. Digital QR Menue offers a better alternative: restaurants create a digital QR menu and customers order directly on WhatsApp. Restaurants keep 100% of their revenue, and customers often get lower prices since there's no middleman commission. For dine-in, customers scan the table QR code; for delivery, restaurants can share their digital menu link on social media or Google Maps so customers can order directly without going through a third-party app.",
      },
      {
        q: "What is the difference between ordering on Foodpanda vs ordering via QR code?",
        a: "When you order on Foodpanda, the app charges the restaurant a 25-35% commission. This means the restaurant either increases prices or loses money on every order. With a Digital QR Menue QR code, you order directly through WhatsApp — the restaurant pays no commission, so prices stay fair. Additionally, Foodpanda requires an app download and account creation; a QR code menu opens instantly in your phone browser with zero friction. Finally, with a QR code, you're ordering directly from the restaurant's own kitchen — no third-party delivery partner handling your food.",
      },
    ],
  },
  {
    title: "Digital Menu Creation & Management",
    faqs: [
      {
        q: "How to create a digital menu for your restaurant?",
        a: "Creating a digital menu for your restaurant takes just 5 minutes. Sign up for a free trial on Digital QR Menue, enter your restaurant name and details, add your dishes with prices and descriptions, and upload mouth-watering photos. The platform automatically generates a unique QR code linked to your digital menu. Download the QR code, print it on table tents or stickers, and place them on your tables. Customers scan with their phone camera, view your complete digital restaurant menu with photos and prices, and place orders directly through WhatsApp. Updates are instant — change a price or add a new dish and it's live immediately.",
      },
      {
        q: "How does a QR code menu work for restaurants?",
        a: "A QR code menu works by encoding your restaurant's digital menu URL into a scannable square barcode. Restaurants create their menu on the Digital QR Menue platform, which generates the QR code. When printed and placed on tables, customers simply open their phone camera and point it at the QR code. The camera recognizes the code and opens the digital food menu in the browser automatically. No typing, no searching, no app. Customers can browse the full menu organized by categories, see photos of each dish, check prices, add items to their cart, and send a perfectly formatted order to the restaurant's WhatsApp. The entire process takes under 10 seconds from scan to order.",
      },
      {
        q: "Can I update my digital restaurant menu myself?",
        a: "Yes, absolutely. Your digital restaurant menu is fully self-managed through your dashboard. You can change prices, add new dishes, remove sold-out items, update photos, reorganize categories, and switch between English and Urdu — all in real-time. Changes are visible to customers the moment they scan your QR code next. No need to call anyone, no technical support ticket, and most importantly, no expensive reprinting of paper menus. If chicken prices go up tomorrow, you update them in 30 seconds from your phone.",
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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.digitalmenue.com" },
            { "@type": "ListItem", position: 2, name: "FAQ", item: "https://www.digitalmenue.com/faq" },
          ],
        }}
      />
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
