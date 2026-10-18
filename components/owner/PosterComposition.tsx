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
  /** Design template — each one renders a completely different layout. */
  template?: AITemplateKey
  dishes?: PosterDish[]
  orderPhone?: string | null
  qrUrl?: string | null
  colorScheme?: AIColorSchemeKey
  className?: string
}

const ACCENT: Record<AIColorSchemeKey, string> = {
  appetizing: "#EF4444",
  fresh: "#22C55E",
  royal: "#F5B83D",
}

const VALID: AITemplateKey[] = ["classic", "modern", "bold", "elegant"]

/**
 * Every dimension below is expressed in `cqw` (container query width) units so the
 * design scales with the POSTER, not the viewport. The same poster is rendered at
 * ~300px in a history card and at 1024px when downloaded — viewport breakpoints
 * would blow the typography up in the small case and shrink it in the large one.
 */
const T = {
  nameXL: "text-[2.9cqw]", // classic
  nameL: "text-[2.3cqw]", // bold
  nameM: "text-[1.7cqw]", // modern / elegant
  label: "text-[1cqw]",
  dish: "text-[1.5cqw]",
  dishSm: "text-[1.3cqw]",
  price: "text-[1.5cqw]",
  phone: "text-[1.15cqw]",
  caption: "text-[0.95cqw]",
  qr: "h-[6.6cqw] w-[6.6cqw]",
  qrSm: "h-[6cqw] w-[6cqw]",
  pad: "px-[3cqw]",
  radius: "rounded-[1.1cqw]",
} as const

function formatPrice(price: number): string {
  return `Rs ${price.toLocaleString("en-PK")}`
}

const SHADOW = "drop-shadow-[0_0.35cqw_1.4cqw_rgba(0,0,0,0.9)]"
const SHADOW_SM = "drop-shadow-[0_0.2cqw_0.8cqw_rgba(0,0,0,0.9)]"

/**
 * Poster overlay. The artwork is the full-bleed background; all text sits on top.
 * Four distinct design languages:
 *
 *  - classic  centred traditional serif with an ornament
 *  - modern   left-aligned editorial sans with hairline rules
 *  - bold     solid colour bars, heavy type, sticker prices
 *  - elegant  centred fine-dining serif, wide tracking, gold hairlines
 *
 * Dish rows always come from the same list that was rendered into the artwork, so
 * the printed names can never disagree with the pictured dishes.
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
  const tpl = VALID.includes(template) ? template : "classic"
  const items = dishes.slice(0, 2)
  const [imgFailed, setImgFailed] = useState(false)
  const showArtwork = artworkUrl && !imgFailed
  const phoneHref = orderPhone ? `tel:${orderPhone.replace(/[^+\d]/g, "")}` : null
  const hasPhone = Boolean(phoneHref && orderPhone)

  const qr = (size: "qr" | "qrSm") =>
    qrUrl ? (
      <div className={`shrink-0 rounded-[0.5cqw] bg-white p-[0.45cqw] shadow-md ${T[size]}`}>
        <QRCodeSVG
          value={qrUrl}
          size={64}
          level="M"
          marginSize={0}
          bgColor="#FFFFFF"
          fgColor="#1F1B16"
          className="h-full w-full"
        />
      </div>
    ) : null

  const priceOf = (d: PosterDish) =>
    typeof d.price === "number" && d.price > 0 ? formatPrice(d.price) : null

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{ aspectRatio: ratioToAspect(ratio), containerType: "inline-size" }}
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
          style={{ background: `linear-gradient(150deg, #1A1A1A 0%, #3A2A1A 55%, ${accent}66 100%)` }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-[10%] w-[10%] text-white/40" />
          </div>
        </div>
      )}

      {/* ── Legibility treatment (per design) ── */}
      {tpl === "bold" ? (
        <div
          className="absolute inset-x-0 bottom-0 h-[46%]"
          style={{
            background: `linear-gradient(to top, ${accent}00 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.9) 100%)`,
          }}
        />
      ) : tpl === "elegant" ? (
        <>
          <div className="absolute inset-x-0 top-0 h-[32%] bg-gradient-to-b from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[56%] bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
        </>
      ) : tpl === "modern" ? (
        <>
          <div className="absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-black/55 via-black/18 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[54%] bg-gradient-to-t from-black/80 via-black/34 to-transparent" />
        </>
      ) : (
        <>
          <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-black/72 via-black/26 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/86 via-black/40 to-transparent" />
        </>
      )}

      {/* ══════════ BOLD — solid bars, heavy type, sticker prices ══════════ */}
      {tpl === "bold" && (
        <>
          <div
            className="absolute inset-x-0 top-0 px-[3cqw] py-[1.1cqw] text-center"
            style={{ background: accent }}
          >
            <h3 className={`font-black uppercase leading-tight tracking-[0.04em] text-white ${T.nameL}`}>
              {restaurantName}
            </h3>
          </div>

          <div className="absolute inset-x-0 bottom-0">
            <div className={`px-[3cqw] pb-[1cqw]`}>
              {items.length > 0 && (
                <ul className="space-y-[0.7cqw]">
                  {items.map((d) => (
                    <li key={d.name} className="flex items-center gap-[1cqw]">
                      <span className={`min-w-0 truncate font-black uppercase tracking-wide text-white ${T.dish} ${SHADOW}`}>
                        {d.name}
                      </span>
                      <span className="mb-[0.3cqw] min-w-[1cqw] flex-1 border-b border-white/45" />
                      {priceOf(d) && (
                        <span
                          className={`shrink-0 rounded-[0.6cqw] px-[0.9cqw] py-[0.25cqw] font-black text-white ${T.dishSm}`}
                          style={{ background: accent, boxShadow: "0 0.2cqw 0.7cqw rgba(0,0,0,0.55)" }}
                        >
                          {priceOf(d)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div
              className="flex items-center justify-between gap-[1cqw] px-[3cqw] py-[1cqw]"
              style={{ background: accent }}
            >
              {hasPhone && orderPhone ? (
                <a href={phoneHref!} className="flex items-center gap-[0.7cqw] text-white">
                  <Phone className="h-[1.5cqw] w-[1.5cqw]" />
                  <span className={`font-black tracking-wide whitespace-nowrap ${T.phone}`}>
                    {orderPhone}
                  </span>
                </a>
              ) : (
                <span />
              )}
              {qrUrl && (
                <div className="flex items-center gap-[0.8cqw]">
                  <span className={`font-black uppercase tracking-[0.2em] text-white ${T.caption}`}>
                    Scan to Order
                  </span>
                  {qr("qrSm")}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ══════════ ELEGANT — centred fine-dining, wide tracking ══════════ */}
      {tpl === "elegant" && (
        <div className="absolute inset-0 flex flex-col justify-between">
          <header className={`px-[4cqw] pt-[2.6cqw] text-center`}>
            <div className="mx-auto h-[1px] w-[5cqw]" style={{ background: accent }} />
            <h3
              className={`mt-[1.2cqw] font-serif font-light uppercase leading-tight tracking-[0.3em] text-white ${T.nameM} ${SHADOW}`}
            >
              {restaurantName}
            </h3>
            <div className="mx-auto mt-[1.2cqw] h-[1px] w-[5cqw]" style={{ background: accent }} />
          </header>

          <footer className="px-[4cqw] pb-[2cqw] text-center">
            {items.length > 0 && (
              <>
                <p
                  className={`mb-[1cqw] font-medium uppercase tracking-[0.4em] ${T.label} ${SHADOW_SM}`}
                  style={{ color: accent }}
                >
                  The Menu
                </p>
                <div className="mx-auto max-w-[62%] space-y-[0.7cqw]">
                  {items.map((d) => (
                    <div key={d.name} className="flex items-baseline gap-[1cqw] text-white">
                      <span className={`min-w-0 truncate font-serif tracking-wide ${T.dishSm} ${SHADOW_SM}`}>
                        {d.name}
                      </span>
                      <span className="mb-[0.2cqw] min-w-[1cqw] flex-1 border-b border-dotted border-white/35" />
                      {priceOf(d) && (
                        <span className={`shrink-0 font-serif ${T.dishSm} ${SHADOW_SM}`} style={{ color: accent }}>
                          {priceOf(d)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-[1.8cqw] flex flex-col items-center gap-[0.9cqw]">
              {hasPhone && orderPhone && (
                <a
                  href={phoneHref!}
                  className="flex items-center gap-[0.7cqw] rounded-full border px-[1.6cqw] py-[0.35cqw]"
                  style={{ borderColor: accent, color: accent }}
                >
                  <Phone className="h-[1.3cqw] w-[1.3cqw]" />
                  <span className={`font-medium tracking-[0.18em] ${T.caption}`}>{orderPhone}</span>
                </a>
              )}
              {qrUrl && (
                <div className="flex flex-col items-center gap-[0.5cqw]">
                  {qr("qrSm")}
                  <span className="font-medium uppercase tracking-[0.32em]" style={{ color: accent, fontSize: "0.85cqw" }}>
                    Scan to Order
                  </span>
                </div>
              )}
            </div>
          </footer>
        </div>
      )}

      {/* ══════════ MODERN — left editorial sans, hairline rules ══════════ */}
      {tpl === "modern" && (
        <div className="absolute inset-0 flex flex-col justify-between">
          <header className={`px-[3.4cqw] pt-[2.4cqw]`}>
            <h3 className={`font-semibold uppercase leading-tight tracking-[0.28em] text-white ${T.nameM} ${SHADOW}`}>
              {restaurantName}
            </h3>
            <div className="mt-[0.8cqw] h-[1px] w-[4cqw]" style={{ background: accent }} />
          </header>

          <footer className={`px-[3.4cqw] pb-[2cqw]`}>
            {items.length > 0 && (
              <div className="mx-auto max-w-[78%] space-y-[1cqw]">
                {items.map((d) => (
                  <div
                    key={d.name}
                    className="border-t pt-[0.7cqw]"
                    style={{ borderColor: "rgba(255,255,255,0.4)" }}
                  >
                    <div className="flex items-baseline justify-between gap-[1.4cqw] text-white">
                      <span className={`min-w-0 truncate font-semibold uppercase tracking-[0.16em] ${T.dishSm} ${SHADOW_SM}`}>
                        {d.name}
                      </span>
                      {priceOf(d) && (
                        <span className={`shrink-0 font-bold ${T.dishSm} ${SHADOW_SM}`} style={{ color: accent }}>
                          {priceOf(d)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-[1.6cqw] flex items-center justify-between gap-[1cqw]">
              {hasPhone && orderPhone ? (
                <a
                  href={phoneHref!}
                  className="flex items-center gap-[0.7cqw] rounded-full border px-[1.4cqw] py-[0.5cqw]"
                  style={{ borderColor: "rgba(255,255,255,0.5)", color: "#fff" }}
                >
                  <Phone className="h-[1.3cqw] w-[1.3cqw]" style={{ color: accent }} />
                  <span className={`font-bold tracking-wide whitespace-nowrap ${T.phone}`}>{orderPhone}</span>
                </a>
              ) : (
                <div />
              )}
              {qrUrl && (
                <div className="flex items-center gap-[0.8cqw]">
                  <p
                    className={`text-right font-bold uppercase leading-tight tracking-[0.18em] text-white ${T.caption} ${SHADOW_SM}`}
                  >
                    Scan to
                    <br />
                    Order
                  </p>
                  {qr("qrSm")}
                </div>
              )}
            </div>
          </footer>
        </div>
      )}

      {/* ══════════ CLASSIC — centred traditional serif + ornament ══════════ */}
      {tpl === "classic" && (
        <div className="absolute inset-0 flex flex-col justify-between">
          <header className="px-[3cqw] pt-[2.4cqw] text-center">
            <h3 className={`font-serif font-bold uppercase leading-tight tracking-[0.16em] text-white ${T.nameXL} ${SHADOW}`}>
              {restaurantName}
            </h3>
            <div className="mt-[1cqw] flex items-center justify-center gap-[0.9cqw]">
              <span className="h-[1px] w-[3.2cqw]" style={{ background: accent }} />
              <span className="text-[1.5cqw] leading-none" style={{ color: accent }}>
                ✦
              </span>
              <span className="h-[1px] w-[3.2cqw]" style={{ background: accent }} />
            </div>
          </header>

          <footer className="px-[3.4cqw] pb-[2.2cqw] text-center">
            {items.length > 0 && (
              <>
                <p
                  className={`mb-[1cqw] font-semibold uppercase tracking-[0.35em] ${T.label}`}
                  style={{ color: accent, textShadow: "0 0.15cqw 0.4cqw rgba(0,0,0,0.85)" }}
                >
                  Today&apos;s Specials
                </p>
                <div className="mx-auto max-w-[68%] space-y-[0.7cqw]">
                  {items.map((d) => (
                    <div key={d.name} className="flex items-baseline gap-[1cqw] text-white">
                      <span className={`min-w-0 truncate font-serif font-medium ${T.dishSm} ${SHADOW_SM}`}>
                        {d.name}
                      </span>
                      <span className="mb-[0.2cqw] min-w-[1cqw] flex-1 border-b border-dotted border-white/40" />
                      {priceOf(d) && (
                        <span className={`shrink-0 font-bold ${T.dishSm} ${SHADOW_SM}`} style={{ color: accent }}>
                          {priceOf(d)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-[1.6cqw] flex items-center justify-center gap-[1.6cqw]">
              {hasPhone && orderPhone && (
                <a
                  href={phoneHref!}
                  className="flex items-center gap-[0.7cqw] rounded-full bg-white/95 px-[1.5cqw] py-[0.55cqw] shadow-md"
                  style={{ color: "#1F1B16" }}
                >
                  <Phone className="h-[1.3cqw] w-[1.3cqw]" style={{ color: accent }} />
                  <span className={`font-bold tracking-wide whitespace-nowrap ${T.phone}`}>{orderPhone}</span>
                </a>
              )}
              {qrUrl && (
                <div className="flex items-center gap-[0.9cqw]">
                  <p
                    className={`text-right font-bold uppercase leading-tight tracking-[0.18em] text-white ${T.caption} ${SHADOW_SM}`}
                  >
                    Scan to
                    <br />
                    Order
                  </p>
                  {qr("qr")}
                </div>
              )}
            </div>
          </footer>
        </div>
      )}
    </div>
  )
}