import { createLogger } from "@/lib/logger"

const log = createLogger("ai-generator")

// ─────────────────────────────────────────────────────────────────────────────
// Gemini Image Generation (Imagen via Gemini API)
// https://ai.google.dev/gemini-api/docs/image-generation
// POST {GEMINI_API_BASE_URL}/v1beta/models/{model}:generateContent
//   - model "imagen-4.0" (or "imagen-3.0") produces a single 1024x1024 image
//   - model "gemini-2.5-flash-image" accepts multiple candidates + aspect ratios
// ─────────────────────────────────────────────────────────────────────────────

export const AI_IMAGE_MODEL =
  process.env.GEMINI_IMAGE_MODEL || "imagen-3.0-generate-001"

const GEMINI_BASE_URL =
  process.env.GEMINI_API_BASE_URL || "https://generativelanguage.googleapis.com"

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
  /** Base64-encoded PNG of the generated image (no data: prefix). */
  b64: string
  mimeType: string
}

const RATIO_TO_SIZE: Record<AIAspectRatio, [number, number]> = {
  "1:1": [1024, 1024],
  "4:3": [1216, 912],
  "3:4": [912, 1216],
  "16:9": [1344, 768],
  "9:16": [768, 1344],
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
// Gemini API call
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a poster artwork image via the Gemini (Imagen) API.
 * Returns base64 image data; throws on failure with a readable message.
 */
export async function generatePosterArtwork(
  options: AIPosterOptions
): Promise<AIPosterResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Contact support to enable AI posters."
    )
  }

  const url = `${GEMINI_BASE_URL}/v1beta/models/${AI_IMAGE_MODEL}:generateContent`
  const [width, height] = RATIO_TO_SIZE[options.ratio]

  const payload: Record<string, unknown> = {
    contents: [
      {
        parts: [{ text: options.prompt }],
      },
    ],
    generationConfig: {
      imageConfig: {
        aspectRatio: options.ratio,
        imageSize: `${width}x${height}`,
      },
      candidateCount: 1,
    },
  }

  const start = Date.now()
  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(payload),
      // Image generation takes 10-60s
      signal: AbortSignal.timeout(90_000),
    })
  } catch (err) {
    log.error("Gemini request failed", { error: String(err) })
    throw new Error("Could not reach the AI image service. Please try again.")
  }

  const elapsed = Date.now() - start
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    log.error("Gemini error response", { status: res.status, body: text.slice(0, 500) })
    if (res.status === 429) {
      throw new Error("AI service is busy — please wait a minute and try again.")
    }
    throw new Error(
      `AI image generation failed (${res.status}). Please try again.`
    )
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] } }[]
    error?: { message?: string }
  }

  if (json.error) {
    log.error("Gemini API error", { message: json.error.message })
    throw new Error("AI image generation was rejected. Please try again.")
  }

  const inlineData =
    json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData

  if (!inlineData?.data) {
    log.error("Gemini returned no image data", { elapsed })
    throw new Error("The AI returned no image. Please try again.")
  }

  log.info("Gemini image generated", { model: AI_IMAGE_MODEL, ms: elapsed })
  return { b64: inlineData.data, mimeType: inlineData.mimeType || "image/png" }
}
