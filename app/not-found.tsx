import Link from "next/link"

const links = [
  { href: "/restaurants", label: "Browse Restaurants", desc: "Find restaurants near you" },
  { href: "/pricing", label: "View Pricing", desc: "See our QR menu plans" },
  { href: "/faq", label: "FAQ", desc: "Get answers to common questions" },
]

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#F0F0F0]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center text-white text-xs font-bold">
              D
            </div>
            <span className="text-sm font-bold text-black">Digital QR Menue</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#F8F8F8] mb-4">
              <span className="text-5xl font-bold text-[#CCC]">404</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-3">
            Page not found
          </h1>
          <p className="text-sm text-[#666] mb-2 leading-relaxed max-w-xs mx-auto">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
          <p className="text-xs text-[#999] mb-10">
            Try checking the URL or use one of the links below.
          </p>

          <div className="space-y-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 p-4 rounded-xl border border-[#F0F0F0] hover:bg-[#FAFAFA] hover:border-[#DDD] transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors text-sm font-bold">
                  &rarr;
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-black">{link.label}</p>
                  <p className="text-xs text-[#888]">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/"
            data-testid="not-found-home-btn"
            className="inline-flex items-center justify-center gap-2 mt-8 w-full px-5 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-[#1A1A1A] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#F0F0F0] py-6">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-[#BBB]">&copy; 2026 Digital QR Menue. All rights reserved.</p>
          <div className="flex gap-4 text-[10px] text-[#999]">
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
