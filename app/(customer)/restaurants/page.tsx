"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface RestaurantSummary {
  id: string
  name: string
  slug: string
  city: string
  cuisine_type: string | null
  logo_url: string | null
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([])
  const [selectedCity, setSelectedCity] = useState<string>("")
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

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Restaurants</h1>
        <p className="text-sm text-[#999] mt-1">Order from your favorite spots</p>
      </div>

      <div className="px-4 pb-2 overflow-x-auto flex gap-2 scrollbar-none">
        <button
          onClick={() => setSelectedCity("")}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            !selectedCity ? "bg-black text-white shadow-sm" : "bg-[#F5F5F5] text-[#666] hover:bg-[#EEE]"
          }`}
        >
          All
        </button>
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCity === city ? "bg-black text-white shadow-sm" : "bg-[#F5F5F5] text-[#666] hover:bg-[#EEE]"
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="px-4 mt-2 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-[#F5F5F5] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="px-4 mt-8 text-center">
          <p className="text-[#999]">No restaurants found</p>
        </div>
      ) : (
        <div className="px-4 mt-2 space-y-6">
          {Object.entries(grouped).map(([city, items]) => (
            <section key={city}>
              <h2 className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">{city}</h2>
              <div className="space-y-3">
                {items.map((r) => (
                  <Link
                    key={r.id}
                    href={`/menu/${r.slug}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-[#F0F0F0] hover:border-[#DDD] hover:shadow-sm transition-all active:scale-[0.99]"
                  >
                    {r.logo_url ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative bg-[#F8F8F8]">
                        <Image src={r.logo_url} alt={r.name} fill className="object-cover" sizes="56px" />
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
                    <div className="w-1.5 h-1.5 rounded-full bg-[#DDD]" />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
