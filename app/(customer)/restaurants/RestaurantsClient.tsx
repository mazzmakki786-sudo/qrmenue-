"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { useFavorites } from "@/lib/hooks/useFavorites"
import Link from "next/link"
import { Clock, Truck, Heart, MapPin, Search, Ban } from "lucide-react"
import { isRestaurantOpen } from "@/lib/restaurant-hours"
import { isRestaurantSealed } from "@/lib/restaurant-sealed"

interface RestaurantSummary {
  id: string
  name: string
  slug: string
  city: string
  cuisine_type: string | null
  logo_url: string | null
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
    <div className={`flex items-center gap-2.5 p-3 bg-white border border-border rounded-xl hover:border-border-strong hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-200 group h-full ${sealed ? "opacity-60" : ""}`}>
      <Link href={`/menu/${r.slug}`} className="flex items-center gap-2.5 min-w-0 flex-1">
        {r.logo_url ? (
          <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-[#F5F5F5] ring-1 ring-black/5">
            <Image src={r.logo_url} alt={r.name} width={44} height={44} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-[#1A1A1A] text-white flex items-center justify-center font-bold text-base flex-shrink-0">
            {r.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[13px] font-semibold text-text-primary truncate group-hover:underline decoration-1 underline-offset-2 decoration-text-muted">
              {r.name}
            </h3>
            {sealed ? (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 bg-[#F5F5F5] text-text-muted">
                Sealed
              </span>
            ) : (
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                reallyOpen ? "bg-accent/10 text-accent" : "bg-error/10 text-error"
              }`}>
                {reallyOpen ? "Open" : "Closed"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
            {r.cuisine_type && <span className="truncate">{r.cuisine_type}</span>}
            {r.city && (
              <>
                <span className="text-border-strong">·</span>
                <span className="inline-flex items-center gap-0.5 shrink-0">
                  <MapPin className="w-2.5 h-2.5" />
                  {r.city}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2.5 mt-0.5 text-[10px] text-text-muted">
            {r.delivery_time_min != null && (
              <span className="inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                <Clock className="w-2.5 h-2.5" />
                {r.delivery_time_min} min
              </span>
            )}
            {r.delivery_fee != null && (
              <span className="inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                <Truck className="w-2.5 h-2.5" />
                {r.delivery_fee === 0 ? "Free" : `Rs\xa0${r.delivery_fee}`}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={(e) => { e.preventDefault(); onToggleFav(r.id) }}
          className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${isFav ? "fill-red-500 text-red-500" : "text-text-muted/40 hover:text-red-400"}`} />
        </button>
        <Link
          href={`/menu/${r.slug}`}
          className="inline-flex items-center px-3 py-1.5 rounded-xl bg-primary text-white text-[11px] font-semibold hover:bg-primary-hover active:scale-[0.97] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
        >
          View Menu
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
        .select("id, name, slug, city, cuisine_type, logo_url, delivery_time_min, delivery_fee, is_open, opening_time, closing_time, opening_hours, plan, plan_end_date, trial_end")
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
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-10 pb-24">
        {/* Search + Filter Section */}
        <section className="mb-4 sm:mb-6 space-y-3">
          {/* Search Bar */}
          <div className="w-full">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-text-primary transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurants, cuisines, or locations..."
                className="w-full pl-10 pr-9 h-10 bg-white border border-border rounded-xl focus:ring-1 focus:ring-primary/20 focus:border-primary/30 text-[13px] outline-none transition-all placeholder:text-text-muted"
              />
              {searchQuery && (
                <button
                  onClick={handleSearchClear}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#F5F5F5] flex items-center justify-center hover:bg-border transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-2.5 h-2.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* City Filters — single line, horizontal scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              onClick={() => setSelectedCity("")}
              className={`shrink-0 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                !selectedCity
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white text-text-secondary border border-border hover:border-border-strong"
              }`}
            >
              All Cities
            </button>
            {allCities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`shrink-0 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                  selectedCity === city
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white text-text-secondary border border-border hover:border-border-strong"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </section>

        {/* Results count */}
        {searchQuery.trim() && !loading && (
          <p className="text-[12px] text-text-muted mb-3 font-medium">
            {filteredRestaurants.length} {filteredRestaurants.length === 1 ? "restaurant" : "restaurants"} found
          </p>
        )}

        {/* Restaurant List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-2.5 p-3 bg-white border border-border rounded-xl animate-pulse">
                <div className="w-11 h-11 rounded-xl bg-[#F5F5F5] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[#F5F5F5] rounded w-1/3" />
                  <div className="h-2.5 bg-[#F5F5F5] rounded w-1/2" />
                </div>
                <div className="w-20 h-8 bg-[#F5F5F5] rounded-xl shrink-0" />
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="py-14 sm:py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white border border-border mx-auto mb-4 flex items-center justify-center shadow-sm">
              <Search className="w-6 h-6 text-text-muted/30" />
            </div>
            <h3 className="text-base font-semibold text-text-primary mb-1">
              {searchQuery.trim() ? "No restaurants found" : "No restaurants yet"}
            </h3>
            <p className="text-[13px] text-text-secondary mb-5 max-w-xs mx-auto leading-relaxed">
              {searchQuery.trim()
                ? `No results for "${searchQuery}". Try a different search or city.`
                : "There are no restaurants in this area yet."}
            </p>
            {searchQuery.trim() && (
              <button
                onClick={handleSearchClear}
                className="text-[12px] font-semibold text-text-primary bg-[#F5F5F5] hover:bg-border px-5 py-2 rounded-xl transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
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
