"use client"

import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function DashboardFooter() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <footer className="border-t border-[#F0F0F0] pt-6 flex flex-col items-center gap-4">
      <button onClick={handleLogout} className="text-[#BA1A1A] font-medium hover:underline flex items-center gap-2 text-sm transition-all">
        <LogOut className="w-4 h-4" /> Sign Out
      </button>
      <div className="flex flex-col md:flex-row items-center gap-2 text-center">
        <span className="text-xs font-bold text-black">QRMenu.pk</span>
        <span className="text-[12px] text-[#555]">&copy; 2024 QRMenu.pk. All rights reserved.</span>
      </div>
    </footer>
  )
}
