"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Phone, Sparkles } from "lucide-react"
import type { AIAspectRatio, AIColorSchemeKey, AITemplateKey } from "@/lib/ai-generator"

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
  /** Drives the overlay layout — each template has its own distinct design. */
  template?: AITemplateKey
  dishes?: PosterDish[]
  /** Order phone shown in the footer call box. */
  orderPhone?: string | null
  /** URL encoded into the QR code. */
  qrUrl?: string | null
  /** Drives the accent color of decorations, prices and call-outs. */
  colorScheme?: AIColorSchemeKey
  className?: string
}

const ACCENT: Record<AIColorSchemeKey, string> = {
  appetizing: "#EF4444",
  fresh: "#22C55E",
  royal: "#F5B83D",
}

function formatPrice(price: number): string {
  return `Rs ${price.toLocaleString("en-PK")}`
}

/**
 * A composed restaurant poster: the AI artwork is the full-bleed background and
 * the text (restaurant name, dish names + prices, phone, QR) is overlaid on it
 * with scrims for legibility. Each template renders a different design language
 * — "classic" is warm & serif, "modern" is clean editorial sans.
 */
export function PosterComposition({
  artworkUrl,
  restaurantName,
  ratio,
  template = "classic",
  dishes = [],
  orderPhone,
  qrUrl,
  colorScheme = "appetizing",
  className = "",
}: PosterCompositionProps) {
  const accent = ACCENT[colorScheme] || ACCENT.appetizing
  const tpl = template === "modern" ? "modern" : "classic"
  const items = dishes.slice(0, 2)
  const [imgFailed, setImgFailed] = useState(false)
  const showArtwork = artworkUrl && !imgFailed
  const phoneHref = orderPhone ? `tel:${orderPhone.replace(/[^+\d]/g, "")}` : null

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
            background: `linear-gradient(150deg, #1A1A1A 0%, #3A2A1A 55%, ${accent}66 100%)`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white/40" />
          </div>
        </div>
      )}

      {/* ── Legibility scrims (per template) ── */}
      <div
        className={`absolute inset-x-0 top-0 bg-gradient-to-b to-transparent ${
          tpl === "modern" ? "h-20 from-black/45 via-black/15" : "h-28 from-black/70 via-black/25"
        }`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent ${
          tpl === "modern" ? "h-[52%] from-black/75 via-black/30" : "h-[58%] from-black/85 via-black/40"
        }`}
      />

      {/* ── Content (each template has its own layout & typography) ── */}
      {tpl === "modern" ? (
        /* ── Modern Minimalist: clean editorial sans, hairline rules ── */
        <div className="absolute inset-0 flex flex-col justify-between">
          <header className="px-5 pt-4">
            <h3 className="text-white text-sm md:text-lg font-semibold uppercase tracking-[0.28em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight">
              {restaurantName}
            </h3>
            <div className="mt-1.5 h-px w-10" style={{ background: accent }} />
          </header>

          <footer className="px-5 pb-4">
            {items.length > 0 && (
              <div className="mx-auto max-w-sm space-y-2">
                {items.map((dish) => (
                  <div
                    key={dish.name}
                    className="border-t pt-1.5"
                    style={{ borderColor: "rgba(255,255,255,0.4)" }}
                  >
                    <div className="flex items-baseline justify-between gap-3 text-white">
                      <span className="min-w-0 truncate text-[11px] md:text-sm font-semibold uppercase tracking-[0.16em] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                        {dish.name}
                      </span>
                      {typeof dish.price === "number" && dish.price > 0 ? (
                        <span
                          className="shrink-0 text-[11px] md:text-sm font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                          style={{ color: accent }}
                        >
                          {formatPrice(dish.price)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between gap-2">
              {phoneHref && orderPhone ? (
                <a
                  href={phoneHref}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1.5"
                  style={{ borderColor: "rgba(255,255,255,0.5)", color: "#fff" }}
                >
                  <Phone className="h-3 w-3" style={{ color: accent }} />
                  <span className="text-[10px] md:text-xs font-bold tracking-wide whitespace-nowrap">
                    {orderPhone}
                  </span>
                </a>
              ) : (
                <div />
              )}
              {qrUrl && (
                <div className="flex items-center gap-1.5">
                  <p className="text-right text-[8px] md:text-[10px] font-bold uppercase leading-tight tracking-[0.18em] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    Scan to
                    <br />
                    Order
                  </p>
                  <div className="rounded-md bg-white p-1 shadow-md">
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
              )}
            </div>
          </footer>
        </div>
      ) : (
        /* ── Classic Feast: warm traditional serif, centered ornament ── */
        <div className="absolute inset-0 flex flex-col justify-between">
          <header className="px-4 pt-4 text-center">
            <h3 className="font-serif font-bold uppercase tracking-[0.18em] text-white text-xl md:text-3xl leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {restaurantName}
            </h3>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="h-px w-8" style={{ background: accent }} />
              <span className="text-[11px] leading-none" style={{ color: accent }}>
                ✦
              </span>
              <span className="h-px w-8" style={{ background: accent }} />
            </div>
          </header>

          <footer className="px-5 pb-4 text-center">
            {items.length > 0 && (
              <>
                <p
                  className="mb-2 text-[10px] md:text-xs font-semibold uppercase tracking-[0.35em]"
                  style={{ color: accent, textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                >
                  Today&apos;s Specials
                </p>
                <div className="mx-auto max-w-xs space-y-1.5">
                  {items.map((dish) => (
                    <div key={dish.name} className="flex items-baseline gap-2 text-white">
                      <span className="min-w-0 truncate font-serif text-sm md:text-base font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                        {dish.name}
                      </span>
                      <span className="mb-0.5 min-w-[12px] flex-1 border-b border-dotted border-white/40" />
                      {typeof dish.price === "number" && dish.price > 0 ? (
                        <span
                          className="shrink-0 text-sm md:text-base font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                          style={{ color: accent }}
                        >
                          {formatPrice(dish.price)}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-3 flex items-center justify-center gap-3">
              {phoneHref && orderPhone && (
                <a
                  href={phoneHref}
                  className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-md"
                  style={{ color: "#1F1B16" }}
                >
                  <Phone className="h-3 w-3" style={{ color: accent }} />
                  <span className="text-[10px] md:text-xs font-bold tracking-wide whitespace-nowrap">
                    {orderPhone}
                  </span>
                </a>
              )}
              {qrUrl && (
                <div className="flex items-center gap-2">
                  <p className="text-right text-[8px] md:text-[10px] font-bold uppercase leading-tight tracking-[0.18em] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    Scan to
                    <br />
                    Order
                  </p>
                  <div className="rounded-md bg-white p-1 shadow-md">
                    <QRCodeSVG
                      value={qrUrl}
                      size={44}
                      level="M"
                      marginSize={0}
                      bgColor="#FFFFFF"
                      fgColor="#1F1B16"
                    />
                  </div>
                </div>
              )}
            </div>
          </footer>
        </div>
      )}
    </div>
  )
}
