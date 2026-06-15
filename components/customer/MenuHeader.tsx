"use client"

import { useState } from "react"
import Image from "next/image"
import { MapPin, UtensilsCrossed, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface Props {
  name: string
  nameUr?: string | null
  logoUrl?: string | null
  coverUrl?: string | null
  city: string
  cuisineType?: string | null
  description?: string | null
  lang?: "en" | "ur"
}

export function MenuHeader({ name, nameUr, logoUrl, coverUrl, city, cuisineType, description, lang = "en" }: Props) {
  const router = useRouter()
  const [logoError, setLogoError] = useState(false)
  const [coverError, setCoverError] = useState(false)
  const displayName = lang === "ur" && nameUr ? nameUr : name

  return (
    <div className="pb-4 px-4">
      {/* Cover Image */}
      <div className="relative w-full h-48 rounded-3xl overflow-hidden mb-6 group">
        <button
          onClick={() => router.back()}
          className="absolute top-3 left-3 z-30 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white active:scale-95 transition-transform"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#25D366]/20 to-transparent z-10" />
        {coverUrl && !coverError ? (
          <Image
            src={coverUrl}
            alt={`${name} cover photo`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 600px"
            onError={() => setCoverError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0052D4] via-[#4364F7] to-[#6FB1FC]" />
        )}
        <div className="absolute bottom-4 left-4 z-20 flex items-end gap-4">
          {logoUrl && !logoError ? (
            <div className="w-14 h-14 rounded-2xl border-4 border-white shadow-sm overflow-hidden relative flex-shrink-0">
              <Image
                src={logoUrl}
                alt={`${name} logo`}
                fill
                className="object-cover"
                sizes="56px"
                priority
                onError={() => setLogoError(true)}
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl border-4 border-white shadow-sm bg-[#EDEEEF] flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-[#555]">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-white text-2xl font-bold leading-tight">{displayName}</h1>
            <div className="flex items-center gap-3 text-white/90 text-xs mt-1">
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
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-[#555] leading-relaxed px-1">
          {description}
        </p>
      )}
    </div>
  )
}
