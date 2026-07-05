"use client"

import { AlertTriangle } from "lucide-react"

export default function RestaurantsError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 bg-[#F8F8F8]">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-[#333] mb-1">Something went wrong</h2>
        <p className="text-sm text-[#777] mb-6 leading-relaxed">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-[#1A1A1A] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
