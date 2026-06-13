"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import en from "@/messages/en.json"
import ur from "@/messages/ur.json"

export type Language = "en" | "ur"
type Messages = typeof en

interface I18nContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

const messages: Record<Language, Messages> = { en, ur }

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en")

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    const keys = key.split(".")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = messages[lang]
    for (const k of keys) {
      value = value?.[k]
    }
    if (typeof value !== "string") return key
    if (vars) {
      return Object.entries(vars).reduce((acc, [k, v]) => acc.replace(`{${k}}`, String(v)), value)
    }
    return value
  }, [lang])

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}
