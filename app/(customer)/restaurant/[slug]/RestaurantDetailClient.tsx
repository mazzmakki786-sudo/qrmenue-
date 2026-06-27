"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { MapPin, Phone, ArrowLeft, UtensilsCrossed, Truck, Clock, Navigation } from "lucide-react"
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
        {/* Restaurant Header — Simple: Logo + Info */}
        <div className="flex items-center gap-5 py-6 border-b border-border/50 mb-5">
          {/* Logo */}
          {restaurant.logo_url && !logoError ? (
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5 relative flex-shrink-0 bg-white">
              <Image
                src={restaurant.logo_url}
                alt={restaurant.name}
                fill
                className="object-cover"
                sizes="80px"
                onError={() => setLogoError(true)}
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-[#8F2E19] text-white flex items-center justify-center font-bold text-2xl flex-shrink-0 shadow-sm">
              {restaurant.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-text-primary leading-tight">
              {restaurant.name_ur || restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {restaurant.city}
              </span>
              {restaurant.cuisine_type && (
                <span className="flex items-center gap-1">
                  <UtensilsCrossed className="w-3.5 h-3.5" /> {restaurant.cuisine_type}
                </span>
              )}
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                liveIsOpen ? "bg-accent/10 text-accent" : "bg-error/10 text-error"
              }`}>
                {liveIsOpen ? "● Open" : "● Closed"}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {restaurant.description && (
          <p className="text-sm text-[#555] leading-relaxed mb-4">
            {restaurant.description}
          </p>
        )}

        {/* Contact & Delivery Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {restaurant.phone && (
            <a
              href={`tel:${restaurant.phone}`}
              className="flex items-center gap-3 p-3 bg-white rounded-xl border border-border hover:border-border-strong hover:shadow-sm transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium">Phone</p>
                <p className="text-sm font-semibold text-text-primary">{restaurant.phone}</p>
              </div>
            </a>
          )}
          {restaurant.address && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-border">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium">Address</p>
                <p className="text-sm font-semibold text-text-primary truncate">{restaurant.address}</p>
              </div>
            </div>
          )}
          {restaurant.delivery_fee !== undefined && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-border sm:col-span-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium">Delivery</p>
                <p className="text-sm font-semibold text-text-primary">
                  {restaurant.delivery_fee === 0 ? "Free delivery" : `Rs ${restaurant.delivery_fee} delivery fee`}
                  {restaurant.delivery_time_min && ` • ${restaurant.delivery_time_min} min`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Opening Hours */}
        {restaurant.opening_hours && (
          <div className="border border-border rounded-xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-text-primary" />
              <h3 className="font-semibold text-sm text-text-primary">Opening Hours</h3>
            </div>
            <div className="space-y-1.5">
              {(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const).map((day) => {
                const hours = restaurant.opening_hours?.[day]
                const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
                const isToday = day === today
                if (!hours) return null
                return (
                  <div key={day} className={`flex justify-between items-center text-sm py-1.5 px-2 rounded-lg ${isToday ? "bg-primary/5 font-medium" : ""}`}>
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
          </div>
        )}

        {/* Map / Location */}
        {restaurant.lat && restaurant.lng && (
          <div className="border border-border rounded-xl overflow-hidden mb-5">
            <div className="h-48 bg-[#F9FAFB] flex items-center justify-center relative">
              <MapPin className="w-8 h-8 text-text-muted" />
              <a
                href={`https://www.google.com/maps?q=${restaurant.lat},${restaurant.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 left-3 bg-white px-3 py-1.5 rounded-lg text-xs font-medium border border-border flex items-center gap-1.5 hover:bg-surface transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
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
