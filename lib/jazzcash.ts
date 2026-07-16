import crypto from "node:crypto"

const SANDBOX_URL = "https://sandbox.jazzcash.com.pk/PaymentRedirect/index"
const PRODUCTION_URL = "https://payments.jazzcash.com.pk/PaymentRedirect/index"

interface JazzCashConfig {
  merchantId: string
  password: string
  hashKey: string
  sandbox: boolean
}

function getConfig(): JazzCashConfig {
  return {
    merchantId: process.env.JAZZCASH_MERCHANT_ID || "",
    password: process.env.JAZZCASH_PASSWORD || "",
    hashKey: process.env.JAZZCASH_HASH_KEY || "",
    sandbox: process.env.JAZZCASH_SANDBOX !== "false",
  }
}

export function getPaymentUrl(): string {
  const config = getConfig()
  return config.sandbox ? SANDBOX_URL : PRODUCTION_URL
}

export function isJazzCashEnabled(): boolean {
  const config = getConfig()
  return !!(config.merchantId && config.password && config.hashKey)
}

function pad(n: number): string {
  return n.toString().padStart(2, "0")
}

export function generateTxnDateTime(date?: Date): string {
  const d = date || new Date()
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

export function generateTxnRefNo(): string {
  return `PLAN_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export function buildReturnUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return `${base}/api/payments/jazzcash/callback`
}

export function buildIpnUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return `${base}/api/payments/jazzcash/ipn`
}

export function generateSecureHash(params: Record<string, string>): string {
  const config = getConfig()
  const sortedKeys = Object.keys(params).filter((k) => k.toLowerCase().startsWith("pp") && k !== "pp_SecureHash").sort()

  const values = sortedKeys.map((k) => params[k] || "").join("&")
  const hashData = config.hashKey + "&" + values

  const utf8Bytes = new TextEncoder().encode(hashData)
  const iso88591String = new TextDecoder("iso-8859-1").decode(utf8Bytes)

  return crypto.createHmac("sha256", config.hashKey).update(iso88591String).digest("hex").toUpperCase()
}

export function verifySecureHash(params: Record<string, string>): boolean {
  const receivedHash = params["pp_SecureHash"]
  if (!receivedHash) return false

  const calculatedHash = generateSecureHash(params)
  return calculatedHash === receivedHash.toUpperCase()
}

export function buildPaymentPayload(params: {
  txnRefNo: string
  amount: number
  billReference: string
  description: string
  returnUrl?: string
  txnType?: string
}): Record<string, string> {
  const config = getConfig()
  const txnDateTime = generateTxnDateTime()
  const expiryDate = new Date(Date.now() + 3 * 60 * 60 * 1000)
  const txnExpiryDateTime = generateTxnDateTime(expiryDate)

  const payload: Record<string, string> = {
    pp_Version: "1.1",
    pp_TxnType: params.txnType || "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: config.merchantId,
    pp_SubMerchantID: "",
    pp_Password: config.password,
    pp_BankID: "TBANK",
    pp_ProductID: "RETL",
    pp_TxnRefNo: params.txnRefNo,
    pp_Amount: params.amount.toString(),
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: txnDateTime,
    pp_TxnExpiryDateTime: txnExpiryDateTime,
    pp_BillReference: params.billReference,
    pp_Description: params.description,
    pp_ReturnURL: params.returnUrl || buildReturnUrl(),
    ppmpf_1: "1",
    ppmpf_2: "2",
    ppmpf_3: "3",
    ppmpf_4: "4",
    ppmpf_5: "5",
  }

  payload.pp_SecureHash = generateSecureHash(payload)

  return payload
}

export function buildAutoSubmitForm(payload: Record<string, string>): string {
  const actionUrl = getPaymentUrl()
  const fields = Object.entries(payload)
    .map(
      ([key, value]) =>
        `<input type="hidden" name="${key}" value="${value.replace(/"/g, "&quot;")}" />`
    )
    .join("\n")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Redirecting to JazzCash...</title>
  <style>
    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .loader { text-align: center; }
    .loader p { color: #666; font-size: 14px; margin-top: 16px; }
    .spinner { width: 40px; height: 40px; border: 4px solid #e0e0e0; border-top-color: #c4151c; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <p>Redirecting to JazzCash payment gateway...</p>
  </div>
  <form id="jazzcashForm" method="POST" action="${actionUrl}" style="display:none">
    ${fields}
  </form>
  <script>document.getElementById("jazzcashForm").submit();</script>
</body>
</html>`
}
