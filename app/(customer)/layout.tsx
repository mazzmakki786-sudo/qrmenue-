"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingCart, Home, ClipboardList } from "lucide-react"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { useCartStore } from "@/stores/cartStore"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const totalItems = useCartStore((s) => s.getTotalItems)()

  const nav = [
    { href: "/restaurants", label: "Home", icon: Home, ariaLabel: "Home" },
    { href: "/cart", label: "Cart", icon: ShoppingCart, ariaLabel: "Cart" },
    { href: "/account", label: "Orders", icon: ClipboardList, ariaLabel: "Orders" },
  ]

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-white">
        <main className="flex-1 pb-[60px] max-w-app w-full safe-top">
          {children}
        </main>
        <nav
          role="navigation"
          aria-label="Main navigation"
          className="fixed bottom-0 left-0 right-0 h-[60px] bg-white border-t border-[#F0F0F0] flex items-center justify-around z-50 md:max-w-app md:mx-auto md:left-[calc(50%-240px)]"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {nav.map((item) => {
            const isActive = item.href === "/restaurants"
              ? pathname === "/restaurants" || pathname.startsWith("/restaurant")
              : pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.ariaLabel}
                className={`relative flex flex-col items-center gap-0.5 transition-colors min-touch justify-center ${
                  isActive ? "text-black" : "text-[#999]"
                }`}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {item.href === "/cart" && totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] rounded-full bg-[#25D366] text-white text-[10px] font-bold flex items-center justify-center px-1">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-black" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </ErrorBoundary>
  )
}
