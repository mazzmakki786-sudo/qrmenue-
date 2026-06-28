import { generateText } from "ai"
import { google } from "@ai-sdk/google"

const model = google("gemini-2.0-flash-lite")

export interface AiGenerateCaptionInput {
  restaurantName: string
  dishes: { name_en: string; name_ur?: string | null; price: number; description_en?: string | null }[]
  deals: { title_en: string; deal_type: string; deal_value: number; description_en?: string | null }[]
  userPrompt: string
  language: string
  designAnswers: { question: string; answer: string }[]
  layout: string
  template: string
}

export interface AiCaptionResult {
  caption: string
  suggestedColors: { primary: string; secondary: string; accent: string }
}

export async function generateDesignQuestions(input: {
  restaurantName: string
  userPrompt: string
  language: string
  template: string
  layout: string
}): Promise<string[]> {
  const systemPrompt = `You are a professional social media post designer helping a Pakistani restaurant create a promotional post.
Ask 3 short, specific design preference questions to help create the perfect post.

Rules:
- Each question must be short (under 60 chars)
- Questions should be yes/no or A/B choices
- Focus on visual style (not content)
- Return ONLY a JSON array of strings

Examples:
["Light or dark background?", "Bold text or elegant text?", "Simple or decorative borders?"]
["Want your logo visible?", "Bright colors or muted tones?", "Text at top or bottom?"]
["Food images prominent or subtle?", "Modern look or traditional?", "Include price tags?"]`

  const userMsg = `Restaurant: ${input.restaurantName}
User request: ${input.userPrompt}
Language: ${input.language === "ur" ? "Urdu" : "English"}
Template: ${input.template}
Layout: ${input.layout}

Generate 3 design preference questions (as a JSON array of strings):`

  const { text } = await generateText({
    model,
    system: systemPrompt,
    prompt: userMsg,
    temperature: 0.5,
    maxOutputTokens: 500,
  })

  try {
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim()
    const parsed = JSON.parse(cleaned)
    return Array.isArray(parsed) ? parsed.slice(0, 4) : [
      "Light or dark background?",
      "Bold text or subtle text?",
      "Show prices on the post?",
    ]
  } catch {
    return [
      "Light or dark background?",
      "Bold text or subtle text?",
      "Show prices on the post?",
    ]
  }
}

export async function generatePostCaption(input: AiGenerateCaptionInput): Promise<AiCaptionResult> {
  const dishesList = input.dishes
    .map((d) => `- ${d.name_en}${d.description_en ? `: ${d.description_en}` : ""} (Rs ${d.price})`)
    .join("\n")

  const dealsList = input.deals
    .map((d) => `- ${d.title_en} (${d.deal_type === "percentage" ? `${d.deal_value}% off` : `Rs ${d.deal_value} off`})${d.description_en ? `: ${d.description_en}` : ""}`)
    .join("\n")

  const designPrefs = input.designAnswers.map((da) => `${da.question} → ${da.answer}`).join("\n")

  const systemPrompt = `You are a professional social media post writer for Pakistani restaurants.
Generate an engaging promotional caption based on all provided context.
Return ONLY valid JSON.

Rules:
- Caption language: ${input.language === "ur" ? "Urdu (proper Urdu script)" : "English (Pakistani English style with local flavor)"}
- Keep caption 50-200 characters
- Include relevant food emojis
- Match the design preferences provided
- Consider layout: ${input.layout} and template: ${input.template}

Return JSON:
{
  "caption": "the post caption text",
  "suggestedColors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex" }
}`

  const userPrompt = `Restaurant: ${input.restaurantName}

Available Dishes:
${dishesList || "No dishes listed"}

Active Deals:
${dealsList || "No active deals"}

Design Preferences:
${designPrefs || "No specific preferences"}

User Request: ${input.userPrompt}

Layout: ${input.layout}
Template: ${input.template}

Generate the caption and suggest matching colors.`

  const { text } = await generateText({
    model,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.7,
    maxOutputTokens: 1000,
  })

  try {
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim()
    return JSON.parse(cleaned) as AiCaptionResult
  } catch {
    return {
      caption: text.slice(0, 200).replace(/[{}"]/g, "").trim(),
      suggestedColors: { primary: "#1a1a1a", secondary: "#25D366", accent: "#FF6B35" },
    }
  }
}
