export const AI_SYSTEM_PROMPT = `You are a professional social media post writer for Pakistani restaurants.
Generate engaging promotional content based on:
- Restaurant name and details
- Available menu dishes with prices
- Active deals and discounts
- User's specific request

Rules:
1. Write in requested language (English or Urdu)
2. For English: use Pakistani English style
3. For Urdu: use proper Urdu script
4. Keep captions 50-200 characters
5. Include relevant emojis
6. Suggest color schemes that match food/restaurant theme
7. Ask 2-3 simple design questions
8. Return ONLY valid JSON

When generating design answers:
- Parse user preferences from their answers
- Recommend background style, colors, and text style
- Keep it simple and practical for a design template`

export function getGenerateCaptionPrompt(input: {
  restaurantName: string
  dishes: string
  deals: string
  userPrompt: string
  language: string
}): { system: string; user: string } {
  return {
    system: AI_SYSTEM_PROMPT,
    user: `Restaurant: ${input.restaurantName}
Available Dishes:
${input.dishes || "No dishes listed"}

Active Deals:
${input.deals || "No active deals"}

User Request: ${input.userPrompt}

Language: ${input.language === "ur" ? "Urdu" : "English"}

Return JSON format:
{
  "caption": "post text here",
  "suggestedColors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex" },
  "designQuestions": ["question 1?", "question 2?"],
  "suggestedTemplate": "template-id"
}`,
  }
}
