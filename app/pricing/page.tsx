import type { Metadata } from "next"
import { PricingSection } from "@/components/pricing/PricingSection"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { mergeYearlyPlans, type DBPlan } from "@/lib/map-plans"
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

// Revalidate every hour — static page with periodic regeneration
export const revalidate = 3600

const pricingFaqs = [
  {
    question: "Is the Free Trial really free?",
    answer: "Yes! No credit card required. You get 30 days with full access to test Digital QR Menue for your restaurant.",
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
    answer: "Easypaisa or bank transfer. After payment, message us on WhatsApp and we'll activate your plan within minutes.",
  },
  {
    question: "Is there a commission on orders?",
    answer: "Never. We charge a flat monthly fee. You keep 100% of your revenue.",
  },
]

export default async function PricingPage() {
  const admin = createAdminClient()

  const [plansRes, settingsRes] = await Promise.all([
    admin.from("plans").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
    admin.from("company_settings").select("key, value"),
  ])

  const plansData = plansRes.data as DBPlan[] | null
  const initialPlans = plansData ? mergeYearlyPlans(plansData) : []

  // Get WhatsApp support number
  let whatsappNumber = ""
  if (settingsRes.data) {
    const whatsappSetting = settingsRes.data.find((s: any) => s.key === "whatsapp_support")
    if (whatsappSetting) {
      whatsappNumber = whatsappSetting.value.replace(/[^0-9]/g, "")
      if (whatsappNumber.startsWith("0")) {
        whatsappNumber = "92" + whatsappNumber.slice(1)
      }
    }
  }

  return (
    <>
      <PricingJsonLd />
      <FaqJsonLd faqs={pricingFaqs} />
      <LandingHeader />
      <PricingSection
        heading="Plans & Pricing"
        description="No hidden fees. No commission on orders. Cancel anytime."
        initialPlans={initialPlans}
        whatsappNumber={whatsappNumber}
      />
    </>
  )
}
