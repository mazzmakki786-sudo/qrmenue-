"use client"

import { useRef, useEffect, useState } from "react"
import { Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface OrderItem {
  name_en: string
  quantity: number
  subtotal: number
}

interface OrderData {
  id: string
  order_number: string
  created_at: string
  items: OrderItem[]
  total_price: number
  payment_method: string
  order_type: string
  table_number?: string | null
  customer_name: string
  order_status: string
  delivery_fee?: number
  discount_amount?: number
  deals?: { title_en?: string } | null
}

interface RestaurantData {
  name: string
  city?: string | null
  logo_url?: string | null
}

interface Props {
  order: OrderData
  restaurant: RestaurantData
}

export function OrderReceipt({ order, restaurant }: Props) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  // Capture order status + created_at as a SNAPSHOT on mount,
  // so the receipt never changes after being rendered.
  const [snapshot] = useState({
    status: order.order_status,
    createdAt: order.created_at,
    orderNumber: order.order_number,
  })

  const handlePrint = () => {
    if (!receiptRef.current) return
    const clone = receiptRef.current.cloneNode(true) as HTMLElement

    // Build a self-contained HTML for print
    const styles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules || []).map((r) => r.cssText).join("")
        } catch {
          return ""
        }
      })
      .join("")

    const html = `
      <html>
        <head>
          <title>Receipt - ${snapshot.orderNumber}</title>
          <style>
            body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; width: 300px; }
            * { box-sizing: border-box; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .text-sm { font-size: 12px; }
            .text-xs { font-size: 10px; }
            .mt-2 { margin-top: 8px; }
            .mt-4 { margin-top: 16px; }
            .mb-1 { margin-bottom: 4px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .border-t { border-top: 1px dashed #000; }
            .border-b { border-bottom: 1px dashed #000; }
            .py-1 { padding-top: 4px; padding-bottom: 4px; }
            .py-2 { padding-top: 8px; padding-bottom: 8px; }
            .px-2 { padding-left: 8px; padding-right: 8px; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .w-full { width: 100%; }
            img { max-width: 80px; max-height: 80px; border-radius: 50%; margin: 0 auto 8px; display: block; }
            .receipt { width: 300px; margin: 0 auto; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="receipt"></div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          <\/script>
        </body>
      </html>
    `

    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.document.querySelector(".receipt")?.appendChild(clone)
  }

  const handleDownload = async () => {
    const el = receiptRef.current
    if (!el || downloading) return
    setDownloading(true)

    try {
      // Wait for fonts to be fully loaded so the receipt renders at its true dimensions
      await document.fonts.ready

      // Use scroll dimensions so the full content is captured,
      // even if part of the receipt is outside the viewport.
      const fullWidth = el.scrollWidth
      const fullHeight = el.scrollHeight

      // Try html-to-image first with explicit dimensions + overflow visible
      // to prevent clipping when the clone is rendered off-screen.
      const { toPng } = await import("html-to-image")
      const dataUrl = await toPng(el, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
        width: fullWidth,
        height: fullHeight,
        style: {
          overflow: "visible",
          maxWidth: "none",
        },
      })
      const a = document.createElement("a")
      a.download = `receipt-${snapshot.orderNumber}.png`
      a.href = dataUrl
      a.click()
    } catch (err) {
      console.error("[Receipt] html-to-image failed:", err)
      // Fallback to html2canvas with explicit dimensions
      try {
        const html2canvas = (await import("html2canvas")).default
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          width: el.scrollWidth,
          height: el.scrollHeight,
        })
        const dataUrl = canvas.toDataURL("image/png")
        const a = document.createElement("a")
        a.download = `receipt-${snapshot.orderNumber}.png`
        a.href = dataUrl
        a.click()
      } catch (err2) {
        console.error("[Receipt] html2canvas also failed:", err2)
        // Last resort: print fallback
        handlePrint()
      }
    } finally {
      setDownloading(false)
    }
  }

  const statusLabel =
    snapshot.status === "received" ? "Received"
      : snapshot.status === "preparing" ? "Preparing"
        : snapshot.status === "ready" ? "Ready"
          : snapshot.status === "completed" ? "Completed"
            : snapshot.status === "cancelled" ? "Cancelled"
              : snapshot.status

  return (
    <div>
      <div
        ref={receiptRef}
        className="bg-white p-6 rounded-[14px] border border-[#E8E8E8] w-full max-w-sm mx-auto font-mono text-sm"
      >
        {/* Restaurant Info */}
        <div className="text-center mb-4">
          {restaurant?.logo_url && (
            <Image
              src={restaurant.logo_url}
              alt={restaurant.name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
            />
          )}
          <h2 className="text-base font-bold">{restaurant?.name || "Restaurant"}</h2>
          {restaurant?.city && <p className="text-xs text-[#555]">{restaurant.city}</p>}
        </div>

        <div className="border-t border-dashed border-[#CCC] pt-3 mb-3 text-center">
          <p className="font-bold text-sm">ORDER RECEIPT</p>
          <p className="text-xs text-[#555]">{snapshot.orderNumber}</p>
          <p className="text-xs text-[#555]">{new Date(snapshot.createdAt).toLocaleString("en-PK")}</p>
        </div>

        {/* Items */}
        <div className="border-t border-dashed border-[#CCC] pt-2 mb-2">
          <div className="flex justify-between text-xs text-[#555] mb-1 px-1">
            <span>Item</span>
            <span>Qty</span>
            <span>Price</span>
          </div>
          {(order.items || []).map((item: any, i: number) => (
            <div key={i} className="flex justify-between py-1 px-1 text-sm">
              <span className="flex-1">{item.name_en}</span>
              <span className="w-8 text-center">{item.quantity}</span>
              <span className="w-16 text-right">Rs {item.subtotal}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-dashed border-[#CCC] pt-2 mb-2 space-y-1">
          {(order.delivery_fee ?? 0) > 0 && (
            <div className="flex justify-between px-1 text-sm">
              <span>Delivery Fee</span>
              <span>Rs {order.delivery_fee}</span>
            </div>
          )}
          {(order.discount_amount ?? 0) > 0 && (
            <div className="flex justify-between px-1 text-sm">
              <span>{order.deals?.title_en || "Discount"}</span>
              <span className="text-[#25D366]">-Rs {order.discount_amount}</span>
            </div>
          )}
          <div className="flex justify-between px-1 text-sm font-bold">
            <span>Total</span>
            <span>Rs {order.total_price}</span>
          </div>
          <div className="flex justify-between px-1 text-xs text-[#555]">
            <span>Payment</span>
            <span className="capitalize">{order.payment_method === "cod" ? "Cash on Delivery (COD)" : order.payment_method?.replace("_", " ")}</span>
          </div>
          <div className="flex justify-between px-1 text-xs text-[#555]">
            <span>Type</span>
            <span className="capitalize">{order.order_type?.replace("_", " ")}</span>
          </div>
          {order.table_number && (
            <div className="flex justify-between px-1 text-xs text-[#555]">
              <span>Table</span>
              <span>{order.table_number}</span>
            </div>
          )}
          {order.customer_name && (
            <div className="flex justify-between px-1 text-xs text-[#555]">
              <span>Customer</span>
              <span>{order.customer_name}</span>
            </div>
          )}
        </div>

        {/* Status — FROZEN at snapshot time, never updates */}
        <div className="border-t border-dashed border-[#CCC] pt-2 mb-2 text-center">
          <p className="text-xs font-bold uppercase tracking-wider">
            {statusLabel}
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-dashed border-[#CCC] pt-4 text-center">
          <p className="text-[10px] text-[#999]">Powered By QR Menu</p>
          <p className="text-[10px] text-[#999]">digitalmenue.com</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 max-w-sm mx-auto">
        <Button variant="primary" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
        <Button variant="primary" onClick={handleDownload} loading={downloading}>
          <Download className="w-4 h-4 mr-2" /> Save
        </Button>
      </div>
    </div>
  )
}
