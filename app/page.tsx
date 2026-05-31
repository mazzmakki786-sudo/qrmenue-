import Link from "next/link"
import { Button } from "@/components/ui/button"
import { QrCode, Smartphone, Store, CreditCard } from "lucide-react"

const features = [
  { icon: QrCode, title: "QR Code Menu", desc: "Each restaurant gets a unique QR code. Customers scan and order instantly." },
  { icon: Smartphone, title: "No App Required", desc: "Opens in browser — no download, no friction, works on every phone." },
  { icon: Store, title: "Owner Dashboard", desc: "Manage menu, view orders, track analytics, all from your phone or laptop." },
  { icon: CreditCard, title: "Affordable Pricing", desc: "Starting at just PKR 800/month. No foodpanda commissions." },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 h-16 border-b border-[#F0F0F0]">
        <span className="font-bold text-lg">QRMenu.pk</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-[#555] hover:text-black">
            Sign In
          </Link>
          <Link href="/signup/restaurant">
            <Button size="sm" variant="primary">Get Started</Button>
          </Link>
        </div>
      </header>

      <section className="px-6 py-20 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Pakistan's Digital Menu Platform
        </h1>
        <p className="text-lg text-[#555] mb-8">
          Replace printed menus with QR codes. Customers scan, order, and you get notified — all without paying 30% commission.
        </p>
        <Link href="/signup/restaurant">
          <Button variant="accent" size="lg">Start Free Trial</Button>
        </Link>
        <p className="text-xs text-[#555] mt-3">7-day free trial • No credit card required</p>
      </section>

      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-[#555]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#F8F8F8] px-6 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-8 text-left">
          {[
            { step: "1", title: "Sign up", desc: "Create your restaurant profile in 2 minutes" },
            { step: "2", title: "Add your menu", desc: "Add categories, dishes, and prices" },
            { step: "3", title: "Print QR & grow", desc: "Display QR on tables. Customers order via WhatsApp." },
          ].map((s) => (
            <div key={s.step} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                {s.step}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{s.title}</h3>
                <p className="text-sm text-[#555] mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-8 text-sm text-[#555]">
        <p>QRMenu.pk — Made in Pakistan 🇵🇰</p>
      </footer>
    </div>
  )
}
