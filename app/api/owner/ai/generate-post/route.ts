import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limiter"
import { csrfGuard } from "@/lib/csrf"
import { safeRoute } from "@/lib/api-error"
import { type Plan } from "@/lib/subscription"
import { getEffectiveLimitsFromDB } from "@/lib/subscription-db"
import { z } from "zod"
import { logOwnerAction, getIpSimple } from "@/lib/owner-audit"

const savePostSchema = z.object({
  prompt: z.string().min(1),
  language: z.enum(["en", "ur"]),
  ratio: z.string(),
  caption: z.string().optional(),
  image_url: z.string().optional(),
  template_used: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
  dish_ids: z.array(z.string().uuid()).optional(),
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

  const limits = await getEffectiveLimitsFromDB(restaurant.plan as Plan, restaurant.plan_limits_override as any)
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

  const parsed = savePostSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  // Create the AI post record
  const { data: post, error: postError } = await supabase
    .from("ai_posts")
    .insert({
      restaurant_id: restaurant.id,
      prompt: parsed.data.prompt,
      language: parsed.data.language,
      ratio: parsed.data.ratio,
      caption: parsed.data.caption || null,
      image_url: parsed.data.image_url || null,
      template_used: parsed.data.template_used || null,
      settings: parsed.data.settings || {},
    })
    .select()
    .single()

  if (postError) {
    return NextResponse.json({ error: "Failed to save post" }, { status: 400 })
  }

  // Save associated dish images
  if (parsed.data.dish_ids && parsed.data.dish_ids.length > 0) {
    const { data: dishImages } = await supabase
      .from("dishes")
      .select("id, image_url")
      .in("id", parsed.data.dish_ids)
      .eq("restaurant_id", restaurant.id)

    if (dishImages) {
      const postImages = dishImages
        .filter((d: any) => d.image_url)
        .map((d: any, i: number) => ({
          ai_post_id: post.id,
          dish_id: d.id,
          image_url: d.image_url,
          position: i,
        }))

      if (postImages.length > 0) {
        await supabase.from("ai_post_images").insert(postImages)
      }
    }
  }

  // Increment usage counter
  try {
    await admin.rpc("increment_ai_usage", {
      p_restaurant_id: restaurant.id,
      p_month: month,
    })
  } catch {
    try {
      await admin.from("ai_usage").upsert({
        restaurant_id: restaurant.id,
        month,
        count: (usage?.count ?? 0) + 1,
      }, { onConflict: "restaurant_id,month" })
    } catch {}
  }

  // Log to superadmin audit
  try {
    await admin.from("ai_generation_logs").insert({
      restaurant_id: restaurant.id,
      plan: restaurant.plan,
      prompt: parsed.data.prompt,
      image_url: parsed.data.image_url || null,
    })
  } catch {}

  try {
    await logOwnerAction(restaurant.id, user.id, "ai_post_generated", {
      post_id: post.id,
      prompt: parsed.data.prompt,
    }, getIpSimple(request))
  } catch {}

  return NextResponse.json({ post })
})
