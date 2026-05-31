"use client"

import { useState } from "react"

type Language = "en" | "ur"

export function LanguageToggle() {
  const [lang, setLang] = useState<Language>("en")

  const toggle = () => {
    setLang((prev) => (prev === "en" ? "ur" : "en"))
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F8F8F8] text-xs font-medium text-[#555] hover:bg-[#F0F0F0] transition-colors"
    >
      <span className={lang === "en" ? "text-black font-semibold" : ""}>EN</span>
      <span className="text-[#CCC]">/</span>
      <span className={lang === "ur" ? "text-black font-semibold font-urdu" : ""}>UR</span>
    </button>
  )
}
