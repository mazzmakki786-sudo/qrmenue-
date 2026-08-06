"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Suspense } from "react"
import { LayoutDashboard, UtensilsCrossed, ClipboardList, BarChart3, User, CreditCard, QrCode, Menu, X, LogOut, Megaphone, Percent, Table2, BellRing, ChevronLeft, Sparkles } from "lucide-react"
import { BellNotification } from "@/components/owner/BellNotification"
import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { fetchOwnerRestaurant } from "@/lib/owner-restaurant"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { Toaster } from "@/components/shared/Toaster"
import { usePushNotifications } from "@/lib/hooks/usePushNotifications"
import { LogoIcon } from "@/components/shared/LogoIcon"

const ALL_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/dashboard/deals", label: "Deals", icon: Percent },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
  { href: "/dashboard/tables", label: "Tables", icon: Table2 },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/ai-posters", label: "AI Posters", icon: Sparkles },
  { href: "/dashboard/settings", label: "Profile", icon: User },
  { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
  { href: "/dashboard/qr", label: "QR Code", icon: QrCode },
]

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [plan, setPlan] = useState<string>("trial")
  const push = usePushNotifications(restaurantId)
  const canHaveTables = ["growth", "growth-yearly", "premium", "premium-yearly"].includes(plan)
  const navItems = ALL_NAV_ITEMS.filter((item) => {
    if (item.href === "/dashboard/tables") return canHaveTables
    return true
  })

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).__ownerRestaurantCache) {
      const cached = (window as any).__ownerRestaurantCache
      if (cached && typeof cached.id === "string" && typeof cached.plan === "string") {
        setRestaurantId(cached.id)
        setPlan(cached.plan)
        return
      }
    }
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user?.id) return
      fetchOwnerRestaurant(supabase, user.id)
        .then(({ restaurant }) => {
          if (restaurant) {
            try {
              (window as any).__ownerRestaurantCache = { id: restaurant.id, plan: restaurant.plan }
            } catch {}
            setRestaurantId(restaurant.id)
            setPlan(restaurant.plan)
          }
        })
    }).catch(() => {})
  }, [])

  // Body scroll lock when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  // Escape key to close drawer
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && mobileOpen) {
      setMobileOpen(false)
    }
  }, [mobileOpen])

  useEffect(() => {
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [handleEscape])

  const handleLogout = async () => {
    setRestaurantId(null)
    setPlan("trial")
    delete (window as any).__ownerRestaurantCache
    try {
      // Sign out the browser client first so the persisted (localStorage) session is cleared.
      // Otherwise the client-side session survives and back-navigation re-logs the user in.
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {}
    try { await fetch("/api/auth/logout", { method: "POST" }) } catch {}
    // router.replace (not window.location.href) so the dashboard is wiped from history —
    // pressing back from /login won't return into the protected area.
    router.replace("/login")
  }

  const isActive = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(href))

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Toaster />
      {/* Do NOT use <head> in client components — causes hydration errors #418 */}


      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-[#EDEDED] z-40 shadow-sm">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-[#EDEDED] shrink-0">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shrink-0">
            <LogoIcon className="w-[18px] h-[18px]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-[#111] leading-tight">Digital QR</span>
            <span className="text-[15px] font-bold text-[#111] leading-tight -mt-0.5">Menue</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-[#F5F5F5] text-[#111]"
                    : "text-[#666] hover:bg-[#F5F5F5] hover:text-[#333]"
                }`}
              >
                {/* Active indicator */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-black rounded-full" />
                )}
                <Icon className={`w-[18px] h-[18px] shrink-0 transition-colors duration-150 ${
                  active ? "text-black" : "text-[#888] group-hover:text-[#555]"
                }`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5 shrink-0">
          <div className="border-t border-[#EDEDED] pt-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#DC2626] hover:bg-red-50 w-full transition-all duration-150 group"
            >
              <LogOut className="w-[18px] h-[18px] shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── DESKTOP TOP BAR ── */}
      <header className="hidden md:flex items-center justify-between h-16 px-6 bg-white/90 backdrop-blur-md border-b border-[#EDEDED] sticky top-0 z-30 ml-60">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
          <h1 className="text-[15px] font-semibold text-[#222]">
            {navItems.find((i) => isActive(i.href))?.label || "Dashboard"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Bell Notification */}
          {restaurantId && (
            <div className="relative">
              <BellNotification restaurantId={restaurantId} />
            </div>
          )}

          {/* Push Notification Toggle */}
          {push.supported && (
            <button
              onClick={push.subscribed ? push.unsubscribe : push.requestPermission}
              disabled={push.loading}
              className={`w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] transition-all duration-150 ${
                push.subscribed ? "text-[#25D366]" : "text-[#888]"
              }`}
              title={push.subscribed ? "Push notifications on" : "Enable push notifications"}
            >
              {push.loading ? (
                <svg className="w-[18px] h-[18px] animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <BellRing className="w-[18px] h-[18px]" />
              )}
            </button>
          )}

          {/* Profile */}
          <Link
            href="/dashboard/settings"
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] transition-all duration-150 group"
            title="Profile"
          >
            <div className="w-7 h-7 rounded-md bg-[#F0F0F0] flex items-center justify-center group-hover:bg-[#E8E8E8] transition-colors">
              <User className="w-[14px] h-[14px] text-[#666]" />
            </div>
          </Link>
        </div>
      </header>

      {/* ── MOBILE TOP BAR ── */}
      <div
        className="md:hidden flex items-center justify-between h-14 px-4 bg-white/90 backdrop-blur-md border-b border-[#EDEDED] sticky top-0 z-30"
        style={{ paddingTop: "env(safe-area-inset-top)", height: "calc(56px + env(safe-area-inset-top))" }}
      >
        <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[#F5F5F5]">
          <Menu className="w-5 h-5 text-[#333]" />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-sm">
          <LogoIcon className="w-5 h-5" />
          <span className="text-[#333]">Digital QR Menue</span>
        </Link>
        <div className="flex items-center gap-1">
          {restaurantId && <BellNotification restaurantId={restaurantId} />}
          <Link
            href="/dashboard/settings"
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[#F5F5F5]"
          >
            <User className="w-5 h-5 text-[#666]" />
          </Link>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <div
            role="dialog"
            aria-label="Navigation menu"
            className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white flex flex-col shadow-xl"
            style={{
              paddingTop: "calc(20px + env(safe-area-inset-top))",
              animation: "slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
                  <LogoIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-base leading-tight text-[#111]">Digital QR</div>
                  <div className="font-bold text-base leading-tight text-[#111] -mt-1">Menue</div>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F0F0F0]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-[#666]" />
              </button>
            </div>
            <p className="text-[11px] text-[#999] font-medium uppercase tracking-wider px-4 mb-3">Owner Dashboard</p>

            {/* Drawer Nav */}
            <nav className="space-y-0.5 flex-1 overflow-y-auto px-3">
              {navItems.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 min-h-[44px] ${
                      active
                        ? "bg-[#F5F5F5] text-[#111]"
                        : "text-[#555] hover:bg-[#F5F5F5] hover:text-[#333]"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-black rounded-full" />
                    )}
                    <Icon className={`w-[20px] h-[20px] shrink-0 ${
                      active ? "text-black" : "text-[#888]"
                    }`} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Drawer Logout */}
            <div className="px-3 pb-5 shrink-0 border-t border-[#EDEDED] pt-3 mx-3">
              <button
                onClick={() => { setMobileOpen(false); handleLogout() }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#DC2626] hover:bg-red-50 w-full min-h-[44px] transition-all duration-150 group"
              >
                <LogOut className="w-[20px] h-[20px] shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main
        className="md:ml-60 p-4 md:p-6 lg:p-8 max-w-6xl min-h-[calc(100vh-4rem)]"
        style={{ paddingBottom: "calc(24px + env(safe-area-inset-bottom))" }}
      >
        <ErrorBoundary>
          <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" /></div>}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </main>

      <style jsx global>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
