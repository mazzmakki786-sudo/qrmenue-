import sharp from "sharp"
import { createLogger } from "@/lib/logger"
import type { AIColorSchemeKey } from "@/lib/ai-generator"

const log = createLogger("poster-artwork")

/** Square canvas the poster artwork is rendered at. */
export const ARTWORK_SIZE = 1024

/**
 * Text zones reserved for the HTML overlay, per design template.
 * The dish photos are laid out strictly between them, so the overlay never has to
 * fight the artwork for space — and the row stays perfectly aligned in every
 * design because the slots are computed, never eyeballed.
 */
const ZONES: Record<string, { top: number; bottom: number }> = {
  classic: { top: 232, bottom: 300 },
  modern: { top: 200, bottom: 320 },
  // bold uses solid colour bars top and bottom, so it needs less headroom up top
  bold: { top: 150, bottom: 356 },
  elegant: { top: 252, bottom: 322 },
}

/** Accent palette per colour scheme, used for the fallback backdrop wash. */
const BACKDROP: Record<AIColorSchemeKey, { top: string; bottom: string }> = {
  appetizing: { top: "#2A1109", bottom: "#4A1A0C" },
  fresh: { top: "#0E2417", bottom: "#14361F" },
  royal: { top: "#14110A", bottom: "#2A2110" },
}

export interface PosterArtworkDish {
  name: string
  /** The restaurant's real photo of this dish — the ground truth for the poster. */
  imageUrl?: string | null
}

export interface PosterArtworkOptions {
  dishes: PosterArtworkDish[]
  colorScheme: AIColorSchemeKey
  /** Design template — decides how much room the overlay needs. */
  templateKey?: string
  /** Optional AI ambience image used as the backdrop behind the dish photos. */
  backdropImage?: Buffer | null
}

export interface PosterArtworkResult {
  buffer: Buffer
  mimeType: "image/jpeg"
  /** "photo" = composed from real dish photos, "ai" = ambience only. */
  source: "photo" | "ai"
  /**
   * Dishes whose PHOTO actually made it into the artwork. The caller must render
   * the text overlay from this same list, so the printed names and the pictured
   * dishes can never disagree.
   */
  usedDishNames: string[]
}

/** Warm, appetising grade. Deliberately mild so highlights are not blown further. */
const GRADE = {
  brightness: 1.0,
  saturation: 1.08,
} as const

const GAP = 18
const SIDE_PAD = 10
const CORNER_R = 26

/**
 * Fetch a dish photo and normalise it to a JPEG.
 * Returns null when the URL is missing or unreachable so callers can skip it.
 */
async function loadDishPhoto(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20_000) })
    if (!res.ok) return null
    const raw = Buffer.from(await res.arrayBuffer())
    if (raw.length < 1024) return null
    return await sharp(raw).rotate().jpeg({ quality: 92, mozjpeg: true }).toBuffer()
  } catch {
    return null
  }
}

function backdropSvg(top: string, bottom: string): Buffer {
  return Buffer.from(
    `<svg width="${ARTWORK_SIZE}" height="${ARTWORK_SIZE}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stop-color="${top}"/>
          <stop offset="100%" stop-color="${bottom}"/>
        </linearGradient>
      </defs>
      <rect width="${ARTWORK_SIZE}" height="${ARTWORK_SIZE}" fill="url(#g)"/>
    </svg>`
  )
}

/** Rounded-corner alpha mask applied to each dish photo. */
function cornerMask(w: number, h: number): Buffer {
  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${w}" height="${h}" rx="${CORNER_R}" ry="${CORNER_R}" fill="#fff"/>
    </svg>`
  )
}

/** Hairline edge so each dish reads as its own card against the backdrop. */
function edgeStroke(w: number, h: number): Buffer {
  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${CORNER_R}" ry="${CORNER_R}"
            fill="none" stroke="rgba(255,255,255,0.20)" stroke-width="2"/>
    </svg>`
  )
}

/**
 * Build the poster artwork.
 *
 * The restaurant's REAL dish photos are the source of truth — that is what makes
 * karahi look like karahi and chicken tikka look like chicken tikka. A
 * text-to-image model can only guess, so it is never asked to draw a dish; AI is
 * used only for the atmospheric backdrop.
 *
 * Layout is deterministic: identical slots, identical gaps, identical top edge,
 * so the row of dishes is always perfectly aligned. A dish with no usable photo
 * is dropped and reported back so the text overlay can drop it too.
 */
export async function buildPosterArtwork(
  opts: PosterArtworkOptions
): Promise<PosterArtworkResult> {
  const started = Date.now()

  // Keep the photo attached to its dish so the used set can be reported exactly.
  const resolved = await Promise.all(
    opts.dishes.map(async (d) => ({
      name: d.name,
      photo: d.imageUrl ? await loadDishPhoto(d.imageUrl) : null,
    }))
  )
  const usable = resolved.filter((r): r is { name: string; photo: Buffer } => r.photo !== null)

  // ── No real photos: ambience only, no dish is claimed ──
  if (usable.length === 0) {
    const { top, bottom } = BACKDROP[opts.colorScheme] || BACKDROP.appetizing
    const buffer = opts.backdropImage
      ? await sharp(opts.backdropImage)
          .resize(ARTWORK_SIZE, ARTWORK_SIZE, { fit: "cover" })
          .modulate({ brightness: 0.85 })
          .jpeg({ quality: 90, mozjpeg: true })
          .toBuffer()
      : await sharp(backdropSvg(top, bottom))
          .jpeg({ quality: 90, mozjpeg: true })
          .toBuffer()
    log.info("poster artwork: ambience only (no usable dish photos)")
    return { buffer, mimeType: "image/jpeg", source: "ai", usedDishNames: [] }
  }

  const usedDishNames = usable.map((r) => r.name)

  // ── Backdrop: AI ambience > blurred crop of the dish > gradient wash ──
  const { top, bottom } = BACKDROP[opts.colorScheme] || BACKDROP.appetizing
  let base: Buffer
  let backdropKind: "ai" | "photo"
  if (opts.backdropImage) {
    base = await sharp(opts.backdropImage)
      .resize(ARTWORK_SIZE, ARTWORK_SIZE, { fit: "cover" })
      .blur(26)
      .modulate({ brightness: 0.66 })
      .toBuffer()
    backdropKind = "ai"
  } else {
    base = await sharp(usable[0].photo)
      .resize(ARTWORK_SIZE, ARTWORK_SIZE, { fit: "cover", position: "attention" })
      .blur(30)
      .modulate({ brightness: 0.6, saturation: 1.1 })
      .toBuffer()
    backdropKind = "photo"
  }

  // ── Strictly between the reserved text zones for this design ──
  const zone = ZONES[opts.templateKey || "classic"] || ZONES.classic
  const n = usable.length
  const bandH = ARTWORK_SIZE - zone.top - zone.bottom
  const slotW = Math.min(
    Math.floor((ARTWORK_SIZE - SIDE_PAD * 2 - GAP * (n - 1)) / n),
    bandH
  )
  const slotH = slotW // square slots keep the row optically even
  const rowW = slotW * n + GAP * (n - 1)
  const rowLeft = Math.round((ARTWORK_SIZE - rowW) / 2)
  const bandTop = zone.top

  const layers: sharp.OverlayOptions[] = []
  for (let i = 0; i < n; i++) {
    const left = rowLeft + i * (slotW + GAP)

    const shadow = await sharp({
      create: {
        width: slotW,
        height: slotH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0.55 },
      },
    })
      .blur(18)
      .png()
      .toBuffer()
    layers.push({ input: shadow, left, top: bandTop + 12 })

    // Same crop rules, same grade, same radius for every dish — a matched set.
    const card = await sharp(usable[i].photo)
      .resize(slotW, slotH, { fit: "cover", position: "attention" })
      .modulate(GRADE)
      .sharpen({ sigma: 1 })
      .composite([
        { input: cornerMask(slotW, slotH), blend: "dest-in" },
        { input: edgeStroke(slotW, slotH), blend: "over" },
      ])
      .png()
      .toBuffer()
    layers.push({ input: card, left, top: bandTop })
  }

  const buffer = await sharp(base)
    .composite(layers)
    .modulate({ saturation: 1.04 })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer()

  log.info("poster artwork built", {
    requested: opts.dishes.length,
    usedPhotos: n,
    usedDishNames,
    backdrop: backdropKind,
    slot: `${slotW}x${slotH}`,
    rowLeft,
    ms: Date.now() - started,
  })

  return {
    buffer,
    mimeType: "image/jpeg",
    source: "photo",
    usedDishNames,
  }
}