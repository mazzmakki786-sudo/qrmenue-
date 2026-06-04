"use client"

import { useState } from "react"
import Image from "next/image"
import { MapPin, Store, Timer } from "lucide-react"

interface Props {
  name: string
  nameUr?: string | null
  logoUrl?: string | null
  city: string
  cuisineType?: string | null
  lang?: "en" | "ur"
}

export function MenuHeader({ name, nameUr, logoUrl, city, cuisineType, lang = "en" }: Props) {
  const [logoError, setLogoError] = useState(false)
  const displayName = lang === "ur" && nameUr ? nameUr : name

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FF6B35]/5 to-transparent" />
      <div className="relative flex items-start gap-4 pt-6 pb-4 px-4">
        {logoUrl && !logoError ? (
          <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 relative shadow-sm">
            <Image
              src={logoUrl}
              alt={displayName}
              fill
              className="object-cover"
              sizes="56px"
              onError={() => setLogoError(true)}
            />
          </div>
        ) : logoUrl && logoError ? (
          <div className="w-14 h-14 rounded-2xl bg-[#F8F8F8] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Store className="w-6 h-6 text-[#999]" />
          </div>
        ) : null}
        <div className="flex-1 min-w-0">
          <h1 className={`text-2xl font-bold text-[#111] leading-tight ${lang === "ur" ? "font-urdu" : ""}`}>
            {displayName}
          </h1>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#999]" />
              <span className="text-sm text-[#555]">{city}</span>
            </div>
            {cuisineType && (
              <>
                <span className="text-[#DDD]">|</span>
                <div className="flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5 text-[#999]" />
                  <span className="text-sm text-[#555]">{cuisineType}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
