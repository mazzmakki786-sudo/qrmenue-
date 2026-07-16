import { NextResponse } from "next/server"
import { safeRoute } from "@/lib/api-error"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limiter"
import { csrfGuard } from "@/lib/csrf"
import {
  buildPaymentPayload,
  buildAutoSubmitForm,
  generateTxnRefNo,
  isJazzCashEnabled,
} from "@/lib/jazzcash"
import { type Plan } from "@/lib/subscription"

const VALID_PLANS = ["starter", "growth", "premium"]
const VALID_INTERVALS = ["monthly", "yearly"]

export const POST = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  try {
    await checkRateLimit(request, "owner:write")
  } catch {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    )
  }

  if (!isJazzCashEnabled()) {
    return NextResponse.json(
      { error: "JazzCash payment gateway is not configured" },
      { status: 503 }
    )
  }

  const admin = createAdminClient()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const plan = body.plan as string
  const billingInterval = (body.billingInterval as string) || "monthly"

  if (!plan || !VALID_PLANS.includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  if (!VALID_INTERVALS.includes(billingInterval)) {
    return NextResponse.json({ error: "Invalid billing interval" }, { status: 400 })
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, owner_id")
    .eq("owner_id", user.id)
    .single()

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  // Use admin client to bypass RLS on plans table
  const { data: planData } = await admin
    .from("plans")
    .select("price_pkr, yearly_price_pkr, name")
    .eq("slug", plan)
    .eq("is_active", true)
    .single()

  if (!planData) {
    return NextResponse.json({ error: "Invalid plan amount" }, { status: 400 })
  }

  const amount = billingInterval === "yearly" && planData.yearly_price_pkr
    ? planData.yearly_price_pkr
    : planData.price_pkr

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid plan amount" }, { status: 400 })
  }

  const planDurationDays = billingInterval === "yearly" ? 365 : 30
  const txnRefNo = generateTxnRefNo()
  const amountInPaisa = amount * 100

  const { error: subInsertError } = await admin.from("subscriptions").insert({
    restaurant_id: restaurant.id,
    plan: plan,
    amount_pkr: amount,
    payment_method: "jazzcash",
    payment_ref: txnRefNo,
    status: "pending",
    billing_interval: billingInterval,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + planDurationDays * 86400000).toISOString(),
    notes: `Pending payment via JazzCash | ${planData.name} (${billingInterval})`,
  })

  if (subInsertError) {
    console.error("[JazzCash Initiate] Failed to create pending subscription:", subInsertError)
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 })
  }

  const payload = buildPaymentPayload({
    txnRefNo,
    amount: amountInPaisa,
    billReference: `${restaurant.id}_${txnRefNo}`,
    description: `QRMenu.pk - ${planData.name} (${billingInterval})`,
  })

  const html = buildAutoSubmitForm(payload)

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  })
})
