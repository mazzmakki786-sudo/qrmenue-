"use client"

import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"

interface Props {
  restaurantSlug: string
  restaurantName: string
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://qr-menue-one.vercel.app"

export function QRCodeDisplay({ restaurantSlug, restaurantName }: Props) {
  const menuUrl = `${APP_URL}/menu/${restaurantSlug}`

  const downloadQR = () => {
    const svg = document.getElementById("restaurant-qr")
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext("2d")
    const img = new Image()
    img.onload = () => {
      ctx!.drawImage(img, 0, 0)
      const a = document.createElement("a")
      a.download = `${restaurantSlug}-qr-code.png`
      a.href = canvas.toDataURL("image/png")
      a.click()
    }
    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <QRCodeSVG
        id="restaurant-qr"
        value={menuUrl}
        size={200}
        level="H"
        includeMargin
      />
      <p className="text-sm text-[#555]">{restaurantName}</p>
      <Button variant="ghost" size="sm" onClick={downloadQR}>
        Download QR Code (PNG)
      </Button>
    </div>
  )
}
