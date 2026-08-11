"use client"

import { useRef, useState } from "react"
import { toPng } from "html-to-image"
import { Button } from "@/components/ui/button"
import { Download, Loader2, Trash2, ImageOff } from "lucide-react"
import type { Database } from "@/types/supabase"
import { AI_TEMPLATES, AI_COLOR_SCHEMES } from "@/lib/ai-generator"
import { PosterComposition } from "./PosterComposition"

type Generation = Database["public"]["Tables"]["ai_poster_generations"]["Row"]

interface PosterCardProps {
  gen: Generation
  restaurantName: string
  onDelete: (id: string) => void
  deleting: boolean
}

/** A generated poster in history — renders the composed design (artwork +
 *  restaurant name, dish price tags, order phone, QR "Scan to Order"). */
export function PosterCard({ gen, restaurantName, onDelete, deleting }: PosterCardProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const templateLabel =
    AI_TEMPLATES[gen.template_key as keyof typeof AI_TEMPLATES]?.label ?? gen.template_key
  const schemeLabel =
    AI_COLOR_SCHEMES[gen.color_scheme as keyof typeof AI_COLOR_SCHEMES]?.label ?? gen.color_scheme

  const prices = (gen.dish_prices as (number | null)[] | null) ?? []
  const dishes = (gen.dish_names || []).map((name, i) => ({
    name,
    price: prices[i] ?? null,
  }))

  const handleDownload = async () => {
    if (!overlayRef.current || !gen.image_url) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(overlayRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      })
      const link = document.createElement("a")
      link.download = `${restaurantName.replace(/\s+/g, "-").toLowerCase()}-poster.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error("Poster download failed:", err)
    } finally {
      setDownloading(false)
    }
  }

  if (gen.status === "failed") {
    return (
      <div className="rounded-2xl border border-[#EDEDED] p-4 bg-[#FEF7F7] flex flex-col">
        <div className="flex items-center justify-center h-40 bg-red-50 rounded-xl mb-3 text-red-400">
          <ImageOff className="w-8 h-8" />
        </div>
        <p className="text-sm font-semibold text-red-700">Generation failed</p>
        <p className="text-xs text-red-600 mt-0.5 mb-3">{gen.error_message || "Please try again."}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(gen.id)}
          disabled={deleting}
          className="mt-auto"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Trash2 className="w-4 h-4 mr-1" />}
          Remove
        </Button>
      </div>
    )
  }

  if (!gen.image_url || gen.status !== "success") {
    return (
      <div className="rounded-2xl border border-[#EDEDED] p-4 flex flex-col items-center justify-center h-64 animate-pulse">
        <Loader2 className="w-6 h-6 animate-spin text-[#999] mb-2" />
        <p className="text-sm text-[#666]">Generating poster…</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[#EDEDED] p-4 bg-white flex flex-col">
      <div className="rounded-xl overflow-hidden border border-[#EEE]" ref={overlayRef}>
        <PosterComposition
          artworkUrl={gen.image_url}
          restaurantName={restaurantName}
          ratio={(gen.ratio as any) || "1:1"}
          template={(gen.template_key as any) || "classic"}
          dishes={dishes}
          orderPhone={gen.order_phone}
          qrUrl={gen.qr_url}
          colorScheme={(gen.color_scheme as any) || "appetizing"}
        />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div>
          <p className="text-xs font-semibold text-[#333]">{templateLabel}</p>
          <p className="text-[11px] text-[#999]">{schemeLabel} · {gen.ratio}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleDownload} disabled={downloading}>
            {downloading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Download className="w-4 h-4 mr-1" />}
            Download
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(gen.id)}
            disabled={deleting}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
