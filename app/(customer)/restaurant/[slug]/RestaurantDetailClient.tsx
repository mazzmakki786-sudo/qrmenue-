"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { MapPin, Phone, ArrowLeft, UtensilsCrossed, Clock, Navigation } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/stores/cartStore"
import { CartBar } from "@/components/customer/CartBar"
import { Card as DishCard } from "@/components/customer/DishGrid"
import type { Category, Dish } from "@/types"

interface Restaurant {
  id: string
  name: string
  name_ur: string | null
  slug: string
  city: string
  cuisine_type: string | null
  logo_url: string | null
  description: string | null
  phone: string | null
  address: string | null
  delivery_fee?: number
  delivery_time_min?: number
  is_open?: boolean
  opening_hours?: Record<string, { open: string; close: string; closed: boolean }> | null
  lat?: number | null
  lng?: number | null
}

interface Props {
  restaurant: Restaurant
  categories: (Category & { dishes: Dish[] })[]
}

export function RestaurantDetailClient({ restaurant, categories }: Props) {
  const router = useRouter()
  const [logoError, setLogoError] = useState(false)
  const [liveIsOpen, setLiveIsOpen] = useState(restaurant.is_open ?? true)
  const setRestaurant = useCartStore((s) => s.setRestaurant)
  const clearCart = useCartStore((s) => s.clearCart)
  const currentRestaurantId = useCartStore((s) => s.restaurantId)

  // Keep liveIsOpen in sync with SSR prop
  useEffect(() => {
    setLiveIsOpen(restaurant.is_open ?? true)
  }, [restaurant.is_open])

  // Realtime sync for is_open
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(uid(`restaurant-open-${restaurant.id}`))
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "restaurants", filter: `id=eq.${restaurant.id}` },
        (payload) => {
          const r = payload.new as any
          if (r.is_open !== undefined) setLiveIsOpen(r.is_open)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [restaurant.id])

  // Set restaurant in cart store on mount
  useEffect(() => {
    if (currentRestaurantId && currentRestaurantId !== restaurant.id) {
      clearCart()
    }
    setRestaurant(restaurant.id, restaurant.name, restaurant.slug, restaurant.delivery_fee ?? 0)
  }, [restaurant.id, restaurant.name, restaurant.slug])

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header */}
      <div
        className="fixed top-0 left-0 right-0 z-40 bg-white/80 safe-top"
        style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center justify-between px-4 h-12 mx-auto">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-text-primary" />
          </button>
          <span className="text-[13px] font-semibold text-text-primary">QRMenu.pk</span>
          <div className="w-8" />
        </div>
      </div>

      {/* Content */}
      <main className="pt-12 pb-[100px] px-4 mx-auto">
        {/* Compact Restaurant Header */}
        <div className="flex items-start gap-3.5 py-5 border-b border-border/50 mb-4">
          {/* Logo - smaller 56x56 */}
          {restaurant.logo_url && !logoError ? (
            <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5 relative flex-shrink-0 bg-white">
              <Image
                src={restaurant.logo_url}
                alt={restaurant.name}
                fill
                className="object-cover"
                sizes="56px"
                onError={() => setLogoError(true)}
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-[#8F2E19] text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm">
              {restaurant.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Info - narrow lines */}
          <div className="min-w-0 flex-1 pt-0.5">
            <h1 className="text-base font-bold text-text-primary leading-tight truncate">
              {restaurant.name_ur || restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-text-secondary mt-0.5">
              {restaurant.city && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" /> {restaurant.city}
                </span>
              )}
              {restaurant.cuisine_type && (
                <span className="flex items-center gap-0.5">
                  <UtensilsCrossed className="w-3 h-3" /> {restaurant.cuisine_type}
                </span>
              )}
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                liveIsOpen ? "bg-accent/10 text-accent" : "bg-error/10 text-error"
              }`}>
                {liveIsOpen ? "● Open" : "● Closed"}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {restaurant.description && (
          <p className="text-xs text-text-secondary leading-relaxed mb-4 line-clamp-2">
            {restaurant.description}
          </p>
        )}

        {/* Action Buttons Row - Call & Location */}
        <div className="flex gap-2.5 mb-5">
          {restaurant.phone && (
            <a
              href={`tel:${restaurant.phone}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold active:scale-[0.97] transition-transform"
            >
              <Phone className="w-3.5 h-3.5" />
              Call Now
            </a>
          )}
          {restaurant.lat && restaurant.lng ? (
            <a
              href={`https://www.google.com/maps?q=${restaurant.lat},${restaurant.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-text-secondary text-xs font-semibold active:scale-[0.97] transition-transform hover:bg-[#FAFAFA]"
            >
              <Navigation className="w-3.5 h-3.5" />
              Directions
            </a>
          ) : restaurant.address ? (
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(restaurant.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-text-secondary text-xs font-semibold active:scale-[0.97] transition-transform hover:bg-[#FAFAFA]"
            >
              <MapPin className="w-3.5 h-3.5" />
              Location
            </a>
          ) : null}
        </div>

        {/* Opening Hours - Compact inline */}
        {restaurant.opening_hours && (
          <details className="group border border-border rounded-xl overflow-hidden mb-4">
            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-xs font-semibold text-text-primary hover:bg-[#FAFAFA] transition-colors list-none">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Opening Hours
              </span>
              <span className="text-text-muted group-open:rotate-180 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="px-4 pb-3 space-y-1">
              {(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const).map((day) => {
                const hours = restaurant.opening_hours?.[day]
                const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
                const isToday = day === today
                if (!hours) return null
                return (
                  <div key={day} className={`flex justify-between items-center text-xs py-1.5 px-2 rounded-lg ${isToday ? "bg-primary/5 font-medium" : ""}`}>
                    <span className={`capitalize ${isToday ? "text-text-primary" : "text-text-secondary"}`}>
                      {day}
                    </span>
                    <span className={hours.closed ? "text-error font-medium" : "text-text-primary"}>
                      {hours.closed ? "Closed" : `${hours.open} — ${hours.close}`}
                    </span>
                  </div>
                )
              })}
            </div>
          </details>
        )}

        {/* Map / Location - Compact */}
        {restaurant.lat && restaurant.lng && (
          <div className="border border-border rounded-xl overflow-hidden mb-4">
            <div className="h-32 bg-[#F9FAFB] flex items-center justify-center relative">
              <MapPin className="w-6 h-6 text-text-muted" />
              <a
                href={`https://www.google.com/maps?q=${restaurant.lat},${restaurant.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-2 left-2 bg-white px-2.5 py-1 rounded-lg text-[10px] font-medium border border-border flex items-center gap-1 hover:bg-surface transition-colors"
              >
                <Navigation className="w-3 h-3" />
                Get Directions
              </a>
            </div>
          </div>
        )}

        {/* Menu Dishes */}
        {categories.length > 0 ? (
          <div className="space-y-6">
            {categories.map((category) => {
              const availableDishes = category.dishes.filter((d) => d.is_available)
              const unavailableDishes = category.dishes.filter((d) => !d.is_available)
              if (availableDishes.length === 0 && unavailableDishes.length === 0) return null

              return (
                <section key={category.id}>
                  <h2 className="text-sm font-bold text-text-primary border-l-4 border-primary pl-2.5 mb-3">
                    {category.name_en}
                  </h2>
                  <div className="space-y-2">
                    {availableDishes.map((dish) => (
                      <DishCard key={dish.id} dish={dish} />
                    ))}
                    {unavailableDishes.map((dish) => (
                      <DishCard key={dish.id} dish={dish} unavailable />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#F5F5F5] flex items-center justify-center mx-auto mb-3">
              <UtensilsCrossed className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm text-text-muted font-medium">No menu items available</p>
          </div>
        )}
      </main>
      <CartBar />
    </div>
  )
}
