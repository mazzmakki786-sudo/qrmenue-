import Link from "next/link"
import { Store, ChevronRight } from "lucide-react"

export function RestaurantUnavailable({ restaurantName }: { restaurantName: string }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm w-full">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#F5F5F5] flex items-center justify-center">
          <Store className="w-7 h-7 text-[#999]" />
        </div>
        <h1 className="text-lg font-bold text-[#333] mb-2">{restaurantName}</h1>
        <p className="text-sm text-[#777] mb-6 leading-relaxed">
          This restaurant is not accepting orders right now. Please try again later.
        </p>
        <Link
          href="/restaurants"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#333] text-white text-sm font-medium rounded-xl hover:bg-black transition-colors"
        >
          <Store className="w-4 h-4" />
          Browse Other Restaurants
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
