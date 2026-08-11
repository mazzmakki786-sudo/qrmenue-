import { createLogger } from "@/lib/logger"

const log = createLogger("ai-generator")

// ─────────────────────────────────────────────────────────────────────────────
// Cloudflare Workers AI Image Generation (FLUX.1 [schnell])
// https://developers.cloudflare.com/workers-ai/
// POST https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{model}
//   - model "@cf/black-forest-labs/flux-1-schnell" produces a 1024x1024 JPEG
//   - accepts { prompt, steps } only; returns base64 in { result.image }
// ─────────────────────────────────────────────────────────────────────────────

export const AI_IMAGE_MODEL =
  process.env.CLOUDFLARE_AI_MODEL || "@cf/black-forest-labs/flux-1-schnell"

const CLOUDFLARE_AI_BASE_URL =
  "https://api.cloudflare.com/client/v4/accounts"

/** Supported poster aspect ratios (width:height). */
export const AI_ASPECT_RATIOS = ["1:1", "4:3", "3:4", "16:9", "9:16"] as const
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
// Poster design rules — always applied to the AI prompt
// ─────────────────────────────────────────────────────────────────────────────

export const POSTER_DESIGN_RULES = `Design rules for a professional restaurant promotional poster (ALWAYS follow):
- Do NOT render any text, letters, numbers, words, logos, or watermarks inside the image — the dish names, prices, and restaurant name are added as clean HTML text on top afterward, so the artwork must be pure imagery with empty (clean) space reserved in the areas where text will go.
- Center-weighted composition: keep the main food/plate centered and visually dominant.
- Leave clean negative space at the top for a headline, and at the bottom for a footer.
- Mouth-watering, appetizing food photography: realistic, freshly plated, steam/smoke where suitable, vibrant natural colors.
- Restaurant-quality presentation: garnishes, props, warm ambient lighting, shallow depth of field.
- No people, no hands, no faces, no brand logos, no props with written text (no newspapers, no labels on bottles).
- Professional advertising photography style, high resolution, sharp focus on food.`

// ─────────────────────────────────────────────────────────────────────────────
// Design templates (3) — how the artwork is composed
// ─────────────────────────────────────────────────────────────────────────────

export const AI_TEMPLATES = {
  classic: {
    label: "Classic Feast",
    desc: "Hero dish in the center with a clean, balanced spread of all selected dishes around it",
  },
  modern: {
    label: "Modern Minimalist",
    desc: "One large hero dish centered on a clean studio background, lots of empty space, premium look",
  },
  festive: {
    label: "Festive Celebration",
    desc: "Energetic celebratory layout with vibrant decorations, bunting accents, and a lively table spread",
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

/** Build the final artwork prompt from template + palette + dish context. */
export function buildArtworkPrompt(opts: {
  templateKey: AITemplateKey
  colorScheme: AIColorSchemeKey
  dishNames: string[]
  customPrompt?: string
  restaurantName: string
}): string {
  const template = AI_TEMPLATES[opts.templateKey]
  const scheme = AI_COLOR_SCHEMES[opts.colorScheme]

  const dishList =
    opts.dishNames.length > 0
      ? opts.dishNames.join(", ")
      : "a delicious spread of food"

  if (opts.customPrompt && opts.customPrompt.trim()) {
    // Advanced mode — owner writes their own vision; still enforce the rules
    return `${opts.customPrompt.trim()} ${POSTER_DESIGN_RULES}`
  }

  return `Promotional poster artwork for "${opts.restaurantName}", a restaurant.
Show these dishes (photorealistic food): ${dishList}.
Layout: ${template.label} — ${template.desc}.
Color palette: ${scheme.palette}.
${POSTER_DESIGN_RULES}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Cloudflare Workers AI call
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a poster artwork image via Cloudflare Workers AI (FLUX.1 [schnell]).
 * Returns base64 image data; throws on failure with a readable message.
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

  // FLUX.1 [schnell] outputs a fixed 1024x1024 canvas; the requested aspect
  // ratio is enforced by the frontend via object-fit + CSS aspect ratio.

  const url = `${CLOUDFLARE_AI_BASE_URL}/${accountId}/ai/run/${AI_IMAGE_MODEL}`
  const payload = {
    prompt: options.prompt,
    steps: 4,
    seed: Math.floor(Math.random() * 10),
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