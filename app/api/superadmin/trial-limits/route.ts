import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { DEFAULT_TRIAL_LIMITS, DEFAULT_EXPIRED_TRIAL_LIMITS, type TrialLimitConfig, type ExpiredTrialLimitConfig } from "@/lib/subscription"

async function getSetting(key: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("company_settings")
    .select("value")
    .eq("key", key)
    .single()
  return data?.value || null
}

async function upsertSetting(key: string, value: string) {
  const supabase = await createClient()
  await supabase
    .from("company_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== process.env.SUPER_ADMIN_EMAIL?.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const trialRaw = await getSetting("trial_limits")
  const expiredRaw = await getSetting("expired_trial_limits")

  const config: TrialLimitConfig = trialRaw
    ? { ...DEFAULT_TRIAL_LIMITS, ...JSON.parse(trialRaw) }
    : { ...DEFAULT_TRIAL_LIMITS }

  const expiredConfig: ExpiredTrialLimitConfig = expiredRaw
    ? { ...DEFAULT_EXPIRED_TRIAL_LIMITS, ...JSON.parse(expiredRaw) }
    : { ...DEFAULT_EXPIRED_TRIAL_LIMITS }

  return NextResponse.json({ config, expiredConfig })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== process.env.SUPER_ADMIN_EMAIL?.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await request.json()
  const { maxDishes, maxCategories, maxOrders, trialDurationDays, gracePeriodDays } = body

  const existing = DEFAULT_TRIAL_LIMITS
  const config: TrialLimitConfig = {
    maxDishes: typeof maxDishes === "number" ? maxDishes : existing.maxDishes,
    maxCategories: typeof maxCategories === "number" ? maxCategories : existing.maxCategories,
    maxOrders: typeof maxOrders === "number" ? maxOrders : existing.maxOrders,
    trialDurationDays: typeof trialDurationDays === "number" ? trialDurationDays : existing.trialDurationDays,
    gracePeriodDays: typeof gracePeriodDays === "number" ? gracePeriodDays : existing.gracePeriodDays,
  }

  await upsertSetting("trial_limits", JSON.stringify(config))

  return NextResponse.json({ config, message: "Trial limits updated" })
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== process.env.SUPER_ADMIN_EMAIL?.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await request.json()
  const existing = DEFAULT_EXPIRED_TRIAL_LIMITS
  const expiredConfig: ExpiredTrialLimitConfig = {
    maxDishes: typeof body.maxDishes === "number" ? body.maxDishes : existing.maxDishes,
    maxCategories: typeof body.maxCategories === "number" ? body.maxCategories : existing.maxCategories,
    maxOrders: typeof body.maxOrders === "number" ? body.maxOrders : existing.maxOrders,
    maxImages: typeof body.maxImages === "number" ? body.maxImages : existing.maxImages,
    blockMenu: typeof body.blockMenu === "boolean" ? body.blockMenu : existing.blockMenu,
    blockOrders: typeof body.blockOrders === "boolean" ? body.blockOrders : existing.blockOrders,
  }

  await upsertSetting("expired_trial_limits", JSON.stringify(expiredConfig))

  return NextResponse.json({ expiredConfig, message: "Expired trial limits updated" })
}