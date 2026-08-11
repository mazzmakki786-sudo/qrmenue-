import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server"
import { z } from "zod"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { csrfGuard } from "@/lib/csrf"
import { safeRoute } from "@/lib/api-error"
import { logOwnerAction, getIpSimple } from "@/lib/owner-audit"
import { getEffectiveLimits } from "@/lib/subscription"
import { getAiGenerationCount, incrementAiUsage, invalidateAiUsage } from "@/lib/ai-usage"
import {
  generatePosterArtwork,
  buildArtworkPrompt,
  AI_ASPECT_RATIOS,
  AI_TEMPLATES,
  AI_COLOR_SCHEMES,
  type AITemplateKey,
  type AIColorSchemeKey,
  type AIAspectRatio,
} from "@/lib/ai-generator"
import { createLogger } from "@/lib/logger"

const log = createLogger("owner-ai")

const dishItemSchema = z.object({
  name: z.string().trim().min(1).max(100),
  price: z.number().nonnegative().max(1000000).optional().nullable(),
})

const generateSchema = z.object({
  dishes: z.array(dishItemSchema).max(12).optional().default([]),
  templateKey: z.enum(Object.keys(AI_TEMPLATES) as [AITemplateKey, ...AITemplateKey[]]).default("classic"),
  colorScheme: z.enum(Object.keys(AI_COLOR_SCHEMES) as [AIColorSchemeKey, ...AIColorSchemeKey[]]).default("appetizing"),
  ratio: z.enum(AI_ASPECT_RATIOS as unknown as [AIAspectRatio, ...AIAspectRatio[]]).default("1:1"),
  customPrompt: z.string().max(2000).optional(),
  orderPhone: z.string().trim().max(30).optional().default(""),
})

export const GET = safeRoute(async (request) => {
  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 30, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, plan, plan_limits_override, is_active, is_suspended")
    .eq("owner_id", user.id)
    .maybeSingle()
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

  const [historyRes, usage] = await Promise.all([
    supabase
      .from("ai_poster_generations")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false })
      .limit(100),
    getAiGenerationCount(restaurant.id, supabase),
  ])

  if (historyRes.error) {
    log.error("Failed to fetch AI history", { error: historyRes.error.message })
    return NextResponse.json({ error: "Failed to fetch generations" }, { status: 400 })
  }

  const limits = getEffectiveLimits(
    restaurant.plan as any,
    restaurant.plan_limits_override as any
  )
  const limit = limits.aiGenerationsPerMonth ?? 0

  return NextResponse.json({
    generations: historyRes.data ?? [],
    usage,
    limit,
    remaining: Math.max(0, limit - usage),
  })
})

export const POST = safeRoute(async (request) => {
  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 5, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, slug, phone, plan, plan_limits_override, is_active, is_suspended")
    .eq("owner_id", user.id)
    .maybeSingle()
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  if (!restaurant.is_active) return NextResponse.json({ error: "Restaurant is not active" }, { status: 403 })
  if (restaurant.is_suspended) return NextResponse.json({ error: "Restaurant is suspended" }, { status: 403 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = generateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  // ── Plan limit check (monthly) ──
  const limits = getEffectiveLimits(
    restaurant.plan as any,
    restaurant.plan_limits_override as any
  )
  const limit = limits.aiGenerationsPerMonth ?? 0
  const used = await getAiGenerationCount(restaurant.id, supabase)
  if (used >= limit) {
    return NextResponse.json(
      {
        error: "LIMIT_REACHED",
        message: `You've used all ${limit} AI poster generation${limit === 1 ? "" : "s"} this month. Upgrade your plan for more.`,
        usage: used,
        limit,
      },
      { status: 403 }
    )
  }

  const admin = createAdminClient()

  // ── Insert generation record (status pending) ──
  const dishNames = parsed.data.dishes.map((d) => d.name)
  const dishPrices = parsed.data.dishes.map((d) => d.price ?? null)
  const prompt = buildArtworkPrompt({
    templateKey: parsed.data.templateKey,
    colorScheme: parsed.data.colorScheme,
    dishNames,
    customPrompt: parsed.data.customPrompt,
  })

  const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://digitalmenue.com"
  const qrUrl = `${APP_URL}/${restaurant.slug}`

  const { data: gen, error: insertError } = await admin
    .from("ai_poster_generations")
    .insert({
      restaurant_id: restaurant.id,
      owner_id: user.id,
      prompt,
      template_key: parsed.data.templateKey,
      color_scheme: parsed.data.colorScheme,
      ratio: parsed.data.ratio,
      dish_names: dishNames,
      dish_prices: dishPrices,
      order_phone: parsed.data.orderPhone || restaurant.phone || null,
      qr_url: qrUrl,
      status: "pending",
    })
    .select()
    .single()

  if (insertError || !gen) {
    log.error("Failed to insert AI generation", { error: insertError?.message })
    return NextResponse.json({ error: "Failed to start generation" }, { status: 400 })
  }

  logOwnerAction(restaurant.id, user.id, "ai_poster_generate", {
    generation_id: gen.id,
    template: parsed.data.templateKey,
    ratio: parsed.data.ratio,
    dishes: dishNames.length,
  }, getIpSimple(request)).catch(console.error)

  // ── Call Gemini ──
  try {
    const result = await generatePosterArtwork({
      prompt,
      templateKey: parsed.data.templateKey,
      colorScheme: parsed.data.colorScheme,
      ratio: parsed.data.ratio,
      dishNames,
    })

    // Store in Supabase storage (public bucket ai-posters)
    const path = `${restaurant.id}/${gen.id}.jpg`
    const buffer = Buffer.from(result.b64, "base64")
    const { error: uploadError } = await admin.storage
      .from("ai-posters")
      .upload(path, buffer, {
        contentType: result.mimeType || "image/jpeg",
        upsert: true,
      })
    if (uploadError) {
      log.error("Storage upload failed", { error: uploadError.message })
      throw new Error("Image generated but failed to save. Please try again.")
    }

    const { data: urlData } = admin.storage.from("ai-posters").getPublicUrl(path)

    const { error: updateError } = await admin
      .from("ai_poster_generations")
      .update({
        status: "success",
        image_path: path,
        image_url: urlData.publicUrl,
      })
      .eq("id", gen.id)

    if (updateError) {
      log.error("Failed to finalize generation", { error: updateError.message })
    }

    // Consume ONE credit — monotonic, never refunded on delete.
    const newUsage = await incrementAiUsage(restaurant.id, admin)

    return NextResponse.json({
      generation: {
        ...gen,
        status: "success",
        image_path: path,
        image_url: urlData.publicUrl,
      },
      usage: newUsage,
      limit,
      remaining: Math.max(0, limit - newUsage),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed"
    await admin
      .from("ai_poster_generations")
      .update({ status: "failed", error_message: message })
      .eq("id", gen.id)
    invalidateAiUsage(restaurant.id)
    log.error("AI generation failed", { generation_id: gen.id, message })
    return NextResponse.json({ error: "GENERATION_FAILED", message }, { status: 502 })
  }
})
