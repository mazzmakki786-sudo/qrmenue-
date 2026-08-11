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

/** Actual output pixel sizes per ratio (multiples of 16 — FLUX constraint). */
export const AI_IMAGE_SIZES: Record<AIAspectRatio, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
}

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

export const POSTER_DESIGN_RULES = `Design rules for professional restaurant food photography (ALWAYS follow):
- STRICTLY NO TEXT: Do NOT render any letters, numbers, words, slogans, logos, watermarks, restaurant names, menus, prices, or signs anywhere in the image — no text of any kind.
- The dishes listed in the prompt MUST be the only subjects, shown exactly as described, centered in the frame and never cropped out.
- If two dishes are featured, place them side by side in the center of the frame, both fully visible and equally prominent.
- Mouth-watering, appetizing food photography: realistic, freshly plated, steam/smoke where suitable, vibrant natural colors.
- Restaurant-quality presentation: garnishes, props, warm ambient lighting, shallow depth of field.
- No people, no hands, no faces, no brand logos, no props with printed text (no newspapers, no labels on bottles).
- Professional advertising photography style, high resolution, sharp focus on the food.`

// ─────────────────────────────────────────────────────────────────────────────
// Dish descriptors — curated so FLUX renders the EXACT dish the owner selected
// (falls back to the dish name itself).
// ─────────────────────────────────────────────────────────────────────────────

const DISH_DESCRIPTORS: Record<string, string> = {
  "chicken biryani": "chicken biryani — long-grain basmati rice layered with spiced chicken, saffron, crispy fried onions and fresh mint",
  "beef biryani": "beef biryani — spiced basmati rice layered with tender beef, saffron and fried onions",
  biryani: "a hearty biryani — saffron basmati rice layered with spiced meat, crispy fried onions and mint",
  pulao: "vegetable pulao — fragrant basmati rice with carrots, green peas, whole spices and a drizzle of ghee",
  "mutton pulao": "mutton pulao — tender mutton pieces in fragrant spiced basmati rice with fried onions",
  nihari: "beef nihari — a slow-cooked shank stew in a thick spiced gravy, garnished with ginger, green chilies, coriander and lemon",
  "chicken karahi": "chicken karahi — a tomato-based wok-fried curry with ginger, garlic and green chilies",
  karahi: "a karahi curry — a wok-fried tomato-based meat curry with ginger, garlic and green chilies",
  "seekh kebab": "seekh kebabs — charred minced-meat skewers served with grilled onions and mint chutney",
  kebab: "grilled kebabs — charred skewers of spiced minced meat served with chutney",
  "chicken tikka": "charcoal chicken tikka — smoky, bright-orange grilled chicken pieces with char marks",
  tikka: "smoky marinated grilled meat tikka skewers with charred edges",
  haleem: "haleem — a slow-cooked lentil and meat porridge topped with fried onions, ginger, lemon and coriander",
  korma: "a rich, creamy chicken korma with a silky cashew gravy and a swirl of cream",
  daal: "daal — a comforting lentil curry with a tempering of fried garlic, cumin and chilies",
  "daal makhani": "daal makhani — black lentils slow-cooked with butter and cream",
  naan: "freshly baked naan bread brushed with butter",
  "garlic naan": "freshly baked garlic naan brushed with butter and herbs",
  roti: "freshly baked roti flatbread",
  chai: "a glass of masala chai — spiced milky tea with cardamom",
  tea: "a cup of masala chai with cardamom and cinnamon",
  zinger: "a crispy fried chicken burger with lettuce and spicy mayo",
  burger: "a gourmet beef burger with melted cheese, fresh lettuce and a brioche bun",
  fries: "a serving of golden crispy french fries",
  "french fries": "a serving of golden crispy french fries",
  pizza: "a wood-fired pizza with bubbling melted cheese and fresh basil",
  "ice cream": "a scoop of creamy ice cream",
  "chocolate shake": "a tall glass of thick chocolate milkshake topped with whipped cream",
  lassi: "a tall glass of creamy sweet lassi topped with pistachios",
  "cold coffee": "a tall glass of iced cold coffee with cream",
  salad: "a fresh garden salad with crisp vegetables",
}

// ─────────────────────────────────────────────────────────────────────────────
// Design templates (3) — how the artwork is composed
// ─────────────────────────────────────────────────────────────────────────────

export const AI_TEMPLATES = {
  classic: {
    label: "Classic Feast",
    desc: "Hero dishes in the center with a clean, balanced spread around them",
  },
  modern: {
    label: "Modern Minimalist",
    desc: "Dishes centered on a clean studio background, lots of empty space, premium look",
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

/** Build the final artwork prompt from template + palette + exact dish context. */
export function buildArtworkPrompt(opts: {
  templateKey: AITemplateKey
  colorScheme: AIColorSchemeKey
  dishNames: string[]
  customPrompt?: string
}): string {
  const template = AI_TEMPLATES[opts.templateKey]
  const scheme = AI_COLOR_SCHEMES[opts.colorScheme]

  if (opts.customPrompt && opts.customPrompt.trim()) {
    // Advanced mode — owner writes their own vision; still enforce the rules
    return `${opts.customPrompt.trim()} ${POSTER_DESIGN_RULES}`
  }

  const dishList =
    opts.dishNames.length > 0
      ? opts.dishNames
          .map((name) => {
            const key = name.trim().toLowerCase()
            return DISH_DESCRIPTORS[key] || `the exact dish "${name}", prepared authentically and beautifully plated`
          })
          .join("; ")
      : "a delicious spread of food"

  return `Premium restaurant food photography — one frame that shows ONLY these exact dishes: ${dishList}.
The dishes above MUST be the only subjects, each clearly identifiable, mouth-watering, and centered in the frame.
Style: ${template.label} — ${template.desc}.
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

  // FLUX.1 [schnell] accepts explicit width/height (multiples of 16) per the
  // AI_IMAGE_SIZES map; the poster overlay enforces the visual ratio.

  const url = `${CLOUDFLARE_AI_BASE_URL}/${accountId}/ai/run/${AI_IMAGE_MODEL}`
  const size = AI_IMAGE_SIZES[options.ratio]
  const payload = {
    prompt: options.prompt,
    steps: 4,
    seed: Math.floor(Math.random() * 10),
    width: size.width,
    height: size.height,
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