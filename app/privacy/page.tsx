import type { Metadata } from "next"
import { LandingHeader } from "@/components/shared/LandingHeader"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Digital QR Menue. Learn how we collect, use, and protect your data in compliance with Pakistani law (PECA 2016).",
  alternates: {
    canonical: "https://www.digitalmenue.com/privacy",
  },
}

// Revalidate every hour — static page with periodic regeneration
export const revalidate = 3600

const sections = [
  {
    title: "Information We Collect",
    content: `We collect information you provide directly when you create an account, add your restaurant, upload dishes, or contact us. This includes your name, email address, phone number, restaurant name, menu details, and dish images.

We also automatically collect certain technical information when you use our platform, including your IP address, browser type, device information, and usage data such as pages visited and actions taken within the dashboard.`,
  },
  {
    title: "How We Use Your Information",
    content: `We use your information to operate, maintain, and improve Digital QR Menue. Specifically:
• To create and manage your restaurant account and menu
• To generate QR codes and public menu pages
• To send order notifications via WhatsApp
• To communicate with you about your account, billing, and support
• To improve our platform, fix bugs, and develop new features
• To comply with legal obligations under Pakistani law`,
  },
  {
    title: "Data Sharing & Disclosure",
    content: `We do not sell your personal data to third parties. We may share your information with:
• Service providers who help us operate the platform (hosting, email delivery, analytics) — these providers are contractually bound to protect your data
• Law enforcement or regulatory authorities if required under Pakistani law, including the Prevention of Electronic Crimes Act (PECA) 2016
• Other parties with your explicit consent`,
  },
  {
    title: "Data Storage & Security",
    content: `Your data is stored on secure servers with industry-standard encryption. We implement reasonable technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction.

We retain your data for as long as your account is active. If you close your account, we retain your data for 90 days before permanent deletion, unless we are required to retain it longer by law.`,
  },
  {
    title: "Cookies & Tracking",
    content: `We use essential cookies to keep you logged in and maintain session state. We also use analytics cookies to understand how our platform is used. You can control cookie preferences through your browser settings.

We do not use tracking cookies for advertising or third-party marketing.`,
  },
  {
    title: "Your Rights",
    content: `Under Pakistani law and global best practices, you have the right to:
• Access the personal data we hold about you
• Request correction of inaccurate data
• Request deletion of your data (subject to legal retention requirements)
• Withdraw consent where processing is based on consent
• Lodge a complaint with the relevant authority

To exercise any of these rights, contact us at support@digitalmenue.com or via WhatsApp.`,
  },
  {
    title: "Updates to This Policy",
    content: `We may update this Privacy Policy from time to time. Material changes will be notified via email or through your dashboard. Continued use of Digital QR Menue after changes constitutes acceptance of the updated policy.

This policy was last updated on July 5, 2026.`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <section className="bg-black text-white py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-sm md:text-base text-[#AAA] max-w-xl mx-auto">
            How we collect, use, and protect your data — in compliance with Pakistani law (PECA 2016).
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-5">
          <div className="mb-10">
            <p className="text-xs text-[#888] mb-4">Last updated: July 5, 2026</p>
            <p className="text-sm text-[#555] leading-relaxed">
              This Privacy Policy explains how Digital QR Menue (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) collects, uses, discloses, and protects
              your personal information when you use our QR menu and WhatsApp ordering platform. We are committed to
              protecting your privacy in accordance with the <strong>Prevention of Electronic Crimes Act (PECA) 2016</strong> of
              Pakistan and applicable data protection laws.
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
              If you have questions about this Privacy Policy or how we handle your data, contact us at:
            </p>
            <p className="text-sm text-[#555] mt-2">
              <strong>Email:</strong> support@digitalmenue.com
            </p>
            <p className="text-sm text-[#555]">
              <strong>WhatsApp:</strong> <a href="https://wa.me/923146325823" target="_blank" rel="noopener noreferrer" className="text-black underline">+92-314-6325823</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
