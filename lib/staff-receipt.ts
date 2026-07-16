"use client"

export interface ReceiptData {
  restaurantName: string
  restaurantSlug: string
  orderNumber: string
  customerName: string
  tableNumber: string | null
  items: { name: string; price: number; quantity: number; subtotal: number }[]
  totalPrice: number
  date: string
  staffName: string
}

export function buildReceiptHTML(data: ReceiptData): string {
  const itemsRows = data.items
    .map(
      (item) => `
    <tr>
      <td style="font-size:12px;padding:4px 0">${item.name}</td>
      <td style="font-size:12px;padding:4px 0;text-align:center">${item.quantity}</td>
      <td style="font-size:12px;padding:4px 0;text-align:right">Rs ${item.subtotal.toLocaleString()}</td>
    </tr>`
    )
    .join("")

  return `
    <div id="receipt" style="width:300px;padding:20px;font-family:'Courier New',monospace;background:white">
      <div style="text-align:center;margin-bottom:15px;border-bottom:2px dashed #000;padding-bottom:10px">
        <h2 style="margin:0;font-size:18px">${data.restaurantName}</h2>
        <p style="margin:4px 0;font-size:11px;color:#555">${data.restaurantSlug}</p>
        <p style="margin:4px 0;font-size:11px;color:#555">${data.date}</p>
      </div>
      <div style="margin-bottom:10px;font-size:12px">
        <p style="margin:2px 0"><strong>Order:</strong> #${data.orderNumber}</p>
        <p style="margin:2px 0"><strong>Customer:</strong> ${data.customerName}</p>
        ${data.tableNumber ? `<p style="margin:2px 0"><strong>Table:</strong> ${data.tableNumber}</p>` : ""}
        <p style="margin:2px 0"><strong>Staff:</strong> ${data.staffName}</p>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="border-bottom:1px solid #000">
            <th style="font-size:12px;text-align:left;padding:4px 0">Item</th>
            <th style="font-size:12px;text-align:center;padding:4px 0">Qty</th>
            <th style="font-size:12px;text-align:right;padding:4px 0">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
        <tfoot>
          <tr style="border-top:2px solid #000">
            <td colspan="2" style="font-size:14px;font-weight:bold;padding:8px 0">TOTAL</td>
            <td style="font-size:14px;font-weight:bold;text-align:right;padding:8px 0">Rs ${data.totalPrice.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
      <div style="text-align:center;margin-top:15px;border-top:2px dashed #000;padding-top:10px;font-size:11px;color:#555">
        <p style="margin:2px 0">Thank you for visiting!</p>
      </div>
    </div>
  `
}

export function printReceipt(data: ReceiptData) {
  const html = buildReceiptHTML(data)
  const win = window.open("", "_blank")
  if (!win) return
  win.document.write(`
    <html>
      <head><title>Receipt #${data.orderNumber}</title></head>
      <body style="margin:0;display:flex;justify-content:center;background:#f5f5f5">
        ${html}
        <script>
          window.onload = function() { window.print(); window.close(); }
        <\/script>
      </body>
    </html>
  `)
  win.document.close()
}

export async function downloadReceiptPNG(data: ReceiptData): Promise<void> {
  const html = buildReceiptHTML(data)

  const iframe = document.createElement("iframe")
  iframe.style.position = "fixed"
  iframe.style.top = "-9999px"
  iframe.style.left = "-9999px"
  iframe.style.width = "300px"
  iframe.style.height = "0"
  iframe.style.border = "none"
  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentWindow?.document
  if (!iframeDoc) {
    document.body.removeChild(iframe)
    return
  }

  iframeDoc.open()
  iframeDoc.write(`
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; }
          #receipt { width: 300px; padding: 20px; font-family: 'Courier New', monospace; background: white; box-sizing: border-box; }
        </style>
      </head>
      <body>${html}</body>
    </html>
  `)
  iframeDoc.close()

  await new Promise((resolve) => setTimeout(resolve, 200))

  try {
    const html2canvas = (await import("html2canvas")).default
    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: 340,
    })
    const link = document.createElement("a")
    link.download = `receipt-${data.orderNumber}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  } catch (err) {
    console.error("Receipt PNG failed:", err)
    printReceipt(data)
  } finally {
    document.body.removeChild(iframe)
  }
}

export function printBluetoothReceipt(data: ReceiptData) {
  const lines = [
    `================================`,
    `  ${data.restaurantName}`,
    `  ${data.restaurantSlug}`,
    `  ${data.date}`,
    `================================`,
    `Order: #${data.orderNumber}`,
    `Customer: ${data.customerName}`,
    data.tableNumber ? `Table: ${data.tableNumber}` : "",
    `Staff: ${data.staffName}`,
    `--------------------------------`,
    ...data.items.map(
      (item) =>
        `${item.name} x${item.quantity}`.padEnd(30) +
        `Rs ${item.subtotal.toLocaleString()}`
    ),
    `--------------------------------`,
    `TOTAL`.padEnd(30) + `Rs ${data.totalPrice.toLocaleString()}`,
    `================================`,
    `  Thank you!`,
    `================================`,
    `\n\n\n`,
  ]
    .filter(Boolean)
    .join("\n")

  const nav = navigator as any
  if (nav.bluetooth) {
    const textEncoder = new TextEncoder()
    const data = textEncoder.encode(lines)

    nav.bluetooth
      .requestDevice({
        acceptAllDevices: true,
        optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
      })
      .then((device: any) => device.gatt?.connect())
      .then((server: any) => server?.getPrimaryService("000018f0-0000-1000-8000-00805f9b34fb"))
      .then((service: any) => service.getCharacteristic("00002af1-0000-1000-8000-00805f9b34fb"))
      .then((char: any) => char.writeValue(data))
      .then(() => {
        showReceiptToast("Receipt sent to Bluetooth printer")
      })
      .catch((err: any) => {
        console.error("Bluetooth print failed:", err)
        showReceiptToast("Bluetooth print failed. Try Print or PNG instead.", true)
      })
  } else {
    showReceiptToast("Bluetooth not available. Use Print or PNG.", true)
  }
}

function showReceiptToast(message: string, isError = false) {
  const toast = document.createElement("div")
  toast.className = `fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] ${isError ? "bg-red-600" : "bg-green-600"} text-white rounded-xl px-6 py-3 shadow-2xl text-sm font-medium animate-slide-up`
  toast.textContent = message
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.transition = "opacity 0.3s"
    toast.style.opacity = "0"
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}
