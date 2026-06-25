"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Search, X, UtensilsCrossed, Star, Clock, Bike } from "lucide-react"

interface RestaurantSummary {
  id: string
  name: string
  slug: string
  city: string
  cuisine_type: string | null
  logo_url: string | null
  description?: string | null
  rating?: number
  delivery_time_min?: number
  delivery_fee?: number
  is_open?: boolean
}

interface RestaurantsClientProps {
  initialRestaurants: RestaurantSummary[]
  initialCities: string[]
}

export function RestaurantsClient({ initialRestaurants, initialCities }: RestaurantsClientProps) {
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>(initialRestaurants)
  const [allCities] = useState<string[]>(initialCities)
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)

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
        .select("id, name, slug, city, cuisine_type, logo_url, description, rating, delivery_time_min, delivery_fee, is_open")
        .eq("is_active", true)

      if (selectedCity) {
        query = query.eq("city", selectedCity)
      }

      const { data } = await query.order("name")
      setRestaurants(data || [])
      setLoading(false)
    }
    fetchRestaurants()
  }, [selectedCity]) // eslint-disable-line react-hooks/exhaustive-deps

  const cities = [...new Set(restaurants.map((r) => r.city))].sort()
  const grouped = cities.reduce<Record<string, RestaurantSummary[]>>((acc, city) => {
    const items = restaurants.filter((r) => r.city === city)
    if (items.length) acc[city] = items
    return acc
  }, {})

  const filteredGrouped = searchQuery.trim()
    ? cities.reduce<Record<string, RestaurantSummary[]>>((acc, city) => {
        const q = searchQuery.toLowerCase()
        const items = (grouped[city] || []).filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            (r.cuisine_type || "").toLowerCase().includes(q)
        )
        if (items.length) acc[city] = items
        return acc
      }, {})
    : grouped

  const filteredCount = Object.values(filteredGrouped).reduce((s, arr) => s + arr.length, 0)

  return (
    <div className="bg-white min-h-screen">
      {/* Glass Header */}
      <div
        className="fixed safe-top top-0 left-0 right-0 z-40 bg-white/80"
        style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        <div className="px-4 pt-3 pb-3 max-w-[600px] mx-auto">
          {/* Brand */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[20px] font-semibold text-text-primary tracking-tight">
                QRMenu.pk
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants or cuisines..."
              className="w-full bg-white border border-border rounded-xl py-2.5 pl-10 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
            )}
          </div>
        </div>

        {/* City Filter Chips */}
        <div className="px-4 pb-3 max-w-[600px] mx-auto">
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedCity("")}
                className={`shrink-0 px-5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  !selectedCity
                    ? "bg-primary text-white"
                    : "bg-white border border-border text-text-secondary hover:bg-[#F5F5F5]"
                }`}
              >
                All
              </button>
              {allCities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`shrink-0 px-5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCity === city
                      ? "bg-primary text-white"
                      : "bg-white border border-border text-text-secondary hover:bg-[#F5F5F5]"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
            {/* Gradient fade overlays */}
            <div className="absolute left-0 top-0 bottom-3 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-[140px] pb-[80px] px-4 max-w-[600px] mx-auto">
        {/* Restaurant List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
                <div className="h-28 bg-[#F5F5F5]" />
                <div className="pt-7 px-3 pb-3 space-y-2">
                  <div className="h-4 bg-[#F5F5F5] rounded w-2/3" />
                  <div className="h-3 bg-[#F5F5F5] rounded w-1/2" />
                  <div className="h-3 bg-[#F5F5F5] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCount === 0 ? (
          <div className="py-24 text-center">
            <UtensilsCrossed className="w-10 h-10 text-text-muted mx-auto mb-4" />
            <p className="text-base text-text-secondary">No restaurants found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(filteredGrouped).map(([city, items]) => (
              <section key={city} className="space-y-4">
                {/* City Header */}
                <h2 className="text-black/60 uppercase text-xs font-bold tracking-wider">
                  {city}
                </h2>

                {/* Restaurant Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((r) => (
                    <Link
                      key={r.id}
                      href={`/restaurant/${r.slug}`}
                      className="block bg-white rounded-2xl border border-border hover:border-[#E8E8E8] hover:shadow-[0_4px_20px_rgba(217,74,42,0.08)] transition-all active:scale-[0.99] group overflow-hidden"
                    >
                      {/* Cover image area with gradient */}
                      <div className="relative h-28 bg-gradient-to-br from-primary/5 to-accent/5">
                        {/* Logo overlay at bottom-left */}
                        {r.logo_url ? (
                          <div className="absolute -bottom-5 left-3 w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm z-10">
                            <Image
                              src={r.logo_url}
                              alt={r.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="absolute -bottom-5 left-3 w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm z-10">
                            {r.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Info section */}
                      <div className="pt-7 px-3 pb-3">
                        <h3 className="font-semibold text-[15px] text-text-primary truncate">
                          {r.name}
                        </h3>
                        <p className="text-xs text-text-secondary mt-0.5 truncate">
                          {r.cuisine_type || "Restaurant"} &bull; {r.city}
                        </p>

                        {/* Badges row */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {r.is_open !== undefined && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                r.is_open
                                  ? "bg-accent/10 text-accent"
                                  : "bg-error/10 text-error"
                              }`}
                            >
                              {r.is_open ? "Open" : "Closed"}
                            </span>
                          )}
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-text-secondary">
                          {r.rating != null && (
                            <span className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-current text-yellow-500" />
                              {r.rating.toFixed(1)}
                            </span>
                          )}
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
                        </div>
                      </div>
                    </Link>
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