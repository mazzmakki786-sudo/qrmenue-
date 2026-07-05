"use client"

import Link from "next/link"
import { useState } from "react"

export function LandingHeader() {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 h-14">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden w-9 h-9 rounded-lg bg-[#F5F5F5] flex items-center justify-center hover:bg-[#EBEBEB] transition-colors"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/" className="flex items-center gap-2 font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center text-xs">D</div>
              <span>Digital QR Menue</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/restaurants" className="text-sm font-medium text-[#555] px-3 py-1.5 rounded-lg hover:bg-[#F5F5F5] hover:text-black transition-colors">Restaurants</Link>
            <Link href="/pricing" className="text-sm font-medium text-[#555] px-3 py-1.5 rounded-lg hover:bg-[#F5F5F5] hover:text-black transition-colors">Pricing</Link>
            <Link href="/faq" className="text-sm font-medium text-[#555] px-3 py-1.5 rounded-lg hover:bg-[#F5F5F5] hover:text-black transition-colors">FAQ</Link>
            <Link href="/contact" className="text-sm font-medium text-[#555] px-3 py-1.5 rounded-lg hover:bg-[#F5F5F5] hover:text-black transition-colors">Contact</Link>
            <div className="w-px h-5 bg-[#E0E0E0] mx-2" />
            <Link href="/login" className="text-sm font-medium px-4 py-1.5 rounded-lg border border-[#E0E0E0] text-[#555] hover:border-[#999] hover:text-black transition-colors">Sign In</Link>
            <Link href="/signup" className="text-sm font-medium px-4 py-1.5 rounded-lg bg-black text-white hover:bg-[#1A1A1A] transition-colors">Get Started</Link>
          </nav>
          <div className="flex md:hidden items-center gap-2">
            <Link href="/login" className="text-xs font-medium text-[#555] px-2.5 py-1.5 rounded-lg border border-[#E0E0E0]">Sign In</Link>
            <Link href="/signup" className="text-xs font-medium px-3 py-1.5 rounded-lg bg-black text-white">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={close}
      />

      {/* Drawer — right slide */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 md:hidden flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-[#E8E8E8]">
          <span className="font-bold text-sm">Menu</span>
          <button
            className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center hover:bg-[#EBEBEB] transition-colors"
            aria-label="Close menu"
            onClick={close}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 py-4 px-4 space-y-0.5 overflow-y-auto">
          {[
            { href: "/restaurants", label: "Restaurants", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
            { href: "/pricing", label: "Pricing & Plans", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            { href: "/faq", label: "FAQ", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
            { href: "/contact", label: "Contact", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
          ].map(({ href, label, icon }) => (
            <Link key={href} href={href} onClick={close}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#555] hover:bg-[#F5F5F5] hover:text-black transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
              {label}
            </Link>
          ))}

          <div className="h-px bg-[#E8E8E8] my-3" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#AAA] mb-2 px-3">Account</p>
          <Link href="/login" onClick={close}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#555] hover:bg-[#F5F5F5] hover:text-black transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In
          </Link>
          <Link href="/signup" onClick={close}
            className="flex items-center justify-center gap-2 mx-3 mt-2 px-3 py-2.5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-[#1A1A1A] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Get Started
          </Link>

          <div className="h-px bg-[#E8E8E8] my-3" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#AAA] mb-2 px-3">Legal</p>
          <Link href="/privacy" onClick={close}
            className="block px-3 py-2 rounded-lg text-xs text-[#999] hover:bg-[#F5F5F5] hover:text-[#555] transition-colors"
          >
            Privacy Policy
          </Link>
          <Link href="/terms" onClick={close}
            className="block px-3 py-2 rounded-lg text-xs text-[#999] hover:bg-[#F5F5F5] hover:text-[#555] transition-colors"
          >
            Terms of Service
          </Link>
        </nav>

        <div className="px-5 py-4 border-t border-[#E8E8E8]">
          <p className="text-[10px] text-[#BBB]">&copy; 2026 QRMenu.pk. All rights reserved.</p>
        </div>
      </aside>
    </>
  )
}
