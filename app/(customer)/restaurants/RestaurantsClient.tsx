"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Search, X } from "lucide-react"

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
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

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
          (r) => r.name.toLowerCase().includes(q) || (r.cuisine_type || "").toLowerCase().includes(q)
        )
        if (items.length) acc[city] = items
        return acc
      }, {})
    : grouped

  const filteredCount = Object.values(filteredGrouped).reduce((s, arr) => s + arr.length, 0)

  return (
    <div className="min-h-screen bg-white">
      <main className="pt-24 pb-8 px-4 max-w-app mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Restaurants</h1>
          <p className="text-sm text-[#999] mt-1">Order from your favorite spots</p>
        </header>

        {/* Search Bar */}
        <div className="relative mb-4 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999] group-focus-within:text-black transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search restaurants..."
            className="w-full bg-[#F9FAFB] border border-[#F0F0F0] rounded-xl py-3 pl-11 pr-10 text-sm focus:outline-none focus:border-black transition-all placeholder:text-[#999]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#DDD] flex items-center justify-center hover:bg-[#CCC] transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3 h-3 text-[#555]" />
            </button>
          )}
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 -mx-4 px-4">
          <button
            onClick={() => setSelectedCity("")}
            className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              !selectedCity ? "bg-black text-white" : "bg-[#F5F5F5] text-[#666] hover:bg-[#EEEEEE]"
            }`}
          >
            All
          </button>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCity === city ? "bg-black text-white" : "bg-[#F5F5F5] text-[#666] hover:bg-[#EEEEEE]"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-[#F5F5F5] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredCount === 0 ? (
          <div className="py-24 text-center">
            <p className="text-[#999]">{searchQuery ? "No restaurants match your search" : "No restaurants found"}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(filteredGrouped).map(([city, items]) => (
              <section key={city} className="space-y-3">
                <h2 className="text-[12px] font-semibold text-[#999] uppercase tracking-wider">{city}</h2>
                {items.map((r, index) => (
                  <Link
                    key={r.id}
                    href={`/menu/${r.slug}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-[#F0F0F0] hover:border-[#DDD] hover:shadow-sm transition-all active:scale-[0.99] group animate-fadeInUp"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {r.logo_url ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative bg-black">
                        <Image src={r.logo_url} alt={r.name} fill className="object-contain p-1.5" sizes="56px" priority />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-black text-white flex items-center justify-center shrink-0 text-xl font-bold">
                        {r.name[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{r.name}</p>
                      <p className="text-xs text-[#999] mt-0.5">
                        {r.cuisine_type || "Restaurant"}
                      </p>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#DDD] group-hover:bg-[#25D366] transition-colors" />
                  </Link>
                ))}
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
