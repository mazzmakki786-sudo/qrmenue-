"use client"

import { useRef } from "react"
import { formatPrice } from "@/lib/utils"
import { Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  order: any
  restaurant: any
}

export function OrderReceipt({ order, restaurant }: Props) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const win = window.open("", "_blank")
    if (!win || !receiptRef.current) return
    const html = `
      <html>
        <head><title>Receipt - ${order.order_number}</title>
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
        </style>
        </head>
        <body>
          <div class="receipt">
            ${receiptRef.current.innerHTML}
          </div>
          <script>window.print();<\/script>
        </body>
      </html>
    `
    win.document.write(html)
    win.document.close()
  }

  const handleDownload = () => {
    const el = receiptRef.current
    if (!el) return
    import("html-to-image").then(({ toPng }) => {
      toPng(el, { quality: 0.95, pixelRatio: 2 }).then((dataUrl) => {
        const a = document.createElement("a")
        a.download = `receipt-${order.order_number}.png`
        a.href = dataUrl
        a.click()
      })
    })
  }

  return (
    <div>
      <div
        ref={receiptRef}
        className="bg-white p-6 rounded-[14px] border border-[#E8E8E8] w-full max-w-sm mx-auto font-mono text-sm"
      >
        {/* Restaurant Info */}
        <div className="text-center mb-4">
          {restaurant?.logo_url && (
            <img
              src={restaurant.logo_url}
              alt={restaurant.name}
              className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
            />
          )}
          <h2 className="text-base font-bold">{restaurant?.name || "Restaurant"}</h2>
          {restaurant?.city && <p className="text-xs text-[#555]">{restaurant.city}</p>}
        </div>

        <div className="border-t border-dashed border-[#CCC] pt-3 mb-3 text-center">
          <p className="font-bold text-sm">ORDER RECEIPT</p>
          <p className="text-xs text-[#555]">{order.order_number}</p>
          <p className="text-xs text-[#555]">{new Date(order.created_at).toLocaleString("en-PK")}</p>
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
          <div className="flex justify-between px-1 text-sm">
            <span>Total</span>
            <span className="font-bold">Rs {order.total_price}</span>
          </div>
          <div className="flex justify-between px-1 text-xs text-[#555]">
            <span>Payment</span>
            <span className="capitalize">{order.payment_method?.replace("_", " ")}</span>
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

        {/* Status */}
        <div className="border-t border-dashed border-[#CCC] pt-2 mb-2 text-center">
          <p className="text-xs font-bold uppercase tracking-wider">
            {order.order_status === "completed" ? "Completed" : order.order_status === "preparing" ? "Confirmed" : order.order_status}
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-dashed border-[#CCC] pt-4 text-center">
          <p className="text-[10px] text-[#999]">Powered By QR Menu</p>
          <p className="text-[10px] text-[#999]">qr-menue-one.vercel.app</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 max-w-sm mx-auto">
        <Button variant="primary" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
        <Button variant="primary" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" /> Save
        </Button>
      </div>
    </div>
  )
}
