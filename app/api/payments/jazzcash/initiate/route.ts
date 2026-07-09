import { NextResponse } from "next/server"
import { safeRoute } from "@/lib/api-error"
import { createClient } from "@/lib/supabase/server"
import { validateCsrf } from "@/lib/csrf"
import { checkRateLimit } from "@/lib/rate-limiter"
import {
  buildPaymentPayload,
  buildAutoSubmitForm,
  generateTxnRefNo,
  isJazzCashEnabled,
} from "@/lib/jazzcash"
import { PLAN_PRICES, PLAN_NAMES, type Plan } from "@/lib/subscription"

const VALID_PLANS: Plan[] = ["starter", "growth", "premium"]

export const POST = safeRoute(async (request) => {
  const { valid } = validateCsrf(request)
  if (!valid) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 })
  }

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

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const plan = body.plan as Plan

  if (!plan || !VALID_PLANS.includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, owner_id")
    .eq("owner_id", user.id)
    .single()

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  const amount = PLAN_PRICES[plan]
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid plan amount" }, { status: 400 })
  }

  const txnRefNo = generateTxnRefNo()
  const amountInPaisa = amount * 100

  const payload = buildPaymentPayload({
    txnRefNo,
    amount: amountInPaisa,
    billReference: restaurant.id,
    description: `QRMenu.pk - ${PLAN_NAMES[plan]} Plan`,
  })

  const html = buildAutoSubmitForm(payload)

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  })
})
