import type { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { JsonLd } from "@/components/JsonLd"
import { COMPANY_INFO } from "@/lib/company-info"

export const metadata: Metadata = {
  title: "Terms of Service — Digital QR Menue | Restaurant QR Menu Platform Agreement",
  description:
    "Terms of Service for Digital QR Menue. Governs your use of our QR menu platform, WhatsApp ordering system, subscriptions, billing, and content. Covers restaurant owners and customers in Pakistan.",
  alternates: {
    canonical: "https://www.digitalmenue.com/terms",
  },
  openGraph: {
    title: "Terms of Service — Digital QR Menue",
    description:
      "Legal terms governing the use of Digital QR Menue's QR menu and WhatsApp ordering platform for restaurants in Pakistan.",
    url: "https://www.digitalmenue.com/terms",
  },
}

export const revalidate = 3600

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By creating an account or using Digital QR Menue ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.

These Terms apply to all restaurant owners, staff, and customers who access or interact with the platform.

${COMPANY_INFO.ownershipStatement}. Our registered address is ${COMPANY_INFO.address}.`,
  },
  {
    title: "2. Account Registration",
    content: `You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.

You must be at least 18 years old to create an account. If you are registering on behalf of a business, you represent that you have the authority to bind that business to these Terms.`,
  },
  {
    title: "3. Subscription & Billing",
    content: `Digital QR Menue offers tiered subscription plans: Free Trial (30 days), Starter (PKR 1,500/month), Growth (PKR 2,500/month), and Premium (PKR 4,500/month).

• All prices are in Pakistani Rupees (PKR) and are exclusive of applicable taxes
• Prices are the same regardless of payment method — no surcharges are applied for card payments, bank transfers, JazzCash, or Easypaisa
• Subscriptions auto-renew monthly unless cancelled
• You may upgrade, downgrade, or cancel at any time
• No refunds for partial months — you retain access until the end of the paid period
• Downgrading may result in loss of features (e.g., dish limits)
• We reserve the right to change pricing with 30 days' notice`,
  },
  {
    title: "4. Free Trial",
    content: `The Free Trial period is 30 days from the date of sign-up. No credit card is required. At the end of the trial, your menu will be paused but your data is preserved for 90 days. Subscribe to any paid plan to reactivate.`,
  },
  {
    title: "5. Restaurant Content",
    content: `You retain all ownership rights to your menu content, dish images, and restaurant information. You are solely responsible for the accuracy, legality, and appropriateness of your content.

You grant Digital QR Menue a non-exclusive, worldwide license to display your content on public menu pages, QR codes, and related materials as part of providing the Service.

You represent that you have the rights to any images or content you upload and that they do not infringe on third-party rights or contain offensive material.`,
  },
  {
    title: "6. QR Code & Menu Availability",
    content: `We strive to keep the Service available 24/7 but do not guarantee uninterrupted access. We reserve the right to temporarily suspend access for maintenance, updates, or emergencies.

QR codes generated through the Service remain functional as long as your account is active. If your subscription expires or is cancelled, the menu page will be taken offline.

Operational hours for support: ${COMPANY_INFO.hours.full.join("; ")}.`,
  },
  {
    title: "7. WhatsApp Ordering",
    content: `Digital QR Menue facilitates order messages via WhatsApp. We do not process payments, handle order fulfillment, or mediate disputes between restaurants and customers.

Restaurants are responsible for confirming, preparing, and delivering orders received through the platform. Customers are responsible for providing accurate contact and order details.`,
  },
  {
    title: "8. Dispatch & Fulfillment",
    content: `Restaurants using Digital QR Menue agree to:
• Communicate estimated dispatch/preparation times to customers at order confirmation
• Notify customers promptly if an order cannot be fulfilled within the estimated time
• Verify the customer's delivery address before dispatching delivery orders
• Issue transaction receipts to customers within 7 days of order completion
• Retain transaction records for at least 5 years in compliance with payment processor requirements

Customers are advised to verify their delivery address at checkout and ensure their contact information is accurate. Typical dispatch times are 20–45 minutes from order confirmation, though this varies by restaurant and order complexity.`,
  },
  {
    title: "9. Prohibited Conduct",
    content: `You agree not to:
• Use the Service for any unlawful purpose under Pakistani law
• Upload harmful code, malware, or attempt to breach platform security
• Scrape, copy, or reproduce menu content from other restaurants
• Interfere with other users' accounts or the platform's operation
• Use the Service to distribute spam or unsolicited communications`,
  },
  {
    title: "10. Limitation of Liability",
    content: `Digital QR Menue is provided "as is" without warranties of any kind, express or implied. We are not liable for:
• Loss of business, revenue, or profits
• Indirect, incidental, or consequential damages
• Issues arising from third-party services (WhatsApp, payment processors)
• Data loss — you are encouraged to maintain backups of your menu content

Our total liability is limited to the amount you paid us in the 12 months preceding the claim.`,
  },
  {
    title: "11. Termination",
    content: `You may terminate your account at any time by contacting us via WhatsApp or email. We may suspend or terminate your account if you violate these Terms, with or without notice.

Upon termination, your data will be retained for 90 days before permanent deletion. If you re-subscribe within that period, your data will be restored.`,
  },
  {
    title: "12. Governing Law",
    content: `These Terms are governed by the laws of the Islamic Republic of Pakistan. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Lahore, Pakistan.

This agreement shall be construed in accordance with the Prevention of Electronic Crimes Act (PECA) 2016 and other applicable Pakistani laws.`,
  },
  {
    title: "13. Changes to Terms",
    content: `We may update these Terms from time to time. Material changes will be notified via email or through your dashboard. Continued use of the Service after changes constitutes acceptance of the updated Terms.

These Terms were last updated on July 20, 2026.`,
  },
]

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Terms of Service — Digital QR Menue",
          description:
            "Terms of Service for Digital QR Menue's QR menu and WhatsApp ordering platform. Covers subscriptions, billing, content ownership, prohibited conduct, and governing law under Pakistan's PECA 2016.",
          url: "https://www.digitalmenue.com/terms",
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
            { "@type": "ListItem", position: 2, name: "Terms of Service", item: "https://www.digitalmenue.com/terms" },
          ],
        }}
      />
      <div className="min-h-screen bg-white">
        <LandingHeader />
        <section className="bg-black text-white py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-5 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-sm md:text-base text-[#AAA] max-w-xl mx-auto">
              Please read these terms carefully before using Digital QR Menue.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-5">
            <p className="text-xs text-[#888] mb-6">Last updated: July 20, 2026</p>

            <div className="p-4 bg-[#F9FAFB] rounded-xl border border-[#E8E8E8] mb-8">
              <p className="text-sm font-semibold text-black">{COMPANY_INFO.ownershipStatement}</p>
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
              <h2 className="text-lg font-bold mb-3">Contact Information</h2>
              <p className="text-sm text-[#555] leading-relaxed">
                For questions about these Terms, contact us at:
              </p>
              <p className="text-sm text-[#555] mt-2">
                <strong>Email:</strong> {COMPANY_INFO.support.email}
              </p>
              <p className="text-sm text-[#555]">
                <strong>WhatsApp:</strong>{" "}
                <a href={`https://wa.me/${COMPANY_INFO.support.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-black underline">
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
                <Link href="/refund" className="text-black underline">
                  Return &amp; Refund Policy
                </Link>
                ,{" "}
                <Link href="/shipping" className="text-black underline">
                  Shipping Policy
                </Link>
                , and{" "}
                <Link href="/about" className="text-black underline">
                  About Us
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
