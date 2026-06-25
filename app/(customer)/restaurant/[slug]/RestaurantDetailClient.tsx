"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
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
  const setRestaurant = useCartStore((s) => s.setRestaurant)
  const clearCart = useCartStore((s) => s.clearCart)
  const currentRestaurantId = useCartStore((s) => s.restaurantId)

  // Set restaurant in cart store on mount
  useEffect(() => {
    if (currentRestaurantId && currentRestaurantId !== restaurant.id) {
      clearCart()
    }
    setRestaurant(restaurant.id, restaurant.name, restaurant.slug, restaurant.delivery_fee ?? 0)
  }, [restaurant.id, restaurant.name, restaurant.slug])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div
        className="fixed top-0 left-0 right-0 z-40 bg-white/80 safe-top"
        style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center justify-between px-4 h-12 max-w-[600px] mx-auto">
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
      <main className="pt-12 pb-[100px] px-4 max-w-[600px] mx-auto">
        {/* Hero */}
        <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-4 mt-3">
          {restaurant.logo_url && !logoError ? (
            <>
              <Image
                src={restaurant.logo_url}
                alt={restaurant.name}
                fill
                className="object-cover"
                sizes="600px"
                priority
                onError={() => setLogoError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/30 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-[#8F2E19]" />
          )}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-end gap-3">
              {restaurant.logo_url && !logoError ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden border-4 border-white/80 shadow-sm relative flex-shrink-0">
                  <Image
                    src={restaurant.logo_url}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border-4 border-white/30">
                  <span className="text-lg font-bold text-white">
                    {restaurant.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-white text-[18px] font-semibold leading-tight">
                  {restaurant.name_ur || restaurant.name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-white/80 text-[11px] font-medium mt-0.5">
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" /> {restaurant.city}
                  </span>
                  {restaurant.cuisine_type && (
                    <span className="flex items-center gap-0.5">
                      <UtensilsCrossed className="w-3 h-3" /> {restaurant.cuisine_type}
                    </span>
                  )}

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${restaurant.is_open !== false ? 'bg-accent/20 text-accent' : 'bg-error/20 text-error'}`}>
                    {restaurant.is_open !== false ? '● Open' : '● Closed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {restaurant.description && (
          <p className="text-[13px] text-[#555] leading-relaxed mb-3">
            {restaurant.description}
          </p>
        )}

        {/* Contact Info — Compact Row */}
        <div className="flex gap-2 mb-4">
          {restaurant.phone && (
            <a
              href={`tel:${restaurant.phone}`}
              className="flex items-center gap-2 flex-1 min-w-0 p-2.5 bg-white rounded-xl hover:bg-[#F5F5F5] transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-[#F5F5F5] flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-text-muted">Phone</p>
                <p className="text-[12px] font-semibold text-text-primary truncate">{restaurant.phone}</p>
              </div>
            </a>
          )}
          {restaurant.address && (
            <div className="flex items-center gap-2 flex-1 min-w-0 p-2.5 bg-white rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-[#F5F5F5] flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-text-muted">Address</p>
                <p className="text-[12px] font-semibold text-text-primary truncate">{restaurant.address}</p>
              </div>
            </div>
          )}
        </div>

        {/* Opening Hours */}
        {restaurant.opening_hours && (
          <div className="border border-[#E8E8E8] rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-[#111111]" />
              <h3 className="font-semibold text-[15px] text-[#111111]">Opening Hours</h3>
            </div>
            <div className="space-y-2">
              {(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const).map((day) => {
                const hours = restaurant.opening_hours?.[day]
                const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
                const isToday = day === today
                if (!hours) return null
                return (
                  <div key={day} className={`flex justify-between items-center text-sm py-1 ${isToday ? "bg-[#F9FAFB] -mx-2 px-2 rounded-lg" : ""}`}>
                    <span className={`capitalize ${isToday ? "font-semibold text-[#111111]" : "text-[#555555]"}`}>
                      {day}
                    </span>
                    <span className={hours.closed ? "text-[#EF4444] font-medium" : "text-[#111111]"}>
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
          <div className="border border-[#E8E8E8] rounded-xl overflow-hidden mb-4">
            <div className="h-48 bg-[#F9FAFB] flex items-center justify-center relative">
              <MapPin className="w-8 h-8 text-[#888888]" />
              <a
                href={`https://www.google.com/maps?q=${restaurant.lat},${restaurant.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 left-3 bg-white px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E8E8E8] flex items-center gap-1.5 hover:bg-[#F5F5F5] transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                Get Directions
              </a>
            </div>
          </div>
        )}

        {/* Delivery Info */}
        {restaurant.delivery_fee !== undefined && (
          <div className="flex items-center gap-2 p-3 bg-[#F5F5F5] rounded-xl mb-4">
            <Truck className="w-4 h-4 text-primary" />
            <span className="text-xs text-text-primary font-medium">
              {restaurant.delivery_fee === 0 ? 'Free delivery' : `Rs ${restaurant.delivery_fee} delivery fee`}
              {restaurant.delivery_time_min && ` • ${restaurant.delivery_time_min} min`}
            </span>
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
