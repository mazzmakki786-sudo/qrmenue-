import type { Metadata } from "next"
import { PricingSection } from "@/components/pricing/PricingSection"
import { PricingJsonLd, FaqJsonLd } from "@/components/JsonLd"
import { LandingHeader } from "@/components/shared/LandingHeader"

export const metadata: Metadata = {
  title: "Pricing — QRMenu.pk Plans",
  description:
    "Choose the right QRMenu.pk plan for your restaurant. Free trial, Starter, Growth, and Premium plans available.",
  openGraph: {
    title: "Pricing | QRMenu.pk",
    description: "QR menu plans for restaurants",
    type: "website",
    url: "https://www.digitalmenue.com/pricing",
    siteName: "Digitalmenue.com",
  },
  alternates: {
    canonical: "https://www.digitalmenue.com/pricing",
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
      <PricingSection
        heading="Plans & Pricing"
        description="No hidden fees. No commission on orders. Cancel anytime."
      />
    </>
  )
}
