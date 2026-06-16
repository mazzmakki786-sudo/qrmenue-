"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Search, X, ArrowLeft } from "lucide-react"

interface RestaurantSummary {
  id: string
  name: string
  slug: string
  city: string
  cuisine_type: string | null
  logo_url: string | null
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
        .select("id, name, slug, city, cuisine_type, logo_url")
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
    <div className="min-h-screen bg-white">
      {/* Glass Header */}
      <div
        className="fixed top-0 left-0 right-0 z-40 bg-white/80"
        style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        <div className="px-4 pt-3 pb-3 max-w-[600px] mx-auto">
          {/* Brand */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[20px] font-semibold text-black tracking-tight">
                QRMenu.pk
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants or cuisines..."
              className="w-full bg-[#F9FAFB] border border-[#F0F0F0] rounded-xl py-2.5 pl-10 pr-10 text-[14px] text-black placeholder:text-[#999] focus:outline-none focus:border-black transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-[#999]" />
              </button>
            )}
          </div>
        </div>

        {/* City Filter Chips */}
        <div className="px-4 pb-3 max-w-[600px] mx-auto">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCity("")}
              className={`shrink-0 px-5 py-2 rounded-full text-[12px] font-medium whitespace-nowrap transition-colors ${
                !selectedCity
                  ? "bg-black text-white"
                  : "bg-[#F5F5F5] text-[#666] hover:bg-[#EEE]"
              }`}
            >
              All
            </button>
            {allCities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`shrink-0 px-5 py-2 rounded-full text-[12px] font-medium whitespace-nowrap transition-colors ${
                  selectedCity === city
                    ? "bg-black text-white"
                    : "bg-[#F5F5F5] text-[#666] hover:bg-[#EEE]"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-[140px] pb-8 px-4 max-w-[600px] mx-auto">
        {/* Restaurant List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-[#F0F0F0] rounded-xl">
                <div className="w-14 h-14 rounded-xl bg-[#F5F5F5] animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#F5F5F5] rounded animate-pulse w-1/2" />
                  <div className="h-3 bg-[#F5F5F5] rounded animate-pulse w-1/3" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#F5F5F5] animate-pulse" />
              </div>
            ))}
          </div>
        ) : filteredCount === 0 ? (
          <div className="py-24 text-center">
            <Search className="w-10 h-10 text-[#CCC] mx-auto mb-4" />
            <p className="text-[16px] text-[#999]">No restaurants found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(filteredGrouped).map(([city, items]) => (
              <section key={city} className="space-y-4">
                {/* City Header */}
                <h2 className="text-[12px] font-semibold text-[#999] tracking-wider uppercase">
                  {city}
                </h2>

                {/* Restaurant Cards */}
                <div className="space-y-4">
                  {items.map((r) => (
                    <Link
                      key={r.id}
                      href={`/restaurant/${r.slug}`}
                      className="flex items-center gap-4 p-4 border border-[#F0F0F0] rounded-xl hover:border-[#DDD] hover:shadow-[0px_4px_20px_rgba(0,0,0,0.05)] transition-all active:scale-[0.99] group"
                    >
                      {/* Logo */}
                      {r.logo_url ? (
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-black flex items-center justify-center shrink-0">
                          <Image
                            src={r.logo_url}
                            alt={r.name}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-black text-white flex items-center justify-center font-bold text-[20px] shrink-0">
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[14px] text-black truncate">
                          {r.name}
                        </h3>
                        <p className="text-[12px] text-[#999] truncate">
                          {r.cuisine_type || "Restaurant"}
                        </p>
                      </div>

                      {/* Dot Indicator */}
                      <div className="w-1.5 h-1.5 rounded-full bg-[#DDD] group-hover:bg-black transition-colors shrink-0" />
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
