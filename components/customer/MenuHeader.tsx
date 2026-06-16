"use client"

import { useState } from "react"
import Image from "next/image"
import { MapPin, Clock } from "lucide-react"
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
  const [logoError, setLogoError] = useState(false)
  const [coverError, setCoverError] = useState(false)
  const displayName = lang === "ur" && nameUr ? nameUr : name

  return (
    <div className="pt-2 pb-6">
      {/* Hero Section */}
      <div className="relative w-full h-48 rounded-3xl overflow-hidden mb-6">
        {coverUrl && !coverError ? (
          <>
            <Image
              src={coverUrl}
              alt={displayName}
              fill
              className="object-cover"
              sizes="600px"
              priority
              onError={() => setCoverError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#333]" />
        )}

        {/* Logo + Name Overlay */}
        <div className="absolute bottom-4 left-4 z-20 flex items-end gap-4">
          {logoUrl && !logoError ? (
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-4 border-white shadow-sm relative flex-shrink-0">
              <Image
                src={logoUrl}
                alt={displayName}
                fill
                className="object-cover"
                sizes="56px"
                onError={() => setLogoError(true)}
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border-4 border-white/30">
              <span className="text-xl font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-white text-[24px] font-semibold leading-tight tracking-tight">
              {displayName}
            </h1>
            <div className="flex items-center gap-3 text-white/90 text-[12px] font-medium mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {city}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> 25-40 min
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-[14px] text-[#555] leading-relaxed px-1">
          {description}
        </p>
      )}
    </div>
  )
}
