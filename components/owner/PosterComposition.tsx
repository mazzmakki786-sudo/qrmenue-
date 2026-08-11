"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Phone, ScanLine, Sparkles } from "lucide-react"
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
  /** Generated artwork URL. When null a placeholder is shown (design preview). */
  artworkUrl: string | null
  restaurantName: string
  ratio: AIAspectRatio
  dishes?: PosterDish[]
  /** Order phone shown in the footer box. */
  orderPhone?: string | null
  /** URL encoded into the QR code. */
  qrUrl?: string | null
  /** Drives the accent color of price tags / CTA. */
  colorScheme?: AIColorSchemeKey
  className?: string
}

const ACCENT: Record<AIColorSchemeKey, string> = {
  appetizing: "#EF4444",
  fresh: "#22C55E",
  royal: "#F59E0B",
}

function formatPrice(price: number): string {
  return `Rs ${price.toLocaleString("en-PK")}`
}

/**
 * A composed restaurant poster: AI artwork as background + an HTML/CSS overlay
 * that renders the restaurant name (once), a bottom menu strip with dish name +
 * price tags, an order phone box, and a QR "Scan to Order" footer.
 *
 * The overlay is the single source of text (the AI artwork is generated with
 * STRICT no-text rules), so the restaurant name never duplicates and dish names
 * never float in the center of the image.
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
  const items = dishes.slice(0, 6)
  const [imgFailed, setImgFailed] = useState(false)
  const showArtwork = artworkUrl && !imgFailed

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{ aspectRatio: ratioToAspect(ratio) }}
    >
      {/* ── Artwork / placeholder ── */}
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
            background: `linear-gradient(150deg, #1a1a1a 0%, #3a2a1a 55%, ${accent}66 100%)`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white/40" />
          </div>
        </div>
      )}

      {/* ── Scrims for legibility ── */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/45 to-transparent" />

      {/* ── Content column ── */}
      <div className="absolute inset-0 flex flex-col justify-between">
        {/* Top — restaurant name (single source of truth) */}
        <header className="px-4 pt-4 text-center">
          <h3 className="text-white font-extrabold uppercase tracking-[0.18em] text-base md:text-xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] leading-tight">
            {restaurantName}
          </h3>
          <div
            className="mx-auto mt-1.5 h-[3px] w-10 rounded-full"
            style={{ background: accent }}
          />
        </header>

        {/* Middle — flexible breathing room (pure artwork space) */}
        <div className="flex-1" />

        {/* Bottom — menu strip + phone + QR */}
        <footer className="px-3 pb-3 space-y-2.5">
          {items.length > 0 && (
            <div className="rounded-2xl bg-black/65 backdrop-blur-[3px] px-4 py-3 border border-white/10">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2"
                style={{ color: accent }}
              >
                Today&apos;s Specials
              </p>
              <ul className="space-y-1.5">
                {items.map((dish) => (
                  <li key={dish.name} className="flex items-center gap-2 text-white">
                    <span className="truncate text-xs md:text-sm font-medium min-w-0">
                      {dish.name}
                    </span>
                    <span className="flex-1 border-b border-dotted border-white/30 mb-0.5 min-w-[16px]" />
                    {typeof dish.price === "number" && dish.price > 0 ? (
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] md:text-xs font-bold text-white shadow-sm"
                        style={{ background: accent }}
                      >
                        {formatPrice(dish.price)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            {orderPhone ? (
              <a
                href={`tel:${orderPhone.replace(/[^+\d]/g, "")}`}
                className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-md"
                style={{ color: "#111827" }}
              >
                <Phone className="w-3 h-3" style={{ color: accent }} />
                <span className="text-[11px] md:text-xs font-bold tracking-wide whitespace-nowrap">
                  {orderPhone}
                </span>
              </a>
            ) : (
              <div className="h-6" />
            )}

            {qrUrl ? (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-[9px] md:text-[11px] font-extrabold uppercase tracking-[0.18em] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] leading-tight">
                    Scan to
                    <br />
                    Order Now
                  </p>
                  <p
                    className="text-[8px] md:text-[9px] font-semibold uppercase tracking-widest"
                    style={{ color: accent }}
                  >
                    Your Table QR Menu
                  </p>
                </div>
                <div className="rounded-lg bg-white p-1 shadow-md">
                  <QRCodeSVG
                    value={qrUrl}
                    size={52}
                    level="M"
                    marginSize={0}
                    bgColor="#FFFFFF"
                    fgColor="#111827"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </footer>
      </div>

      {/* Corner flourish */}
      <div
        className="absolute right-2 top-2 rounded-md px-1.5 py-0.5 flex items-center gap-1"
        style={{ background: accent, color: "#ffffff" }}
      >
        <ScanLine className="w-3 h-3" />
        <span className="text-[8px] font-extrabold uppercase tracking-widest">QR Menu</span>
      </div>
    </div>
  )
}
