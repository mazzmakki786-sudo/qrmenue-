"use client"

import { useRef, useState, useCallback } from "react"
import { Download, Sparkles, Image, Plus } from "lucide-react"
import type { Dish } from "@/types"

interface TemplateDef {
  id: string
  name: string
  icon: string
  desc: string
}

interface TemplateData {
  heading: string
  tagline: string
  dishImage: string
  dishName: string
  price: string
  showLogo: boolean
  showPrice: boolean
}

const TEMPLATES: TemplateDef[] = [
  { id: "bold-deal", name: "Bold Deal", icon: "🔥", desc: "Big promotion with hero dish" },
  { id: "showcase", name: "Showcase", icon: "▦", desc: "Grid of dishes & prices" },
  { id: "signature", name: "Signature", icon: "✦", desc: "Elegant logo + hero design" },
  { id: "fresh", name: "Fresh", icon: "🌿", desc: "Clean natural aesthetic" },
]

const RATIOS: { id: string; label: string; w: number; h: number }[] = [
  { id: "1:1", label: "Square 1:1", w: 400, h: 400 },
  { id: "4:5", label: "Story 4:5", w: 400, h: 500 },
  { id: "16:9", label: "Wide 16:9", w: 480, h: 270 },
]

interface PosterProps {
  data: TemplateData
  ratio: { id: string; w: number; h: number }
  logo?: string | null
  restaurantName: string
  onImageClick?: () => void
  onLogoClick?: () => void
}

function PlaceholderOverlay({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <div onClick={onClick}
      className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-inherit z-10">
      <div className="bg-white/90 rounded-lg px-2 py-1 text-[9px] font-medium text-[#555] flex items-center gap-1 shadow-sm">
        <Plus className="w-3 h-3" /> {label}
      </div>
    </div>
  )
}

// ── Template 1: Bold Deal ──
function BoldDealPoster({ data, ratio, logo, restaurantName, onImageClick, onLogoClick }: PosterProps) {
  const isWide = ratio.id === "16:9"
  return (
    <div style={{ width: ratio.w, height: ratio.h, background: "linear-gradient(145deg, #DC2626 0%, #991B1B 100%)", position: "relative", overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
      <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
      <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
      {/* Logo */}
      {data.showLogo && (
        <div style={{ position: "absolute", top: 10, left: 12, zIndex: 5 }} onClick={onLogoClick} className="cursor-pointer">
          {logo ? (
            <img src={logo} alt="" style={{ width: 36, height: 36, borderRadius: 999, objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)" }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 999, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Logo</div>
          )}
        </div>
      )}
      {/* Badge */}
      <div style={{ position: "absolute", top: 12, right: 12, background: "#FCD34D", color: "#111", fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 12, letterSpacing: 0.5 }}>LIMITED</div>
      {/* Heading */}
      <div style={{ position: "absolute", top: isWide ? 18 : data.showLogo ? 58 : 30, left: 0, right: 0, textAlign: "center", padding: "0 16px" }}>
        <div style={{ fontSize: isWide ? 24 : Math.min(ratio.w * 0.09, 38), fontWeight: 900, color: "#fff", lineHeight: 1.15, textShadow: "0 2px 12px rgba(0,0,0,0.25)", letterSpacing: -0.5 }}>{data.heading || "BIG OFFER"}</div>
        <div style={{ fontSize: isWide ? 11 : 13, color: "rgba(255,255,255,0.75)", marginTop: 4, fontWeight: 500 }}>{data.tagline || "Limited time deal"}</div>
      </div>
      {/* Dish Image */}
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: isWide ? 80 : data.dishImage ? 130 : 130, width: isWide ? 90 : 120, height: isWide ? 90 : 120, borderRadius: 16, overflow: "hidden", border: "3px solid rgba(255,255,255,0.25)", boxShadow: "0 6px 24px rgba(0,0,0,0.3)", background: "rgba(255,255,255,0.08)" }}>
        <div className="relative w-full h-full" onClick={onImageClick}>
          {data.dishImage ? <img src={data.dishImage} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div className="w-full h-full" />}
          <PlaceholderOverlay label={data.dishImage ? "Replace" : "Add dish"} onClick={onImageClick} />
        </div>
      </div>
      {/* Dish Name + Price */}
      <div style={{ position: "absolute", top: isWide ? 175 : data.dishImage ? 258 : 195, left: 0, right: 0, textAlign: "center" }}>
        {data.dishName && <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 600 }}>{data.dishName}</div>}
        {data.showPrice && <div style={{ color: "#FCD34D", fontSize: isWide ? 22 : 30, fontWeight: 900, marginTop: 2, textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>{data.price || "Rs 499"}</div>}
      </div>
      {/* CTA */}
      <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", padding: "5px 24px", borderRadius: 20, fontSize: 10, color: "#fff", fontWeight: 700, letterSpacing: 0.5 }}>ORDER NOW</div>
      </div>
    </div>
  )
}

// ── Template 2: Showcase ──
function ShowcasePoster({ data, ratio, logo, restaurantName, onImageClick, onLogoClick }: PosterProps) {
  const isWide = ratio.id === "16:9"
  const s = isWide ? 55 : 75
  const gap = isWide ? 4 : 6
  return (
    <div style={{ width: ratio.w, height: ratio.h, background: "#fff", position: "relative", overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#111", padding: isWide ? "8px 12px" : "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        {data.showLogo && (
          <div onClick={onLogoClick} className="cursor-pointer">
            {logo ? <img src={logo} alt="" style={{ width: isWide ? 22 : 28, height: isWide ? 22 : 28, borderRadius: 999, objectFit: "cover" }} /> : <div style={{ width: isWide ? 22 : 28, height: isWide ? 22 : 28, borderRadius: 999, background: "#333" }} />}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: isWide ? 11 : 14, fontWeight: 700, color: "#fff" }}>{data.heading || "Our Menu"}</div>
          <div style={{ fontSize: isWide ? 8 : 9, color: "rgba(255,255,255,0.5)" }}>{restaurantName}</div>
        </div>
      </div>
      {/* Grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap, justifyContent: "center", padding: isWide ? "8px" : "12px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ width: s, height: s, borderRadius: 8, overflow: "hidden", background: "#F5F5F5", position: "relative" }}>
            {i === 1 && data.dishImage ? (
              <div className="relative w-full h-full" onClick={onImageClick}>
                <img src={data.dishImage} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <PlaceholderOverlay label="Replace" onClick={onImageClick} />
              </div>
            ) : (
              <div style={{ width: "100%", height: "100%", background: `hsl(${i * 55}, 15%, 93%)` }} />
            )}
          </div>
        ))}
      </div>
      {/* Info */}
      <div style={{ textAlign: "center", padding: isWide ? "0 8px" : "0 12px" }}>
        <div style={{ fontSize: isWide ? 10 : 13, fontWeight: 600, color: "#333" }}>{data.dishName || "Featured Dish"}</div>
        {data.showPrice && <div style={{ fontSize: isWide ? 16 : 22, fontWeight: 800, color: "#DC2626", marginTop: 2 }}>{data.price || "Rs 499"}</div>}
      </div>
      {data.tagline && <div style={{ textAlign: "center", fontSize: 8, color: "#999", marginTop: isWide ? 4 : 6, padding: "0 12px" }}>{data.tagline}</div>}
    </div>
  )
}

// ── Template 3: Signature ──
function SignaturePoster({ data, ratio, logo, restaurantName, onImageClick, onLogoClick }: PosterProps) {
  const isWide = ratio.id === "16:9"
  return (
    <div style={{ width: ratio.w, height: ratio.h, background: "linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)", position: "relative", overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
      {/* Decorative */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)" }} />
      {/* Top section */}
      <div style={{ textAlign: "center", paddingTop: isWide ? 14 : 24 }}>
        <div onClick={onLogoClick} className="cursor-pointer inline-block">
          {data.showLogo && logo ? (
            <img src={logo} alt="" style={{ width: isWide ? 32 : 48, height: isWide ? 32 : 48, borderRadius: 999, objectFit: "cover", border: "2px solid rgba(255,215,0,0.3)", margin: "0 auto" }} />
          ) : data.showLogo ? (
            <div style={{ width: isWide ? 32 : 48, height: isWide ? 32 : 48, borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,215,0,0.2)", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Logo</div>
          ) : null}
        </div>
        <div style={{ fontSize: isWide ? 10 : 12, fontWeight: 700, color: "rgba(255,215,0,0.7)", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>{restaurantName}</div>
      </div>
      {/* Heading */}
      <div style={{ textAlign: "center", padding: "0 16px", marginTop: isWide ? 2 : 6 }}>
        <div style={{ fontSize: isWide ? 22 : Math.min(ratio.w * 0.08, 34), fontWeight: 900, color: "#fff", lineHeight: 1.15, textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>{data.heading || "Signature Dish"}</div>
      </div>
      {/* Dish */}
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: isWide ? 110 : 170, width: isWide ? 90 : 140, height: isWide ? 90 : 140, borderRadius: "50%", overflow: "hidden", border: "3px solid rgba(255,215,0,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", background: "rgba(255,255,255,0.05)" }}>
        <div className="relative w-full h-full" onClick={onImageClick}>
          {data.dishImage ? <img src={data.dishImage} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div className="w-full h-full" />}
          <PlaceholderOverlay label={data.dishImage ? "Replace" : "Add dish"} onClick={onImageClick} />
        </div>
      </div>
      {/* Name + Price */}
      <div style={{ position: "absolute", bottom: isWide ? 24 : 40, left: 0, right: 0, textAlign: "center" }}>
        {data.dishName && <div style={{ fontSize: isWide ? 11 : 14, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{data.dishName}</div>}
        {data.showPrice && <div style={{ fontSize: isWide ? 18 : 28, fontWeight: 900, color: "#FCD34D", marginTop: 2, textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>{data.price || "Rs 999"}</div>}
      </div>
      {/* Tagline */}
      <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, textAlign: "center", fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: 1 }}>{data.tagline}</div>
    </div>
  )
}

// ── Template 4: Fresh ──
function FreshPoster({ data, ratio, logo, restaurantName, onImageClick, onLogoClick }: PosterProps) {
  const isWide = ratio.id === "16:9"
  return (
    <div style={{ width: ratio.w, height: ratio.h, background: "#F0FDF4", position: "relative", overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
      {/* Green top */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "38%", background: "linear-gradient(165deg, #166534 0%, #22C55E 100%)", borderRadius: "0 0 40px 40px" }}>
        {/* Pattern dots */}
        <div style={{ position: "absolute", top: 10, right: 10, width: 40, height: 40, background: "radial-gradient(circle, rgba(255,255,255,0.1) 2px, transparent 2px)", backgroundSize: "8px 8px" }} />
      </div>
      {/* Logo */}
      <div style={{ position: "absolute", top: 10, left: 12, zIndex: 5 }} onClick={onLogoClick} className="cursor-pointer">
        {data.showLogo && logo ? (
          <img src={logo} alt="" style={{ width: 32, height: 32, borderRadius: 999, objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)" }} />
        ) : data.showLogo ? (
          <div style={{ width: 32, height: 32, borderRadius: 999, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "rgba(255,255,255,0.4)" }}>Logo</div>
        ) : null}
      </div>
      {/* Heading on green */}
      <div style={{ position: "absolute", top: isWide ? 12 : 44, left: 0, right: 0, textAlign: "center", padding: "0 20px", zIndex: 2 }}>
        <div style={{ fontSize: isWide ? 20 : Math.min(ratio.w * 0.075, 30), fontWeight: 800, color: "#fff", lineHeight: 1.15, textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>{data.heading || "Fresh & Healthy"}</div>
        <div style={{ fontSize: isWide ? 9 : 11, color: "rgba(255,255,255,0.7)", marginTop: 2, fontWeight: 500 }}>{data.tagline || "Made with fresh ingredients"}</div>
      </div>
      {/* Circular dish image */}
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: isWide ? 70 : 120, width: isWide ? 100 : 150, height: isWide ? 100 : 150, borderRadius: "50%", overflow: "hidden", border: "4px solid #fff", boxShadow: "0 6px 24px rgba(0,0,0,0.12)", zIndex: 5, background: "#DCFCE7" }}>
        <div className="relative w-full h-full" onClick={onImageClick}>
          {data.dishImage ? <img src={data.dishImage} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div className="w-full h-full" />}
          <PlaceholderOverlay label={data.dishImage ? "Replace" : "Add dish"} onClick={onImageClick} />
        </div>
      </div>
      {/* Bottom info */}
      <div style={{ position: "absolute", bottom: isWide ? 20 : 36, left: 0, right: 0, textAlign: "center", padding: "0 24px" }}>
        {data.dishName && <div style={{ fontSize: isWide ? 12 : 16, fontWeight: 700, color: "#166534" }}>{data.dishName}</div>}
        {data.showPrice && <div style={{ fontSize: isWide ? 20 : 30, fontWeight: 900, color: "#15803D", marginTop: 2 }}>{data.price || "Rs 699"}</div>}
      </div>
    </div>
  )
}

interface Props {
  dishes: Dish[]
  restaurantName: string
  restaurantLogo?: string | null
  onSave?: (dataUrl: string) => void
}

export function CanvaEditor({ dishes, restaurantName, restaurantLogo, onSave }: Props) {
  const posterRef = useRef<HTMLDivElement>(null)
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id)
  const [ratio, setRatio] = useState(RATIOS[0])
  const [exporting, setExporting] = useState(false)
  const [showDishPicker, setShowDishPicker] = useState(false)
  const [data, setData] = useState<TemplateData>({
    heading: "Weekend Special",
    tagline: "Limited time offer - Order Now!",
    dishImage: "",
    dishName: "",
    price: "Rs 499",
    showLogo: true,
    showPrice: true,
  })

  const update = useCallback((k: keyof TemplateData, v: string | boolean) => {
    setData((prev) => ({ ...prev, [k]: v }))
  }, [])

  const pickDish = (dish: Dish) => {
    update("dishImage", dish.image_url || "")
    update("dishName", dish.name_en)
    update("price", `Rs ${dish.price}`)
    setShowDishPicker(false)
  }

  const handleExport = useCallback(async () => {
    if (!posterRef.current) return
    setExporting(true)
    try {
      const el = posterRef.current
      await Promise.all(Array.from(el.querySelectorAll("img")).map((img) =>
        img.complete ? Promise.resolve() : new Promise((r) => { img.onload = r; img.onerror = r })
      ))
      const { toPng } = await import("html-to-image")
      const dataUrl = await toPng(el, { quality: 0.95, pixelRatio: 2, backgroundColor: "#ffffff" })
      const link = document.createElement("a")
      link.download = `poster-${templateId}-${Date.now()}.png`
      link.href = dataUrl; link.click()
      if (onSave) onSave(dataUrl)
    } catch (e) { console.error(e) } finally { setExporting(false) }
  }, [onSave, templateId])

  const renderPoster = (onImgClick: () => void, onLgClick: () => void) => {
    const props = { data, ratio, logo: restaurantLogo, restaurantName, onImageClick: onImgClick, onLogoClick: onLgClick }
    switch (templateId) {
      case "bold-deal": return <BoldDealPoster {...props} />
      case "showcase": return <ShowcasePoster {...props} />
      case "signature": return <SignaturePoster {...props} />
      case "fresh": return <FreshPoster {...props} />
      default: return <BoldDealPoster {...props} />
    }
  }

  // Scale poster to fit container width
  const maxPreviewW = 480
  const scale = Math.min(1, maxPreviewW / ratio.w)

  return (
    <div className="space-y-4">
      {/* Template Gallery - Horizontal scroll */}
      <div className="bg-white rounded-2xl border border-[#F0F0F0] p-2.5 sm:p-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TEMPLATES.map((t) => {
            const sel = templateId === t.id
            return (
              <button key={t.id} onClick={() => setTemplateId(t.id)}
                className={`flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-left transition-all flex-shrink-0 ${
                  sel ? "bg-black text-white shadow-sm" : "bg-[#F8F8F8] text-[#555] hover:bg-[#F0F0F0]"
                }`}>
                <span className="text-lg sm:text-xl">{t.icon}</span>
                <div>
                  <div className={`text-xs font-bold ${sel ? "text-white" : "text-[#111]"}`}>{t.name}</div>
                  <div className={`text-[9px] leading-tight ${sel ? "text-white/60" : "text-[#999]"}`}>{t.desc}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Poster Preview */}
        <div className="flex-1 bg-white rounded-2xl border border-[#F0F0F0] p-3 sm:p-4 flex items-start justify-center min-h-[300px]">
          <div style={{ transform: `scale(${scale})`, transformOrigin: "top center", maxWidth: "100%" }}>
            <div ref={posterRef} style={{ borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.1)" }}>
              {renderPoster(() => setShowDishPicker(true), () => update("showLogo", !data.showLogo))}
            </div>
          </div>
        </div>

        {/* Edit Panel */}
        <div className="w-full lg:w-72 xl:w-80 bg-white rounded-2xl border border-[#F0F0F0] p-4 space-y-3">
          <h3 className="text-xs font-bold text-[#111] uppercase tracking-wide">Customize</h3>

          {/* Heading */}
          <div>
            <label className="text-[10px] font-bold text-[#999] block mb-0.5">Heading</label>
            <input value={data.heading} onChange={(e) => update("heading", e.target.value)}
              placeholder="e.g. Weekend Special"
              className="w-full rounded-xl bg-[#F8F8F8] border border-[#E8E8E8] px-3 py-2 text-xs focus:outline-none focus:border-black" />
          </div>

          {/* Tagline */}
          <div>
            <label className="text-[10px] font-bold text-[#999] block mb-0.5">Tagline</label>
            <input value={data.tagline} onChange={(e) => update("tagline", e.target.value)}
              placeholder="e.g. Limited time offer"
              className="w-full rounded-xl bg-[#F8F8F8] border border-[#E8E8E8] px-3 py-2 text-xs focus:outline-none focus:border-black" />
          </div>

          {/* Dish Image */}
          <div>
            <label className="text-[10px] font-bold text-[#999] block mb-0.5">Dish Image</label>
            {data.dishImage ? (
              <div className="flex items-center gap-2 mb-1">
                <img src={data.dishImage} alt="" className="w-10 h-10 rounded-lg object-cover ring-1 ring-black/5" />
                <span className="text-xs text-[#555] flex-1 truncate">{data.dishName || "Selected"}</span>
                <button onClick={() => { update("dishImage", ""); update("dishName", "") }} className="text-[10px] text-red-500 font-medium hover:underline">Remove</button>
              </div>
            ) : null}
            <button onClick={() => setShowDishPicker(true)}
              className="flex items-center gap-2 w-full rounded-xl bg-[#F8F8F8] border border-dashed border-[#CCC] px-3 py-2.5 text-xs text-[#999] hover:bg-[#F0F0F0] transition-colors">
              <Image className="w-4 h-4 flex-shrink-0" />
              <span>{data.dishImage ? "Change dish" : "Pick a dish from menu"}</span>
            </button>
          </div>

          {/* Price */}
          <div>
            <label className="text-[10px] font-bold text-[#999] block mb-0.5">Price</label>
            <div className="flex gap-2 items-center">
              <input value={data.price} onChange={(e) => update("price", e.target.value)}
                placeholder="Rs 499"
                className="flex-1 rounded-xl bg-[#F8F8F8] border border-[#E8E8E8] px-3 py-2 text-xs focus:outline-none focus:border-black" />
              <label className="flex items-center gap-1 cursor-pointer text-[10px] text-[#555] flex-shrink-0">
                <input type="checkbox" checked={data.showPrice} onChange={(e) => update("showPrice", e.target.checked)}
                  className="w-3 h-3 accent-black" />
                Show
              </label>
            </div>
          </div>

          {/* Logo Toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-[#555] pt-1">
            <input type="checkbox" checked={data.showLogo} onChange={(e) => update("showLogo", e.target.checked)}
              className="w-3.5 h-3.5 accent-black rounded" />
            Show logo
            {data.showLogo && restaurantLogo && <span className="text-[9px] text-green-600">✓ loaded</span>}
          </label>

          {/* Size */}
          <div className="border-t border-[#F0F0F0] pt-2">
            <label className="text-[10px] font-bold text-[#999] block mb-1">Size</label>
            <div className="flex gap-1.5">
              {RATIOS.map((r) => (
                <button key={r.id} onClick={() => setRatio(r)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${ratio.id === r.id ? "bg-black text-white shadow-sm" : "bg-[#F8F8F8] text-[#555] hover:bg-[#F0F0F0]"}`}>
                  {r.label.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Download */}
          <button onClick={handleExport} disabled={exporting}
            className="w-full py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 mt-2">
            {exporting ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {exporting ? "Exporting..." : "Download Poster"}
          </button>
        </div>
      </div>

      {/* Dish Picker Modal */}
      {showDishPicker && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3" onClick={() => setShowDishPicker(false)}>
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold mb-3">Choose a dish</h3>
            {dishes.filter((d) => d.image_url).length === 0 ? (
              <p className="text-xs text-[#999]">No dishes with images. Add images to your menu dishes first.</p>
            ) : (
              <div className="space-y-1">
                {dishes.filter((d) => d.image_url).map((dish) => (
                  <button key={dish.id} onClick={() => pickDish(dish)}
                    className="flex items-center gap-2.5 w-full p-2 rounded-xl hover:bg-[#F8F8F8] transition-colors text-left">
                    <img src={dish.image_url!} alt="" className="w-11 h-11 rounded-xl object-cover ring-1 ring-black/5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{dish.name_en}</p>
                      <p className="text-[10px] text-[#999]">Rs {dish.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
