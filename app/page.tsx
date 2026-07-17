import { createClient, createAdminClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ContactSection } from "@/components/shared/ContactSection"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { PricingSection } from "@/components/pricing/PricingSection"
import { AppFooter } from "@/components/shared/AppFooter"
import { mapPlan, type DBPlan } from "@/lib/map-plans"
import { FaqJsonLd } from "@/components/JsonLd"

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()
    if (restaurant) redirect("/dashboard")
    redirect("/restaurants")
  }

  const { data: settingsData } = await supabase
    .from("company_settings")
    .select("key, value")

  const settings: Record<string, string> = {}
  ;(settingsData || []).forEach((s: any) => { settings[s.key] = s.value })

  // Server-side fetch -- zero client loading for pricing section
  const admin = createAdminClient()
  const { data: dbPlans } = await admin
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  const initialPlans = (dbPlans as DBPlan[] | null)?.map(mapPlan) || []

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      {/* ─── Hero ─── */}
      <section className="relative bg-black">
        <div className="max-w-6xl mx-auto px-5 pt-28 pb-24 md:pt-40 md:pb-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <span className="text-xs font-medium text-white/70 tracking-wide">Trusted by 1,000+ Restaurants in Pakistan</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6 max-w-5xl mx-auto text-white">
              From Menu to Order in Seconds &mdash;{" "}
              <span className="text-[#25D366]">Zero Commission</span>
            </h1>
            <p className="text-base md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
              Ab menu print karne ka kharcha khatam! Apne customers ko dein behtareen digital menu card aur orders receive karein seedha apne WhatsApp par. Aaj hi free trial shuru karein.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup/restaurant"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-[#25D366] hover:text-black transition-all hover:scale-[1.02] active:scale-[0.98] text-center shadow-lg shadow-white/10"
              >
                Start Free Trial
              </Link>
              <Link
                href="/restaurants"
                data-testid="browse-restaurants-btn"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/20 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white hover:border-white/40 transition-all text-center"
              >
                Browse Restaurants
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Steps / How It Works ─── */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12 md:mb-20">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#999] mb-4">How It Works</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Get started in 3 simple steps</h2>
          </div>
          {/* Mobile: stacked with timeline */}
          <div className="md:hidden max-w-sm mx-auto">
            {[
              { num: "01", title: "Create Your Menu", desc: "Add your dishes, prices, and photos through our simple dashboard. Takes under 5 minutes — no technical skills needed." },
              { num: "02", title: "Print the QR Code", desc: "We generate a unique QR code for your restaurant. Download, print, and place on tables, menus, or your storefront." },
              { num: "03", title: "Start Receiving Orders", desc: "Customers scan the code, browse your menu, and order via WhatsApp. You keep 100% of every order." },
            ].map((step, i) => (
              <div key={step.num} className="flex gap-5 relative">
                {i < 2 && <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-[#E8E8E8]" />}
                <div className="relative z-10 w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold">{step.num}</span>
                </div>
                <div className="pb-10 flex-1">
                  <h3 className="font-bold text-base mb-1.5">{step.title}</h3>
                  <p className="text-sm text-[#555] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: 3 columns */}
          <div className="hidden md:grid md:grid-cols-3 gap-10 md:gap-16 relative">
            <div className="absolute top-9 left-[10%] right-[10%] h-[2px] bg-[#E8E8E8]" />
            {[
              { num: "01", title: "Create Your Menu", desc: "Add your dishes, prices, and photos through our simple dashboard. Takes under 5 minutes — no technical skills needed." },
              { num: "02", title: "Print the QR Code", desc: "We generate a unique QR code for your restaurant. Download, print, and place on tables, menus, or your storefront." },
              { num: "03", title: "Start Receiving Orders", desc: "Customers scan the code, browse your menu, and order via WhatsApp. You keep 100% of every order." },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="relative z-10 w-[72px] h-[72px] rounded-full bg-black text-white flex items-center justify-center mx-auto mb-6">
                  <span className="text-xl font-bold">{step.num}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-[#555] leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEO Content Section ─── */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Digital QR Menu for Restaurants &mdash; The Complete Guide
          </h2>
          <div className="text-sm md:text-base text-[#555] leading-relaxed space-y-5">
            <h3 className="text-lg md:text-xl font-semibold text-black mt-8 mb-3">
              What Is a QR Code Menu for Restaurants?
            </h3>
            <p>
              A <strong>menu QR code</strong> is a scannable barcode that diners scan with their smartphone camera to instantly
              view a <strong>digital restaurant menu</strong> on their screen. Instead of handing out printed paper menus that
              get outdated the moment prices change, restaurants in Pakistan are switching to a <strong>digital QR menu</strong>
              that updates in real-time. A <strong>digital food menu</strong> powered by QR technology allows customers to
              browse dishes, see photos, check prices, and place an <strong>online order</strong> &mdash; all without waiting for a waiter.
              For any <strong>menu QR code restaurant</strong> setup, the process is simple: the restaurant creates its
              <strong>digital QR code menu</strong> on a platform like Digital QR Menue, prints the unique QR code on a table
              tent card, and diners scan it the moment they sit down.
            </p>

            <h3 className="text-lg md:text-xl font-semibold text-black mt-8 mb-3">
              How to Create a Digital Menu with QR Code
            </h3>
            <p>
              Learning <strong>how to create a digital menu with QR code</strong> technology is easier than you think.
              Most <strong>digital menu design</strong> platforms, including Digital QR Menue, let you set up a complete
              <strong>digital QR menu for restaurant</strong> in under five minutes. You simply add your dishes, prices,
              and photos through a dashboard; the platform generates a unique QR code linked to your <strong>online menu</strong>;
              you print the code and place it on your tables; and customers start scanning and ordering immediately.
              Unlike traditional paper menus that can cost PKR 2,000&ndash;8,000 per reprint batch, a <strong>digital QR menu</strong>
              never needs reprinting. For restaurants looking for a <strong>free QR code order online</strong> solution,
              Digital QR Menue offers a free trial so you can test the system before committing.
            </p>

            <h3 className="text-lg md:text-xl font-semibold text-black mt-8 mb-3">
              How to Get Orders on WhatsApp with QR Code Menus
            </h3>
            <p>
              One of the biggest advantages of a <strong>QR code menu free</strong> platform is WhatsApp integration.
              Restaurant owners frequently ask <strong>how to get order on WhatsApp</strong> or <strong>how to take orders on WhatsApp</strong>
              without hiring extra staff. The answer is a <strong>digital restaurant menu QR code</strong> system. When a customer
              scans your QR code, browses your <strong>digital food menu</strong>, and selects items, their complete order
              &mdash; item names, quantities, prices, and special instructions &mdash; is formatted and sent directly to your
              restaurant&apos;s WhatsApp number. Customers simply tap &quot;Order via WhatsApp,&quot; and a pre-filled message
              with their complete order appears. Restaurant owners also <strong>get order updates on WhatsApp</strong> in real-time,
              so there&apos;s never any confusion. This is the future of <strong>online restaurant ordering</strong> &mdash; direct,
              commission-free, and instant.
            </p>

            <h3 className="text-lg md:text-xl font-semibold text-black mt-8 mb-3">
              Online Ordering System for Restaurants in Pakistan
            </h3>
            <p>
              A modern <strong>online ordering system</strong> does more than just display a menu. The best
              <strong>online restaurant ordering platforms</strong> give customers a seamless experience from browsing to payment.
              When you build your <strong>online restaurant ordering website</strong> around a QR code, every table in your
              restaurant becomes a self-ordering station. Customers who search for &quot;<strong>online order food near me</strong>&quot;
              can find your restaurant through the platform directory, browse your <strong>pizza online menu</strong>, and order ahead
              for pickup or delivery. For <strong>true digital restaurants</strong>, the <strong>online restaurant ordering system</strong>
              must support multiple payment methods. Digital QR Menue integrates with JazzCash and Easypaisa so customers can
              <strong>scan and get orders</strong> paid for before they even arrive.
            </p>

            <h3 className="text-lg md:text-xl font-semibold text-black mt-8 mb-3">
              Why QR Code Menus Are Taking Over Pakistan&apos;s Restaurant Industry
            </h3>
            <p>
              There&apos;s a reason more <strong>restaurants with QR code menus</strong> are appearing across Lahore, Karachi,
              Islamabad, and every major Pakistani city. Food aggregators like Foodpanda charge 25&ndash;35% commission per order.
              A restaurant doing PKR 200,000 in monthly orders loses PKR 50,000+ to commissions. By switching to a
              <strong>menu QR code restaurant</strong> system with direct WhatsApp ordering, that commission disappears entirely.
              Additionally, <strong>digital restaurants</strong> equipped with QR menus reduce labor costs, eliminate order errors
              from phone calls, and provide customers with a modern dining experience. For restaurants searching
              &quot;<strong>QR code menu Pakistan</strong>&quot; or &quot;<strong>scan menu code online free</strong>&quot; tools,
              Digital QR Menue is the most comprehensive platform available.
            </p>
            <p>
              Whether you run a <Link href="/restaurants?city=lahore" className="text-black underline underline-offset-2 hover:no-underline font-medium">caf&eacute; in Lahore</Link>,
              a <Link href="/restaurants?city=karachi" className="text-black underline underline-offset-2 hover:no-underline font-medium">restaurant in Karachi</Link>,
              a <Link href="/restaurants?city=islamabad" className="text-black underline underline-offset-2 hover:no-underline font-medium">diner in Islamabad</Link>,
              or an eatery in <Link href="/restaurants?city=faisalabad" className="text-black underline underline-offset-2 hover:no-underline font-medium">Faisalabad</Link>,
              <Link href="/restaurants?city=rawalpindi" className="text-black underline underline-offset-2 hover:no-underline font-medium">Rawalpindi</Link>,
              <Link href="/restaurants?city=peshawar" className="text-black underline underline-offset-2 hover:no-underline font-medium">Peshawar</Link>, or
              <Link href="/restaurants?city=multan" className="text-black underline underline-offset-2 hover:no-underline font-medium">Multan</Link>
              &mdash; a <strong>digital QR menu</strong> works for every type of food business. Get started with a
              <Link href="/signup/restaurant" className="text-black underline underline-offset-2 hover:no-underline font-medium">free trial today</Link>
              and see why hundreds of Pakistani restaurants have already gone digital.
              Visit our <Link href="/faq" className="text-black underline underline-offset-2 hover:no-underline font-medium">FAQ</Link> or
              <Link href="/blog" className="text-black underline underline-offset-2 hover:no-underline font-medium">blog</Link>
              for more restaurant tips and guides.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Why Choose Us ─── */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14 md:mb-20">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#999] mb-4">Why Choose Us</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              The smarter way to run your restaurant
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-14 max-w-5xl mx-auto">
            {[
              {
                title: "Save 30% on Delivery Commissions",
                desc: "Foodpanda charges 25-35% per order. With Digital QR Menue, every order goes directly through your customer's WhatsApp — no middleman, no commission. A restaurant doing PKR 200,000/month in orders saves over PKR 50,000 every month.",
                highlights: ["Zero commission on every order", "No listing fees or hidden charges", "Full bill amount is yours to keep"],
              },
              {
                title: "Eliminate Menu Reprint Costs",
                desc: "Paper menus cost PKR 2,000 – 8,000+ per batch and are outdated the moment prices change. Update prices, add dishes, or swap seasonal items in real-time from your dashboard. Zero printing cost. Zero waste.",
                highlights: ["Instant price updates — no reprinting", "Save PKR 6,000 – 24,000 per year", "Eco-friendly — eliminate paper waste"],
              },
              {
                title: "100% Error-Free Orders",
                desc: "Phone call orders lead to wrong items, misheard quantities, and disputes. When customers build their own cart, they see the menu, pick their items, and send a perfectly formatted WhatsApp order. Your kitchen gets the exact order, every time.",
                highlights: ["Customers type their own order", "All details in writing — no miscommunication", "No more 'I ordered something else' disputes"],
              },
              {
                title: "No App Downloads for Customers",
                desc: "No app store. No sign-up. No OTP. Your customer scans the QR code on their table — that's it. The menu opens instantly in their phone browser. Works on every phone — Android, iPhone, even basic smartphones.",
                highlights: ["Scan with the phone camera", "Works on every smartphone in Pakistan", "Higher engagement, faster orders"],
              },
            ].map((item, i) => (
              <div key={i} className="group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center text-sm font-bold shrink-0 group-hover:bg-[#25D366] transition-colors">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                </div>
                <p className="text-sm text-[#555] leading-relaxed mb-4">{item.desc}</p>
                <ul className="space-y-2">
                  {item.highlights.map((h, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-[#666]">
                      <svg className="w-4 h-4 mt-0.5 text-[#25D366] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ─── Pricing ─── */}
      <PricingSection
        heading="Simple, Transparent Pricing"
        description="No hidden fees. No commission on orders. Cancel anytime."
        initialPlans={initialPlans}
      />

      {/* ─── Blog ─── */}
      <section className="py-20 md:py-28 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#999] mb-4">Blog</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Restaurant Tips &amp; Guides</h2>
            <p className="text-sm text-[#555] max-w-md mx-auto">
              Learn how to grow your restaurant with QR menus, WhatsApp ordering, and smart marketing strategies.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <Link
              href="/blog/how-to-make-qr-code-menu-for-restaurant"
              className="group block bg-white rounded-2xl border border-[#F0F0F0] p-6 md:p-8 hover:border-[#D0D0D0] hover:shadow-sm transition-all mb-8"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#25D366]">QR Menu Guides</span>
                <span className="text-[11px] text-[#999]">7 min read</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-black mb-2 group-hover:text-[#25D366] transition-colors">
                How to Make a QR Code Menu for Your Restaurant: Complete Step-by-Step Guide
              </h3>
              <p className="text-sm text-[#555] leading-relaxed">
                Learn how to make a QR code menu for your restaurant in Pakistan. Step-by-step guide covering QR code menu card price, WhatsApp ordering setup, and pro tips.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-black">
                Read Article
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>
          </div>
          <div className="text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-[#1A1A1A] transition-all"
            >
              View All Articles
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FAQs ─── */}
      <FaqJsonLd faqs={[
        {
          question: "How can I order food online?",
          answer: "Ordering food online is easy with Digital QR Menue. Simply visit any restaurant's digital menu by scanning their QR code with your phone camera, browse the menu, select your dishes, and tap 'Order via WhatsApp.' The order is sent directly to the restaurant — no app download, no sign-up required. You can pay via JazzCash, Easypaisa, or cash on delivery. Browse our restaurant directory to find digital menus near you in Lahore, Karachi, Islamabad, and across Pakistan."
        },
        {
          question: "Which delivery app is best for food?",
          answer: "While Foodpanda and Cheetay are popular in Pakistan, they charge restaurants 25-35% commission per order — costs that are passed on to customers through higher prices. The best alternative is a direct QR code ordering system like Digital QR Menue. Customers scan a QR code to view the menu and order directly via WhatsApp. Restaurants keep 100% of their revenue, and customers get better prices since there is no middleman commission."
        },
        {
          question: "How to create a digital menu for your restaurant?",
          answer: "Creating a digital QR menu for your restaurant takes under 5 minutes with Digital QR Menue. Sign up for a free trial, add your restaurant name and details, upload your dishes with prices and photos, and the platform instantly generates a unique QR code. Download and print the QR code on table tents, stickers, or menus. Customers scan it with their phone to view your digital menu and place orders directly on WhatsApp. No technical skills needed."
        },
        {
          question: "What is a QR code menu and how does it work?",
          answer: "A QR code menu is a digital menu that customers access by scanning a QR code with their phone camera. Once scanned, your full menu with photos, prices, and categories opens in their browser. They can browse dishes and place orders directly through WhatsApp — no app download needed."
        },
        {
          question: "How much does Digital QR Menue cost?",
          answer: "We offer a 30-day free trial with no credit card required. Paid plans start at PKR 1,500/month. Unlike Foodpanda which charges 25-35% commission per order, we charge a flat monthly fee with zero commission on orders."
        },
        {
          question: "How do restaurants get orders on WhatsApp?",
          answer: "Restaurants get orders on WhatsApp by using a digital QR menu system. When a customer scans the QR code, browses the menu, and selects items, a pre-formatted WhatsApp message containing their name, selected items, quantities, and prices is sent directly to the restaurant's WhatsApp number. The restaurant receives order updates on WhatsApp in real-time and confirms with a simple reply."
        },
        {
          question: "Do customers need to download an app to use a QR code menu?",
          answer: "No. One of the biggest advantages of a digital QR menu ordering system is that it requires zero app downloads. Customers scan the QR code with their phone's built-in camera — no app store visit, no OTP verification, no account creation. The menu opens in their phone's browser instantly and works on every device."
        },
        {
          question: "What is the difference between ordering on Foodpanda vs ordering via QR code?",
          answer: "When you order on Foodpanda, the app charges the restaurant a 25-35% commission. This means the restaurant either increases prices or loses money on every order. With a Digital QR Menue QR code, you order directly through WhatsApp — the restaurant pays no commission, so prices stay fair. Additionally, Foodpanda requires an app download and account creation; a QR code menu opens instantly in your phone browser with zero friction."
        },
        {
          question: "Can I use QR code ordering for pizza and other specific cuisines?",
          answer: "Absolutely. Digital QR Menue works perfectly for all cuisine types. You can create a dedicated pizza online menu, a barbecue menu, a Chinese food menu, or any other cuisine. Organize dishes by categories (starters, main course, desserts, beverages), add high-quality photos, set prices, and mark items as available or sold out."
        },
        {
          question: "Is there a free QR code menu for restaurants in Pakistan?",
          answer: "Yes, Digital QR Menue offers a completely free 30-day trial with no credit card required. During the trial, you get full access to create your digital QR menu, upload up to 20 dishes, and start receiving WhatsApp orders. After the trial, paid plans start from PKR 1,200/month with unlimited dishes, orders, and zero commission on every sale."
        }
      ]} />
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#999] mb-4">FAQ</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-sm text-[#555] max-w-md mx-auto">Got questions? We have answers.</p>
          </div>
          <div className="space-y-3 mb-10">
            {[
              { q: "How can I order food online?", a: "Ordering food online is easy with Digital QR Menue. Simply scan any restaurant's QR code, browse their digital menu, select your dishes, and tap 'Order via WhatsApp.' The order goes directly to the restaurant — no app download or sign-up needed." },
              { q: "Which delivery app is best for food?", a: "Foodpanda charges restaurants 25-35% commission per order. The best alternative is a direct QR code ordering system like Digital QR Menue. Customers scan a QR code and order via WhatsApp — restaurants keep 100% of revenue, and customers get lower prices." },
              { q: "How to create a digital menu for your restaurant?", a: "Sign up for a free trial, add your dishes with prices and photos, and the platform generates a unique QR code instantly. Print and place on tables — customers scan and order via WhatsApp in seconds." },
              { q: "What is a QR code menu and how does it work?", a: "A QR code menu is a digital menu that customers access by scanning a QR code with their phone camera. Once scanned, your full menu with photos, prices, and categories opens in their browser. They can browse dishes and place orders directly through WhatsApp — no app download needed." },
              { q: "How much does Digital QR Menue cost?", a: "We offer a 30-day free trial with no credit card required. Paid plans start at PKR 1,500/month. Unlike Foodpanda which charges 25-35% commission per order, we charge a flat monthly fee with zero commission on orders." },
              { q: "How do restaurants get orders on WhatsApp?", a: "When a customer scans your QR code and selects items, a pre-formatted WhatsApp message with their complete order is sent directly to your restaurant WhatsApp. You confirm with one reply." },
            ].map((faq, i) => (
              <details key={i} className="group bg-white border border-[#E8E8E8] rounded-xl p-4 md:p-5 open:bg-[#FAFAFA] transition-colors">
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-sm md:text-base list-none">
                  <span>{faq.q}</span>
                  <span className="text-[#999] group-open:rotate-45 transition-transform text-xl leading-none shrink-0 ml-4">+</span>
                </summary>
                <p className="mt-3 text-sm text-[#555] leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-[#1A1A1A] transition-all"
            >
              View All FAQs
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Contact ─── */}
      <ContactSection settings={settings} />

      {/* ─── CTA ─── */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-24">
        <div className="bg-black rounded-3xl p-10 md:p-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#25D366]/10 to-transparent pointer-events-none" />
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 relative z-10">
            Ready to go digital?
          </h2>
          <p className="text-sm md:text-base text-white/70 mb-8 max-w-md mx-auto relative z-10">
            Join hundreds of restaurants in Pakistan using Digital QR Menue to streamline their ordering process.
          </p>
          <div className="relative z-10">
            <Link
              href="/signup/restaurant"
              className="inline-block px-10 py-3.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-[#25D366] hover:text-black transition-all"
            >
              Start Free Trial &mdash; No Credit Card
            </Link>
          </div>
        </div>
      </section>

      <AppFooter />
    </div>
  )
}
