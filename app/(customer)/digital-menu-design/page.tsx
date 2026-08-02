import type { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { JsonLd, BreadcrumbListJsonLd, FaqJsonLd } from "@/components/JsonLd"

export const metadata: Metadata = {
  title: "Digital Menu Design for Restaurants — Beautiful QR Menu Templates | Digital QR Menue",
  description:
    "Create stunning digital menu designs for your restaurant. Professional QR menu templates, food photo integration, and real-time updates. No design skills needed. Start free.",
  alternates: {
    canonical: "https://www.digitalmenue.com/digital-menu-design",
  },
  openGraph: {
    title: "Digital Menu Design for Restaurants — Beautiful QR Menu Templates",
    description:
      "Create stunning digital menu designs for your restaurant. Professional QR menu templates, food photo integration, and real-time updates. No design skills needed.",
    url: "https://www.digitalmenue.com/digital-menu-design",
  },
}

export const revalidate = 3600

const faqs = [
  {
    question: "How do I design a digital menu for my restaurant?",
    answer:
      "Designing a digital menu with Digital QR Menue is simple. Sign up for free, add your restaurant logo and brand colors, organize your dishes into categories, upload high-quality food photos, and set your prices. Your menu goes live instantly with a professional design that works on all devices. No graphic design skills needed.",
  },
  {
    question: "What makes a good digital menu design?",
    answer:
      "A good digital menu design is clean, easy to navigate, and visually appealing. Key elements include: high-resolution food photos for every dish, clear category headings, easy-to-read pricing, concise dish descriptions, and mobile-friendly layout. Colors and fonts should reflect your restaurant's brand identity without distracting from the food.",
  },
  {
    question: "Can I customize colors and branding on my digital menu?",
    answer:
      "Yes. Growth and Premium plans include full custom branding options. You can set your restaurant's brand colors, upload your logo, choose accent shades, and customize button styles. The design automatically adapts to your brand while maintaining a professional, clean layout. Starter plan includes basic customization with pre-designed templates.",
  },
  {
    question: "How do food photos improve my digital menu design?",
    answer:
      "Food photos are the most important element of a digital menu design. Restaurants that include high-quality photos see up to 30% higher order values. Photos help customers decide what to order, reduce hesitation, and make dishes look more appealing. Digital QR Menue supports HD photo uploads directly from your phone or computer.",
  },
  {
    question: "Can I update my digital menu design after it's live?",
    answer:
      "Yes, you can update your menu anytime. Add new dishes, change prices, swap photos, reorganize categories, or update your branding — all changes go live instantly. There is no need to reprint menus or wait for a designer. Updates take effect immediately for all customers viewing your menu.",
  },
  {
    question: "Does my digital menu design work on mobile phones?",
    answer:
      "Yes. Every digital menu created with Digital QR Menue is fully responsive and mobile-optimized. The design automatically adjusts to fit any screen size — phones, tablets, and desktops. Since most customers view your menu on their phone after scanning a QR code, the mobile experience is our top priority.",
  },
]

export default function DigitalMenuDesignPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Digital Menu Design for Restaurants — Beautiful QR Menu Templates",
          description:
            "Complete guide to digital menu design for restaurants. Learn how to create stunning QR menu designs with food photos, branding, and real-time updates.",
          author: { "@type": "Organization", name: "Digital QR Menue" },
          datePublished: "2024-01-15",
          dateModified: "2026-07-21",
          publisher: { "@type": "Organization", name: "Digital QR Menue" },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://www.digitalmenue.com/digital-menu-design",
          },
        }}
      />
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://www.digitalmenue.com" },
          { name: "Digital Menu Design", url: "https://www.digitalmenue.com/digital-menu-design" },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <div className="min-h-screen bg-white">
        <LandingHeader />

        {/* Hero */}
        <section className="bg-black text-white py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-5 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Digital Menu Design for Restaurants
            </h1>
            <p className="text-base md:text-lg text-[#AAA] max-w-2xl mx-auto leading-relaxed">
              Create beautiful, professional digital menus for your restaurant. Stunning templates,
              HD food photos, custom branding, and instant updates. No design skills required.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/signup/restaurant"
                className="bg-white text-black px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#E5E5E5] transition-colors"
              >
                Create Your Menu Design
              </Link>
              <Link
                href="/pricing"
                className="px-6 py-3.5 rounded-xl border border-[#333] text-sm font-medium text-white hover:bg-[#1A1A1A] transition-colors"
              >
                View Plans
              </Link>
            </div>
          </div>
        </section>

        {/* Why Menu Design Matters */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Why Menu Design Matters for Your Restaurant
              </h2>
              <div className="space-y-5 text-sm md:text-base text-[#555] leading-relaxed">
                <p>
                  Your menu is the single most important sales tool in your restaurant. A well-designed
                  digital menu does more than just list dishes — it guides customers toward your most
                  profitable items, showcases your food in the best light, and creates a memorable
                  dining experience before the first bite.
                </p>
                <p>
                  Studies show that restaurant menu design directly impacts customer choices and
                  spending. Strategic placement of high-margin items, professional food photography,
                  and clear pricing presentation can increase average order values by 20-30%. In the
                  digital age, your <strong>digital menu design</strong> is often the first interaction
                  a customer has with your restaurant.
                </p>
                <p>
                  A poorly designed menu confuses customers and leads to hesitation, while a clean,
                  visually appealing design builds confidence and encourages exploration. With
                  Digital QR Menue, you get professional <strong>digital menu design</strong> tools
                  that make your restaurant look its best — without hiring a designer.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Design Features */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Digital Menu Design Features
            </h2>
            <p className="text-sm text-[#555] text-center mb-12 max-w-lg mx-auto">
              Everything you need to create a stunning digital menu that drives orders.
            </p>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  title: "HD Food Photos",
                  description:
                    "Showcase every dish with high-resolution photos. Upload from your phone or computer. Photos make dishes irresistible and increase order values.",
                },
                {
                  title: "Smart Categories",
                  description:
                    "Organize dishes into clear categories — appetizers, mains, desserts, drinks. Custom category ordering lets you highlight your best items first.",
                },
                {
                  title: "Custom Branding",
                  description:
                    "Match your menu to your restaurant's brand. Set custom colors, upload your logo, and choose fonts that reflect your restaurant's personality.",
                },
                {
                  title: "Mobile-First Design",
                  description:
                    "Every menu is fully responsive and optimized for phones. Customers scan a QR code and see a beautiful, easy-to-navigate menu instantly.",
                },
                {
                  title: "Real-Time Updates",
                  description:
                    "Change prices, add new dishes, or remove sold-out items instantly. Updates take effect immediately — no reprinting, no waiting, no extra cost.",
                },
                {
                  title: "Multi-Language Support",
                  description:
                    "Create menus in English, Urdu, or both. Perfect for Pakistani restaurants serving diverse customers. Switch between languages with one tap.",
                },
              ].map((feature, i) => (
                <div key={i} className="p-6 md:p-7 bg-white rounded-2xl border border-[#F0F0F0]">
                  <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#555] leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Before & After */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Before & After: The Power of Good Menu Design
            </h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-lg mx-auto">
              See how professional digital menu design transforms the way customers view your dishes.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Before */}
              <div className="p-6 md:p-8 rounded-2xl bg-[#F9FAFB] border border-[#F0F0F0]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#999] mb-3 block">Before — Plain Text Menu</span>
                <div className="space-y-3">
                  {[
                    { name: "Chicken Biryani", price: "PKR 250" },
                    { name: "Mutton Karahi", price: "PKR 450" },
                    { name: "Chicken Qorma", price: "PKR 320" },
                    { name: "Nihari", price: "PKR 350" },
                    { name: "Kheer", price: "PKR 150" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-[#E8E8E8] last:border-0">
                      <span className="text-sm text-[#555]">{item.name}</span>
                      <span className="text-sm font-medium text-[#999]">{item.price}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#AAA] mt-4 text-center">
                  No photos, no descriptions, no visual appeal. Customers cannot see what they are ordering.
                </p>
              </div>

              {/* After */}
              <div className="p-6 md:p-8 rounded-2xl bg-black text-white">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#AAA] mb-3 block">After — Designed Digital Menu</span>
                <div className="space-y-3">
                  {[
                    { name: "Chicken Biryani", desc: "Fragrant basmati rice with tender chicken, aromatic spices", price: "PKR 250" },
                    { name: "Mutton Karahi", desc: "Slow-cooked mutton in rich tomato and ginger gravy", price: "PKR 450" },
                    { name: "Chicken Qorma", desc: "Creamy yogurt-based curry with traditional spices", price: "PKR 320" },
                    { name: "Nihari", desc: "Overnight-simmered beef shank in spiced gravy", price: "PKR 350" },
                    { name: "Kheer", desc: "Creamy rice pudding with cardamom and pistachio", price: "PKR 150" },
                  ].map((item, i) => (
                    <div key={i} className="py-2.5 border-b border-[#1A1A1A] last:border-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                          <span className="text-sm font-medium">{item.name}</span>
                          <p className="text-xs text-[#AAA] mt-0.5">{item.desc}</p>
                        </div>
                        <span className="text-sm font-medium text-white shrink-0">{item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#555] mt-4 text-center">
                  Descriptions guide choices. Professional layout builds confidence. Photos (not shown) boost orders.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Design Tips */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Digital Menu Design Tips for Restaurants
            </h2>
            <p className="text-sm text-[#555] text-center mb-12 max-w-lg mx-auto">
              Professional design strategies to increase orders and customer satisfaction.
            </p>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                {
                  num: "01",
                  title: "Use High-Quality Food Photos",
                  desc: "Photos are the #1 factor in digital menu success. Use well-lit, high-resolution images that show the actual dish. Blurry or dark photos hurt credibility and reduce orders. Digital QR Menue supports full HD photo uploads.",
                },
                {
                  num: "02",
                  title: "Write Descriptive Dish Names",
                  desc: "Instead of 'Chicken Curry,' write 'Creamy Butter Chicken Curry with Kasuri Methi.' Descriptive names paint a picture and justify higher prices. They also help with search and make your menu feel premium.",
                },
                {
                  num: "03",
                  title: "Keep Pricing Clean & Simple",
                  desc: "Display prices clearly next to each item. Avoid cluttering with currency symbols on every line — use PKR on the header and numbers below. Right-align prices for easy scanning. Consider omitting the PKR symbol (save 30-40% space) and just use numbers.",
                },
                {
                  num: "04",
                  title: "Organize by Smart Categories",
                  desc: "Group dishes logically: Appetizers, Main Course, BBQ, Drinks, Desserts. Put your most profitable items at the top of each category. Keep categories concise — too many options overwhelm customers and slow decision-making.",
                },
                {
                  num: "05",
                  title: "Highlight Signature & Chefs Specials",
                  desc: "Use visual cues like badges, borders, or icons to highlight your signature dishes and chef specials. Featured items get 3x more orders than regular listings. Digital QR Menue lets you tag dishes as 'Chef's Special' or 'Most Popular.'",
                },
                {
                  num: "06",
                  title: "Match Your Brand Identity",
                  desc: "Your digital menu should look like an extension of your restaurant. Use your brand colors, logo, and consistent fonts. A branded menu builds trust and recognition. Growth and Premium plans include full customization options.",
                },
              ].map((tip, i) => (
                <div key={i} className="p-6 md:p-7 bg-white rounded-2xl border border-[#F0F0F0]">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#BBB]">{tip.num}</span>
                  <h3 className="font-semibold text-base mt-1 mb-2">{tip.title}</h3>
                  <p className="text-sm text-[#555] leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              How to Design Your Digital Menu in 4 Steps
            </h2>
            <p className="text-sm text-[#555] text-center mb-12 max-w-lg mx-auto">
              Professional menu design made simple. No experience needed.
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Sign Up", desc: "Create your free account in 30 seconds. No credit card needed." },
                { step: "2", title: "Choose a Template", desc: "Select from professional templates. Add your brand colors and logo." },
                { step: "3", title: "Add Dishes & Photos", desc: "Upload your menu items with HD photos, prices, and descriptions." },
                { step: "4", title: "Publish & Share", desc: "Print your QR code and share your menu link. Your design goes live instantly." },
              ].map((step, i) => (
                <div key={i} className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-lg font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{step.title}</h3>
                  <p className="text-xs text-[#555] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries */}
        <section className="py-16 md:py-20 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Who Needs Professional Digital Menu Design?
            </h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-lg mx-auto">
              From fine dining to cloud kitchens — great menu design helps every food business.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                "Fine Dining Restaurants", "Cafes & Coffee Shops", "Fast Food Chains", "BBQ & Grill Houses",
                "Bakeries & Patisseries", "Cloud Kitchens", "Food Trucks", "Home-Based Food Businesses",
              ].map((item, i) => (
                <div key={i} className="p-4 bg-white rounded-xl border border-[#F0F0F0] text-center text-sm font-medium text-[#555]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
              Frequently Asked Questions About Digital Menu Design
            </h2>
            <p className="text-sm text-[#555] text-center mb-10 max-w-md mx-auto">
              Everything you need to know about designing a digital menu for your restaurant.
            </p>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="group p-4 md:p-5 bg-white rounded-xl border border-[#F0F0F0] open:shadow-sm transition-shadow">
                  <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                    {faq.question}
                    <span className="text-[#999] text-lg group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <p className="text-sm text-[#555] leading-relaxed mt-3 pt-3 border-t border-[#F0F0F0]">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Explore More — internal link hub */}
        <section className="py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-5 text-center">
            <h2 className="text-lg font-bold mb-4">Explore More Digital Menu Solutions</h2>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link href="/digital-menu-for-restaurants" className="px-4 py-2 rounded-full bg-[#F5F5F5] text-sm font-medium hover:bg-black hover:text-white transition-colors">
                Digital Menu for Restaurants
              </Link>
              <Link href="/digital-menu-pdf" className="px-4 py-2 rounded-full bg-[#F5F5F5] text-sm font-medium hover:bg-black hover:text-white transition-colors">
                PDF to QR Menu
              </Link>
              <Link href="/digital-menu-app" className="px-4 py-2 rounded-full bg-[#F5F5F5] text-sm font-medium hover:bg-black hover:text-white transition-colors">
                Digital Menu App
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-black text-white">
          <div className="max-w-2xl mx-auto px-5 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Design Your Digital Menu Today
            </h2>
            <p className="text-sm text-[#AAA] mb-8 max-w-md mx-auto">
              Create a stunning digital menu design for your restaurant. Start your free trial — no credit card needed. Join thousands of restaurants using Digital QR Menue.
            </p>
            <Link
              href="/signup/restaurant"
              className="inline-block bg-white text-black px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#E5E5E5] transition-colors"
            >
              Create Your Menu Design →
            </Link>
            <p className="text-xs text-[#666] mt-3">Free 30-day trial • Full access • No credit card required</p>
          </div>
        </section>
      </div>
    </>
  )
}
