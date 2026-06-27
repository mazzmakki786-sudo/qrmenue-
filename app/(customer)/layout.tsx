"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingCart, Home, ClipboardList, Heart } from "lucide-react"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { useCartStore } from "@/stores/cartStore"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const items = useCartStore((s) => s.items)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const nav = [
    { href: "/restaurants", label: "Home", icon: Home, ariaLabel: "Home" },
    { href: "/favorites", label: "Favs", icon: Heart, ariaLabel: "Favorites" },
    { href: "/cart", label: "Cart", icon: ShoppingCart, ariaLabel: "Cart" },
    { href: "/account", label: "Orders", icon: ClipboardList, ariaLabel: "Orders" },
  ]

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        <main className="pb-12">
          {children}
        </main>
        <nav
          role="navigation"
          aria-label="Main navigation"
          className="fixed bottom-0 left-0 right-0 h-12 bg-white border-t border-border flex items-center justify-around z-50"
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
                className={`relative flex flex-col items-center justify-center min-w-[64px] h-full transition-colors ${
                  isActive ? "text-primary" : "text-text-muted hover:text-text-secondary"
                }`}
              >
                <div className="relative">
                  <item.icon className={`w-4 h-4 ${isActive ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
                  {item.href === "/cart" && totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[14px] h-3.5 rounded-full bg-primary text-white text-[8px] font-bold flex items-center justify-center px-0.5 shadow-sm">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] mt-0.5 ${isActive ? "font-semibold" : "font-medium"}`}>{item.label}</span>
                {isActive && (
                  <span className="absolute top-0 w-8 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </ErrorBoundary>
  )
}
