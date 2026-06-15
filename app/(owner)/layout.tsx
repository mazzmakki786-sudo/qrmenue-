"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, UtensilsCrossed, ClipboardList, BarChart3, User, CreditCard, QrCode, Menu, X, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { BellNotification } from "@/components/owner/BellNotification"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import Head from "next/head"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Profile", icon: User },
  { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
  { href: "/dashboard/qr", label: "QR Code", icon: QrCode },
]

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setRestaurantId(data.id)
        })
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
      </Head>
      <header className="hidden md:flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-md border-b border-[#F0F0F0] sticky top-0 z-30">
        <div className="flex items-center gap-6 lg:gap-8">
          <Link href="/dashboard" className="font-bold text-lg tracking-tight flex-shrink-0">
            QRMenu.pk
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-black text-white" : "text-[#555] hover:bg-[#F0F0F0]"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {restaurantId && <BellNotification restaurantId={restaurantId} />}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#555] hover:bg-[#F0F0F0] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <div
        className="md:hidden flex items-center justify-between h-14 px-4 bg-white/80 backdrop-blur-md border-b border-[#F0F0F0] sticky top-0 z-30"
        style={{ paddingTop: "env(safe-area-inset-top)", height: "calc(56px + env(safe-area-inset-top))" }}
      >
        <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/dashboard" className="font-semibold text-sm">QRMenu.pk</Link>
        <div className="flex items-center gap-1">
          {restaurantId && <BellNotification restaurantId={restaurantId} />}
          <button
            onClick={handleLogout}
            className="p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <LogOut className="w-5 h-5 text-[#555]" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div
            className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white p-4 flex flex-col"
            style={{ paddingTop: "calc(16px + env(safe-area-inset-top))" }}
          >
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[#F0F0F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4 px-2">
              <p className="font-bold text-lg">QRMenu.pk</p>
              <p className="text-xs text-[#999]">Owner dashboard</p>
            </div>
            <nav className="space-y-1 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                      isActive ? "bg-black text-white" : "text-[#222] hover:bg-[#F0F0F0]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <hr className="my-3 border-[#F0F0F0]" />
            <button
              onClick={() => { setMobileOpen(false); handleLogout() }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#DC2626] hover:bg-red-50 w-full min-h-[44px]"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      <main
        className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto"
        style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  )
}
