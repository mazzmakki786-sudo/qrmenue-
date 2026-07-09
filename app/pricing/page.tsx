import type { Metadata } from "next"
import { PricingSection } from "@/components/pricing/PricingSection"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { mapPlan, type DBPlan } from "@/lib/map-plans"
import { PricingJsonLd, FaqJsonLd } from "@/components/JsonLd"
import { createAdminClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Pricing — Digital QR Menue Plans",
  description:
    "Choose the right Digital QR Menue plan for your restaurant. Free trial, Starter, Growth, and Premium plans available.",
  openGraph: {
    title: "Pricing | Digital QR Menue",
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

export default async function PricingPage() {
  const admin = createAdminClient()
  const { data: dbPlans } = await admin
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  const initialPlans = (dbPlans as DBPlan[] | null)?.map(mapPlan) || []

  return (
    <>
      <PricingJsonLd />
      <FaqJsonLd faqs={pricingFaqs} />
      <LandingHeader />
      <PricingSection
        heading="Plans & Pricing"
        description="No hidden fees. No commission on orders. Cancel anytime."
        initialPlans={initialPlans}
      />
    </>
  )
}
