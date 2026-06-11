"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Download, Copy, Check, Printer } from "lucide-react"
import type { Restaurant } from "@/types"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://qr-menue-one.vercel.app"

export default function QRPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [copied, setCopied] = useState(false)
  const [size, setSize] = useState(200)
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

      if (data) setRestaurant(data)
    }
    fetch()
  }, [])

  if (!restaurant) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 bg-[#E8E8E8] rounded animate-pulse" />
        <div className="flex justify-center">
          <div className="w-[200px] h-[200px] bg-[#E8E8E8] rounded-[14px] animate-pulse" />
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
        <head><title>QR Code - ${restaurant.name}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
          ${svg.outerHTML}
          <p style="margin-top:16px;font-size:18px;color:#555;">${restaurant.name}</p>
          <p style="font-size:14px;color:#999;">${menuUrl}</p>
          <script>window.print();<\/script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">QR Code</h1>

      {/* QR Code Display */}
      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-6 flex flex-col items-center gap-4 overflow-hidden">
        <div ref={qrRef} className="max-w-full">
          <QRCodeSVG
            id="restaurant-qr"
            value={menuUrl}
            size={size}
            level="H"
            includeMargin
            className="max-w-full h-auto"
          />
        </div>
        <p className="text-sm font-medium">{restaurant.name}</p>
        <p className="text-xs text-[#555]">Scan to view menu</p>

        {/* Size selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#555]">Size:</span>
          {[150, 200, 250, 300].map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                size === s ? "bg-black text-white" : "bg-[#F8F8F8] text-[#555]"
              }`}
            >
              {s}px
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant URL */}
      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5 space-y-3">
        <h2 className="text-sm font-semibold">Restaurant URL</h2>
        <div className="flex items-center gap-2 p-3 bg-[#F8F8F8] rounded-[10px]">
          <code className="text-sm flex-1 break-all">{menuUrl}</code>
          <button
            onClick={handleCopyUrl}
            className="flex-shrink-0 p-2 hover:bg-[#E8E8E8] rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4 text-[#555]" />}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => downloadQR(`${restaurant.slug}-qr-code.png`)}>
          <Download className="w-4 h-4 mr-2" /> Download PNG
        </Button>
        <Button variant="ghost" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
      </div>
    </div>
  )
}
