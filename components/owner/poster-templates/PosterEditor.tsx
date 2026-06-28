"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { toPng } from "html-to-image"
import { Download, ArrowUpDown, ImageUp, Palette, Type, Layout, Sparkles, Loader2 } from "lucide-react"
import type { Dish } from "@/types"
import { PosterRenderer, TEMPLATES, getDefaultColors } from "./PosterTemplates"
import type { PosterSettings, PosterRatio, PosterLayout } from "./types"

interface Props {
  dishes: Dish[]
  restaurantName: string
  restaurantLogo?: string | null
  initialCaption?: string
  onSave?: (dataUrl: string) => void
}

const RATIOS: { id: PosterRatio; label: string; icon: string }[] = [
  { id: "1:1", label: "1:1 Square", icon: "▣" },
  { id: "16:9", label: "16:9 Wide", icon: "▬" },
  { id: "4:5", label: "4:5 Story", icon: "▮" },
]

const TEXT_SIZES = ["sm", "md", "lg"] as const

export function PosterEditor({ dishes, restaurantName, restaurantLogo, initialCaption, onSave }: Props) {
  const posterRef = useRef<HTMLDivElement>(null)
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id)
  const [selectedLayout, setSelectedLayout] = useState<PosterLayout>("image-top")
  const [ratio, setRatio] = useState<PosterRatio>("1:1")
  const [caption, setCaption] = useState(initialCaption || "")
  const [showPrices, setShowPrices] = useState(true)
  const [showName, setShowName] = useState(true)
  const [textSize, setTextSize] = useState<"sm" | "md" | "lg">("md")
  const [colors, setColors] = useState(getDefaultColors(TEMPLATES[0].id))
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>([])
  const [exporting, setExporting] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const template = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0]

  useEffect(() => {
    const def = getDefaultColors(selectedTemplate)
    setColors(def)
    const t = TEMPLATES.find((t) => t.id === selectedTemplate)
    if (t && !t.layouts.includes(selectedLayout)) {
      setSelectedLayout(t.layouts[0])
    }
  }, [selectedTemplate])

  const toggleDish = useCallback((id: string) => {
    setSelectedDishIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id].slice(0, 6)
    )
  }, [])

  const moveDish = useCallback((index: number, dir: -1 | 1) => {
    setSelectedDishIds((prev) => {
      const arr = [...prev]
      const newIndex = index + dir
      if (newIndex < 0 || newIndex >= arr.length) return arr
      ;[arr[index], arr[newIndex]] = [arr[newIndex], arr[index]]
      return arr
    })
  }, [])

  const handleExport = useCallback(async () => {
    if (!posterRef.current) return
    setExporting(true)
    try {
      const dataUrl = await toPng(posterRef.current, { quality: 0.95, pixelRatio: 2 })
      const link = document.createElement("a")
      link.download = `poster-${template.id}-${Date.now()}.png`
      link.href = dataUrl
      link.click()
      if (onSave) onSave(dataUrl)
    } catch { } finally { setExporting(false) }
  }, [onSave, template.id])

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return
    setAiGenerating(true)
    setAiError(null)
    try {
      const res = await fetch("/api/owner/ai/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          language: "en",
          dish_ids: selectedDishIds,
          mode: "generate-caption",
        }),
      })
      const data = await res.json()
      if (!res.ok) { setAiError(data.error || "AI generation failed"); return }
      setCaption(data.caption || "")
      if (data.suggestedColors) {
        setColors((prev) => ({
          ...prev,
          textPrimary: data.suggestedColors.primary || prev.textPrimary,
          accent: data.suggestedColors.accent || prev.accent,
          cardBg: data.suggestedColors.secondary || prev.cardBg,
        }))
      }
    } catch {
      setAiError("Network error. Please try again.")
    } finally {
      setAiGenerating(false)
    }
  }

  const selectedDishes = dishes.filter((d) => selectedDishIds.includes(d.id))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Controls Panel */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-[#F0F0F0] p-4 space-y-4 max-h-[700px] overflow-y-auto">
        {/* AI Prompt */}
        <div className="bg-gradient-to-br from-[#7C3AED]/5 to-[#2563EB]/5 rounded-xl p-3 border border-[#7C3AED]/10">
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#111] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" /> AI Generate
          </label>
          <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. Create a poster for our weekend BBQ special with grilled items..."
            className="w-full h-16 rounded-xl bg-white border border-[#E8E8E8] px-3 py-2 text-xs focus:outline-none focus:border-[#7C3AED] resize-none mb-2"
          />
          {aiError && <p className="text-[10px] text-red-500 mb-2">{aiError}</p>}
          <button onClick={handleAiGenerate} disabled={aiGenerating || !aiPrompt.trim()}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white text-xs font-bold hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
            {aiGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {aiGenerating ? "Generating..." : "Generate with AI"}
          </button>
        </div>
        {/* Template */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#111] mb-2">
            <Layout className="w-3.5 h-3.5" /> Template
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                className={`p-2 rounded-xl text-center text-[10px] font-medium transition-all ${
                  selectedTemplate === t.id ? "bg-black text-white ring-2 ring-black" : "bg-[#F8F8F8] text-[#555] hover:bg-[#F0F0F0]"
                } ${t.premium ? "ring-1 ring-[#FCD34D]" : ""}`}>
                <span className="text-lg block mb-0.5">{t.icon}</span>
                {t.name}
                {t.premium && <span className="block text-[8px] text-[#F59E0B] font-bold">PREMIUM</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Layout */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#111] mb-2">
            <ImageUp className="w-3.5 h-3.5" /> Layout
          </label>
          <div className="flex flex-wrap gap-1.5">
            {template.layouts.map((l) => (
              <button key={l} onClick={() => setSelectedLayout(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedLayout === l ? "bg-black text-white" : "bg-[#F8F8F8] text-[#555]"
                }`}>
                {l === "image-top" ? "Image Row" : l === "image-grid" ? "Grid" : l === "overlay" ? "Overlay" : l === "side-by-side" ? "Side" : "Split"}
              </button>
            ))}
          </div>
        </div>

        {/* Ratio */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#111] mb-2">Ratio</label>
          <div className="flex gap-1.5">
            {RATIOS.map((r) => (
              <button key={r.id} onClick={() => setRatio(r.id)}
                className={`flex-1 p-2 rounded-xl text-center text-[10px] font-medium transition-all ${
                  ratio === r.id ? "bg-black text-white" : "bg-[#F8F8F8] text-[#555]"
                }`}>
                <span className="text-lg block">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Caption */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#111] mb-2">
            <Type className="w-3.5 h-3.5" /> Caption
          </label>
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)}
            placeholder="Enter your caption or promotion text..."
            className="w-full h-16 rounded-xl bg-[#F8F8F8] border border-[#E8E8E8] px-3 py-2 text-xs focus:outline-none focus:border-black resize-none" />
        </div>

        {/* Colors */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#111] mb-2">
            <Palette className="w-3.5 h-3.5" /> Colors
          </label>
          <div className="grid grid-cols-5 gap-2">
            {(["bgTop", "bgBottom", "textPrimary", "accent", "cardBg"] as const).map((key) => (
              <div key={key} className="text-center">
                <input type="color" value={colors[key]}
                  onChange={(e) => setColors((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-full h-8 rounded-lg cursor-pointer" />
                <span className="text-[8px] text-[#999] mt-0.5 block">
                  {key === "bgTop" ? "Bg 1" : key === "bgBottom" ? "Bg 2" : key === "textPrimary" ? "Text" : key === "accent" ? "Accent" : "Card"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={showPrices} onChange={(e) => setShowPrices(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-black" />
            <span className="text-xs text-[#555]">Prices</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-black" />
            <span className="text-xs text-[#555]">Restaurant</span>
          </label>
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#555]">Size:</span>
            {TEXT_SIZES.map((s) => (
              <button key={s} onClick={() => setTextSize(s)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium ${textSize === s ? "bg-black text-white" : "bg-[#F0F0F0] text-[#555]"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Dish Selection + Ordering */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#111] mb-2">
            <ArrowUpDown className="w-3.5 h-3.5" /> Dishes (tap to reorder)
          </label>
          {dishes.length === 0 ? (
            <p className="text-xs text-[#999]">No dishes with images</p>
          ) : (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {dishes.map((dish) => {
                const idx = selectedDishIds.indexOf(dish.id)
                const isSelected = idx >= 0
                return (
                  <div key={dish.id}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs transition-all ${
                      isSelected ? "bg-black/5 border border-black/10" : "bg-[#F8F8F8] hover:bg-[#F0F0F0]"
                    }`}>
                    <button onClick={() => toggleDish(dish.id)}
                      className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold ${
                        isSelected ? "bg-black text-white" : "border border-[#CCC]"
                      }`}>
                      {isSelected ? idx + 1 : ""}
                    </button>
                    <span className="flex-1 truncate">{dish.name_en}</span>
                    {isSelected && (
                      <div className="flex gap-0.5">
                        <button onClick={() => moveDish(idx, -1)} disabled={idx === 0}
                          className="p-0.5 rounded hover:bg-white/50 disabled:opacity-20">▲</button>
                        <button onClick={() => moveDish(idx, 1)} disabled={idx === selectedDishIds.length - 1}
                          className="p-0.5 rounded hover:bg-white/50 disabled:opacity-20">▼</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Export Button */}
        <button onClick={handleExport} disabled={exporting || selectedDishIds.length === 0}
          className="w-full py-3 rounded-xl bg-black text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
          {exporting ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {exporting ? "Exporting..." : "Download Poster"}
        </button>
      </div>

      {/* Preview */}
      <div className="lg:col-span-8 flex items-start justify-center">
        <div className="w-full max-w-[500px] mx-auto">
          <PosterRenderer
            ref={posterRef}
            dishes={selectedDishes}
            settings={{
              templateId: selectedTemplate,
              layout: selectedLayout,
              ratio,
              caption,
              showPrices,
              showRestaurantName: showName,
              textSize,
              colors,
            }}
            restaurantName={restaurantName}
            restaurantLogo={restaurantLogo}
          />
        </div>
      </div>
    </div>
  )
}
