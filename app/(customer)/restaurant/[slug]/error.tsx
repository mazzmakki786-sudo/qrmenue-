"use client"

import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function RestaurantError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 bg-white">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-[#333] mb-1">Something went wrong</h2>
        <p className="text-sm text-[#777] mb-6 leading-relaxed">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="w-full sm:w-auto px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-[#1A1A1A] transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/restaurants"
            className="w-full sm:w-auto px-6 py-2.5 border border-[#E8E8E8] text-sm font-semibold text-[#555] rounded-xl hover:border-black hover:text-black transition-colors"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    </div>
  )
}
