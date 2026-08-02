"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { COMPANY_INFO } from "@/lib/company-info"
import { LogoIconWhite } from "./LogoIcon"

const socialPlatforms = [
  { key: "social_facebook", label: "Facebook", hoverColor: "hover:bg-[#1877F2]", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { key: "social_instagram", label: "Instagram", hoverColor: "hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF]", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
  { key: "social_linkedin", label: "LinkedIn", hoverColor: "hover:bg-[#0A66C2]", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  { key: "social_tiktok", label: "TikTok", hoverColor: "hover:bg-black", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
  { key: "social_youtube", label: "YouTube", hoverColor: "hover:bg-[#FF0000]", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  { key: "social_twitter", label: "Twitter / X", hoverColor: "hover:bg-black", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
]

export function AppFooter() {
  const [settings, setSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchSettings = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("company_settings").select("*")
      if (data) {
        const s: Record<string, string> = {}
        data.forEach((row: any) => { s[row.key] = row.value })
        setSettings(s)
      }
    }
    fetchSettings()
  }, [])

  const activeSocials = socialPlatforms.filter((p) => settings[p.key])

  return (
    <footer className="bg-[#0A0A0A] text-[#999]">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        {/* 2 cols on mobile, 5 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 md:gap-8">
          {/* Column 1: Brand — full width on mobile */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <LogoIconWhite className="w-7 h-7" />
              <span className="font-bold text-sm text-white">Digital QR Menue</span>
            </div>
            <p className="text-xs leading-relaxed text-[#777] mb-4 max-w-[220px]">
              Free digital QR menus for Pakistani restaurants. No printing, direct WhatsApp orders.
            </p>
            {/* Social icons from DB */}
            {activeSocials.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                {activeSocials.map((p) => (
                  <a
                    key={p.key}
                    href={settings[p.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={p.label}
                    className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:text-white transition-all ${p.hoverColor}`}
                  >
                    {p.icon}
                  </a>
                ))}
              </div>
            )}
            <p className="text-[11px] text-[#666]">
              Made in Pakistan 💚
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-white/60 mb-3">Links</h4>
            <ul className="space-y-1.5">
              {[
                { href: "/restaurants", label: "Browse Restaurants" },
                { href: "/pricing", label: "Pricing" },
                { href: "/about", label: "About" },
                { href: "/blog", label: "Blog" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-[#777] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="col-span-1">
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-white/60 mb-3">Resources</h4>
            <ul className="space-y-1.5">
              {[
                { href: "/digital-menu-for-restaurants", label: "Digital Menu for Restaurants" },
                { href: "/digital-menu-pdf", label: "PDF Menu to QR" },
                { href: "/digital-menu-app", label: "Digital Menu App" },
                { href: "/digital-menu-tablet", label: "Tablet Menu" },
                { href: "/digital-menu-design", label: "Digital Menu Design" },
                { href: "/qr-menu-login", label: "QR Menu Login" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-[#777] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Pakistan */}
          <div className="col-span-1">
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-white/60 mb-3">Pakistan</h4>
            <ul className="space-y-1.5">
              {[
                { href: "/digital-menu-pakistan", label: "Digital Menu Pakistan" },
                { href: "/qr-menu-pakistan", label: "QR Menu Pakistan" },
                { href: "/digital-menu-islamabad", label: "Digital Menu Islamabad" },
                { href: "/digital-menu-lahore", label: "Digital Menu Lahore" },
                { href: "/digital-menu-karachi", label: "Digital Menu Karachi" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-[#777] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact & Legal */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-white/60 mb-3">Contact</h4>
            <ul className="space-y-1.5 mb-4">
              {COMPANY_INFO.support.whatsapp && (
                <li>
                  <a
                    href={`https://wa.me/${COMPANY_INFO.support.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener"
                    className="text-xs text-[#777] hover:text-white transition-colors flex items-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    {COMPANY_INFO.support.whatsapp}
                  </a>
                </li>
              )}
              {COMPANY_INFO.support.email && (
                <li>
                  <a
                    href={`mailto:${COMPANY_INFO.support.email}`}
                    className="text-xs text-[#777] hover:text-white transition-colors flex items-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {COMPANY_INFO.support.email}
                  </a>
                </li>
              )}
              {COMPANY_INFO.address && (
                <li className="text-xs text-[#777] flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 0111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {COMPANY_INFO.address}
                </li>
              )}
            </ul>

            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-white/60 mb-3">Legal</h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/privacy" className="text-xs text-[#777] hover:text-white transition-colors underline underline-offset-2">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-xs text-[#777] hover:text-white transition-colors underline underline-offset-2">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#1A1A1A] my-6 md:my-8" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[#555] text-center md:text-left">
            &copy; 2026 {COMPANY_INFO.name}. All rights reserved.
          </p>
          <p className="text-[11px] text-[#555] text-center">
            {COMPANY_INFO.ownershipStatement}
          </p>
        </div>
      </div>
    </footer>
  )
}
