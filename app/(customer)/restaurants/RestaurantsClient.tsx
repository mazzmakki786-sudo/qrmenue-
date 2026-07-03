"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { useFavorites } from "@/lib/hooks/useFavorites"
import Link from "next/link"
import { Clock, Truck, Heart } from "lucide-react"

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
  return (
    <div className="flex items-center justify-between gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-black/30 transition-all duration-200 group">
      <Link href={`/menu/${r.slug}`} className="flex items-center gap-3 min-w-0 flex-1">
        {/* Logo */}
        {r.logo_url ? (
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-black/5 lg:w-16 lg:h-16">
            <Image src={r.logo_url} alt={r.name} width={64} height={64} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 text-black flex items-center justify-center font-bold text-sm flex-shrink-0 ring-1 ring-black/5 lg:w-16 lg:h-16 lg:text-lg">
            {r.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-black truncate group-hover:underline decoration-1 underline-offset-2 decoration-black/30 lg:text-base">
            {r.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {r.cuisine_type || ""}
          </p>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-400">
            {r.delivery_time_min != null && (
              <span className="inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                <Clock className="w-3 h-3" />
                {r.delivery_time_min}min
              </span>
            )}
            {r.delivery_fee != null && (
              <span className="inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                <Truck className="w-3 h-3" />
                {r.delivery_fee === 0 ? "Free" : `Rs\xa0${r.delivery_fee}`}
              </span>
            )}
            {r.is_open !== undefined && (
              <span className={`ml-auto text-[10px] font-medium shrink-0 ${r.is_open ? "text-green-600" : "text-red-500"}`}>
                {r.is_open ? "Open" : "Closed"}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Right side: Favorite heart + View Menu button */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={(e) => { e.preventDefault(); onToggleFav(r.id) }}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`w-4 h-4 transition-colors ${isFav ? "fill-red-500 text-red-500" : "text-gray-300 hover:text-red-400"}`} />
        </button>
        <Link
          href={`/menu/${r.slug}`}
          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-black text-white text-[11px] font-semibold hover:bg-gray-800 active:scale-[0.97] transition-all shadow-sm lg:px-4 lg:py-2 lg:text-xs"
        >
          Menu
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
        .select("id, name, slug, city, cuisine_type, logo_url, delivery_time_min, delivery_fee, is_open")
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
                ? { ...r, is_open: updated.is_open }
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
    <div className="min-h-screen bg-[#f9f9f9]">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24">
        {/* Search Section */}
        <section className="mb-6 sm:mb-8">
          <div className="max-w-xl">
            <div className="relative group">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-black transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for names, cuisines, or locations..."
                className="w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-black/20 focus:border-black/30 text-sm outline-none transition-all placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={handleSearchClear}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* City Filters */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8">
          <button
            onClick={() => setSelectedCity("")}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              !selectedCity
                ? "bg-black text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          {allCities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCity === city
                  ? "bg-black text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Results count when searching */}
        {searchQuery.trim() && !loading && (
          <p className="text-sm text-gray-500 mb-4 sm:mb-5">
            {filteredRestaurants.length} {filteredRestaurants.length === 1 ? "restaurant" : "restaurants"} found
          </p>
        )}

        {/* Restaurant List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="w-16 h-4 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="py-12 sm:py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white mx-auto mb-4 flex items-center justify-center shadow-sm border border-gray-100">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-black mb-1">
              {searchQuery.trim() ? "No restaurants found" : "No restaurants yet"}
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
              {searchQuery.trim()
                ? `No results for "${searchQuery}". Try a different search.`
                : "There are no restaurants in this area yet."}
            </p>
            {searchQuery.trim() && (
              <button
                onClick={handleSearchClear}
                className="text-sm font-semibold text-black bg-gray-100 hover:bg-gray-200 px-5 py-2 rounded-xl transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
