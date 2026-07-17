"use client"

import Link from "next/link"
import { RefreshCw, Home, AlertTriangle, Mail } from "lucide-react"

export default function RootError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#F0F0F0]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center text-white text-xs font-bold">
              D
            </div>
            <span className="text-sm font-bold text-black">Digital QR Menue</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="text-center max-w-md">
          {/* 500 visual */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-50 mb-4">
              <AlertTriangle className="w-9 h-9 text-red-400" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-3">
            Something went wrong
          </h1>
          <p className="text-sm text-[#666] mb-2 leading-relaxed max-w-xs mx-auto">
            An unexpected error occurred on our end. We&apos;ve been notified and are looking into it.
          </p>
          <p className="text-xs text-[#999] mb-10">
            Your data is safe. Please try again or go back home.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-[#1A1A1A] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-5 py-3 border border-[#E0E0E0] text-[#555] rounded-xl text-sm font-semibold hover:border-black hover:text-black transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 w-full px-5 py-3 border border-[#E0E0E0] text-[#555] rounded-xl text-sm font-semibold hover:border-black hover:text-black transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#F0F0F0] py-6">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-[#BBB]">&copy; 2026 Digital QR Menue. All rights reserved.</p>
          <div className="flex gap-4 text-[10px] text-[#999]">
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
