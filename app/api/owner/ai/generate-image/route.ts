import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limiter"
import { csrfGuard } from "@/lib/csrf"
import { safeRoute } from "@/lib/api-error"
import { getEffectiveLimits, type Plan } from "@/lib/subscription"
import { generateImage, buildFoodPostPrompt } from "@/lib/ai/image-generation"
import { z } from "zod"

const schema = z.object({
  prompt: z.string().min(3).max(1000),
  caption: z.string().optional(),
  aspect_ratio: z.string().optional(),
  resolution: z.enum(["1K", "2K"]).optional(),
  dish_ids: z.array(z.string().uuid()).max(4).optional(),
  template: z.string().optional(),
  language: z.enum(["en", "ur"]).optional(),
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

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  // Fetch dish images for reference
  let dishNames: string[] = []
  let referenceImages: string[] = []
  if (parsed.data.dish_ids && parsed.data.dish_ids.length > 0) {
    const { data: dishes } = await supabase
      .from("dishes")
      .select("name_en, name_ur, image_url")
      .in("id", parsed.data.dish_ids)
      .eq("restaurant_id", restaurant.id)

    if (dishes) {
      dishNames = dishes.map((d: any) => d.name_en || d.name_ur).filter(Boolean)
      referenceImages = dishes.map((d: any) => d.image_url).filter(Boolean)
    }
  }

  // Build the image prompt
  const imagePrompt = buildFoodPostPrompt({
    restaurantName: restaurant.name,
    dishNames,
    caption: parsed.data.caption || parsed.data.prompt,
    language: parsed.data.language || "en",
    template: parsed.data.template,
  })

  try {
    const result = await generateImage({
      prompt: imagePrompt,
      aspectRatio: parsed.data.aspect_ratio || "1:1",
      resolution: parsed.data.resolution || "1K",
      referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
    })

    // Upload to Supabase Storage
    const buffer = Buffer.from(result.b64_json, "base64")
    const fileName = `${restaurant.id}/${Date.now()}.png`

    const { data: upload } = await admin.storage
      .from("ai-post-images")
      .upload(fileName, buffer, {
        contentType: "image/png",
        upsert: false,
      })

    if (!upload) {
      return NextResponse.json({
        image_b64: result.b64_json,
        image_url: null,
        error: "Image generated but storage upload failed",
      })
    }

    const { data: { publicUrl } } = admin.storage
      .from("ai-post-images")
      .getPublicUrl(fileName)

    return NextResponse.json({
      image_b64: result.b64_json,
      image_url: publicUrl,
      revised_prompt: result.revised_prompt,
    })
  } catch (err: any) {
    console.error("[AI Generate Image Error]", err)
    return NextResponse.json({ error: err.message || "Image generation failed" }, { status: 500 })
  }
})
