"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Search, X, MapPin, Clock, ChevronRight, Utensils } from "lucide-react"

interface RestaurantSummary {
  id: string
  name: string
  slug: string
  city: string
  cuisine_type: string | null
  logo_url: string | null
  created_at: string
}

const gradients = [
  "from-[#FF6B6B] to-[#EE5A24]",
  "from-[#6C5CE7] to-[#A29BFE]",
  "from-[#00B894] to-[#00CEC9]",
  "from-[#FDCB6E] to-[#F39C12]",
  "from-[#E17055] to-[#D63031]",
  "from-[#0984E3] to-[#74B9FF]",
  "from-[#00B894] to-[#55EFC4]",
  "from-[#636E72] to-[#2D3436]",
]

function getGradient(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradients[Math.abs(hash) % gradients.length]
}

export function RestaurantsClient() {
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([])
  const [allCities, setAllCities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCities = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("restaurants")
        .select("city")
        .eq("is_active", true)
      const cities = [...new Set((data || []).map((r) => r.city))].sort()
      setAllCities(cities)
    }
    fetchCities()
  }, [])

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from("restaurants")
        .select("id, name, slug, city, cuisine_type, logo_url, created_at")
        .eq("is_active", true)

      if (selectedCity) {
        query = query.eq("city", selectedCity)
      }

      const { data } = await query.order("name")
      setRestaurants(data || [])
      setLoading(false)
    }
    fetchRestaurants()
  }, [selectedCity])

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
    <div className="min-h-screen bg-[#F7F8F8]">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-[#E8E9EA]">
        <div className="px-4 pt-12 pb-3 max-w-app mx-auto">
          {/* Location */}
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-[#e21b70] shrink-0" />
            <span className="text-sm font-semibold text-black truncate">
              {selectedCity || "All Cities"}
            </span>
            <ChevronRight className="w-4 h-4 text-[#999] shrink-0" />
          </div>

          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7175] group-focus-within:text-[#e21b70] transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants or cuisines..."
              className="w-full bg-[#F7F8F8] rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#e21b70]/20 transition-all placeholder:text-[#B7BABC]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-[#6B7175]" />
              </button>
            )}
          </div>
        </div>

        {/* City Filters - Horizontal Scroll */}
        <div className="px-4 pb-3 max-w-app mx-auto">
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            <button
              onClick={() => setSelectedCity("")}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                !selectedCity
                  ? "bg-[#e21b70] text-white"
                  : "bg-white text-[#2E3138] border border-[#D3D5D7]"
              }`}
            >
              All
            </button>
            {allCities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCity === city
                    ? "bg-[#e21b70] text-white"
                    : "bg-white text-[#2E3138] border border-[#D3D5D7]"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="px-4 pt-4 pb-24 max-w-app mx-auto">
        {/* Result Count */}
        {!loading && (
          <p className="text-xs text-[#6B7175] mb-3">
            {filteredCount} {filteredCount === 1 ? "restaurant" : "restaurants"} found
          </p>
        )}

        {/* Restaurant List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden">
                <div className="h-32 bg-[#E8E9EA] animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-[#E8E9EA] rounded animate-pulse w-1/2" />
                  <div className="h-3 bg-[#E8E9EA] rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCount === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F7F8F8] flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8 text-[#B7BABC]" />
            </div>
            <p className="text-sm font-semibold text-[#2E3138] mb-1">No restaurants found</p>
            <p className="text-xs text-[#6B7175]">Try a different search or city</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(filteredGrouped).map(([city, items]) => (
              <section key={city}>
                {/* City Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#2E3138]">{city}</h2>
                    <span className="text-xs text-[#6B7175]">({items.length})</span>
                  </div>
                </div>

                {/* Restaurant Cards */}
                <div className="space-y-3">
                  {items.map((r) => (
                    <Link
                      key={r.id}
                      href={`/menu/${r.slug}`}
                      className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
                    >
                      {/* Cover Image */}
                      <div className="relative h-36 overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(r.name)}`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                        {/* Tags */}
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="bg-[#e21b70] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            POPULAR
                          </span>
                        </div>

                        {/* Logo */}
                        <div className="absolute bottom-3 left-3">
                          {r.logo_url ? (
                            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-md bg-white">
                              <Image src={r.logo_url} alt={r.name} width={56} height={56} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-white border-2 border-white shadow-md flex items-center justify-center">
                              <span className="text-xl font-bold text-[#2E3138]">{r.name[0]}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-[#2E3138] truncate">{r.name}</h3>
                            <p className="text-xs text-[#6B7175] mt-0.5 truncate">
                              {r.cuisine_type || "Restaurant"} &bull; {r.city}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 bg-[#F7F8F8] px-2 py-1 rounded-lg">
                            <Clock className="w-3 h-3 text-[#6B7175]" />
                            <span className="text-[10px] font-semibold text-[#6B7175]">20-30 min</span>
                          </div>
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
