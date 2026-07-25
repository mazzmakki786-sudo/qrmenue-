"use client"

import Link from "next/link"
import { LogOut } from "lucide-react"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LogoIcon } from "@/components/shared/LogoIcon"

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {}
    try { await fetch("/api/auth/logout", { method: "POST" }) } catch {}
    router.replace("/superadmin")
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F9FAFB]">
        {/* Do NOT use <head> in client components — causes hydration errors #418 */}

        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-[#F0F0F0]">
          <div className="max-w-6xl mx-auto px-3 md:px-10 h-14 md:h-16 flex justify-between items-center">
            <div className="flex items-center gap-4 md:gap-8 min-w-0">
              <Link href="/superadmin" className="flex items-center gap-2 shrink-0">
                <LogoIcon className="w-[22px] h-[22px]" />
                <div className="flex flex-col leading-tight">
                  <span className="font-black text-black text-sm md:text-base">Digital QR</span>
                  <span className="font-black text-black text-sm md:text-base -mt-1">Menue</span>
                </div>
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs md:text-sm text-[#ba1a1a] font-bold hover:underline shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>
        <main className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </ErrorBoundary>
  )
}
