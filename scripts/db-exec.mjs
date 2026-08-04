// One-off helper: run SQL against the live Supabase project via the
// Management API (POST /v1/projects/{ref}/database/query).
// Usage:
//   node scripts/db-exec.mjs <path-to-sql-file>
// Requires SUPABASE_ACCESS_TOKEN (sbp_...) in the environment.
//
// NOTE: kills itself after use — do NOT commit the token anywhere.

const [sqlFile] = process.argv.slice(2)
if (!sqlFile) {
  console.error("Usage: node scripts/db-exec.mjs <sql-file>")
  process.exit(1)
}

const token = process.env.SUPABASE_ACCESS_TOKEN
if (!token || !token.startsWith("sbp_")) {
  console.error("SUPABASE_ACCESS_TOKEN (sbp_...) env var missing")
  process.exit(1)
}

const { readFileSync } = await import("node:fs")
const sql = readFileSync(sqlFile, "utf8")

const PROJECT_REF = "zkwwqcopkwbzbsqqxoiq"

const res = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  }
)

const text = await res.text()
console.log(`HTTP ${res.status}`)
try {
  console.log(JSON.stringify(JSON.parse(text), null, 2))
} catch {
  console.log(text)
}
process.exit(res.ok ? 0 : 1)
