"use client"

import { AlertTriangle } from "lucide-react"

export default function MenuPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[400px] items-center justify-center px-4">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-error" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary">Menu unavailable</h2>
        <p className="text-sm text-text-secondary mt-1 max-w-xs mx-auto">
          {error.message || "Something went wrong while loading this menu."}
        </p>
        <button
          onClick={reset}
          className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all"
        >
          Try again
        </button>
      </div>
    </div>
  )
}