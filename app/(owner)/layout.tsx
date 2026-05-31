"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, UtensilsCrossed, ClipboardList, BarChart3, Settings, CreditCard, QrCode, Menu, X, LogOut } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
  { href: "/dashboard/qr", label: "QR Code", icon: QrCode },
]

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Desktop Top Nav */}
      <header className="hidden md:flex items-center justify-between h-16 px-6 bg-white border-b border-[#F0F0F0] sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="font-bold text-lg tracking-tight">
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
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#555] hover:bg-[#F0F0F0] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-[#F0F0F0] sticky top-0 z-40">
        <button onClick={() => setMobileOpen(true)}>
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-semibold text-sm">QRMenu.pk</span>
        <button onClick={handleLogout}>
          <LogOut className="w-5 h-5 text-[#555]" />
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white p-4">
            <div className="flex justify-end mb-6">
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? "bg-black text-white" : "text-[#555] hover:bg-[#F0F0F0]"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
              <hr className="my-3 border-[#F0F0F0]" />
              <button
                onClick={() => { setMobileOpen(false); handleLogout() }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#DC2626] hover:bg-red-50 w-full"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  )
}
