"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Building2, Settings, Shield, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/superadmin", label: "Restaurants", icon: Building2 },
  { href: "/superadmin/settings", label: "Settings", icon: Settings },
]

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Top Nav */}
      <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-[#F0F0F0] sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <Link href="/superadmin" className="flex items-center gap-2 font-bold text-lg">
            <Shield className="w-5 h-5" />
            Super Admin
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
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

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  )
}
