"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { useFavorites } from "@/lib/hooks/useFavorites"
import Link from "next/link"
import { Clock, Bike } from "lucide-react"

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
    <div className="flex items-center justify-between gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-black/40 transition-colors duration-150 group">
      <Link href={`/restaurant/${r.slug}`} className="flex items-center gap-3 flex-1 min-w-0">
        {/* Logo */}
        {r.logo_url ? (
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-black/5">
            <Image
              src={r.logo_url}
              alt={r.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-100 text-black flex items-center justify-center font-bold text-sm flex-shrink-0">
            {r.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-black truncate group-hover:underline decoration-1 underline-offset-2">
            {r.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {r.city}{r.cuisine_type ? ` • ${r.cuisine_type}` : ""}
          </p>

          {/* Delivery + Status row */}
          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
            {r.delivery_time_min != null && (
              <span className="flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {r.delivery_time_min} min
              </span>
            )}
            {r.delivery_fee != null && (
              <span className="flex items-center gap-0.5">
                <Bike className="w-3 h-3" />
                {r.delivery_fee === 0 ? "Free" : `Rs. ${r.delivery_fee}`}
              </span>
            )}
            {r.is_open !== undefined && (
              <span className={`ml-auto text-[10px] font-medium ${r.is_open ? "text-green-600" : "text-red-500"}`}>
                {r.is_open ? "Open" : "Closed"}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Right side: Favorite star + View Menu */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={(e) => {
            e.preventDefault()
            onToggleFav(r.id)
          }}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <svg
            className={`w-5 h-5 transition-colors ${isFav ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}
            viewBox="0 0 24 24"
            fill={isFav ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>

        <Link
          href={`/restaurant/${r.slug}`}
          className="text-xs font-medium text-black hover:underline decoration-1 underline-offset-2 whitespace-nowrap"
        >
          View Menu
        </Link>
      </div>
    </div>
  )
}

export function RestaurantsClient({ initialRestaurants, initialCities }: RestaurantsClientProps) {
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>(initialRestaurants)
  const allCities = useMemo(() => [...new Set(initialCities)].sort(), [initialCities])
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
        query = query.eq("city", selectedCity)
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
        r.city.toLowerCase().includes(q)
    )
  }, [searchQuery, restaurants])

  const groupedByCity = useMemo(() => {
    const map = new Map<string, RestaurantSummary[]>()
    for (const r of filteredRestaurants) {
      const list = map.get(r.city) || []
      list.push(r)
      map.set(r.city, list)
    }
    return map
  }, [filteredRestaurants])

  const handleSearchClear = useCallback(() => setSearchQuery(""), [])

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Header Section */}
        <section className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-6">
            Browse Restaurants
          </h1>

          {/* Search */}
          <div className="max-w-2xl">
            <div className="relative group">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors"
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
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-1 focus:ring-black/20 text-sm outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={handleSearchClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* City Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCity("")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              !selectedCity
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {allCities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCity === city
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Results count when searching */}
        {searchQuery.trim() && !loading && (
          <p className="text-sm text-gray-500 mb-4">
            {filteredRestaurants.length} {filteredRestaurants.length === 1 ? "restaurant" : "restaurants"} found
          </p>
        )}

        {/* Restaurant List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="w-16 h-4 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-black mb-1">
              {searchQuery.trim() ? "No restaurants found" : "No restaurants yet"}
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
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
          <div className="space-y-6">
            {Array.from(groupedByCity.entries()).map(([city, items]) => (
              <section key={city}>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {city}
                  </h2>
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-[10px] text-gray-400 font-medium">{items.length} {items.length === 1 ? "place" : "places"}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((r) => (
                    <RestaurantCard
                      key={r.id}
                      r={r}
                      isFav={isFavorited(r.id)}
                      onToggleFav={toggleFavorite}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
