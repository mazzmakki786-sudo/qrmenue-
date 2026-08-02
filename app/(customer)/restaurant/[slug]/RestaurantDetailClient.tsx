"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { MapPin, Phone, ArrowLeft, UtensilsCrossed, Clock, Navigation, Truck, Timer, ShoppingCart, Minus, Plus, Trash2, Percent, ImageOff, Store, ExternalLink, Globe, Languages } from "lucide-react"
import { formatTo12Hour, formatPrice } from "@/lib/utils"
import { isRestaurantOpen } from "@/lib/restaurant-hours"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCartStore } from "@/stores/cartStore"
import { CartBar } from "@/components/customer/CartBar"
import { DealBanner } from "@/components/customer/DealBanner"
import { DishBadges } from "@/components/customer/DishBadges"
import { LogoIcon } from "@/components/shared/LogoIcon"
import type { Category, Deal, Dish } from "@/types"
import type { BrandingConfig } from "@/lib/branding"

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
  banner_enabled?: boolean | null
  banner_image_url?: string | null
  banner_link_url?: string | null
}

interface Props {
  restaurant: Restaurant
  categories: (Category & { dishes: Dish[] })[]
  branding?: BrandingConfig
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
      <div className="border border-dashed border-border rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-7 h-7 text-text-muted" />
        </div>
        <p className="text-sm font-semibold text-text-primary mb-1">Your cart is empty</p>
        <p className="text-[13px] text-text-muted leading-relaxed">Browse the menu and add dishes to get started</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-text-muted" />
          Your Order
        </h3>
        <span className="text-[12px] text-text-muted font-medium bg-surface px-2.5 py-1 rounded-full">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
      </div>
      <div className="px-5 py-4 space-y-3 max-h-[55vh] overflow-y-auto">
        {items.map((item) => (
          <div key={item.dish.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
            {item.dish.image_url && (
              <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 relative bg-surface ring-1 ring-black/5">
                <Image src={item.dish.image_url} alt={`${item.dish.name_en} in cart`} width={44} height={44} className="object-cover w-full h-full" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-text-primary truncate">{item.dish.name_en}</p>
              <p className="text-[11px] text-text-muted mt-0.5">Rs {item.dish.price.toLocaleString("en-PK")} each</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}
                className="w-7 h-7 rounded-full bg-surface flex items-center justify-center hover:bg-border transition-colors active:scale-90"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3 text-text-secondary" />
              </button>
              <span className="text-sm font-bold min-w-[20px] text-center text-text-primary">{item.quantity}</span>
              <button
                onClick={() => addItem(item.dish)}
                disabled={effectivelyClosed}
                className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors disabled:opacity-30 active:scale-90"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                onClick={() => removeItem(item.dish.id)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-error hover:bg-error/5 transition-colors ml-1 active:scale-90"
                aria-label="Remove item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 pb-5 pt-3 border-t border-border/60 mx-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-text-secondary font-medium">Total</span>
          <span className="text-xl font-bold text-text-primary">Rs {getTotalPrice().toLocaleString("en-PK")}</span>
        </div>
        {effectivelyClosed ? (
          <div className="bg-error/5 border border-error/15 rounded-xl p-4 text-center">
            <Store className="w-5 h-5 text-error mx-auto mb-1.5" />
            <p className="text-[13px] font-semibold text-error">Restaurant is closed</p>
            <p className="text-[11px] text-text-muted mt-1">
              {liveOpenTime && liveCloseTime
                ? `Open ${formatTo12Hour(liveOpenTime)} — ${formatTo12Hour(liveCloseTime)}`
                : "Orders are not being accepted right now"}
            </p>
          </div>
        ) : (
          <Link
            href="/checkout"
            className="block w-full bg-primary text-white text-center py-3.5 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-all active:scale-[0.98] shadow-sm"
          >
            Proceed to Checkout
          </Link>
        )}
        {restaurantName && (
          <p className="text-[11px] text-text-muted/60 text-center mt-3">{restaurantName}</p>
        )}
      </div>
    </div>
  )
}

function DesktopDishCard({ dish, deals, getName, getDesc, displayLang, unavailable, closed }: { dish: Dish; deals?: (Deal & { dish?: { id: string; name_en: string; name_ur: string | null; image_url: string | null; price: number } | null })[]; getName: (d: Dish) => string; getDesc: (d: Dish) => string | null; displayLang?: string; unavailable?: boolean; closed?: boolean }) {
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
    <div className={`group bg-white rounded-2xl border border-border overflow-hidden transition-all duration-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)] hover:border-border-strong flex flex-col ${unavailable ? "opacity-50" : ""}`}>
      {/* Image */}
      <div className="relative w-full aspect-[16/9] bg-surface overflow-hidden">
        {dish.image_url && !imgError ? (
          <Image
            src={dish.image_url}
            alt={`${dish.name_en}${dish.name_ur ? ` (${dish.name_ur})` : ""} — ₹${dish.price}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 1280px) 50vw, 33vw"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface to-border/20">
            <ImageOff className="w-8 h-8 text-text-muted/30" />
          </div>
        )}
        {/* Deal badge */}
        {dishDeal && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/90 text-primary shadow-sm">
              <Percent className="w-2.5 h-2.5" />
              {dishDeal.deal_type === "percentage" ? `${dishDeal.deal_value}%` : `Rs ${dishDeal.deal_value}`} OFF
            </span>
          </div>
        )}
        {unavailable && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <span className="text-white text-[10px] font-semibold bg-black/60 px-3 py-1 rounded-full">Unavailable</span>
          </div>
        )}
      </div>

      {/* Info — full descriptions visible */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <h3 className="text-[15px] font-semibold text-text-primary leading-snug">{getName(dish)}</h3>
          <div className="text-right shrink-0">
            {dealPrice !== null ? (
              <>
                <span className="text-sm font-bold text-primary">{formatPrice(dealPrice)}</span>
                <p className="text-[10px] text-text-muted line-through">Rs {dish.price.toLocaleString("en-PK")}</p>
              </>
            ) : (
              <span className="text-sm font-bold text-text-primary whitespace-nowrap">Rs {dish.price.toLocaleString("en-PK")}</span>
            )}
          </div>
        </div>

        {/* Show secondary language name below */}
        {displayLang === "ur" && dish.name_en && <p className="text-[12px] text-text-muted leading-snug mb-1">{dish.name_en}</p>}
        {displayLang === "en" && dish.name_ur && <p className="text-[13px] text-text-secondary font-urdu leading-snug mb-1.5">{dish.name_ur}</p>}

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            <DishBadges tags={badges} />
          </div>
        )}

        {getDesc(dish) && (
          <p className="text-[13px] text-text-secondary leading-relaxed mb-3">{getDesc(dish)}</p>
        )}

        {!dish.description_en && <div className="mb-3" />}

        {/* Add/Quantity — mt-auto pushes to bottom */}
        <div className="flex justify-end mt-auto">
          {cartItem ? (
            <div className="inline-flex items-center gap-1.5 bg-surface-dark rounded-full px-1.5 py-1">
              <button onClick={() => updateQuantity(dish.id, cartItem.quantity - 1)} className="w-8 h-8 rounded-full flex items-center justify-center text-primary font-bold hover:bg-white/60 transition-colors text-[18px]">−</button>
              <span className="text-[13px] font-bold min-w-[22px] text-center text-text-primary">{cartItem.quantity}</span>
              <button onClick={() => addItem(dish)} disabled={closed} className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors disabled:opacity-30 text-[18px] font-bold">+</button>
            </div>
          ) : (
            <button onClick={() => addItem(dish)} disabled={unavailable || closed} className="inline-flex items-center gap-1 bg-primary text-white rounded-full px-4 py-2 text-xs font-semibold hover:bg-primary-hover active:scale-[0.95] transition-all duration-200 disabled:opacity-50">
              {closed ? "Closed" : "+ Add"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function MobileDishCard({ dish, deals, getName, getDesc, displayLang, unavailable, closed }: { dish: Dish; deals?: (Deal & { dish?: { id: string; name_en: string; name_ur: string | null; image_url: string | null; price: number } | null })[]; getName: (d: Dish) => string; getDesc: (d: Dish) => string | null; displayLang?: string; unavailable?: boolean; closed?: boolean }) {
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
    <div className={`group bg-white rounded-xl border border-border overflow-hidden transition-all duration-200 flex flex-col ${unavailable ? "opacity-50" : ""}`}>
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-surface overflow-hidden">
        {dish.image_url && !imgError ? (
          <Image
            src={dish.image_url}
            alt={`${dish.name_en}${dish.name_ur ? ` (${dish.name_ur})` : ""} — ₹${dish.price}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 200px"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface to-border/20">
            <ImageOff className="w-6 h-6 text-text-muted/30" />
          </div>
        )}
        {/* Deal badge */}
        {dishDeal && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-white/90 text-primary shadow-sm">
              <Percent className="w-2 h-2" />
              {dishDeal.deal_type === "percentage" ? `${dishDeal.deal_value}%` : `Rs ${dishDeal.deal_value}`} OFF
            </span>
          </div>
        )}
        {unavailable && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[1px]">
            <span className="text-white text-[9px] font-semibold bg-black/60 px-2.5 py-1 rounded-full">Unavailable</span>
          </div>
        )}
      </div>

      {/* Info — flex-1 + mt-auto on action to push to bottom */}
      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3 className="text-[13px] font-semibold text-text-primary leading-snug flex-1">{getName(dish)}</h3>
          <span className="text-[13px] font-bold text-text-primary shrink-0 ml-1">
            {dealPrice !== null ? (
              <span className="text-primary">{formatPrice(dealPrice)}</span>
            ) : (
              `Rs ${dish.price.toLocaleString("en-PK")}`
            )}
          </span>
        </div>

        {/* Show opposite language name as secondary */}
        {displayLang === "ur" && dish.name_en && <p className="text-[11px] text-text-muted leading-snug mb-1">{dish.name_en}</p>}
        {displayLang === "en" && dish.name_ur && <p className="text-[11px] text-text-secondary font-urdu leading-snug mb-1 tracking-tight">{dish.name_ur}</p>}

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mb-1">
            <DishBadges tags={badges} />
          </div>
        )}

        {getDesc(dish) && (
          <p className="text-[11px] text-text-secondary leading-relaxed mb-2">{getDesc(dish)}</p>
        )}

        {!dish.description_en && <div className="mb-2" />}

        <div className="flex justify-end mt-auto">
          {cartItem ? (
            <div className="inline-flex items-center gap-1 bg-surface-dark rounded-full px-1.5 py-0.5 min-h-[30px]">
              <button onClick={() => updateQuantity(dish.id, cartItem.quantity - 1)} className="w-7 h-7 rounded-full flex items-center justify-center text-primary font-bold hover:bg-white/60 transition-colors text-[15px]">−</button>
              <span className="text-[12px] font-bold min-w-[18px] text-center text-text-primary">{cartItem.quantity}</span>
              <button onClick={() => addItem(dish)} disabled={closed} className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors disabled:opacity-30 text-[15px] font-bold">+</button>
            </div>
          ) : (
            <button onClick={() => addItem(dish)} disabled={unavailable || closed} className="inline-flex items-center gap-1 bg-primary text-white rounded-full px-3.5 py-1.5 text-[11px] font-semibold hover:bg-primary-hover active:scale-[0.95] transition-all duration-200 disabled:opacity-50">
              {closed ? "Closed" : "+ Add"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function RestaurantDetailClient({ restaurant, categories, branding }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [logoError, setLogoError] = useState(false)
  const [liveIsOpen, setLiveIsOpen] = useState(restaurant.is_open ?? true)
  const [_, setLang] = useState(searchParams?.get("lang") === "ur" ? "ur" : "en")
  const [imgLoaded, setImgLoaded] = useState(false)
  const [liveOpenTime, setLiveOpenTime] = useState(restaurant.opening_time ? restaurant.opening_time.slice(0, 5) : undefined)
  const [liveCloseTime, setLiveCloseTime] = useState(restaurant.closing_time ? restaurant.closing_time.slice(0, 5) : undefined)
  const [liveOpeningHours, setLiveOpeningHours] = useState<Record<string, { open: string; close: string; closed: boolean }> | null>(restaurant.opening_hours ?? null)
  const [deals, setDeals] = useState<(Deal & { dish?: { id: string; name_en: string; name_ur: string | null; image_url: string | null; price: number } | null })[]>([])
  const setRestaurant = useCartStore((s) => s.setRestaurant)
  const clearCart = useCartStore((s) => s.clearCart)
  const currentRestaurantId = useCartStore((s) => s.restaurantId)

  // ── Realtime-reactive time check ──
  // Uses live state instead of static SSR props so Realtime updates take effect.
  const isTimeClosed = !isRestaurantOpen(
    liveOpenTime,
    liveCloseTime,
    liveOpeningHours
  )
  const effectivelyClosed = !liveIsOpen || isTimeClosed

  useEffect(() => {
    setLiveIsOpen(restaurant.is_open ?? true)
    setLiveOpenTime(restaurant.opening_time ? restaurant.opening_time.slice(0, 5) : undefined)
    setLiveCloseTime(restaurant.closing_time ? restaurant.closing_time.slice(0, 5) : undefined)
    setLiveOpeningHours(restaurant.opening_hours ?? null)
  }, [restaurant.is_open, restaurant.opening_time, restaurant.closing_time, restaurant.opening_hours])

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
          if (r.opening_hours) setLiveOpeningHours(r.opening_hours)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant.id, restaurant.name, restaurant.slug])

  function scrollToCategory(categoryId: string) {
    const el = document.getElementById(`desk-cat-${categoryId}`)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // Language toggle - updates URL param for SSR and component re-render
  const lang = searchParams?.get("lang") === "ur" ? "ur" : "en"
  const toggleLang = useCallback(() => {
    const newLang = lang === "en" ? "ur" : "en"
    const params = new URLSearchParams(searchParams?.toString() || "")
    if (newLang === "en") params.delete("lang")
    else params.set("lang", newLang)
    router.push(`${pathname}?${params.toString()}`)
  }, [lang, pathname, router, searchParams])

  // Language-aware display helper
  const displayLang = lang
  const getName = useCallback((dish: Dish) => {
    return displayLang === "ur" && dish.name_ur ? dish.name_ur : dish.name_en
  }, [displayLang])
  const getCatName = useCallback((cat: { name_en: string; name_ur?: string | null }) => {
    return displayLang === "ur" && cat.name_ur ? cat.name_ur : cat.name_en
  }, [displayLang])
  const getDesc = useCallback((dish: Dish) => {
    return displayLang === "ur" && dish.description_ur ? dish.description_ur : dish.description_en
  }, [displayLang])

  const hasAnyDishes = categories.some((cat) => cat.dishes.length > 0)

  return (
    <div className="min-h-screen bg-white">

      {/* ===== UNIFIED TOP BAR ===== */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/30 h-14 md:h-14 flex items-center shadow-sm">
        <div className="flex items-center justify-between w-full px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            {/* Back button - use Link instead of router.back() to avoid glitch */}
            <Link
              href="/restaurants"
              className="w-8 h-8 rounded-full bg-surface flex items-center justify-center active:scale-95 transition-transform hover:bg-border shrink-0"
              aria-label="Go back to restaurants"
            >
              <ArrowLeft className="w-4 h-4 text-text-primary" />
            </Link>
            {/* Logo + Name */}
            <Link href="/restaurants" className="flex items-center gap-2 shrink-0">
              <LogoIcon className="w-5 h-5 shrink-0" />
              <span className="hidden sm:inline text-xs font-semibold text-text-primary">{restaurant.name}</span>
              <span className="text-[10px] text-text-muted hidden sm:inline">— Digital QR Menue</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface hover:bg-border transition-colors text-xs font-semibold text-text-secondary"
              aria-label="Toggle language"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang === "en" ? "اردو" : "English"}</span>
            </button>
            {/* Desktop: all restaurants link */}
            <Link
              href="/restaurants"
              className="hidden md:inline-flex text-xs font-medium text-text-muted hover:text-text-secondary transition-colors px-3 py-1.5"
            >
              All Restaurants
            </Link>
          </div>
        </div>
      </header>

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="md:hidden">
        <main className="pb-[100px] mx-auto">
          {/* Hero Section — Banner or Logo background */}
          <div className="relative w-full h-52 bg-surface overflow-hidden">
            {(restaurant.banner_enabled && restaurant.banner_image_url) ? (
              <>
                {!imgLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-surface to-border/20 animate-pulse" />
                )}
                <Image
                  src={restaurant.banner_image_url}
                  alt={restaurant.name}
                  fill
                  className={`object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                  sizes="100vw"
                  priority
                  onLoad={() => setImgLoaded(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              </>
            ) : (restaurant.logo_url && !logoError ? (
              <>
                <Image
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                  onError={() => setLogoError(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary via-primary-hover to-primary/60" />
            ))}
            {/* Always show logo overlay */}
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <div className="flex items-end gap-3">
                {restaurant.logo_url && (
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/90 shadow-lg relative shrink-0 bg-white">
                    <Image src={restaurant.logo_url} alt={restaurant.name} fill className="object-cover" sizes="56px" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="text-white text-lg font-bold leading-tight drop-shadow-sm">{restaurant.name_ur || restaurant.name}</h1>
                  <div className="flex items-center gap-1.5 text-white/80 text-[11px] mt-0.5">
                    {restaurant.cuisine_type && <span>{restaurant.cuisine_type}</span>}
                    {restaurant.city && <><span className="text-white/40">·</span><span>{restaurant.city}</span></>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status + Info chips */}
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                !effectivelyClosed ? "bg-accent/8 text-accent" : "bg-error/8 text-error"
              }`}>
                <span className={`relative w-1.5 h-1.5 rounded-full ${!effectivelyClosed ? "bg-accent" : "bg-error"}`}>
                  {!effectivelyClosed && <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-30" />}
                </span>
                {effectivelyClosed ? "Closed" : "Open now"}
              </span>
              {liveOpenTime && liveCloseTime && (
                <span className="text-[11px] text-text-secondary flex items-center gap-1">
                  <Clock className="w-3 h-3 text-text-muted" />
                  {formatTo12Hour(liveOpenTime)} — {formatTo12Hour(liveCloseTime)}
                </span>
              )}
              {restaurant.delivery_time_min != null && (
                <span className="text-[11px] text-text-secondary flex items-center gap-1">
                  <Timer className="w-3 h-3 text-text-muted" />
                  {restaurant.delivery_time_min} min
                </span>
              )}
            </div>
            {restaurant.delivery_fee != null && (
              <span className="text-[11px] text-text-secondary flex items-center gap-1 mt-1.5">
                <Truck className="w-3 h-3 text-text-muted" />
                {restaurant.delivery_fee === 0 ? "Free delivery" : `Delivery: Rs\xa0${restaurant.delivery_fee}`}
              </span>
            )}
          </div>

          {/* Description — only if no hero image or banner */}
          {restaurant.description && !restaurant.logo_url && !restaurant.banner_enabled && (
            <p className="px-4 text-[13px] text-text-secondary leading-relaxed pb-3 border-b border-border/40">{restaurant.description}</p>
          )}

          {/* Action Buttons */}
          <div className="px-4 pt-3 pb-2">
            <div className="flex gap-2">
              {restaurant.phone && (
                <a href={`tel:${restaurant.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-white text-[12px] font-semibold active:scale-[0.97] transition-transform">
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
              )}
              {(restaurant.lat && restaurant.lng) || restaurant.address ? (
                <a
                  href={restaurant.lat && restaurant.lng ? `https://www.google.com/maps?q=${restaurant.lat},${restaurant.lng}` : `https://www.google.com/maps/search/${encodeURIComponent(restaurant.address || "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-text-secondary text-[12px] font-semibold active:scale-[0.97] transition-transform"
                >
                  <Navigation className="w-3.5 h-3.5" /> Direction
                </a>
              ) : null}
            </div>
          </div>

          {/* Sticky Category Pills */}
          {categories.length > 0 && (
            <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-md border-b border-border/40 overflow-x-auto no-scrollbar px-4">
              <div className="flex gap-1.5 py-2.5 min-w-max" role="tablist">
                {categories.map((cat) => {
                  if (cat.dishes.length === 0) return null
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        const el = document.getElementById(`m-cat-${cat.id}`)
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
                      }}
                      className="whitespace-nowrap text-[12px] font-semibold px-4 py-2 rounded-full bg-surface text-text-secondary hover:bg-surface-dark hover:text-text-primary transition-all active:scale-95"
                    >
                      {getCatName(cat)}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="px-4 pt-3">
            {deals.length > 0 && <div className="mb-4 animate-fade-in"><DealBanner restaurantId={restaurant.id} slug={restaurant.slug} /></div>}

            {effectivelyClosed && (
              <div className="bg-error/5 border border-error/20 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-error flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <p className="text-[12px] text-error font-semibold">
                  {liveOpenTime && liveCloseTime
                    ? `Open today ${formatTo12Hour(liveOpenTime)} — ${formatTo12Hour(liveCloseTime)}`
                    : "Closed right now"}
                </p>
              </div>
            )}

            {/* Categories + 2-Column Dish Grid */}
            {categories.length > 0 ? (
              <div className="space-y-6 pb-4">
                {categories.map((category) => {
                  const availableDishes = category.dishes.filter((d) => d.is_available)
                  const unavailableDishes = category.dishes.filter((d) => !d.is_available)
                  if (availableDishes.length === 0 && unavailableDishes.length === 0) return null
                  return (
                    <section key={category.id} id={`m-cat-${category.id}`} className="scroll-mt-28">
                      <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-[14px] font-bold text-text-primary">{getCatName(category)}</h2>
                        <span className="h-px flex-1 bg-border/50" />
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 auto-rows-fr">
                        {availableDishes.map((dish) => <MobileDishCard key={dish.id} dish={dish} closed={effectivelyClosed} deals={deals} getName={getName} getDesc={getDesc} displayLang={lang} />)}
                        {unavailableDishes.map((dish) => <MobileDishCard key={dish.id} dish={dish} unavailable closed={effectivelyClosed} deals={deals} getName={getName} getDesc={getDesc} displayLang={lang} />)}
                      </div>
                    </section>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center mx-auto mb-3">
                  <UtensilsCrossed className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-text-muted font-medium">No menu items available</p>
              </div>
            )}
          </div>
        </main>
        <CartBar closed={effectivelyClosed} />
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden md:block">
        {/* Desktop Hero — Banner or Logo as background */}
        <div className="relative w-full h-56 bg-surface overflow-hidden">
          {(restaurant.banner_enabled && restaurant.banner_image_url) ? (
            <>
              {!imgLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-surface to-border/20 animate-pulse" />
              )}
              <Image
                src={restaurant.banner_image_url}
                alt={`${restaurant.name} banner`}
                fill
                className={`object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                sizes="100vw"
                priority
                onLoad={() => setImgLoaded(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              {restaurant.banner_link_url && (
                <a
                  href={restaurant.banner_link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-10 flex items-end justify-end p-4 opacity-0 hover:opacity-100 transition-opacity"
                >
                  <span className="text-white text-xs bg-black/50 px-3 py-1.5 rounded-full flex items-center gap-1">
                    Learn more <ExternalLink className="w-3 h-3" />
                  </span>
                </a>
              )}
            </>
          ) : (restaurant.logo_url && !logoError ? (
            <>
              <Image
                src={restaurant.logo_url}
                alt={`${restaurant.name} logo`}
                fill
                className="object-cover opacity-30 scale-150"
                sizes="100vw"
                priority
                onError={() => setLogoError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary via-primary-hover to-primary/60" />
          ))}
        </div>

        {/* HERO INFO SECTION */}
        <div className="bg-white pb-10 border-b border-border/60">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-start gap-6">
              {restaurant.logo_url && !logoError ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5 relative shrink-0 bg-white">
                  <Image src={restaurant.logo_url} alt={`${restaurant.name} logo`} fill className="object-cover" sizes="80px" loading="lazy" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-[#8F2E19] text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-sm">
                  {restaurant.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">{restaurant.name_ur || restaurant.name}</h1>
                    <div className="flex items-center gap-2 mt-1.5 text-sm text-text-secondary">
                      {restaurant.city && (
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {restaurant.city}</span>
                      )}
                      {restaurant.cuisine_type && (
                        <><span className="w-1 h-1 rounded-full bg-border" /><span className="flex items-center gap-1"><UtensilsCrossed className="w-3.5 h-3.5" /> {restaurant.cuisine_type}</span></>
                      )}
                    </div>
                    {restaurant.description && (
                      <p className="text-sm text-text-secondary mt-2 max-w-2xl leading-relaxed">{restaurant.description}</p>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-2.5">
                    {restaurant.phone && (
                      <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-text-primary text-sm font-semibold hover:bg-surface transition-all active:scale-[0.97]">
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                    )}
                    {(restaurant.lat && restaurant.lng) || restaurant.address ? (
                      <a
                        href={restaurant.lat && restaurant.lng ? `https://www.google.com/maps?q=${restaurant.lat},${restaurant.lng}` : `https://www.google.com/maps/search/${encodeURIComponent(restaurant.address || "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-all active:scale-[0.97]"
                      >
                        <Navigation className="w-3.5 h-3.5" /> Directions
                      </a>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 flex-wrap text-sm">
                  <span className={`inline-flex items-center gap-1.5 font-semibold px-3.5 py-1.5 rounded-full ${
                    !effectivelyClosed ? "bg-accent/8 text-accent" : "bg-error/8 text-error"
                  }`}>
                    <span className={`relative w-2 h-2 rounded-full ${!effectivelyClosed ? "bg-accent" : "bg-error"}`}>
                      {!effectivelyClosed && <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-30" />}
                    </span>
                    {effectivelyClosed ? "Closed" : "Open now"}
                  </span>
                  {liveOpenTime && liveCloseTime && (
                    <span className="text-text-secondary font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-text-muted" />
                      {formatTo12Hour(liveOpenTime)} — {formatTo12Hour(liveCloseTime)}
                    </span>
                  )}
                  {restaurant.delivery_time_min != null && (
                    <span className="text-text-secondary font-medium flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-text-muted" />
                      {restaurant.delivery_time_min} min
                    </span>
                  )}
                  {restaurant.delivery_fee != null && (
                    <span className="text-text-secondary font-medium flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-text-muted" />
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
              <aside className="w-48 shrink-0">
                <nav className="sticky top-[72px] space-y-1">
                  {categories.map((cat) => {
                    if (cat.dishes.length === 0) return null
                    const availableCount = cat.dishes.filter((d) => d.is_available).length
                    return (
                      <button
                        key={cat.id}
                        onClick={() => scrollToCategory(cat.id)}
                        className="group block w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary transition-all"
                      >
                        <span className="flex items-center justify-between">
                          <span>{getCatName(cat)}</span>
                          <span className="text-[10px] text-text-muted group-hover:text-text-secondary transition-colors">{availableCount}</span>
                        </span>
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
                <div className="space-y-12">
                  {categories.map((category) => {
                    const availableDishes = category.dishes.filter((d) => d.is_available)
                    const unavailableDishes = category.dishes.filter((d) => !d.is_available)
                    if (availableDishes.length === 0 && unavailableDishes.length === 0) return null
                    return (
                      <section key={category.id} id={`desk-cat-${category.id}`}>
                        <div className="flex items-center gap-3 mb-5">
                          <h2 className="text-lg font-bold text-text-primary">{getCatName(category)}</h2>
                          <span className="h-px flex-1 bg-border/60" />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
                          {availableDishes.map((dish) => <DesktopDishCard key={dish.id} dish={dish} closed={effectivelyClosed} deals={deals} getName={getName} getDesc={getDesc} displayLang={lang} />)}
                          {unavailableDishes.map((dish) => <DesktopDishCard key={dish.id} dish={dish} unavailable closed={effectivelyClosed} deals={deals} getName={getName} getDesc={getDesc} displayLang={lang} />)}
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
