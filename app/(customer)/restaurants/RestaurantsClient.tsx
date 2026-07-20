"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { useFavorites } from "@/lib/hooks/useFavorites"
import Link from "next/link"
import { Clock, Truck, Heart, MapPin, Search, Ban, ChevronRight, Sparkles, UtensilsCrossed } from "lucide-react"
import { isRestaurantOpen } from "@/lib/restaurant-hours"
import { isRestaurantSealed } from "@/lib/restaurant-sealed"

interface RestaurantSummary {
  id: string
  name: string
  slug: string
  city: string
  cuisine_type: string | null
  logo_url: string | null
  phone: string | null
  description?: string | null
  delivery_time_min?: number
  delivery_fee?: number
  is_open?: boolean
  opening_time?: string | null
  closing_time?: string | null
  opening_hours?: Record<string, { open: string; close: string; closed: boolean }> | null
  plan: string
  plan_end_date: string | null
  trial_end: string | null
}

interface RestaurantsClientProps {
  initialRestaurants: RestaurantSummary[]
  initialCities: string[]
}

function RestaurantCard({
  r,
  isFav,
  onToggleFav,
}: {
  r: RestaurantSummary
  isFav: boolean
  onToggleFav: (id: string) => void
}) {
  const reallyOpen = r.is_open && isRestaurantOpen(r.opening_time, r.closing_time, r.opening_hours)
  const sealed = isRestaurantSealed(r)

  return (
    <div data-testid={`restaurant-card-${r.slug}`} className={`flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white border border-border rounded-xl hover:border-black/20 hover:shadow-md hover:shadow-black/[0.03] transition-all duration-200 ${sealed ? "opacity-50" : ""}`}>
      {/* Logo */}
      <Link href={`/menu/${r.slug}`} className="shrink-0">
        {r.logo_url ? (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-[#F5F5F5] ring-1 ring-black/5">
            <Image src={r.logo_url} alt={r.name} width={48} height={48} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-[#1A1A1A] text-white flex items-center justify-center font-bold text-sm sm:text-lg">
            {r.name.charAt(0).toUpperCase()}
          </div>
        )}
      </Link>

      {/* Info */}
      <Link href={`/menu/${r.slug}`} className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-[13px] sm:text-[14px] font-bold text-text-primary truncate max-w-[110px] sm:max-w-[220px]">{r.name}</h3>
          {sealed ? (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#F5F5F5] text-text-muted shrink-0">
              <Ban className="w-2.5 h-2.5 inline-block -mt-0.5 mr-0.5" />
              Sealed
            </span>
          ) : (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
              reallyOpen ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${reallyOpen ? "bg-green-500" : "bg-red-400"}`} />
              {reallyOpen ? "Open" : "Closed"}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-[12px] text-text-secondary mt-0.5 sm:mt-1">
          {r.cuisine_type && (
            <span className="inline-flex items-center gap-1">
              <UtensilsCrossed className="w-3 h-3" />
              {r.cuisine_type}
            </span>
          )}
          {r.city && (
            <>
              <span className="text-border-strong" aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-0.5 shrink-0">
                <MapPin className="w-3 h-3" />
                {r.city}
              </span>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[10px] sm:text-[11px] text-text-muted">
          {r.delivery_time_min != null && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {r.delivery_time_min} min
            </span>
          )}
          {r.delivery_fee != null && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Truck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {r.delivery_fee === 0 ? "Free" : `Rs\xa0${r.delivery_fee}`}
            </span>
          )}
        </div>
      </Link>

      {/* Actions - stacked on mobile */}
      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 flex-shrink-0 self-center sm:self-center">
        <button
          onClick={(e) => { e.preventDefault(); onToggleFav(r.id) }}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${isFav ? "fill-red-500 text-red-500" : "text-text-muted/30 hover:text-red-400"}`} />
        </button>
        <Link
          href={`/menu/${r.slug}`}
          data-testid={`menu-link-${r.slug}`}
          className="inline-flex items-center gap-0.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-primary text-white text-[11px] sm:text-[12px] font-semibold hover:bg-primary-hover active:scale-[0.97] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
        >
          Menu
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </Link>
      </div>
    </div>
  )
}

export function RestaurantsClient({ initialRestaurants, initialCities }: RestaurantsClientProps) {
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>(initialRestaurants)
  const allCities = useMemo(() => [...new Set(initialCities.map((c) => c.trim()))].sort(), [initialCities])
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const { isFavorited, toggleFavorite, loading: favLoading } = useFavorites()

  useEffect(() => {
    if (!selectedCity) {
      setRestaurants(initialRestaurants)
      return
    }

    const fetchRestaurants = async () => {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from("restaurants")
        .select("id, name, slug, city, cuisine_type, logo_url, description, delivery_time_min, delivery_fee, is_open, opening_time, closing_time, opening_hours, plan, plan_end_date, trial_end, phone")
        .eq("is_active", true)
        .eq("is_suspended", false)

      if (selectedCity) {
        query = query.eq("city", selectedCity.trim())
      }

      const { data } = await query.order("name")
      setRestaurants(data || [])
      setLoading(false)
    }
    fetchRestaurants()
  }, [selectedCity]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(uid("restaurants-open-status"))
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "restaurants" },
        (payload) => {
          const updated = payload.new as any
          setRestaurants((prev) =>
            prev.map((r) =>
              r.id === updated.id
                ? { ...r, is_open: updated.is_open, opening_time: updated.opening_time, closing_time: updated.closing_time, opening_hours: updated.opening_hours }
                : r
            )
          )
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const filteredRestaurants = useMemo(() => {
    if (!searchQuery.trim()) return restaurants
    const q = searchQuery.toLowerCase()
    return restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.cuisine_type || "").toLowerCase().includes(q) ||
        r.city.trim().toLowerCase().includes(q)
    )
  }, [searchQuery, restaurants])

  const handleSearchClear = useCallback(() => setSearchQuery(""), [])

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* ── Hero Section ── */}
      <section className="relative bg-gradient-to-br from-black via-[#1A1A1A] to-[#2D2D2D] overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-accent/[0.03] rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/[0.01] rounded-full blur-2xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-6 sm:pb-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/70 text-[11px] font-medium mb-3 sm:mb-4">
              <Sparkles className="w-3 h-3" />
              Discover restaurants near you
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Browse Restaurants
            </h1>
            <p className="text-xs sm:text-base text-white/50 mt-2 sm:mt-3 max-w-lg mx-auto leading-relaxed px-2 sm:px-0">
              Explore digital menus from restaurants across Pakistan. Tap any restaurant to browse their menu and order directly via WhatsApp.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mt-5 sm:mt-8">
            <div className={`relative transition-all duration-200 ${searchFocused ? "scale-[1.02]" : "scale-100"}`}>
              <div className="absolute inset-0 bg-white/5 blur-xl rounded-2xl" />
              <div className={`relative flex items-center bg-white rounded-2xl shadow-xl shadow-black/10 transition-all duration-200 ${searchFocused ? "ring-2 ring-accent/40" : ""}`}>
                <Search className={`absolute left-3.5 sm:left-4 w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${searchFocused ? "text-black" : "text-[#BBB]"}`} />
                <input
                  type="text"
                  data-testid="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search restaurants, cuisines, or locations..."
                  className="w-full pl-9 sm:pl-11 pr-9 sm:pr-11 h-11 sm:h-12 bg-transparent text-[13px] sm:text-[14px] text-black outline-none placeholder:text-[#BBB] font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={handleSearchClear}
                    className="absolute right-3 sm:right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#F0F0F0] flex items-center justify-center hover:bg-[#E0E0E0] transition-colors"
                    aria-label="Clear search"
                  >
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-24">
        {/* City Filters */}
        <section className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              onClick={() => setSelectedCity("")}
              data-testid="city-filter-all"
              className={`shrink-0 px-4 py-2 rounded-full text-[12px] font-semibold transition-all ${
                !selectedCity
                  ? "bg-black text-white shadow-md shadow-black/10"
                  : "bg-white text-[#666] border border-[#E8E8E8] hover:border-[#CCC] hover:text-black hover:shadow-sm"
              }`}
            >
              All Cities
            </button>
            {allCities.map((city) => (
              <button
                key={city}
                data-testid={`city-filter-${city.toLowerCase()}`}
                onClick={() => setSelectedCity(city)}
                className={`shrink-0 px-4 py-2 rounded-full text-[12px] font-semibold transition-all ${
                  selectedCity === city
                    ? "bg-black text-white shadow-md shadow-black/10"
                    : "bg-white text-[#666] border border-[#E8E8E8] hover:border-[#CCC] hover:text-black hover:shadow-sm"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </section>

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-semibold text-black/60">
            {loading
              ? "Loading..."
              : `${filteredRestaurants.length} ${filteredRestaurants.length === 1 ? "restaurant" : "restaurants"}`
            }
          </h2>
          {selectedCity && (
            <button
              onClick={() => setSelectedCity("")}
              className="text-[12px] font-medium text-accent hover:text-accent/80 transition-colors"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Restaurant List — horizontal cards */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white border border-border rounded-xl animate-pulse">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F5F5F5] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#F5F5F5] rounded w-1/3" />
                  <div className="h-3 bg-[#F5F5F5] rounded w-1/2" />
                  <div className="h-3 bg-[#F5F5F5] rounded w-1/4" />
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 shrink-0 self-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#F5F5F5]" />
                  <div className="w-12 sm:w-20 h-7 sm:h-9 rounded-lg sm:rounded-xl bg-[#F5F5F5]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div data-testid="restaurants-empty-state" className="py-12 sm:py-24 text-center px-2">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#F0F0F0] mx-auto mb-5 flex items-center justify-center shadow-sm">
              <Search className="w-7 h-7 text-[#CCC]" />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">
              {searchQuery.trim() ? "No restaurants found" : "No restaurants yet"}
            </h3>
            <p className="text-[13px] text-[#888] mb-6 max-w-sm mx-auto leading-relaxed">
              {searchQuery.trim()
                ? `No results for "${searchQuery}". Try a different search or city.`
                : "There are no restaurants in this area yet."}
            </p>
            {searchQuery.trim() && (
              <button
                onClick={handleSearchClear}
                data-testid="clear-search-btn"
                className="text-[13px] font-semibold text-white bg-black hover:bg-[#333] px-6 py-2.5 rounded-xl transition-colors shadow-md shadow-black/10"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRestaurants.map((r) => (
              <RestaurantCard
                key={r.id}
                r={r}
                isFav={isFavorited(r.id)}
                onToggleFav={toggleFavorite}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
