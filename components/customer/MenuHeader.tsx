"use client"

import { useState } from "react"
import Image from "next/image"
import { MapPin, UtensilsCrossed, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import type { BrandingConfig } from "@/lib/branding"

interface Props {
  name: string
  nameUr?: string | null
  logoUrl?: string | null
  coverUrl?: string | null
  city: string
  cuisineType?: string | null
  description?: string | null
  lang?: "en" | "ur"
  branding?: BrandingConfig
}

export function MenuHeader({ name, nameUr, logoUrl, coverUrl, city, cuisineType, description, lang = "en", branding }: Props) {
  const router = useRouter()
  const [logoError, setLogoError] = useState(false)
  const displayName = lang === "ur" && nameUr ? nameUr : name

  return (
    <div className="pb-2">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-[#F0F0F0] flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        <span className="text-xs font-semibold text-[#999]">QRMenu.pk</span>
        <div className="w-9" />
      </div>

      {/* Logo + Name + Info */}
      <div className="px-4 mt-3 flex items-start gap-3">
        {logoUrl && !logoError ? (
          <div className="w-16 h-16 rounded-2xl overflow-hidden relative flex-shrink-0 shadow-md">
            <Image
              src={logoUrl}
              alt={displayName}
              fill
              className="object-cover"
              sizes="64px"
              priority
              onError={() => setLogoError(true)}
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-[#EDEEEF] flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-xl font-bold text-[#555]">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0 pt-0.5">
          <h1 className="text-xl font-bold text-black leading-tight">{displayName}</h1>
          <div className="flex items-center gap-3 text-[#999] text-xs mt-1.5">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {city}
            </span>
            {cuisineType && (
              <span className="flex items-center gap-1">
                <UtensilsCrossed className="w-3.5 h-3.5" /> {cuisineType}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-[#555] leading-relaxed px-4 mt-3">
          {description}
        </p>
      )}
    </div>
  )
}
