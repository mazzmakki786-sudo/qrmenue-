import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { verifySecureHash } from "@/lib/jazzcash"

export const POST = async (request: Request) => {
  try {
    const formData = await request.formData()
    const params: Record<string, string> = {}
    for (const [key, value] of formData.entries()) {
      params[key] = value.toString()
    }

    const responseCode = params["pp_ResponseCode"]
    const txnRefNo = params["pp_TxnRefNo"] || ""
    const amount = params["pp_Amount"] || ""
    const billReference = params["pp_BillReference"] || ""
    const description = params["pp_Description"] || ""
    const rrn = params["pp_RetreivalReferenceNo"] || ""
    const settlementDate = params["pp_SettlementDate"] || ""
    const responseMessage = params["pp_ResponseMessage"] || ""

    if (!responseCode || !txnRefNo) {
      console.error("[JazzCash IPN] Missing required params")
      return NextResponse.json({ error: "Missing params" }, { status: 400 })
    }

    const hashValid = verifySecureHash(params)
    const isSuccess = responseCode === "000"

    console.log(`[JazzCash IPN] Received`, {
      txnRefNo,
      responseCode,
      responseMessage,
      billReference,
      isSuccess,
      hashValid,
    })

    if (!hashValid) {
      console.error("[JazzCash IPN] Hash verification failed for", txnRefNo)
      return NextResponse.json({ error: "Hash mismatch" }, { status: 403 })
    }

    if (!isSuccess) {
      console.log(`[JazzCash IPN] Transaction ${txnRefNo} failed: ${responseMessage}`)
      return NextResponse.json({ status: "failed" })
    }

    const supabase = createAdminClient()

    // Parse billReference: restaurantId_txnRefNo
    const billParts = billReference.split("_")
    const restaurantId = billParts[0]
    const refTxnNo = billParts.length > 1 ? billParts.slice(1).join("_") : txnRefNo

    if (!restaurantId) {
      console.error("[JazzCash IPN] Invalid billReference:", billReference)
      return NextResponse.json({ error: "Invalid billReference" }, { status: 400 })
    }

    // Verify restaurant exists
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("id", restaurantId)
      .single()

    if (!restaurant) {
      console.error("[JazzCash IPN] Restaurant not found:", restaurantId)
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    // Idempotency check: look for existing subscription by payment_ref + restaurant_id
    const { data: existingTxn } = await supabase
      .from("subscriptions")
      .select("id, status, billing_interval")
      .eq("payment_ref", refTxnNo)
      .eq("restaurant_id", restaurantId)
      .maybeSingle()

    if (existingTxn && existingTxn.status === "active") {
      console.log(`[JazzCash IPN] Duplicate IPN for ${refTxnNo}, skipping`)
      return NextResponse.json({ status: "already_processed" })
    }

    // Determine billing interval and duration
    let billingInterval = "monthly"
    if (existingTxn?.billing_interval) {
      billingInterval = existingTxn.billing_interval
    } else {
      // Fallback: extract from description
      const intervalMatch = description.match(/(monthly|yearly)/i)
      if (intervalMatch) billingInterval = intervalMatch[1].toLowerCase()
    }

    const planDurationDays = billingInterval === "yearly" ? 365 : 30
    const planEndDate = new Date()
    planEndDate.setDate(planEndDate.getDate() + planDurationDays)

    const planAmount = Math.round(parseInt(amount, 10) / 100)
    const planSlug = extractPlanFromDescription(description)

    if (!planSlug) {
      console.error("[JazzCash IPN] Could not extract plan from description", { description })
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    // Update restaurant plan
    const { error: updateError } = await supabase
      .from("restaurants")
      .update({
        plan: planSlug,
        plan_start_date: new Date().toISOString(),
        plan_end_date: planEndDate.toISOString(),
        is_suspended: false,
        is_active: true,
      })
      .eq("id", restaurantId)

    if (updateError) {
      console.error("[JazzCash IPN] Failed to update restaurant plan:", updateError)
      return NextResponse.json({ error: "Update failed" }, { status: 500 })
    }

    if (existingTxn) {
      // Update existing pending subscription to active
      const { error: subUpdateError } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          transaction_ref: rrn,
          end_date: planEndDate.toISOString(),
          notes: `Completed | Settlement: ${settlementDate} | RRN: ${rrn}`,
        })
        .eq("id", existingTxn.id)

      if (subUpdateError) {
        console.error("[JazzCash IPN] Failed to update subscription:", subUpdateError)
      }
    } else {
      // Fallback: insert new subscription record if pending one wasn't created
      const { error: subError } = await supabase.from("subscriptions").insert({
        restaurant_id: restaurantId,
        plan: planSlug,
        amount_pkr: planAmount,
        payment_method: "jazzcash",
        payment_ref: refTxnNo,
        transaction_ref: rrn,
        status: "active",
        billing_interval: billingInterval,
        start_date: new Date().toISOString(),
        end_date: planEndDate.toISOString(),
        notes: `JazzCash IPN (fallback) | Settlement: ${settlementDate} | RRN: ${rrn}`,
      })

      if (subError) {
        console.error("[JazzCash IPN] Failed to insert subscription record:", subError)
      }
    }

    // Audit log
    await supabase.from("owner_audit_log").insert({
      restaurant_id: restaurantId,
      action: "plan_updated",
      details: {
        plan: planSlug,
        amount: planAmount,
        method: "jazzcash",
        txn_ref: refTxnNo,
        rrn,
        billing_interval: billingInterval,
      },
    })

    console.log(`[JazzCash IPN] Plan activated successfully`, {
      restaurant: restaurantId,
      plan: planSlug,
      txnRefNo: refTxnNo,
      rrn,
      billingInterval,
    })

    return NextResponse.json({ status: "success" })
  } catch (err) {
    console.error("[JazzCash IPN Error]", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

function extractPlanFromDescription(description: string): string | null {
  const match = description.match(/(starter|growth|premium)/i)
  return match ? match[1].toLowerCase() : null
}
