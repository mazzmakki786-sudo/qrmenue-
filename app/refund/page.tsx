import type { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { JsonLd } from "@/components/JsonLd"
import { COMPANY_INFO } from "@/lib/company-info"

export const metadata: Metadata = {
  title: "Return & Refund Policy — Digital QR Menue | Order Cancellations & Refunds",
  description:
    "Return, cancellation, and refund policy for Digital QR Menue. Learn about order cancellations, refunds for subscriptions, and how disputes are handled for restaurants and customers in Pakistan.",
  alternates: {
    canonical: "https://www.digitalmenue.com/refund",
  },
  openGraph: {
    title: "Return & Refund Policy — Digital QR Menue",
    description:
      "How returns, cancellations, and refunds work when ordering through Digital QR Menue. Covers customers and restaurant owners in Pakistan.",
    url: "https://www.digitalmenue.com/refund",
  },
}

export const revalidate = 3600

const sections = [
  {
    title: "1. Overview",
    content: `${COMPANY_INFO.ownershipStatement}. This Return & Refund Policy ("Policy") explains how you can cancel an order, request a refund, and resolve disputes when using our platform.

Digital QR Menue is a platform that connects customers with restaurants for ordering food and other items. When you place an order through our platform, you are purchasing directly from the restaurant, and the restaurant is responsible for fulfilling your order. We facilitate the transaction but do not prepare, handle, or deliver food.

All prices displayed on the platform are in Pakistani Rupees (PKR). Our operational hours are: ${COMPANY_INFO.hours.full.join("; ")}.`,
  },
  {
    title: "2. Order Cancellation (by Customer)",
    content: `You may cancel an order within 5 minutes of placing it, provided the restaurant has not yet confirmed the order.

To cancel:
• Go to your order confirmation page and check the cancellation option
• Or message the restaurant directly via the WhatsApp link provided in your order confirmation

If the restaurant has already started preparing your order, cancellation is at their discretion. Please contact the restaurant directly — their WhatsApp number is included in your order confirmation.

We recommend contacting the restaurant as soon as possible if you need to cancel.`,
  },
  {
    title: "3. Order Cancellation (by Restaurant)",
    content: `A restaurant may cancel an order if:
• The ordered items are unavailable
• The restaurant cannot deliver to your address
• The restaurant is closed or at maximum capacity
• The order contains incorrect or incomplete information

If the restaurant cancels your order, you will be notified via WhatsApp. No payment will be processed for cancelled orders.`,
  },
  {
    title: "4. Refunds",
    content: `For Food Orders
Since Digital QR Menue does not process payments for food orders directly (payments are handled between you and the restaurant via cash, JazzCash, or Easypaisa), refunds for food orders are handled directly between you and the restaurant. We encourage both parties to resolve refund matters amicably.

For Subscription Fees (Restaurant Owners)
• No refunds for partial months of service — you retain access until the end of the current billing period
• You may downgrade your plan at any time; the new pricing takes effect from the next billing cycle
• Contact us on WhatsApp within 7 days of payment if you believe an error has occurred
• First-time subscribers may request a full refund within 14 days of initial payment`,
  },
  {
    title: "5. Subscription Cancellation (Restaurant Owners)",
    content: `Restaurant owners may cancel their subscription at any time by contacting us via WhatsApp or email.

Upon cancellation:
• Service continues until the end of the current billing period
• Your menu data and settings are preserved for 90 days
• If you re-subscribe within 90 days, your menu and settings will be restored
• After 90 days, your data is permanently deleted from our systems
• QR codes linked to your menu will stop working once the subscription period ends`,
  },
  {
    title: "6. Dispute Resolution",
    content: `If you have an issue with an order:
1. Contact the restaurant directly via the WhatsApp link in your order confirmation
2. If the issue is not resolved, contact Digital QR Menue support
3. We will mediate in good faith but are not liable for the quality, timing, or delivery of food items

For payment disputes related to transactions processed through PayFast:
• Disputes must be raised within the timeframe specified by PayFast's dispute resolution process
• Chargebacks will be handled in accordance with PayFast's terms and card scheme rules
• Transaction records are retained for at least 5 years as required by our payment processor`,
  },
  {
    title: "7. Exceptions & Non-Refundable Items",
    content: `The following are non-refundable:
• QR code generation and digital menu setup — once created, these are delivered instantly as digital products
• Custom development or integration work performed for specific restaurant requirements
• Services already rendered beyond the point of cancellation
• Third-party fees (payment processing charges, domain registrations, etc.) that have already been incurred

We reserve the right to update this Policy at any time. Changes will be effective immediately upon posting to this page.`,
  },
]

export default function RefundPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Return & Refund Policy — Digital QR Menue",
          description:
            "Return, cancellation, and refund policy for Digital QR Menue's QR menu and WhatsApp ordering platform.",
          url: "https://www.digitalmenue.com/refund",
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
            { "@type": "ListItem", position: 2, name: "Return & Refund Policy", item: "https://www.digitalmenue.com/refund" },
          ],
        }}
      />
      <div className="min-h-screen bg-white">
        <LandingHeader />
        <section className="bg-black text-white py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-5 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Return &amp; Refund Policy</h1>
            <p className="text-sm md:text-base text-[#AAA] max-w-xl mx-auto">
              How cancellations, returns, and refunds work when ordering through Digital QR Menue.
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
                This Return &amp; Refund Policy (&ldquo;Policy&rdquo;) explains how you can cancel an order, request a refund,
                and resolve disputes when using Digital QR Menue. By placing an order or subscribing to our
                services, you agree to the terms of this Policy.
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
                If you have questions about this Return &amp; Refund Policy, please contact us:
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
                <Link href="/shipping" className="text-black underline">
                  Shipping Policy
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
