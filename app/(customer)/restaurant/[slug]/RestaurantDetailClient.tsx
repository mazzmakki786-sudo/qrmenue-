"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { MapPin, Phone, ArrowLeft, UtensilsCrossed, Clock, Navigation, Truck, Timer, ShoppingCart, Minus, Plus, Trash2, Percent, ImageOff, ChevronDown, Store } from "lucide-react"
import { formatTo12Hour, formatPrice } from "@/lib/utils"
import { isRestaurantOpen } from "@/lib/restaurant-hours"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/stores/cartStore"
import { CartBar } from "@/components/customer/CartBar"
import { Card as DishCard } from "@/components/customer/DishGrid"
import { DealBanner } from "@/components/customer/DealBanner"
import { DishBadges } from "@/components/customer/DishBadges"
import type { Category, Deal, Dish } from "@/types"

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
  opening_time?: string | null
  closing_time?: string | null
  opening_hours?: Record<string, { open: string; close: string; closed: boolean }> | null
  lat?: number | null
  lng?: number | null
}

interface Props {
  restaurant: Restaurant
  categories: (Category & { dishes: Dish[] })[]
}

function DesktopCartPanel({ effectivelyClosed, liveOpenTime, liveCloseTime }: { effectivelyClosed?: boolean; liveOpenTime?: string; liveCloseTime?: string }) {
  const items = useCartStore((s) => s.items)
  const getTotalPrice = useCartStore((s) => s.getTotalPrice)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const restaurantName = useCartStore((s) => s.restaurantName)
  const restaurantId = useCartStore((s) => s.restaurantId)
  const addItem = useCartStore((s) => s.addItem)
  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])

  if (totalItems === 0 || !restaurantId) {
    return (
      <div className="bg-white border border-border rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center mx-auto mb-3">
          <ShoppingCart className="w-6 h-6 text-text-muted" />
        </div>
        <p className="text-sm text-text-muted font-medium">Your cart is empty</p>
        <p className="text-xs text-text-muted/70 mt-1">Add items from the menu</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-primary">Your Cart</h3>
        <span className="text-xs text-text-muted">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
      </div>
      <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
        {items.map((item) => (
          <div key={item.dish.id} className="flex items-center gap-3">
            {item.dish.image_url && (
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative bg-surface">
                <Image src={item.dish.image_url} alt={`${item.dish.name_en} in cart`} width={40} height={40} className="object-cover w-full h-full" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">{item.dish.name_en}</p>
              <p className="text-[11px] text-text-muted">Rs {item.dish.price.toLocaleString("en-PK")}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}
                className="w-7 h-7 rounded-full bg-surface flex items-center justify-center hover:bg-border transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold min-w-[18px] text-center text-text-primary">{item.quantity}</span>
              <button
                onClick={() => addItem(item.dish)}
                disabled={effectivelyClosed}
                className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors disabled:opacity-30"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                onClick={() => removeItem(item.dish.id)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-error hover:bg-error/5 transition-colors ml-0.5"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {restaurantName && (
        <div className="px-4 pb-2">
          <p className="text-[10px] text-text-muted text-center">{restaurantName}</p>
        </div>
      )}
      <div className="px-4 pb-4 pt-2 border-t border-border mx-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-text-secondary">Total</span>
          <span className="text-lg font-bold text-text-primary">Rs {getTotalPrice().toLocaleString("en-PK")}</span>
        </div>
        {effectivelyClosed ? (
          <div className="bg-error/10 border border-error/20 rounded-xl p-3 text-center">
            <p className="text-xs font-semibold text-error">Restaurant is closed</p>
            <p className="text-[10px] text-text-muted mt-0.5">
              {liveOpenTime && liveCloseTime
                ? `Open ${formatTo12Hour(liveOpenTime)} — ${formatTo12Hour(liveCloseTime)}`
                : "Orders are not being accepted right now"}
            </p>
          </div>
        ) : (
          <Link
            href="/checkout"
            className="block w-full bg-primary text-white text-center py-3 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors active:scale-[0.98]"
          >
            Proceed to Checkout
          </Link>
        )}
      </div>
    </div>
  )
}

function DesktopDishCard({ dish, deals, unavailable, closed }: { dish: Dish; deals?: (Deal & { dish?: { id: string; name_en: string; name_ur: string | null; image_url: string | null; price: number } | null })[]; unavailable?: boolean; closed?: boolean }) {
  const [imgError, setImgError] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const cartItem = items.find((item) => item.dish.id === dish.id)

  const recognizedTags = ["popular", "chef_special", "spicy"]
  const badges = (dish.tags || []).filter((t) => recognizedTags.includes(t))
  const dishDeal = deals?.find((d) => d.dish_id === dish.id && d.deal_type !== "bundle")
  const dealPrice = dishDeal
    ? dishDeal.deal_type === "percentage"
      ? Math.round(dish.price * (1 - dishDeal.deal_value / 100))
      : Math.max(0, dish.price - dishDeal.deal_value)
    : null

  return (
    <div className={`flex gap-4 p-4 bg-white rounded-2xl border border-border hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 ${unavailable ? "opacity-50" : ""}`}>
      <div className="relative w-28 h-28 shrink-0 overflow-hidden rounded-xl bg-surface">
        {dish.image_url && !imgError ? (
          <Image
            src={dish.image_url}
            alt={`${dish.name_en}${dish.name_ur ? ` (${dish.name_ur})` : ""} — ₹${dish.price}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="112px"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-8 h-8 text-text-muted/30" />
          </div>
        )}
        <div className="absolute top-1.5 left-1.5">
          {dishDeal && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary">
              <Percent className="w-2 h-2" />
              {dishDeal.deal_type === "percentage" ? `${dishDeal.deal_value}%` : `Rs ${dishDeal.deal_value}`} OFF
            </span>
          )}
        </div>
        {unavailable && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
            <span className="text-white text-[10px] font-semibold bg-black/60 px-2.5 py-1 rounded-full">Unavailable</span>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-text-primary">{dish.name_en}</h3>
            {dish.name_ur && <p className="text-[11px] text-text-secondary mt-0.5 font-urdu">{dish.name_ur}</p>}
            {(badges.length > 0) && (
              <div className="flex flex-wrap gap-1 mt-1">
                <DishBadges tags={badges} />
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            {dealPrice !== null ? (
              <>
                <span className="text-sm font-bold text-primary">{formatPrice(dealPrice)}</span>
                <p className="text-[10px] text-text-muted line-through">Rs {dish.price.toLocaleString("en-PK")}</p>
              </>
            ) : (
              <span className="text-sm font-bold text-text-primary">Rs {dish.price.toLocaleString("en-PK")}</span>
            )}
          </div>
        </div>
        {dish.description_en && (
          <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-2 mt-1.5">{dish.description_en}</p>
        )}
        <div className="mt-auto pt-2 flex justify-end">
          {cartItem ? (
            <div className="flex items-center gap-2 bg-surface rounded-full px-2.5 py-1">
              <button onClick={() => updateQuantity(dish.id, cartItem.quantity - 1)} className="w-8 h-8 rounded-full flex items-center justify-center text-primary font-bold hover:bg-white/50 transition-colors text-lg">−</button>
              <span className="text-sm font-bold min-w-[22px] text-center text-text-primary">{cartItem.quantity}</span>
              <button onClick={() => addItem(dish)} disabled={closed} className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors disabled:opacity-30 text-lg font-bold">+</button>
            </div>
          ) : (
            <button onClick={() => addItem(dish)} disabled={unavailable || closed} className="bg-primary text-white rounded-full px-5 py-2 text-xs font-semibold hover:bg-primary-hover active:scale-[0.95] transition-all duration-200 disabled:opacity-50">
              {closed ? "Closed" : "+ Add"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function MobileDishCard({ dish, deals, unavailable, closed }: { dish: Dish; deals?: (Deal & { dish?: { id: string; name_en: string; name_ur: string | null; image_url: string | null; price: number } | null })[]; unavailable?: boolean; closed?: boolean }) {
  const [imgError, setImgError] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const cartItem = items.find((item) => item.dish.id === dish.id)

  const recognizedTags = ["popular", "chef_special", "spicy"]
  const badges = (dish.tags || []).filter((t) => recognizedTags.includes(t))
  const dishDeal = deals?.find((d) => d.dish_id === dish.id && d.deal_type !== "bundle")
  const dealPrice = dishDeal
    ? dishDeal.deal_type === "percentage"
      ? Math.round(dish.price * (1 - dishDeal.deal_value / 100))
      : Math.max(0, dish.price - dishDeal.deal_value)
    : null

  return (
    <div className={`bg-white rounded-xl border border-border overflow-hidden transition-all ${unavailable ? "opacity-50" : ""}`}>
      {/* Image — clean, no overlay badges */}
      <div className="relative w-full aspect-[4/3] bg-surface overflow-hidden">
        {dish.image_url && !imgError ? (
          <Image
            src={dish.image_url}
            alt={`${dish.name_en}${dish.name_ur ? ` (${dish.name_ur})` : ""} — ₹${dish.price}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 200px"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface to-border/20">
            <ImageOff className="w-6 h-6 text-text-muted/30" />
          </div>
        )}
        {/* Only deal badge stays on image */}
        {dishDeal && (
          <div className="absolute top-1.5 left-1.5">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-primary/10 text-primary">
              <Percent className="w-2 h-2" />
              {dishDeal.deal_type === "percentage" ? `${dishDeal.deal_value}%` : `Rs ${dishDeal.deal_value}`} OFF
            </span>
          </div>
        )}
        {unavailable && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <span className="text-white text-[9px] font-semibold bg-black/60 px-2 py-0.5 rounded-full">Unavailable</span>
          </div>
        )}
      </div>

      {/* Info — name + tags + price + add button in balanced layout */}
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0 flex-1">
            <h3 className="text-[12px] font-semibold text-text-primary line-clamp-1 leading-tight">{dish.name_en}</h3>
            {dish.name_ur && <p className="text-[9px] text-text-secondary font-urdu line-clamp-1">{dish.name_ur}</p>}
          </div>
          <span className="text-[13px] font-bold text-text-primary shrink-0 mt-0.5">
            {dealPrice !== null ? (
              <span className="text-primary">{formatPrice(dealPrice)}</span>
            ) : (
              `Rs ${dish.price.toLocaleString("en-PK")}`
            )}
          </span>
        </div>

        {/* Tags moved here — next to name */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mt-1">
            <DishBadges tags={badges} />
          </div>
        )}

        {dish.description_en && (
          <p className="text-[9px] text-text-secondary line-clamp-1 mt-1">{dish.description_en}</p>
        )}

        <div className="flex justify-end mt-2">
          {cartItem ? (
            <div className="flex items-center gap-1.5 bg-surface-dark rounded-full px-2 py-1 min-h-[32px]">
              <button onClick={() => updateQuantity(dish.id, cartItem.quantity - 1)} className="w-8 h-8 rounded-full flex items-center justify-center text-primary font-bold hover:bg-white/50 transition-colors text-[16px]">−</button>
              <span className="text-[13px] font-bold min-w-[18px] text-center text-text-primary">{cartItem.quantity}</span>
              <button onClick={() => addItem(dish)} disabled={closed} className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors disabled:opacity-30 text-[16px] font-bold">+</button>
            </div>
          ) : (
            <button onClick={() => addItem(dish)} disabled={unavailable || closed} className="bg-primary text-white rounded-full px-5 py-2 text-xs font-semibold hover:bg-primary-hover active:scale-[0.95] transition-all disabled:opacity-50 flex items-center gap-1 min-h-[36px]">
              {closed ? "Closed" : "+ Add"}
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
  const [liveIsOpen, setLiveIsOpen] = useState(restaurant.is_open ?? true)
  const [liveOpenTime, setLiveOpenTime] = useState(restaurant.opening_time ? restaurant.opening_time.slice(0, 5) : undefined)
  const [liveCloseTime, setLiveCloseTime] = useState(restaurant.closing_time ? restaurant.closing_time.slice(0, 5) : undefined)
  const [deals, setDeals] = useState<(Deal & { dish?: { id: string; name_en: string; name_ur: string | null; image_url: string | null; price: number } | null })[]>([])
  const setRestaurant = useCartStore((s) => s.setRestaurant)
  const clearCart = useCartStore((s) => s.clearCart)
  const currentRestaurantId = useCartStore((s) => s.restaurantId)
  const cartItems = useCartStore((s) => s.items)
  const totalCartItems = useMemo(() => cartItems.reduce((sum, i) => sum + i.quantity, 0), [cartItems])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const isTimeClosed = !isRestaurantOpen(
    restaurant.opening_time,
    restaurant.closing_time,
    restaurant.opening_hours
  )
  const effectivelyClosed = !liveIsOpen || isTimeClosed

  useEffect(() => {
    setLiveIsOpen(restaurant.is_open ?? true)
    setLiveOpenTime(restaurant.opening_time ? restaurant.opening_time.slice(0, 5) : undefined)
    setLiveCloseTime(restaurant.closing_time ? restaurant.closing_time.slice(0, 5) : undefined)
  }, [restaurant.is_open, restaurant.opening_time, restaurant.closing_time])

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
          if (r.opening_time) setLiveOpenTime(r.opening_time.slice(0, 5))
          if (r.closing_time) setLiveCloseTime(r.closing_time.slice(0, 5))
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [restaurant.id])

  useEffect(() => {
    const supabase = createClient()
    supabase.from("deals")
      .select("*, dish:dishes!dish_id(id, name_en, name_ur, image_url, price)")
      .eq("restaurant_id", restaurant.id)
      .eq("is_active", true)
      .or(`start_date.is.null,start_date.lte.${new Date().toISOString()}`)
      .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setDeals(data) })
  }, [restaurant.id])

  useEffect(() => {
    if (currentRestaurantId && currentRestaurantId !== restaurant.id) {
      clearCart()
    }
    setRestaurant(restaurant.id, restaurant.name, restaurant.slug, restaurant.delivery_fee ?? 0)
  }, [restaurant.id, restaurant.name, restaurant.slug])

  function scrollToCategory(categoryId: string) {
    setActiveCategory(categoryId)
    const el = document.getElementById(`desk-cat-${categoryId}`)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const hasAnyDishes = categories.some((cat) => cat.dishes.length > 0)

  return (
    <div className="min-h-screen bg-white">

      {/* ===== MOBILE HEADER ===== */}
      <div
        className="fixed top-0 left-0 right-0 z-40 bg-white/80 safe-top md:hidden"
        style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center justify-between px-4 h-12 mx-auto max-w-7xl md:px-6">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-text-primary" />
          </button>
          <h2 className="text-[13px] font-semibold text-text-primary mx-2">
            Digital QR Menue
          </h2>
          <div className="w-8" />
        </div>
      </div>

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="md:hidden pt-12">
        <main className="pt-2 pb-[100px] px-4 mx-auto">
          {/* Compact Restaurant Info */}
          <div className="flex items-start gap-3 py-4 border-b border-border/50 mb-3">
            {restaurant.logo_url && !logoError ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5 relative flex-shrink-0 bg-white">
                <Image src={restaurant.logo_url} alt={restaurant.name} fill className="object-cover" sizes="48px" loading="lazy" onError={() => setLogoError(true)} />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-[#8F2E19] text-white flex items-center justify-center font-bold text-base flex-shrink-0 shadow-sm">
                {restaurant.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm font-bold text-text-primary leading-tight truncate">{restaurant.name_ur || restaurant.name}</h1>
                <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  !effectivelyClosed ? "bg-accent/10 text-accent" : "bg-error/10 text-error"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${!effectivelyClosed ? "bg-accent" : "bg-error"}`} />
                  {effectivelyClosed ? "Closed" : "Open"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-text-secondary mt-0.5">
                {restaurant.cuisine_type && <span>{restaurant.cuisine_type}</span>}
                {restaurant.city && <><span className="text-border-strong">·</span><span>{restaurant.city}</span></>}
                {liveOpenTime && liveCloseTime && <><span className="text-border-strong">·</span><span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{formatTo12Hour(liveOpenTime)} — {formatTo12Hour(liveCloseTime)}</span></>}
              </div>
              {(restaurant.delivery_time_min != null || restaurant.delivery_fee != null) && (
                <div className="flex items-center gap-2 text-[10px] text-text-secondary mt-0.5">
                  {restaurant.delivery_time_min != null && <span className="flex items-center gap-0.5"><Timer className="w-2.5 h-2.5" />{restaurant.delivery_time_min} min</span>}
                  {restaurant.delivery_fee != null && <span className="flex items-center gap-0.5"><Truck className="w-2.5 h-2.5" />{restaurant.delivery_fee === 0 ? "Free delivery" : `Rs\xa0${restaurant.delivery_fee}`}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-3">
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-white text-[11px] font-semibold active:scale-[0.97] transition-transform">
                <Phone className="w-3.5 h-3.5" /> Call
              </a>
            )}
            {restaurant.lat && restaurant.lng ? (
              <a href={`https://www.google.com/maps?q=${restaurant.lat},${restaurant.lng}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-text-secondary text-[11px] font-semibold active:scale-[0.97] transition-transform">
                <Navigation className="w-3.5 h-3.5" /> Map
              </a>
            ) : restaurant.address ? (
              <a href={`https://www.google.com/maps/search/${encodeURIComponent(restaurant.address)}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-text-secondary text-[11px] font-semibold active:scale-[0.97] transition-transform">
                <MapPin className="w-3.5 h-3.5" /> Map
              </a>
            ) : null}
          </div>

          {/* Sticky Category Tabs (below Call/Map) */}
          {categories.length > 0 && (
            <div className="sticky top-12 z-30 bg-white/95 backdrop-blur-md border-b border-border/50 overflow-x-auto no-scrollbar -mx-4 px-4 mb-3">
              <div className="flex gap-0.5 py-2 min-w-max">
                {categories.map((cat) => {
                  if (cat.dishes.length === 0) return null
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        const el = document.getElementById(`m-cat-${cat.id}`)
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
                      }}
                      className="whitespace-nowrap text-[11px] font-medium px-3 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                    >
                      {cat.name_en}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {deals.length > 0 && <div className="mb-3"><DealBanner restaurantId={restaurant.id} slug={restaurant.slug} /></div>}

          {effectivelyClosed && (
            <div className="bg-error/5 border border-error/20 rounded-xl px-3 py-2.5 mb-3 flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-error flex items-center justify-center shrink-0">
                <Store className="w-3 h-3 text-white" />
              </div>
              <p className="text-[11px] text-error font-semibold">
                {liveOpenTime && liveCloseTime
                  ? `Open today ${formatTo12Hour(liveOpenTime)} — ${formatTo12Hour(liveCloseTime)}`
                  : "Closed right now"}
              </p>
            </div>
          )}

          {/* Categories + 2-Column Dish Grid */}
          {categories.length > 0 ? (
            <div className="space-y-5">
              {categories.map((category) => {
                const availableDishes = category.dishes.filter((d) => d.is_available)
                const unavailableDishes = category.dishes.filter((d) => !d.is_available)
                if (availableDishes.length === 0 && unavailableDishes.length === 0) return null
                return (
                  <section key={category.id} id={`m-cat-${category.id}`} className="scroll-mt-28">
                    <h2 className="text-[13px] font-bold text-text-primary border-l-[3px] border-primary pl-2 mb-2.5 leading-tight">
                      {category.name_en}
                    </h2>
                    <div className="grid grid-cols-2 gap-2">
                      {availableDishes.map((dish) => <MobileDishCard key={dish.id} dish={dish} closed={effectivelyClosed} deals={deals} />)}
                      {unavailableDishes.map((dish) => <MobileDishCard key={dish.id} dish={dish} unavailable closed={effectivelyClosed} deals={deals} />)}
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
        <CartBar closed={effectivelyClosed} />
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden md:block">
        {/* HERO SECTION */}
        <div className="bg-gradient-to-b from-surface to-white pt-16 pb-8 border-b border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-start gap-5">
              {restaurant.logo_url && !logoError ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md ring-1 ring-black/5 relative shrink-0 bg-white">
                  <Image src={restaurant.logo_url} alt={`${restaurant.name} logo`} fill className="object-cover" sizes="80px" loading="lazy" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-[#8F2E19] text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-md">
                  {restaurant.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-text-primary">{restaurant.name_ur || restaurant.name}</h1>
                    <div className="flex items-center gap-3 mt-1.5 text-sm text-text-secondary">
                      {restaurant.city && (
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {restaurant.city}</span>
                      )}
                      {restaurant.cuisine_type && (
                        <span className="flex items-center gap-1"><UtensilsCrossed className="w-3.5 h-3.5" /> {restaurant.cuisine_type}</span>
                      )}
                    </div>
                    {restaurant.description && (
                      <p className="text-sm text-text-secondary mt-2 max-w-2xl leading-relaxed">{restaurant.description}</p>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    {restaurant.phone && (
                      <a href={`tel:${restaurant.phone}`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-all active:scale-[0.97]">
                        <Phone className="w-4 h-4" /> Call
                      </a>
                    )}
                    {(restaurant.lat && restaurant.lng) || restaurant.address ? (
                      <a
                        href={restaurant.lat && restaurant.lng ? `https://www.google.com/maps?q=${restaurant.lat},${restaurant.lng}` : `https://www.google.com/maps/search/${encodeURIComponent(restaurant.address || "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-text-secondary text-sm font-semibold hover:bg-[#FAFAFA] transition-all active:scale-[0.97]"
                      >
                        <Navigation className="w-4 h-4" /> Directions
                      </a>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full ${
                    !effectivelyClosed ? "bg-accent/10 text-accent" : "bg-error/10 text-error"
                  }`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${!effectivelyClosed ? "bg-accent" : "bg-error"}`} />
                    {effectivelyClosed ? "Closed" : "Open"}
                  </span>
                  {liveOpenTime && liveCloseTime && (
                    <span className="text-sm text-text-secondary font-medium flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-text-muted" />
                      {formatTo12Hour(liveOpenTime)} — {formatTo12Hour(liveCloseTime)}
                    </span>
                  )}
                  {restaurant.delivery_time_min != null && (
                    <span className="text-sm text-text-secondary font-medium flex items-center gap-1.5">
                      <Timer className="w-4 h-4 text-text-muted" />
                      {restaurant.delivery_time_min} min
                    </span>
                  )}
                  {restaurant.delivery_fee != null && (
                    <span className="text-sm text-text-secondary font-medium flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-text-muted" />
                      {restaurant.delivery_fee === 0 ? "Free delivery" : `Rs\xa0${restaurant.delivery_fee}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT: Two-column + Sticky Cart */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex gap-8">
            {/* LEFT SIDEBAR — Category Nav */}
            {hasAnyDishes && (
              <aside className="w-52 shrink-0">
                <nav className="sticky top-20 space-y-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-3 px-3">Menu</p>
                  {categories.map((cat) => {
                    if (cat.dishes.length === 0) return null
                    return (
                      <button
                        key={cat.id}
                        onClick={() => scrollToCategory(cat.id)}
                        className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
                      >
                        {cat.name_en}
                      </button>
                    )
                  })}
                </nav>
              </aside>
            )}

            {/* CENTER — Menu Dishes */}
            <main className="flex-1 min-w-0">
              {deals.length > 0 && (
                <div className="mb-8">
                  <DealBanner restaurantId={restaurant.id} slug={restaurant.slug} />
                </div>
              )}

              {effectivelyClosed && (
                <div className="bg-error/10 border border-error/30 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-error flex items-center justify-center shrink-0">
                    <Store className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-error">Currently Closed</p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {liveOpenTime && liveCloseTime
                        ? `Open today ${formatTo12Hour(liveOpenTime)} — ${formatTo12Hour(liveCloseTime)}`
                        : "This restaurant is not accepting orders right now"}
                    </p>
                  </div>
                </div>
              )}

              {categories.length > 0 ? (
                <div className="space-y-10">
                  {categories.map((category) => {
                    const availableDishes = category.dishes.filter((d) => d.is_available)
                    const unavailableDishes = category.dishes.filter((d) => !d.is_available)
                    if (availableDishes.length === 0 && unavailableDishes.length === 0) return null
                    return (
                      <section key={category.id} id={`desk-cat-${category.id}`}>
                        <h2 className="text-lg font-bold text-text-primary mb-4 border-l-[3px] border-primary pl-3">{category.name_en}</h2>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                          {availableDishes.map((dish) => <DesktopDishCard key={dish.id} dish={dish} closed={effectivelyClosed} deals={deals} />)}
                          {unavailableDishes.map((dish) => <DesktopDishCard key={dish.id} dish={dish} unavailable closed={effectivelyClosed} deals={deals} />)}
                        </div>
                      </section>
                    )
                  })}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="w-14 h-14 rounded-xl bg-surface flex items-center justify-center mx-auto mb-3">
                    <UtensilsCrossed className="w-7 h-7 text-text-muted" />
                  </div>
                  <p className="text-sm text-text-muted font-medium">No menu items available</p>
                </div>
              )}
            </main>

            {/* RIGHT SIDEBAR — Sticky Cart */}
            <aside className="w-80 shrink-0">
              <div className="sticky top-20 space-y-4">
                <DesktopCartPanel effectivelyClosed={effectivelyClosed} liveOpenTime={liveOpenTime} liveCloseTime={liveCloseTime} />
              </div>
            </aside>
          </div>
        </div>
      </div>

    </div>
  )
}
