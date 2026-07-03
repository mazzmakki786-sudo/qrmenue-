const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/images"

export interface GenerateImageOptions {
  prompt: string
  aspectRatio?: string
  resolution?: "1K" | "2K"
  referenceImages?: string[]
}

export interface GenerateImageResult {
  b64_json: string
  revised_prompt?: string
  model_used?: string
}

const FALLBACK_MODELS = [
  "x-ai/grok-imagine-image-quality",
  "bytedance-seed/seedream-4.5",
  "black-forest-labs/flux.2-klein-4b",
  "sourceful/riverflow-v2-fast-preview",
  "google/gemini-2.5-flash-image",
]

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error("OPENROUTER_API_KEY is not set")
  return key
}

function getConfiguredModel(): string {
  return process.env.OPENROUTER_MODEL || "x-ai/grok-imagine-image-quality"
}

async function tryGenerateImage(
  apiKey: string,
  model: string,
  options: GenerateImageOptions,
): Promise<GenerateImageResult> {
  const body: Record<string, unknown> = {
    model,
    prompt: options.prompt,
    n: 1,
  }

  if (options.aspectRatio) body.aspect_ratio = options.aspectRatio
  if (options.resolution) body.resolution = options.resolution
  if (options.referenceImages?.length) {
    body.input_references = options.referenceImages.map((url) => ({ url, type: "image_url" }))
  }

  const res = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    let detail = ""
    try {
      const err = await res.json()
      detail = err.error?.message || err.error || JSON.stringify(err)
    } catch {}
    throw new Error(`OpenRouter ${model} error (${res.status}): ${detail}`)
  }

  const data = await res.json()
  const image = data.data?.[0]
  if (!image?.b64_json) {
    throw new Error(`No image data from ${model}`)
  }

  return {
    b64_json: image.b64_json,
    revised_prompt: image.revised_prompt,
    model_used: model,
  }
}

export async function generateImage(options: GenerateImageOptions): Promise<GenerateImageResult> {
  const apiKey = getApiKey()
  const configuredModel = getConfiguredModel()
  const models = [configuredModel, ...FALLBACK_MODELS.filter((m) => m !== configuredModel)]
  let lastError: Error | null = null

  for (const model of models) {
    try {
      return await tryGenerateImage(apiKey, model, options)
    } catch (err) {
      lastError = err as Error
      console.warn(`[AI Image] model ${model} failed:`, (err as Error).message)
    }
  }

  throw new Error(lastError?.message || "All image generation models failed")
}

export function buildFoodPostPrompt(params: {
  restaurantName: string
  dishNames: string[]
  caption: string
  language: string
  template?: string
}): string {
  const dishList = params.dishNames.join(", ")
  const lang = params.language === "ur" ? "Urdu script text" : "English text"

  return `Professional social media post for "${params.restaurantName}" restaurant.
Show a beautiful food photography composition featuring: ${dishList}.
Style: restaurant promotional post, appetizing food presentation, professional lighting, clean background.
Text on image (${lang}): "${params.caption}"
Design: modern foodie aesthetic, warm inviting colors, restaurant branding feel.
Do NOT include phone numbers, addresses, or contact info in the image.`
}
