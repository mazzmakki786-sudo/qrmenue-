"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { QRCodeSVG } from "qrcode.react"
import { Download, Printer, Copy, Check, ExternalLink, Info } from "lucide-react"
import type { Restaurant } from "@/types"
import { escapeHtml } from "@/lib/utils"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "")

export default function QRPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [copied, setCopied] = useState(false)
  const [size, setSize] = useState(200)
  const [qrLoaded, setQrLoaded] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

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
        setRestaurant(data)
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
    navigator.clipboard.writeText(menuUrl)
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => downloadQR(`${restaurant.slug}-qr-code.png`)}
            className="bg-black text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Download className="w-4 h-4" />
            Download PNG
          </button>
          <button
            onClick={handlePrint}
            className="border border-[#F0F0F0] text-black px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-[#F3F4F5] active:scale-[0.98] transition-all"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: QR Display */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="bg-white p-8 rounded-[14px] border border-[#F0F0F0] w-full max-w-sm flex flex-col items-center transition-transform hover:scale-[1.01] duration-300">
            <div ref={qrRef} className="w-56 h-56 flex items-center justify-center mb-6">
              {!qrLoaded ? (
                <div className="w-full h-full skeleton rounded-lg" />
              ) : (
                <QRCodeSVG
                  id="restaurant-qr"
                  value={menuUrl}
                  size={224}
                  level="H"
                  includeMargin
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

          {/* URL Card */}
          <div className="bg-white p-6 rounded-[14px] border border-[#F0F0F0]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-black mb-5">Restaurant URL</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-[#F9FAFB] p-3 rounded-xl border border-[#F0F0F0] flex items-center justify-between group">
                <code className="text-sm text-[#555] font-mono truncate">{menuUrl}</code>
                <button
                  onClick={handleCopyUrl}
                  className="text-[#555] hover:text-black p-1 transition-colors flex-shrink-0 ml-2"
                >
                  {copied ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#F3F4F5] p-3 rounded-xl border border-[#F0F0F0] text-[#555] hover:text-black transition-all"
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
