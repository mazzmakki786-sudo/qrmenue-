export function getMenuUrl(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return `${baseUrl}/menu/${slug}`
}

export function downloadQRAsPNG(svgElement: SVGElement, filename: string): void {
  const svgData = new XMLSerializer().serializeToString(svgElement)
  const canvas = document.createElement("canvas")
  canvas.width = 400
  canvas.height = 400
  const ctx = canvas.getContext("2d")
  const img = new Image()
  img.onload = () => {
    ctx!.drawImage(img, 0, 0)
    const a = document.createElement("a")
    a.download = `${filename}-qr-code.png`
    a.href = canvas.toDataURL("image/png")
    a.click()
  }
  img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
}
