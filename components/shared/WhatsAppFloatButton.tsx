"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Headset } from "lucide-react"

/**
 * Build a wa.me link from a stored whatsapp number.
 * Accepts "923001234567" (intl, already correct), "03001234567" (0-prefixed PK number),
 * or "+92 300 1234567" (spaces/plus) — normalizes digits and prepends "92" when needed.
 */
function buildWhatsAppLink(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "")
  if (!digits) return ""
  const normalized = digits.startsWith("0") ? "92" + digits.slice(1) : digits
  return `https://wa.me/${normalized}`
}

/**
 * Routes where the floating support button is shown (whitelist).
 * Only these pages display the support icon — everything else is hidden:
 * Home, Contact, About, FAQ, Blog (list + posts), Pricing.
 */
const SUPPORT_PATHS = new Set([
  "/",
  "/contact",
  "/about",
  "/faq",
  "/pricing",
])

/**
 * Floating support button — bottom-right corner, shown only on the whitelisted pages.
 * Opens WhatsApp chat directly with the support team number (`whatsapp_support`
 * company setting, managed by the superadmin in CompanySettingsForm).
 * Nothing renders if no number is configured.
 */
export function WhatsAppFloatButton() {
  const pathname = usePathname()
  const [whatsappUrl, setWhatsappUrl] = useState<string>("")

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("company_settings")
          .select("value")
          .eq("key", "whatsapp_support")
          .maybeSingle()
        if (cancelled) return
        if (data?.value) setWhatsappUrl(buildWhatsAppLink(data.value as string))
      } catch (e) {
        console.error("Failed to load WhatsApp support number", e)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Show only on the whitelisted pages. Blog posts live at /blog/[slug].
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/")
  const isAllowed = SUPPORT_PATHS.has(pathname) || isBlog
  if (!isAllowed) return null
  if (!whatsappUrl) return null

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with support team on WhatsApp"
      title="Chat with support team on WhatsApp"
      className="fixed bottom-6 right-3 md:bottom-6 md:right-6 z-[70] w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#25D366] hover:bg-[#1FB958] active:scale-95 transition-all duration-200 flex items-center justify-center shadow-[0_6px_20px_rgba(37,211,102,0.4)] group"
    >
      <Headset className="w-6 h-6 md:w-7 md:h-7 text-white group-hover:scale-110 transition-transform" />
    </a>
  )
}
