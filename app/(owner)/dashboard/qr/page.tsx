"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { QRCodeSVG } from "qrcode.react"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { QR_GRADIENT_PRESETS, type QRGradientPreset } from "@/lib/branding"
import { Download, Printer, Copy, Check, ExternalLink, Info, Share2, Palette } from "lucide-react"
import type { Restaurant } from "@/types"
import { escapeHtml } from "@/lib/utils"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "")

const GRADIENT_KEYS = Object.keys(QR_GRADIENT_PRESETS) as QRGradientPreset[]

export default function QRPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [copied, setCopied] = useState(false)
  const [size, setSize] = useState(200)
  const [qrLoaded, setQrLoaded] = useState(false)
  const [selectedGradient, setSelectedGradient] = useState<QRGradientPreset>("classic")
  const qrRef = useRef<HTMLDivElement>(null)
  const { planLimits } = useSubscription()

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_id", user.id)
        .single()

      if (data) {
        setRestaurant(data as Restaurant)
        setTimeout(() => setQrLoaded(true), 400)
      }
    }
    fetch()
  }, [])

  if (!restaurant) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48 rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <div className="bg-white p-10 rounded-[14px] border border-[#F0F0F0]">
              <div className="w-64 h-64 skeleton rounded-lg mx-auto" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const hasCustomBranding = planLimits.customBranding
  const gradient = QR_GRADIENT_PRESETS[selectedGradient]
  const showGradientOptions = hasCustomBranding && GRADIENT_KEYS.length > 0

  const menuUrl = `${APP_URL}/menu/${restaurant.slug}`

  const downloadQR = (filename: string) => {
    const svg = document.getElementById("restaurant-qr")
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    canvas.width = size * 2
    canvas.height = size * 2
    const ctx = canvas.getContext("2d")
    const img = new Image()
    img.onload = () => {
      ctx!.drawImage(img, 0, 0)
      const a = document.createElement("a")
      a.download = filename
      a.href = canvas.toDataURL("image/png")
      a.click()
    }
    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  const handleCopyUrl = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(menuUrl).catch(() => {})
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return
    const svg = document.getElementById("restaurant-qr")
    if (!svg) return
    printWindow.document.write(`
      <html>
        <head><title>QR Code - ${escapeHtml(restaurant.name)}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
          ${svg.outerHTML}
          <p style="margin-top:16px;font-size:18px;color:#555;">${escapeHtml(restaurant.name)}</p>
          <p style="font-size:14px;color:#999;">${menuUrl}</p>
          <script>window.print();<\/script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div>
      {/* Header with actions */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">QR Code</h1>
          <p className="text-sm text-[#555] mt-1">Manage and download your digital menu access</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => downloadQR(`${restaurant.slug}-qr-code.png`)}
            className="bg-black text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
            aria-label="Download QR code as PNG"
          >
            <Download className="w-4 h-4" />
            Download PNG
          </button>
          <button
            onClick={handlePrint}
            className="border border-[#F0F0F0] text-black px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-[#F3F4F5] active:scale-[0.98] transition-all"
            aria-label="Print QR code"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: restaurant.name, url: menuUrl }).catch(() => {})
              }
            }}
            className="border border-[#F0F0F0] text-black px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-[#F3F4F5] active:scale-[0.98] transition-all"
            aria-label="Share menu link"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: QR Display */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="bg-white p-8 rounded-[14px] border border-[#F0F0F0] w-full max-w-sm flex flex-col items-center transition-transform hover:scale-[1.01] duration-300">
            <div ref={qrRef} className="flex items-center justify-center mb-6" style={{ width: size, height: size }}>
              {!qrLoaded ? (
                <div className="w-full h-full skeleton rounded-lg" />
              ) : (
                <QRCodeSVG
                  id="restaurant-qr"
                  value={menuUrl}
                  size={size}
                  level="H"
                  includeMargin
                  fgColor={gradient.fgColor}
                  bgColor={gradient.bgColor}
                  className="w-full h-full"
                />
              )}
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-black mb-1">{restaurant.name}</h2>
              <p className="text-sm text-[#555]">Scan to view menu</p>
            </div>
          </div>
        </div>

        {/* Right: Settings */}
        <div className="lg:col-span-7 space-y-6">
          {/* Size Selector */}
          <div className="bg-white p-6 rounded-[14px] border border-[#F0F0F0]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-black mb-5">QR Code Size</h3>
            <div className="flex flex-wrap gap-3">
              {[150, 200, 250, 300].map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                    size === s
                      ? "bg-black text-white shadow-sm"
                      : "border border-[#F0F0F0] text-black hover:bg-[#F3F4F5]"
                  }`}
                >
                  {s}px
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-[#555]">Select the resolution for your download. Higher resolution is recommended for large prints.</p>
          </div>

          {/* QR Color Style (Growth/Premium only) */}
          {showGradientOptions && (
            <div className="bg-white p-6 rounded-[14px] border border-[#F0F0F0]">
              <div className="flex items-center gap-2 mb-5">
                <Palette className="w-4 h-4" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-black">QR Color Style</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {GRADIENT_KEYS.map((key) => {
                  const preset = QR_GRADIENT_PRESETS[key]
                  const isSelected = selectedGradient === key
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedGradient(key)}
                      className={`rounded-xl border-2 p-3 text-left transition-all ${
                        isSelected ? "border-black bg-[#F8F8F8]" : "border-[#F0F0F0] hover:border-[#999]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="w-8 h-8 rounded-lg"
                          style={{ background: preset.fgColor }}
                        />
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-black">{preset.label}</p>
                      <p className="text-[11px] text-[#999] font-mono mt-0.5">{preset.fgColor}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* URL Card */}
          <div className="bg-white p-6 rounded-[14px] border border-[#F0F0F0]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-black mb-5">Restaurant URL</h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 min-w-0 bg-[#F9FAFB] p-3 rounded-xl border border-[#F0F0F0] flex items-center justify-between gap-2">
                <code className="text-sm text-[#555] font-mono truncate">{menuUrl}</code>
                <button
                  onClick={handleCopyUrl}
                  className="text-[#555] hover:text-black p-1 transition-colors shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#F3F4F5] p-3 rounded-xl border border-[#F0F0F0] text-[#555] hover:text-black transition-all flex items-center justify-center sm:flex-shrink-0"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Info Alert */}
          <div className="p-5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 flex gap-3">
            <Info className="w-5 h-5 text-[#25D366] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-black">Dynamic QR Code</p>
              <p className="text-sm text-[#555] mt-1 leading-relaxed">
                This QR code is dynamic. You can change your menu or restaurant details anytime without needing to reprint the QR code.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
