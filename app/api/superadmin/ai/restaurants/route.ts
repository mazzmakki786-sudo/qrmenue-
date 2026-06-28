import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limiter"
import { csrfGuard } from "@/lib/csrf"
import { safeRoute } from "@/lib/api-error"
import { getEffectiveLimits, type Plan } from "@/lib/subscription"
import { z } from "zod"

const superAdminEmail = process.env.SUPER_ADMIN_EMAIL

const overrideSchema = z.object({
  restaurant_id: z.string().uuid(),
  ai_posts_per_month: z.number().int().min(0).optional(),
  bonus_generations: z.number().int().min(0).optional(),
})

async function checkSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== superAdminEmail?.toLowerCase()) return false
  return true
}

export const GET = safeRoute(async (request) => {
  await checkRateLimit(request, "superadmin:read")

  if (!(await checkSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()
  const month = new Date().toISOString().slice(0, 7)

  const { data: restaurants, error } = await admin
    .from("restaurants")
    .select("id, name, slug, plan, is_active, is_suspended, plan_limits_override, logo_url")
    .in("plan", ["growth", "premium"])
    .order("name")

  if (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 400 })
  }

  const { data: usageData } = await admin
    .from("ai_usage")
    .select("restaurant_id, count")
    .eq("month", month)

  const usageMap = new Map((usageData || []).map((u: any) => [u.restaurant_id, u.count]))

  const result = restaurants.map((r: any) => {
    const limits = getEffectiveLimits(r.plan as Plan, r.plan_limits_override as any)
    const used = usageMap.get(r.id) ?? 0
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      plan: r.plan,
      logo_url: r.logo_url,
      is_active: r.is_active,
      is_suspended: r.is_suspended,
      monthlyLimit: limits.aiPostsPerMonth,
      used,
      remaining: Math.max(0, limits.aiPostsPerMonth - used),
      plan_limits_override: r.plan_limits_override,
    }
  })

  return NextResponse.json({ restaurants: result })
})

export const PATCH = safeRoute(async (request) => {
  await checkRateLimit(request, "superadmin:write")

  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  if (!(await checkSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = overrideSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const admin = createAdminClient()

  if (parsed.data.ai_posts_per_month !== undefined) {
    const { data: restaurant } = await admin
      .from("restaurants")
      .select("plan_limits_override")
      .eq("id", parsed.data.restaurant_id)
      .single()

    const currentOverride = (restaurant?.plan_limits_override as Record<string, number>) || {}
    const newOverride = {
      ...currentOverride,
      aiPostsPerMonth: parsed.data.ai_posts_per_month,
    }

    const { error } = await admin
      .from("restaurants")
      .update({ plan_limits_override: newOverride })
      .eq("id", parsed.data.restaurant_id)

    if (error) {
      return NextResponse.json({ error: "Failed to update" }, { status: 400 })
    }
  }

  if (parsed.data.bonus_generations && parsed.data.bonus_generations > 0) {
    const month = new Date().toISOString().slice(0, 7)

    try {
      await admin.rpc("increment_ai_usage", {
        p_restaurant_id: parsed.data.restaurant_id,
        p_month: month,
        p_increment: parsed.data.bonus_generations,
      })
    } catch {
      const { data: usage } = await admin
        .from("ai_usage")
        .select("count")
        .eq("restaurant_id", parsed.data.restaurant_id)
        .eq("month", month)
        .maybeSingle()

      try {
        await admin.from("ai_usage").upsert({
          restaurant_id: parsed.data.restaurant_id,
          month,
          count: (usage?.count ?? 0) + parsed.data.bonus_generations!,
        }, { onConflict: "restaurant_id,month" })
      } catch {}
    }
  }

  return NextResponse.json({ success: true })
})
