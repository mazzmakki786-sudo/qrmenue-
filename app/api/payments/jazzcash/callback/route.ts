import { NextResponse } from "next/server"
import { verifySecureHash } from "@/lib/jazzcash"
import { createAdminClient } from "@/lib/supabase/server"

function extractParams(url: URL, formData?: FormData): Record<string, string> {
  const params: Record<string, string> = {}
  for (const [key, value] of url.searchParams.entries()) {
    params[key] = value
  }
  if (formData) {
    for (const [key, value] of formData.entries()) {
      if (!params[key]) params[key] = value.toString()
    }
  }
  return params
}

async function handleCallback(request: Request) {
  const url = new URL(request.url)
  let formData: FormData | undefined
  try {
    formData = await request.formData()
  } catch {}
  const params = extractParams(url, formData)

  const responseCode = params["pp_ResponseCode"]
  const txnRefNo = params["pp_TxnRefNo"] || ""
  const message = params["pp_ResponseMessage"] || ""
  const billReference = params["pp_BillReference"] || ""
  const rrn = params["pp_RetreivalReferenceNo"] || ""
  const settlementDate = params["pp_SettlementDate"] || ""

  const hashValid = verifySecureHash(params)
  const isSuccess = responseCode === "000"

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const subscriptionUrl = `${appUrl}/dashboard/subscription`

  if (isSuccess && hashValid && txnRefNo) {
    try {
      const supabase = createAdminClient()
      const billParts = billReference.split("_")
      const restaurantId = billParts[0]
      const refTxnNo = billParts.length > 1 ? billParts.slice(1).join("_") : txnRefNo

      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("id, status")
        .eq("payment_ref", refTxnNo)
        .maybeSingle()

      if (existingSub && existingSub.status === "pending") {
        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            transaction_ref: rrn,
            notes: `Completed via callback | Settlement: ${settlementDate} | RRN: ${rrn}`,
          })
          .eq("id", existingSub.id)
      }
    } catch (err) {
      console.error("[JazzCash Callback] Failed to update subscription:", err)
    }
  }

  if (isSuccess && hashValid) {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Successful</title>
  <style>
    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .card { background: white; border-radius: 16px; padding: 40px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.08); max-width: 420px; }
    .icon { width: 64px; height: 64px; background: #25D366; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 32px; color: white; }
    h2 { color: #333; margin: 0 0 8px; font-size: 20px; }
    p { color: #666; font-size: 14px; margin: 0 0 24px; line-height: 1.5; }
    .btn { display: inline-block; background: #000; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; }
    .meta { font-size: 11px; color: #999; margin-top: 16px; }
    .countdown { font-size: 11px; color: #bbb; margin-top: 8px; }
  </style>
  <meta http-equiv="refresh" content="5;url=${subscriptionUrl}">
</head>
<body>
  <div class="card">
    <div class="icon">&#10003;</div>
    <h2>Payment Successful!</h2>
    <p>Your plan is being activated.<br/>Redirecting to dashboard...</p>
    <a href="${subscriptionUrl}" class="btn">Go to Dashboard</a>
    <p class="meta">Ref: ${txnRefNo}${rrn ? ` | RRN: ${rrn}` : ""}</p>
    <p class="countdown">Redirecting in 5 seconds...</p>
  </div>
</body>
</html>`,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    )
  }

  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Failed</title>
  <style>
    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .card { background: white; border-radius: 16px; padding: 40px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.08); max-width: 420px; }
    .icon { width: 64px; height: 64px; background: #DC2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 32px; color: white; }
    h2 { color: #333; margin: 0 0 8px; font-size: 20px; }
    p { color: #666; font-size: 14px; margin: 0 0 24px; line-height: 1.5; }
    .btn { display: inline-block; background: #000; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; }
    .meta { font-size: 11px; color: #999; margin-top: 16px; }
  </style>
  <meta http-equiv="refresh" content="5;url=${subscriptionUrl}">
</head>
<body>
  <div class="card">
    <div class="icon">&#10007;</div>
    <h2>Payment Failed</h2>
    <p>${message || "Transaction could not be completed. Please try again."}</p>
    <p class="meta">Ref: ${txnRefNo}</p>
    <a href="${subscriptionUrl}" class="btn">Back to Dashboard</a>
  </div>
</body>
</html>`,
    {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  )
}

export const GET = async (request: Request) => {
  try {
    return await handleCallback(request)
  } catch (err) {
    console.error("[JazzCash Callback Error]", err)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    return NextResponse.redirect(`${appUrl}/dashboard/subscription`)
  }
}

export const POST = async (request: Request) => {
  try {
    return await handleCallback(request)
  } catch (err) {
    console.error("[JazzCash Callback Error]", err)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    return NextResponse.redirect(`${appUrl}/dashboard/subscription`)
  }
}
