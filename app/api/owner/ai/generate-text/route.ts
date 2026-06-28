import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limiter"
import { csrfGuard } from "@/lib/csrf"
import { safeRoute } from "@/lib/api-error"
import { getEffectiveLimits, type Plan } from "@/lib/subscription"
import { generateDesignQuestions, generatePostCaption } from "@/lib/ai"
import { z } from "zod"

const generateSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters").max(1000),
  language: z.enum(["en", "ur"]),
  dish_ids: z.array(z.string().uuid()).max(4).optional(),
  deal_ids: z.array(z.string().uuid()).optional(),
  template: z.string().optional(),
  layout: z.string().optional(),
  mode: z.enum(["questions-only", "generate-caption"]).optional(),
  design_answers: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
})

export const POST = safeRoute(async (request) => {
  await checkRateLimit(request, "ai:generate")

  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, plan, plan_limits_override, is_active, is_suspended")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  if (!restaurant.is_active) return NextResponse.json({ error: "Restaurant is not active" }, { status: 403 })
  if (restaurant.is_suspended) return NextResponse.json({ error: "Restaurant is suspended" }, { status: 403 })

  const limits = getEffectiveLimits(restaurant.plan as Plan, restaurant.plan_limits_override as any)
  if (limits.aiPostsPerMonth <= 0) {
    return NextResponse.json({ error: "AI posts not available on your plan" }, { status: 403 })
  }

  const month = new Date().toISOString().slice(0, 7)
  const admin = createAdminClient()
  const { data: usage } = await admin
    .from("ai_usage")
    .select("count")
    .eq("restaurant_id", restaurant.id)
    .eq("month", month)
    .maybeSingle()

  if ((usage?.count ?? 0) >= limits.aiPostsPerMonth) {
    return NextResponse.json({ error: "Monthly AI post limit reached" }, { status: 403 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = generateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  // Fetch selected dishes
  let dishes: any[] = []
  if (parsed.data.dish_ids && parsed.data.dish_ids.length > 0) {
    const { data: dishData } = await supabase
      .from("dishes")
      .select("name_en, name_ur, price, description_en")
      .in("id", parsed.data.dish_ids)
      .eq("restaurant_id", restaurant.id)
    dishes = dishData || []
  }

  // Fetch selected deals
  let deals: any[] = []
  if (parsed.data.deal_ids && parsed.data.deal_ids.length > 0) {
    const { data: dealData } = await supabase
      .from("deals")
      .select("title_en, deal_type, deal_value, description_en")
      .in("id", parsed.data.deal_ids)
      .eq("restaurant_id", restaurant.id)
    deals = dealData || []
  }

  try {
    // Mode 1: Only generate design questions
    if (parsed.data.mode === "questions-only") {
      const questions = await generateDesignQuestions({
        restaurantName: restaurant.name,
        userPrompt: parsed.data.prompt,
        language: parsed.data.language,
        template: parsed.data.template || "minimal",
        layout: parsed.data.layout || "image-top-text-bottom",
      })

      return NextResponse.json({ questions })
    }

    // Mode 2: Generate caption with design answers
    const result = await generatePostCaption({
      restaurantName: restaurant.name,
      dishes,
      deals,
      userPrompt: parsed.data.prompt,
      language: parsed.data.language,
      designAnswers: parsed.data.design_answers || [],
      layout: parsed.data.layout || "image-top-text-bottom",
      template: parsed.data.template || "minimal",
    })

    return NextResponse.json({
      caption: result.caption,
      suggestedColors: result.suggestedColors,
    })
  } catch (err) {
    console.error("[AI Generate Text Error]", err)
    return NextResponse.json({ error: "AI generation failed. Please try again." }, { status: 500 })
  }
})
