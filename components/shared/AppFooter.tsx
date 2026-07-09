import Link from "next/link"

export function AppFooter() {
  return (
    <footer className="border-t border-[#F0F0F0]">
      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2 font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center text-xs">D</div>
              Digital QR Menue
            </div>
            <p className="text-xs text-[#999]">Made in Pakistan with 💚</p>
          </div>
          <div className="flex gap-6 text-xs text-[#555]">
            <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
            <Link href="/restaurants" className="hover:text-black transition-colors">Restaurants</Link>
            <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
          </div>
          <div className="flex gap-4 text-xs text-[#555]">
            <Link href="/privacy" className="hover:text-black underline transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-black underline transition-colors">Terms of Service</Link>
          </div>
        </div>
        <div className="text-center mt-6 text-[10px] text-[#BBB]">
          &copy; 2026 Digital QR Menue. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
