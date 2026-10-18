import { createLogger } from "@/lib/logger"

const log = createLogger("ai-generator")

// ─────────────────────────────────────────────────────────────────────────────
// Cloudflare Workers AI Image Generation (FLUX.1 [schnell])
// https://developers.cloudflare.com/workers-ai/
// POST https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{model}
//   - returns base64 in { result.image }; accepts width/height in pixels
// ─────────────────────────────────────────────────────────────────────────────

export const AI_IMAGE_MODEL =
  process.env.CLOUDFLARE_AI_MODEL || "@cf/black-forest-labs/flux-1-schnell"

const CLOUDFLARE_AI_BASE_URL =
  "https://api.cloudflare.com/client/v4/accounts"

/** Supported poster aspect ratios (width:height). Only 1:1 is offered. */
export const AI_ASPECT_RATIOS = ["1:1"] as const
export type AIAspectRatio = (typeof AI_ASPECT_RATIOS)[number]

export interface AIPosterOptions {
  prompt: string
  templateKey: string
  colorScheme: string
  ratio: AIAspectRatio
  dishNames: string[]
}

export interface AIPosterResult {
  /** Base64-encoded image of the generated image (no data: prefix). */
  b64: string
  mimeType: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Design templates — how the poster is composed
// ─────────────────────────────────────────────────────────────────────────────

export const AI_TEMPLATES = {
  classic: {
    label: "Classic Feast",
    desc: "Warm traditional restaurant scene, soft candle glow, rich wooden table, centred hero presentation",
  },
  modern: {
    label: "Modern Minimalist",
    desc: "Bright clean studio backdrop, soft even light, pale neutral surface, lots of empty space",
  },
  bold: {
    label: "Street Bold",
    desc: "Energetic street-food scene, punchy high-contrast lighting, dark stall backdrop, vivid colour",
  },
  elegant: {
    label: "Fine Dining Luxe",
    desc: "Exclusive fine-dining ambience, black marble table, gold candlelight, deep shadows, discreet and premium",
  },
} as const

export type AITemplateKey = keyof typeof AI_TEMPLATES

// ─────────────────────────────────────────────────────────────────────────────
// Color schemes (3) — palette applied to the artwork
// ─────────────────────────────────────────────────────────────────────────────

export const AI_COLOR_SCHEMES = {
  appetizing: {
    label: "Appetizing Red",
    desc: "Warm reds & oranges that stimulate appetite",
    palette: "warm reds, deep oranges, rich browns, cream accents",
  },
  fresh: {
    label: "Fresh Green",
    desc: "Fresh greens & natural tones for healthy, vibrant feel",
    palette: "fresh greens, olive, natural wood tones, soft white",
  },
  royal: {
    label: "Royal Black & Gold",
    desc: "Elegant black & gold for premium, luxury branding",
    palette: "elegant black, rich gold, warm amber, ivory highlights",
  },
} as const

export type AIColorSchemeKey = keyof typeof AI_COLOR_SCHEMES

/**
 * Build the AI backdrop prompt.
 *
 * The dish photos themselves come from the restaurant's real menu images (see
 * lib/poster-artwork.ts), because a text-to-image model can only ever guess what
 * a dish looks like. AI is used solely for the atmospheric backdrop that sits
 * behind those photos — so it must contain NO food and NO text.
 */
export function buildBackdropPrompt(opts: {
  templateKey: AITemplateKey
  colorScheme: AIColorSchemeKey
  customPrompt?: string
}): string {
  if (opts.customPrompt && opts.customPrompt.trim()) {
    return `${opts.customPrompt.trim()} No text, no food, no people.`
  }
  const template = AI_TEMPLATES[opts.templateKey]
  const scheme = AI_COLOR_SCHEMES[opts.colorScheme]
  return `Restaurant table ambience backdrop — an empty, clean surface ready for food to be placed on top.
Scene: ${template.label} — ${template.desc}.
Color palette: ${scheme.palette}.
Mood: warm, inviting, softly lit, shallow depth of field, gentle bokeh, dark edges so white text stays readable.
Absolutely NO food, NO plates, NO cutlery, NO people, NO hands.
STRICTLY NO TEXT: no letters, numbers, words, logos, watermarks, menus, prices or signs anywhere.
Professional commercial photography, high resolution.`
}

// ─────────────────────────────────────────────────────────────────────────────
// Cloudflare Workers AI call
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a poster artwork image via Cloudflare Workers AI (FLUX.1 [schnell]).
 * Returns base64 image data; throws on failure with a readable message.
 *
 * NOTE: the flux-1-schnell input schema accepts ONLY { prompt, steps }.
 * Sending seed / width / height returns HTTP 400 "unevaluated properties".
 * The model natively outputs 1024x1024, which matches the 1:1 poster ratio.
 */
export async function generatePosterArtwork(
  options: AIPosterOptions
): Promise<AIPosterResult> {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID

  if (!apiToken || !accountId) {
    throw new Error(
      "CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID is not configured. Contact support to enable AI posters."
    )
  }

  const url = `${CLOUDFLARE_AI_BASE_URL}/${accountId}/ai/run/${AI_IMAGE_MODEL}`
  const payload = {
    prompt: options.prompt,
    // 8 is the documented maximum for flux-1-schnell and roughly doubles detail
    // over the default 4, for ~2x the neurons. Still ~$0.001 per image.
    steps: 8,
  }

  const start = Date.now()
  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(payload),
      // Image generation takes 10-60s
      signal: AbortSignal.timeout(90_000),
    })
  } catch (err) {
    log.error("Cloudflare request failed", { error: String(err) })
    throw new Error("Could not reach the AI image service. Please try again.")
  }

  const elapsed = Date.now() - start
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    log.error("Cloudflare error response", { status: res.status, body: text.slice(0, 500) })
    if (res.status === 429) {
      throw new Error("AI service is busy — please wait a minute and try again.")
    }
    throw new Error(
      `AI image generation failed (${res.status}). Please try again.`
    )
  }

  const json = (await res.json()) as {
    success?: boolean
    result?: { image?: string }
    errors?: { message?: string }[]
  }

  if (json.errors?.length) {
    log.error("Cloudflare API error", { message: json.errors[0]?.message })
    throw new Error("AI image generation was rejected. Please try again.")
  }

  const imageB64: string | undefined = json.result?.image

  if (!imageB64) {
    log.error("Cloudflare returned no image data", { elapsed })
    throw new Error("The AI returned no image. Please try again.")
  }

  log.info("Cloudflare image generated", { model: AI_IMAGE_MODEL, ms: elapsed })
  return { b64: imageB64, mimeType: "image/jpeg" }
}