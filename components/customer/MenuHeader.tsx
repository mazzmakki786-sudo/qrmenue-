"use client"

import { useState } from "react"
import Image from "next/image"
import { MapPin, Clock, Phone } from "lucide-react"
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
  address?: string | null
  phone?: string | null
  openingHours?: Record<string, { open: string; close: string; closed: boolean }> | null
}

export function MenuHeader({ name, nameUr, logoUrl, coverUrl, city, cuisineType, description, lang = "en", branding, address, phone, openingHours }: Props) {
  const [logoError, setLogoError] = useState(false)
  const [coverError, setCoverError] = useState(false)
  const displayName = lang === "ur" && nameUr ? nameUr : name

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
  const todayHours = openingHours?.[today]
  const isOpen = todayHours && !todayHours.closed

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
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/30 to-transparent z-10" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-primary-hover" />
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

      {/* Compact Info Row */}
      {(address || phone || openingHours) && (
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#555555] mt-2 mb-1">
          {address && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#888888]" />
              <span className="truncate max-w-[150px]">{address}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#888888]" />
              <span>{phone}</span>
            </div>
          )}
          {openingHours && (
            <div className={`flex items-center gap-1 ${isOpen ? "text-green-600" : "text-red-500"}`}>
              <Clock className="w-3.5 h-3.5" />
              <span className="font-medium">{isOpen ? "Open Now" : "Closed"}</span>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-[14px] text-text-secondary leading-relaxed px-1">
          {description}
        </p>
      )}
    </div>
  )
}
