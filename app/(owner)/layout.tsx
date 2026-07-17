"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, UtensilsCrossed, ClipboardList, BarChart3, User, CreditCard, QrCode, Menu, X, LogOut, Megaphone, Image as ImageIcon, Percent, Table2 } from "lucide-react"
import { BellNotification } from "@/components/owner/BellNotification"
import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { Toaster } from "@/components/shared/Toaster"
import { usePushNotifications } from "@/lib/hooks/usePushNotifications"

const ALL_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/dashboard/deals", label: "Deals", icon: Percent },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
  { href: "/dashboard/tables", label: "Tables", icon: Table2 },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Profile", icon: User },
  { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
  { href: "/dashboard/qr", label: "QR Code", icon: QrCode },
]

const AI_NAV_ITEM = { href: "/dashboard/ai-posts", label: "AI Posts", icon: ImageIcon }

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [plan, setPlan] = useState<string>("trial")
  const push = usePushNotifications(restaurantId)

  const hasAiAccess = plan === "growth" || plan === "premium"
  const navItems = hasAiAccess ? [...ALL_NAV_ITEMS.slice(0, 3), AI_NAV_ITEM, ...ALL_NAV_ITEMS.slice(3)] : ALL_NAV_ITEMS

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from("restaurants")
        .select("id, plan")
        .eq("owner_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setRestaurantId(data.id)
            setPlan(data.plan)
          }
        })
    })
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
    try { await fetch("/api/auth/logout", { method: "POST" }) } catch {}
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Toaster />
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
      </head>
      <header className="hidden md:flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-md border-b border-[#F0F0F0] sticky top-0 z-30">
        <div className="flex items-center gap-6 lg:gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight flex-shrink-0">
            <Image
              src="/logos/logo-d-star-qr.svg"
              alt="Digital QR Menue"
              width={28}
              height={28}
              className="w-7 h-7 rounded-lg"
            />
            Digital QR Menue
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
          {push.supported && (
            <div className="flex items-center gap-1">
              {push.subscribed ? (
                <>
                  <button
                    onClick={() => {
                      fetch("/api/push/test", { method: "POST" })
                        .then((r) => r.json())
                        .then((d) => { if (d.sent > 0) alert("✅ Push notification sent!"); else alert("No devices subscribed. Click bell icon to enable."); })
                        .catch(() => alert("❌ Test failed"))
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F0F0F0] transition-colors"
                    title="Send test notification"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#25D366]">
                      <polyline points="9 11 12 14 22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  </button>
                  <button
                    onClick={push.unsubscribe}
                    disabled={push.loading}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors relative"
                    title="Push on — tap to disable"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#25D366]">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] rounded-full border-2 border-white" />
                  </button>
                </>
              ) : (
                <button
                  onClick={push.requestPermission}
                  disabled={push.loading}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F0F0F0] transition-colors"
                  title="Enable push notifications"
                >
                  {push.loading ? (
                    <svg className="w-4 h-4 text-[#555] animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#555]">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          )}
          <Link
            href="/dashboard/settings"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F0F0F0] transition-colors"
            title="Profile"
          >
            <User className="w-5 h-5 text-[#555]" />
          </Link>
        </div>
      </header>

      <div
        className="md:hidden flex items-center justify-between h-14 px-4 bg-white/80 backdrop-blur-md border-b border-[#F0F0F0] sticky top-0 z-30"
        style={{ paddingTop: "env(safe-area-inset-top)", height: "calc(56px + env(safe-area-inset-top))" }}
      >
        <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-sm">
          <Image
            src="/logos/logo-d-star-qr.svg"
            alt="Digital QR Menue"
            width={22}
            height={22}
            className="w-5 h-5 rounded"
          />
          Digital QR Menue
        </Link>
        <div className="flex items-center gap-1">
          {restaurantId && <BellNotification restaurantId={restaurantId} />}
          <Link
            href="/dashboard/settings"
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <User className="w-5 h-5 text-[#555]" />
          </Link>
        </div>
      </div>

      {/* Mobile Drawer with Animation */}
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
            className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white p-4 flex flex-col transition-transform duration-300 ease-out"
            style={{
              transform: "translateX(0)",
              paddingTop: "calc(16px + env(safe-area-inset-top))",
              animation: "slideInLeft 0.3s ease-out",
            }}
          >
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[#F0F0F0]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4 px-2">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Image
                  src="/logos/logo-d-star-qr.svg"
                  alt="Digital QR Menue"
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-lg"
                />
                Digital QR Menue
              </div>
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

      <style jsx global>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
