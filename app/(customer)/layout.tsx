"use client"

import Link from "next/link"
import { Suspense } from "react"
import { usePathname } from "next/navigation"
import { ShoppingCart, Home, ClipboardList, Heart, Menu } from "lucide-react"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { Toaster } from "@/components/shared/Toaster"
import { AppFooter } from "@/components/shared/AppFooter"
import { useCartStore } from "@/stores/cartStore"
import { LogoIcon } from "@/components/shared/LogoIcon"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const items = useCartStore((s) => s.items)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  // SEO landing pages use LandingHeader (marketing nav), not the customer layout nav
  const seoLandingPaths = [
    "/faq",
    "/digital-menu-for-restaurants",
    "/digital-menu-pdf",
    "/digital-menu-design",
    "/digital-menu-tablet",
    "/digital-menu-app",
    "/qr-menu-login",
    "/digital-menu-pakistan",
    "/qr-menu-pakistan",
    "/digital-menu-islamabad",
    "/digital-menu-lahore",
    "/digital-menu-karachi",
  ]
  const hideNav = seoLandingPaths.includes(pathname)

  const nav = [
    { href: "/restaurants", label: "Home", icon: Home, ariaLabel: "Home" },
    { href: "/favorites", label: "Favs", icon: Heart, ariaLabel: "Favorites" },
    { href: "/cart", label: "Cart", icon: ShoppingCart, ariaLabel: "Cart" },
    { href: "/account", label: "Orders", icon: ClipboardList, ariaLabel: "Orders" },
  ]

  const isActive = (href: string) =>
    href === "/restaurants"
      ? pathname === "/restaurants" || pathname.startsWith("/restaurant")
      : pathname === href || (href !== "/" && pathname.startsWith(href))

  return (
    <ErrorBoundary>
      <Toaster />
      <div className="min-h-screen bg-white flex flex-col">
        {!hideNav && (
          <>
          {/* Desktop Top Navbar */}
          <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
              <Link href="/restaurants" className="flex items-center gap-2.5 group">
                <LogoIcon className="w-7 h-7 shrink-0" />
                <span className="text-base font-bold text-black group-hover:opacity-70 transition-opacity">
                  Digital QR Menue
                </span>
              </Link>
              <nav className="flex items-center gap-1">
                {nav.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-label={item.ariaLabel}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? "bg-black text-white"
                          : "text-text-secondary hover:bg-[#F5F5F5]"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${active ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
                      {item.label}
                      {item.href === "/cart" && totalItems > 0 && (
                        <span className="min-w-[18px] h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center px-1 shadow-sm">
                          {totalItems > 99 ? "99+" : totalItems}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </header>

          {/* Main content expands to push footer to bottom — pt-14 offsets the fixed header on desktop */}
          <main className="flex-1 pt-0 md:pt-14 pb-14 md:pb-0">
            <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" /></div>}>
              {children}
            </Suspense>
          </main>

          {/* Footer — pushed to bottom by flex-1 on main, with safe space above mobile nav */}
          <div className="pb-14 md:pb-0">
            <AppFooter />
          </div>

          {/* Mobile Bottom Nav */}
          <nav
            role="navigation"
            aria-label="Main navigation"
            className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-border flex items-center justify-around z-50 safe-bottom"
          >
            {nav.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.ariaLabel}
                  className={`relative flex flex-col items-center justify-center min-w-0 flex-1 h-full transition-colors ${
                    active ? "text-primary" : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <div className="relative">
                    <item.icon className={`w-4 h-4 ${active ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
                    {item.href === "/cart" && totalItems > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-[14px] h-3.5 rounded-full bg-primary text-white text-[8px] font-bold flex items-center justify-center px-0.5 shadow-sm">
                        {totalItems > 99 ? "99+" : totalItems}
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] mt-0.5 ${active ? "font-semibold" : "font-medium"}`}>{item.label}</span>
                  {active && (
                    <span className="absolute top-0 w-8 h-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              )
            })}
          </nav>
          </>
        )}
        {hideNav && (
          <>
            <main className="flex-1">
              {children}
            </main>
            <AppFooter />
          </>
        )}
      </div>
    </ErrorBoundary>
  )
}
