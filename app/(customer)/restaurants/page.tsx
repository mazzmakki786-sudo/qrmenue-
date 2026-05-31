"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { MapPin } from "lucide-react"

interface RestaurantSummary {
  id: string
  name: string
  slug: string
  city: string
  cuisine_type: string | null
  logo_url: string | null
}

const cities = ["Lahore", "Karachi", "Islamabad"]

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

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-6">
        <h1 className="text-xl font-bold mb-4">Nearby Restaurants</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setSelectedCity("")}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCity ? "bg-black text-white" : "bg-[#F8F8F8] text-[#555]"
            }`}
          >
            All
          </button>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCity === city ? "bg-black text-white" : "bg-[#F8F8F8] text-[#555]"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-[#999] py-8">Loading...</p>
        ) : restaurants.length === 0 ? (
          <p className="text-center text-[#999] py-8">No restaurants found</p>
        ) : (
          <div className="space-y-3">
            {restaurants.map((r) => (
              <Link
                key={r.id}
                href={`/menu/${r.slug}`}
                className="flex items-center gap-4 p-4 rounded-[12px] border border-[#E8E8E8] hover:border-[#CCC] transition-colors"
              >
                {r.logo_url ? (
                  <img src={r.logo_url} alt={r.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#F8F8F8] flex items-center justify-center">
                    <span className="text-lg font-bold text-[#555]">{r.name[0]}</span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{r.name}</p>
                  <div className="flex items-center gap-1 text-xs text-[#555] mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {r.city}{r.cuisine_type ? ` • ${r.cuisine_type}` : ""}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
