"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingCart, Home, ClipboardList } from "lucide-react"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const nav = [
    { href: "/restaurants", label: "Home", icon: Home },
    { href: "/cart", label: "Cart", icon: ShoppingCart },
    { href: "/account", label: "Orders", icon: ClipboardList },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 pb-[60px] max-w-app w-full safe-top">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 h-[60px] bg-white border-t border-[#F0F0F0] flex items-center justify-around safe-bottom z-50 md:max-w-app md:mx-auto md:left-[calc(50%-240px)]">
        {nav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 transition-colors min-touch justify-center ${
                isActive ? "text-black" : "text-[#999]"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
