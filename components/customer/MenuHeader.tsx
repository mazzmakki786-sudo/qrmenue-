"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
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
  isOpen?: boolean
  openingTime?: string | null
  closingTime?: string | null
  restaurantId?: string
}

export function MenuHeader({ name, nameUr, logoUrl, coverUrl, city, cuisineType, description, lang = "en", branding, address, phone, openingHours, isOpen, openingTime, closingTime, restaurantId }: Props) {
  const [logoError, setLogoError] = useState(false)
  const [coverError, setCoverError] = useState(false)
  const [openStatus, setOpenStatus] = useState(isOpen ?? true)
  const [openTime, setOpenTime] = useState(openingTime?.slice(0, 5))
  const [closeTime, setCloseTime] = useState(closingTime?.slice(0, 5))
  const displayName = lang === "ur" && nameUr ? nameUr : name

  useEffect(() => {
    setOpenStatus(isOpen ?? true)
    setOpenTime(openingTime?.slice(0, 5))
    setCloseTime(closingTime?.slice(0, 5))
  }, [isOpen, openingTime, closingTime])

  useEffect(() => {
    if (!restaurantId) return
    const supabase = createClient()
    const channel = supabase
      .channel(uid(`menu-open-${restaurantId}`))
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "restaurants", filter: `id=eq.${restaurantId}` },
        (payload) => {
          const r = payload.new as any
          if (r.is_open !== undefined) setOpenStatus(r.is_open)
          if (r.opening_time) setOpenTime(r.opening_time.slice(0, 5))
          if (r.closing_time) setCloseTime(r.closing_time.slice(0, 5))
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [restaurantId])

  return (
    <div className="pt-2 pb-4">
      {/* Hero Section */}
      <div className="relative w-full h-48 rounded-3xl overflow-hidden mb-5 shadow-sm">
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
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent z-10" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary via-primary-hover to-primary/80">
            {/* Decorative pattern overlay */}
            <div className="absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: "radial-gradient(circle at 25% 50%, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }}
            />
          </div>
        )}

        {/* Logo + Name Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className="flex items-end gap-4">
            {logoUrl && !logoError ? (
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-[2.5px] border-white/90 shadow-md relative flex-shrink-0 ring-1 ring-black/10">
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
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 border-[2.5px] border-white/40 shadow-sm">
                <span className="text-xl font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-white text-[24px] font-semibold leading-tight tracking-tight drop-shadow-sm">
                {displayName}
              </h1>
              <div className="flex items-center gap-2 text-white/90 text-[12px] font-medium mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {city}
                </span>
                {cuisineType && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/40" />
                    <span>{cuisineType}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status + Info Row — Structured */}
      <div className="space-y-2.5">
        {/* Status pill + hours */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          openStatus ? "bg-accent/8 text-accent" : "bg-error/8 text-error"
        }`}>
          <span className={`relative w-2 h-2 rounded-full ${openStatus ? "bg-accent" : "bg-error"}`}>
            {openStatus && (
              <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-30" />
            )}
          </span>
          <span className="font-semibold">{openStatus ? "Open" : "Closed"}</span>
          {(openTime && closeTime) && (
            <span className={`text-[11px] ${openStatus ? "text-accent/70" : "text-error/70"}`}>
              &middot; {openTime} — {closeTime}
            </span>
          )}
        </div>

        {/* Info chips row */}
        <div className="flex flex-wrap gap-2">
          {address && (
            <div className="flex items-center gap-1.5 text-[12px] text-text-secondary bg-surface px-2.5 py-1.5 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span className="truncate max-w-[180px]">{address}</span>
            </div>
          )}
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-1.5 text-[12px] text-text-secondary bg-surface px-2.5 py-1.5 rounded-lg hover:bg-surface-dark transition-colors">
              <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span>{phone}</span>
            </a>
          )}
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-[14px] text-text-secondary leading-relaxed mt-3 px-0.5">
          {description}
        </p>
      )}
    </div>
  )
}
