"use client"

import { useEffect, useState, useRef } from "react"
import { WifiOff, Clock } from "lucide-react"

type PageState = "loading" | "ready" | "error" | "offline" | "slow"

interface PageLoaderProps {
  state: PageState
  error?: string | null
  slowThreshold?: number // ms before showing "slow internet" message
  onRetry?: () => void
  skeleton?: React.ReactNode
  children?: React.ReactNode
}

export function PageLoader({
  state,
  error,
  slowThreshold = 8000,
  onRetry,
  skeleton,
  children,
}: PageLoaderProps) {
  const [showSlowMsg, setShowSlowMsg] = useState(false)
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Slow internet detection timer
  useEffect(() => {
    if (state === "loading") {
      slowTimerRef.current = setTimeout(() => {
        setShowSlowMsg(true)
      }, slowThreshold)
    } else {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current)
      setShowSlowMsg(false)
    }
    return () => {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current)
    }
  }, [state, slowThreshold])

  // Offline detection
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  )

  useEffect(() => {
    const handleOffline = () => setIsOffline(true)
    const handleOnline = () => setIsOffline(false)
    window.addEventListener("offline", handleOffline)
    window.addEventListener("online", handleOnline)
    return () => {
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  // If browser is offline, show offline message (highest priority)
  if (isOffline) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <WifiOff className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-text-primary mb-1">No Internet Connection</h2>
        <p className="text-sm text-text-secondary mb-6 max-w-xs">
          Your internet connection appears to be offline. Please check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all active:scale-[0.97]"
        >
          Retry
        </button>
      </div>
    )
  }

  // Show skeleton while loading (with optional slow internet message overlaid)
  if (state === "loading") {
    return (
      <div className="relative">
        {showSlowMsg && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 max-w-sm w-[calc(100%-32px)]">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-800">Loading is taking longer than usual</p>
              <p className="text-[10px] text-amber-600">Your internet connection may be slow</p>
            </div>
          </div>
        )}
        {skeleton || (
          <div className="space-y-4 animate-pulse p-4">
            <div className="h-7 w-32 bg-[#F0F0F0] rounded-lg" />
            <div className="h-20 bg-[#F0F0F0] rounded-2xl" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-[#F0F0F0] rounded-2xl" />
              ))}
            </div>
            <div className="h-48 bg-[#F0F0F0] rounded-2xl" />
          </div>
        )}
      </div>
    )
  }

  // Show error state
  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-text-primary mb-1">Something went wrong</h2>
        <p className="text-sm text-text-secondary mb-6 max-w-xs">{error || "Failed to load data."}</p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all active:scale-[0.97]"
          >
            Retry
          </button>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2.5 border border-border text-text-secondary text-sm font-semibold rounded-xl hover:bg-[#FAFAFA] transition-all active:scale-[0.97]"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    )
  }

  // "slow" state — slow internet detected but data partially available
  if (state === "slow") {
    return (
      <div className="relative">
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 max-w-sm w-[calc(100%-32px)]">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-800">Connection seems slow</p>
            <p className="text-[10px] text-amber-600">Some data may take longer to load</p>
          </div>
        </div>
        {children}
      </div>
    )
  }

  // "ready" — normal render
  return <>{children}</>
}
