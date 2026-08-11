"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Phone, Sparkles } from "lucide-react"
import type { AIAspectRatio, AIColorSchemeKey } from "@/lib/ai-generator"

/** Map poster ratio → CSS aspect-ratio value. */
export function ratioToAspect(ratio: AIAspectRatio): string {
  const map: Record<AIAspectRatio, string> = {
    "1:1": "1 / 1",
  }
  return map[ratio] || "1 / 1"
}

export interface PosterDish {
  name: string
  price?: number | null
}

export interface PosterCompositionProps {
  /** Generated artwork URL. When null a placeholder is shown (loading/error state). */
  artworkUrl: string | null
  restaurantName: string
  ratio: AIAspectRatio
  dishes?: PosterDish[]
  /** Order phone shown in the footer call box. */
  orderPhone?: string | null
  /** URL encoded into the QR code. */
  qrUrl?: string | null
  /** Drives the accent color of the divider, prices and QR call-out. */
  colorScheme?: AIColorSchemeKey
  className?: string
}

const ACCENT: Record<AIColorSchemeKey, string> = {
  appetizing: "#E05C3A",
  fresh: "#2E9E5B",
  royal: "#B98A1B",
}

function formatPrice(price: number): string {
  return `Rs ${price.toLocaleString("en-PK")}`
}

/**
 * A composed restaurant poster on a clean cream canvas:
 *
 *   header (restaurant name, once) → framed AI artwork → menu panel
 *   (dish names + prices on a solid white card) → footer (phone + QR).
 *
 * All text sits on solid backgrounds — dish names and prices never overlap
 * the artwork, keeping the design clean and professional.
 */
export function PosterComposition({
  artworkUrl,
  restaurantName,
  ratio,
  dishes = [],
  orderPhone,
  qrUrl,
  colorScheme = "appetizing",
  className = "",
}: PosterCompositionProps) {
  const accent = ACCENT[colorScheme] || ACCENT.appetizing
  const items = dishes.slice(0, 2)
  const [imgFailed, setImgFailed] = useState(false)
  const showArtwork = artworkUrl && !imgFailed

  return (
    <div
      className={`relative w-full overflow-hidden select-none bg-[#FCF9F3] ${className}`}
      style={{ aspectRatio: ratioToAspect(ratio) }}
    >
      <div className="absolute inset-0 flex flex-col">
        {/* Header — restaurant name (single source of truth) */}
        <header className="shrink-0 px-4 pt-3 pb-2 text-center">
          <h3 className="text-[#1F1B16] font-extrabold uppercase tracking-[0.16em] text-base md:text-xl leading-tight">
            {restaurantName}
          </h3>
          <div
            className="mx-auto mt-1.5 h-[3px] w-9 rounded-full"
            style={{ background: accent }}
          />
        </header>

        {/* Hero artwork (AI-generated, no text) */}
        <div className="relative min-h-0 flex-1 w-full">
          {showArtwork ? (
            <img
              src={artworkUrl || undefined}
              alt={`${restaurantName} promotional poster`}
              className="absolute inset-0 w-full h-full object-cover"
              crossOrigin="anonymous"
              draggable={false}
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                background: `linear-gradient(150deg, #2A2620 0%, #4A3A2A 55%, ${accent}66 100%)`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white/40" />
              </div>
            </div>
          )}
        </div>

        {/* Menu panel — solid white card so text never overlaps the artwork */}
        <div className="shrink-0 px-3 pb-2.5 pt-2">
          {items.length > 0 && (
            <div className="rounded-xl border border-[#EDE3D3] bg-white px-3 py-2 shadow-[0_1px_4px_rgba(31,27,22,0.06)]">
              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-[#A99A84]">
                Today&apos;s Specials
              </p>
              <ul className="space-y-1">
                {items.map((dish) => (
                  <li key={dish.name} className="flex items-baseline gap-2">
                    <span className="min-w-0 truncate text-[11px] md:text-sm font-semibold text-[#2A241C]">
                      {dish.name}
                    </span>
                    <span className="mb-0.5 min-w-[12px] flex-1 border-b border-dotted border-[#D9CDB9]" />
                    {typeof dish.price === "number" && dish.price > 0 ? (
                      <span
                        className="shrink-0 text-[11px] md:text-sm font-bold"
                        style={{ color: accent }}
                      >
                        {formatPrice(dish.price)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer — order phone + QR */}
          <div className="mt-1.5 flex items-center justify-between gap-2 px-0.5">
            {orderPhone ? (
              <a
                href={`tel:${orderPhone.replace(/[^+\d]/g, "")}`}
                className="flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1"
                style={{ borderColor: "#E5DBC9", color: "#2A241C" }}
              >
                <Phone className="h-3 w-3" style={{ color: accent }} />
                <span className="text-[10px] md:text-xs font-bold tracking-wide whitespace-nowrap">
                  {orderPhone}
                </span>
              </a>
            ) : (
              <div />
            )}

            {qrUrl ? (
              <div className="flex items-center gap-1.5">
                <p className="text-right text-[9px] md:text-[11px] font-extrabold uppercase leading-tight tracking-[0.14em] text-[#2A241C]">
                  Scan to
                  <br />
                  Order
                </p>
                <div className="rounded-md border border-[#EDE3D3] bg-white p-1 shadow-sm">
                  <QRCodeSVG
                    value={qrUrl}
                    size={40}
                    level="M"
                    marginSize={0}
                    bgColor="#FFFFFF"
                    fgColor="#1F1B16"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
