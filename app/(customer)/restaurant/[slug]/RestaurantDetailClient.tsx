"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Phone, ArrowLeft, UtensilsCrossed, ImageOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/stores/cartStore"
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
}

interface Props {
  restaurant: Restaurant
  categories: (Category & { dishes: Dish[] })[]
}

function DishCard({ dish }: { dish: Dish }) {
  const [imgError, setImgError] = useState(false)
  const items = useCartStore((s) => s.items)
  const addItem = useCartStore((s) => s.addItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const cartItem = items.find((item) => item.dish.id === dish.id)

  return (
    <div className={`flex gap-3 p-3 bg-[#F9FAFB] rounded-xl border border-transparent hover:border-[#F0F0F0] transition-all ${!dish.is_available ? "opacity-50" : ""}`}>
      <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
        {dish.image_url && !imgError ? (
          <Image
            src={dish.image_url}
            alt={dish.name_en}
            fill
            className="object-cover"
            sizes="80px"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-[#E1E3E4] flex items-center justify-center">
            <ImageOff className="w-5 h-5 text-[#BBB]" />
          </div>
        )}
        {!dish.is_available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
            <span className="text-white text-[9px] font-semibold bg-black/60 px-1.5 py-0.5 rounded-full">Unavailable</span>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4 className="text-[13px] font-semibold text-black line-clamp-1">{dish.name_en}</h4>
          <span className="text-[13px] font-semibold text-black shrink-0">Rs {dish.price.toLocaleString("en-PK")}</span>
        </div>
        {dish.description_en && (
          <p className="text-[11px] text-[#555] line-clamp-2 mt-0.5">{dish.description_en}</p>
        )}
        <div className="mt-auto flex justify-end pt-1">
          {cartItem ? (
            <div className="flex items-center gap-2 bg-[#F0F0F0] px-2.5 py-1 rounded-full">
              <button
                onClick={() => updateQuantity(dish.id, cartItem.quantity - 1)}
                className="w-6 h-6 flex items-center justify-center text-[14px] hover:opacity-70"
                aria-label="Decrease"
              >
                −
              </button>
              <span className="text-[12px] font-bold min-w-[16px] text-center">{cartItem.quantity}</span>
              <button
                onClick={() => addItem(dish)}
                className="w-6 h-6 flex items-center justify-center text-[14px] hover:opacity-70"
                aria-label="Increase"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => addItem(dish)}
              disabled={!dish.is_available}
              className="bg-black text-white px-3 py-1 rounded-full text-[11px] font-semibold active:scale-95 transition-all disabled:opacity-50"
            >
              + Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function RestaurantDetailClient({ restaurant, categories }: Props) {
  const router = useRouter()
  const [logoError, setLogoError] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div
        className="fixed top-0 left-0 right-0 z-40 bg-white/80"
        style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center justify-between px-4 h-12 max-w-[600px] mx-auto">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-black" />
          </button>
          <span className="text-[13px] font-semibold text-black">QRMenu.pk</span>
          <div className="w-8" />
        </div>
      </div>

      {/* Content */}
      <main className="pt-12 pb-24 px-4 max-w-[600px] mx-auto">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#333]" />
          )}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-end gap-3">
              {restaurant.logo_url && !logoError ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden border-3 border-white shadow-sm relative flex-shrink-0">
                  <Image
                    src={restaurant.logo_url}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border-3 border-white/30">
                  <span className="text-lg font-bold text-white">
                    {restaurant.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-white text-[18px] font-semibold leading-tight">
                  {restaurant.name_ur || restaurant.name}
                </h1>
                <div className="flex items-center gap-2 text-white/80 text-[11px] font-medium mt-0.5">
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" /> {restaurant.city}
                  </span>
                  {restaurant.cuisine_type && (
                    <span className="flex items-center gap-0.5">
                      <UtensilsCrossed className="w-3 h-3" /> {restaurant.cuisine_type}
                    </span>
                  )}
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
              className="flex items-center gap-2 flex-1 min-w-0 p-2.5 border border-[#F0F0F0] rounded-lg hover:border-[#DDD] transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-[#F5F5F5] flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5 text-black" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-[#999]">Phone</p>
                <p className="text-[12px] font-semibold text-black truncate">{restaurant.phone}</p>
              </div>
            </a>
          )}
          {restaurant.address && (
            <div className="flex items-center gap-2 flex-1 min-w-0 p-2.5 border border-[#F0F0F0] rounded-lg">
              <div className="w-7 h-7 rounded-lg bg-[#F5F5F5] flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 text-black" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-[#999]">Address</p>
                <p className="text-[12px] font-semibold text-black truncate">{restaurant.address}</p>
              </div>
            </div>
          )}
        </div>

        {/* Menu Dishes */}
        {categories.length > 0 ? (
          <div className="space-y-6">
            {categories.map((category) => {
              const availableDishes = category.dishes.filter((d) => d.is_available)
              const unavailableDishes = category.dishes.filter((d) => !d.is_available)
              if (availableDishes.length === 0 && unavailableDishes.length === 0) return null

              return (
                <section key={category.id}>
                  <h2 className="text-[14px] font-semibold text-black border-l-3 border-black pl-2.5 mb-3">
                    {category.name_en}
                  </h2>
                  <div className="space-y-2">
                    {availableDishes.map((dish) => (
                      <DishCard key={dish.id} dish={dish} />
                    ))}
                    {unavailableDishes.map((dish) => (
                      <DishCard key={dish.id} dish={dish} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <UtensilsCrossed className="w-8 h-8 text-[#CCC] mx-auto mb-3" />
            <p className="text-[14px] text-[#999]">No menu items available</p>
          </div>
        )}
      </main>
    </div>
  )
}
