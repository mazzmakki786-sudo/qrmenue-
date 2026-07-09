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

    if (!responseCode || !txnRefNo) {
      console.error("[JazzCash IPN] Missing required params")
      return NextResponse.json({ error: "Missing params" }, { status: 400 })
    }

    const hashValid = verifySecureHash(params)
    const isSuccess = responseCode === "000"

    if (!hashValid) {
      console.error("[JazzCash IPN] Hash verification failed for", txnRefNo)
      return NextResponse.json({ error: "Hash mismatch" }, { status: 403 })
    }

    if (!isSuccess) {
      console.log(`[JazzCash IPN] Transaction ${txnRefNo} failed: ${params["pp_ResponseMessage"]}`)
      return NextResponse.json({ status: "failed" })
    }

    const supabase = createAdminClient()

    const { data: existingTxn } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("payment_ref", txnRefNo)
      .maybeSingle()

    if (existingTxn) {
      console.log(`[JazzCash IPN] Duplicate IPN for ${txnRefNo}, skipping`)
      return NextResponse.json({ status: "already_processed" })
    }

    const planAmount = Math.round(parseInt(amount, 10) / 100)
    const planSlug = extractPlanFromDescription(description)

    if (!planSlug || !billReference) {
      console.error("[JazzCash IPN] Could not extract plan or restaurant", {
        description,
        billReference,
      })
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    const planEndDate = new Date()
    planEndDate.setDate(planEndDate.getDate() + 30)

    const { error: updateError } = await supabase
      .from("restaurants")
      .update({
        plan: planSlug,
        plan_start_date: new Date().toISOString(),
        plan_end_date: planEndDate.toISOString(),
        is_suspended: false,
        is_active: true,
      })
      .eq("id", billReference)

    if (updateError) {
      console.error("[JazzCash IPN] Failed to update restaurant plan:", updateError)
      return NextResponse.json({ error: "Update failed" }, { status: 500 })
    }

    const { error: subError } = await supabase.from("subscriptions").insert({
      restaurant_id: billReference,
      plan: planSlug,
      amount_pkr: planAmount,
      payment_method: "jazzcash",
      payment_ref: txnRefNo,
      transaction_ref: rrn,
      start_date: new Date().toISOString(),
      end_date: planEndDate.toISOString(),
      notes: `JazzCash IPN | Settlement: ${settlementDate} | RRN: ${rrn}`,
    })

    if (subError) {
      console.error("[JazzCash IPN] Failed to insert subscription record:", subError)
    }

    await supabase.from("owner_audit_log").insert({
      restaurant_id: billReference,
      action: "plan_updated",
      details: {
        plan: planSlug,
        amount: planAmount,
        method: "jazzcash",
        txn_ref: txnRefNo,
        rrn,
      },
    })

    console.log(`[JazzCash IPN] Plan activated successfully`, {
      restaurant: billReference,
      plan: planSlug,
      txnRefNo,
      rrn,
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
