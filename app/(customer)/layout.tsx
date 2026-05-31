import Link from "next/link"
import { ShoppingCart, Home, User } from "lucide-react"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-[60px]">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 h-[60px] bg-white border-t border-[#F0F0F0] flex items-center justify-around safe-bottom z-50">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-[#999]">
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link href="/cart" className="flex flex-col items-center gap-0.5 text-[#999]">
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px]">Cart</span>
        </Link>
        <Link href="/account" className="flex flex-col items-center gap-0.5 text-[#999]">
          <User className="w-5 h-5" />
          <span className="text-[10px]">Account</span>
        </Link>
      </nav>
    </div>
  )
}
