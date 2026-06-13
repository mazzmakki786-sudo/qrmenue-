"use client"

import { useI18n } from "@/lib/i18n/context"

interface Props {
  className?: string
}

export function LanguageToggle({ className = "" }: Props) {
  const { lang, setLang } = useI18n()

  return (
    <button
      onClick={() => setLang(lang === "en" ? "ur" : "en")}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F8F8F8] text-xs font-medium text-[#555] hover:bg-[#F0F0F0] transition-colors ${className}`}
    >
      <span className={lang === "en" ? "text-black font-semibold" : ""}>EN</span>
      <span className="text-[#CCC]">/</span>
      <span className={lang === "ur" ? "text-black font-semibold font-urdu" : ""}>UR</span>
    </button>
  )
}
