"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useFavorites } from "@/lib/hooks/useFavorites"
import { Clock, Bike, Heart, ArrowLeft } from "lucide-react"

interface RestaurantSummary {
  id: string
  name: string
  slug: string
  city: string
  cuisine_type: string | null
  logo_url: string | null
  delivery_time_min: number | null
  delivery_fee: number | null
  is_open: boolean | null
}

export function FavoritesClient() {
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const { isFavorited, toggleFavorite } = useFavorites()
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login?redirect=/favorites")
        return
      }

      setAuthChecked(true)

      // Fetch favorites with restaurant data
      const { data: favorites } = await supabase
        .from("favorites")
        .select("restaurant_id")
        .eq("user_id", user.id)

      if (!favorites || favorites.length === 0) {
        setLoading(false)
        return
      }

      const ids = favorites.map((f) => f.restaurant_id)

      const { data: restaurantsData } = await supabase
        .from("restaurants")
        .select("id, name, slug, city, cuisine_type, logo_url, delivery_time_min, delivery_fee, is_open")
        .in("id", ids)
        .eq("is_active", true)
        .eq("is_suspended", false)
        .order("name")

      setRestaurants(restaurantsData ?? [])
      setLoading(false)
    }

    checkAuthAndFetch()
  }, [router])

  // Listen for unfavorites to update the list in real-time
  useEffect(() => {
    // We'll re-fetch when favoriteIds change (via the useFavorites hook)
    // The toggleFavorite already handles optimistic updates
  }, [])

  const handleRemoveFavorite = async (restaurantId: string) => {
    await toggleFavorite(restaurantId)
    // Remove from local list immediately
    setRestaurants((prev) => prev.filter((r) => r.id !== restaurantId))
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Link
            href="/restaurants"
            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0"
            aria-label="Back to restaurants"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
              My Favorites
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {restaurants.length} {restaurants.length === 1 ? "restaurant" : "restaurants"} saved
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-white border border-gray-100 rounded-xl animate-pulse">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="py-12 sm:py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white mx-auto mb-4 flex items-center justify-center shadow-sm border border-gray-100">
              <Heart className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-1">No favorites yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
              Save your favorite restaurants by tapping the star icon on any restaurant card.
            </p>
            <Link
              href="/restaurants"
              className="inline-block text-sm font-semibold text-white bg-black hover:bg-gray-800 px-5 py-2.5 rounded-xl transition-colors"
            >
              Browse restaurants
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {restaurants.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 p-4 sm:p-5 bg-white border border-gray-200 rounded-xl hover:border-black/30 hover:shadow-sm transition-all duration-200 group"
              >
                <Link href={`/restaurant/${r.slug}`} className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  {r.logo_url ? (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-black/5">
                      <Image
                        src={r.logo_url}
                        alt={r.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 text-black flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 ring-1 ring-black/5">
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] sm:text-base font-semibold text-black truncate group-hover:underline decoration-1 underline-offset-2 decoration-black/30">
                      {r.name}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-gray-500 mt-0.5 truncate">
                      {r.city}{r.cuisine_type ? ` • ${r.cuisine_type}` : ""}
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3 mt-1.5 text-[11px] sm:text-xs text-gray-400">
                      {r.delivery_time_min != null && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {r.delivery_time_min} min
                        </span>
                      )}
                      {r.delivery_fee != null && (
                        <span className="flex items-center gap-1">
                          <Bike className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {r.delivery_fee === 0 ? "Free" : `Rs. ${r.delivery_fee}`}
                        </span>
                      )}
                      {r.is_open !== undefined && (
                        <span className={`ml-auto text-[10px] sm:text-[11px] font-medium ${r.is_open ? "text-green-600" : "text-red-500"}`}>
                          {r.is_open ? "Open" : "Closed"}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                <button
                  onClick={(e) => {
                    e.preventDefault()
                    handleRemoveFavorite(r.id)
                  }}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors flex-shrink-0"
                  aria-label="Remove from favorites"
                >
                  <Heart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isFavorited(r.id) ? "fill-red-500 text-red-500" : "text-gray-300"}`} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
