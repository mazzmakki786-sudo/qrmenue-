import type { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { JsonLd } from "@/components/JsonLd"
import { COMPANY_INFO } from "@/lib/company-info"

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy — Digital QR Menue | Order Dispatch & Delivery Info",
  description:
    "Shipping and delivery policy for Digital QR Menue. Learn about dispatch times, delivery areas, address verification, order tracking, and receipts for orders placed in Pakistan.",
  alternates: {
    canonical: "https://www.digitalmenue.com/shipping",
  },
  openGraph: {
    title: "Shipping & Delivery Policy — Digital QR Menue",
    description:
      "How dispatch, delivery, and order tracking work for orders placed through Digital QR Menue in Pakistan.",
    url: "https://www.digitalmenue.com/shipping",
  },
}

export const revalidate = 3600

const sections = [
  {
    title: "1. Overview",
    content: `${COMPANY_INFO.ownershipStatement}. This Shipping & Delivery Policy (&ldquo;Policy&rdquo;) explains how orders are dispatched, delivered, and tracked when you place an order through Digital QR Menue.

Orders placed through our platform are fulfilled directly by the restaurant you order from. Each restaurant is responsible for preparing, packaging, and delivering your order. We facilitate the ordering process but do not handle, prepare, or deliver food items.

All prices displayed on the platform are in Pakistani Rupees (PKR). Delivery charges, if any, are set by the restaurant and disclosed before you place your order.`,
  },
  {
    title: "2. Dispatch Time",
    content: `When you place an order, the restaurant begins preparing it as soon as they receive your order on WhatsApp. Typical dispatch (preparation) times are:

• Most orders: 20–45 minutes from order confirmation
• Large or complex orders: may take longer, as communicated by the restaurant
• Peak hours (Friday evenings, weekends, public holidays): may experience longer wait times

The estimated preparation time is shown on your order confirmation page. If the restaurant cannot dispatch your order within the estimated time, they will notify you via WhatsApp to confirm a new timeline or offer alternatives.

Restaurants are expected to communicate any significant delays to customers promptly.`,
  },
  {
    title: "3. Delivery Areas & Coverage",
    content: `Each restaurant defines its own delivery area based on their operational capacity and location. The available delivery area is shown at checkout when you select the delivery option.

Key points:
• Orders can only be delivered within a restaurant's self-defined coverage area
• You will be notified at checkout if your address falls outside the delivery area
• Some restaurants may offer pickup (takeaway) only — delivery will not be available for those restaurants
• Restaurants may update their delivery areas at any time from their dashboard`,
  },
  {
    title: "4. Delivery Address Verification",
    content: `You are responsible for providing a complete and accurate delivery address at checkout. To ensure smooth delivery:

• Double-check your address, street name, area, landmark, and city before placing the order
• Provide a working phone number so the restaurant can contact you if needed
• The restaurant may contact you via WhatsApp to verify your address before dispatching

If an order cannot be delivered due to an incorrect or incomplete address provided by you, the restaurant may cancel the order. Please contact the restaurant directly if you realize you've entered the wrong address.`,
  },
  {
    title: "5. Delivery Charges & Pricing",
    content: `• Any delivery charges are set by the restaurant and displayed at checkout before you place your order
• All charges are displayed transparently — there are no hidden fees
• All prices are displayed in Pakistani Rupees (PKR)
• The same prices apply regardless of payment method (cash, JazzCash, Easypaisa, or card)
• No surcharges are applied based on payment method
• Taxes, where applicable, are included in the total amount shown`,
  },
  {
    title: "6. Order Tracking",
    content: `Track your order in real-time from your order confirmation page. The following statuses are used:

• Received — The restaurant has received your order
• Preparing — The restaurant is preparing your food
• Ready — Your order is ready for pickup or dispatch
• Completed — Your order has been delivered or picked up
• Cancelled — The order was cancelled by you or the restaurant

Notifications are sent via WhatsApp at each status change. You can also check the current status anytime from your order confirmation page.`,
  },
  {
    title: "7. Transaction Receipts",
    content: `A transaction receipt is generated for every completed order. Receipts include:
• Order number and date
• Itemized list of ordered items with prices
• Total amount paid
• Payment method used
• Restaurant name and contact information

Receipts are available on your order confirmation page immediately after the order is placed. If you require a copy of your receipt at a later date, contact us at ${COMPANY_INFO.support.email}.

We retain transaction records for a minimum of 5 years in compliance with our payment processor's requirements.`,
  },
]

export default function ShippingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Shipping & Delivery Policy — Digital QR Menue",
          description:
            "Shipping and delivery policy for Digital QR Menue's QR menu and WhatsApp ordering platform in Pakistan.",
          url: "https://www.digitalmenue.com/shipping",
          isPartOf: {
            "@type": "WebSite",
            name: "Digital QR Menue",
            url: "https://www.digitalmenue.com",
          },
          about: {
            "@type": "Organization",
            name: "Digital QR Menue",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.digitalmenue.com" },
            { "@type": "ListItem", position: 2, name: "Shipping & Delivery Policy", item: "https://www.digitalmenue.com/shipping" },
          ],
        }}
      />
      <div className="min-h-screen bg-white">
        <LandingHeader />
        <section className="bg-black text-white py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-5 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Shipping &amp; Delivery Policy</h1>
            <p className="text-sm md:text-base text-[#AAA] max-w-xl mx-auto">
              How dispatch, delivery, and order tracking work when ordering through Digital QR Menue.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-5">
            <div className="mb-10">
              <p className="text-xs text-[#888] mb-4">Last updated: July 20, 2026</p>
              <div className="p-4 bg-[#F9FAFB] rounded-xl border border-[#E8E8E8] mb-6">
                <p className="text-sm font-semibold text-black">{COMPANY_INFO.ownershipStatement}</p>
              </div>
              <p className="text-sm text-[#555] leading-relaxed">
                This Shipping &amp; Delivery Policy explains how orders are dispatched, delivered,
                and tracked when you use Digital QR Menue. By placing an order, you agree to the
                terms of this Policy.
              </p>
            </div>

            <div className="space-y-10">
              {sections.map((section, i) => (
                <div key={i}>
                  <h2 className="text-xl font-bold mb-3">{section.title}</h2>
                  <p className="text-sm text-[#555] leading-relaxed whitespace-pre-line">{section.content}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 p-6 bg-[#F9FAFB] rounded-xl">
              <h2 className="text-lg font-bold mb-3">Contact Us</h2>
              <p className="text-sm text-[#555] leading-relaxed">
                If you have questions about this Shipping &amp; Delivery Policy, please contact us:
              </p>
              <p className="text-sm text-[#555] mt-2">
                <strong>Email:</strong> {COMPANY_INFO.support.email}
              </p>
              <p className="text-sm text-[#555]">
                <strong>WhatsApp:</strong>{" "}
                <a
                  href={`https://wa.me/${COMPANY_INFO.support.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black underline"
                >
                  {COMPANY_INFO.support.whatsapp}
                </a>
              </p>
              <p className="text-sm text-[#555]">
                <strong>Address:</strong> {COMPANY_INFO.address}
              </p>
              <p className="text-sm text-[#555]">
                <strong>Operational Hours:</strong>
              </p>
              <ul className="text-sm text-[#555] list-disc list-inside mt-1">
                {COMPANY_INFO.hours.full.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>

            <div className="mt-10 text-center">
              <p className="text-xs text-[#888]">
                Also read our{" "}
                <Link href="/privacy" className="text-black underline">
                  Privacy Policy
                </Link>
                ,{" "}
                <Link href="/terms" className="text-black underline">
                  Terms of Service
                </Link>
                , and{" "}
                <Link href="/refund" className="text-black underline">
                  Return &amp; Refund Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
