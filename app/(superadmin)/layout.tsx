"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Shield, LogOut, LayoutDashboard } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"

const NAV_ITEMS = [
  { href: "/superadmin", label: "Dashboard", icon: LayoutDashboard },
]

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) =>
    href === "/superadmin" ? pathname === href : pathname === href || pathname.startsWith(href + "/")

  const handleLogout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }) } catch {}
    window.location.href = "/superadmin"
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F9FAFB]">
        <head>
          <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        </head>
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-[#F0F0F0]">
          <div className="max-w-6xl mx-auto px-3 md:px-10 h-14 md:h-16 flex justify-between items-center">
            <div className="flex items-center gap-4 md:gap-8 min-w-0">
              <Link href="/superadmin" className="flex items-center gap-2 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-black text-black text-sm md:text-base">Super Admin</span>
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active ? "bg-black text-white" : "text-[#555] hover:bg-[#F0F0F0]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs md:text-sm text-[#ba1a1a] font-bold hover:underline shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
          {/* Mobile nav */}
          <nav className="md:hidden flex items-center gap-1 px-3 pb-2 overflow-x-auto">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    active ? "bg-black text-white" : "text-[#555] hover:bg-[#F0F0F0]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </header>
        <main className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </ErrorBoundary>
  )
}
