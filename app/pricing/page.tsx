import type { Metadata } from "next"
import { PricingClient } from "./PricingClient"
import { PricingJsonLd, FaqJsonLd } from "@/components/JsonLd"

export const metadata: Metadata = {
  title: "Pricing — QR Menu Plans",
  description:
    "Simple, transparent pricing for QRMenu.pk. Start with a free trial. Plans from PKR 1,200/month. No commission on orders.",
  openGraph: {
    title: "Pricing — QR Menu Plans | QRMenu.pk",
    description:
      "Simple, transparent pricing. Start with a free trial. No commission on orders.",
    type: "website",
    url: "https://qrmenu.pk/pricing",
    siteName: "QRMenu.pk",
  },
  alternates: {
    canonical: "https://qrmenu.pk/pricing",
  },
}

const pricingFaqs = [
  {
    question: "Is the Free Trial really free?",
    answer: "Yes! No credit card required. You get 7 days with full access to test QRMenu for your restaurant.",
  },
  {
    question: "What happens after my Free Trial ends?",
    answer: "Your data is safe. Pick any plan to keep your menu live. If you don't, you have a 3-day grace period before the menu goes offline.",
  },
  {
    question: "Can I change plans later?",
    answer: "Yes, upgrade or downgrade anytime. Just contact us on WhatsApp and we'll switch you in minutes.",
  },
  {
    question: "How do I pay?",
    answer: "JazzCash, Easypaisa, or bank transfer. After payment, message us on WhatsApp and we'll activate your plan within minutes.",
  },
  {
    question: "Is there a commission on orders?",
    answer: "Never. We charge a flat monthly fee. You keep 100% of your revenue.",
  },
]

export default function PricingPage() {
  return (
    <>
      <PricingJsonLd />
      <FaqJsonLd faqs={pricingFaqs} />
      <PricingClient />
    </>
  )
}
