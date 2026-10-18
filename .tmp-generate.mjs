import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"
import { buildPosterArtwork } from "./lib/poster-artwork.ts"
import { buildBackdropPrompt } from "./lib/ai-generator.ts"

const env = {}
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].trim().replace(/^"|"$/g, "")
}
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})
const DIR = path.join(process.cwd(), "public", "preview")
fs.mkdirSync(DIR, { recursive: true })

const LG = "a1000000-0000-4000-8000-000000000001"
const CP = "fd84ba39-b451-442c-9400-d7b69a1d8e68"
const cache = new Map()

async function photos(restId) {
  if (cache.has(restId)) return cache.get(restId)
  const { data } = await admin.from("dishes").select("name_en, price, image_url").eq("restaurant_id", restId)
  const m = new Map()
  for (const d of data || []) m.set((d.name_en || "").trim().toLowerCase(), d)
  cache.set(restId, m)
  return m
}

async function aiBackdrop(templateKey, colorScheme) {
  const prompt = buildBackdropPrompt({ templateKey, colorScheme })
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
    { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` },
      body: JSON.stringify({ prompt, steps: 8 }), signal: AbortSignal.timeout(120000) }
  )
  const j = await res.json().catch(() => ({}))
  return j?.result?.image ? Buffer.from(j.result.image, "base64") : null
}

const JOBS = [
  { file: "1-classic", rest: LG, names: ["Mutton Reshmi Karahi", "Chicken Tikka Karahi"], templateKey: "classic", colorScheme: "appetizing" },
  { file: "2-modern", rest: CP, names: ["Chicken Pop Burger", "Ceasar Salad"], templateKey: "modern", colorScheme: "fresh" },
  { file: "3-bold", rest: LG, names: ["Mutton Biryani", "Chicken Biryani"], templateKey: "bold", colorScheme: "appetizing" },
  { file: "4-elegant", rest: LG, names: ["Pulao", "Zarda Rice"], templateKey: "elegant", colorScheme: "royal" },
]

const manifest = []
for (const job of JOBS) {
  const byName = await photos(job.rest)
  const dishes = job.names.map((n) => {
    const row = byName.get(n.trim().toLowerCase())
    return { name: n, price: row?.price ?? null, imageUrl: row?.image_url ?? null }
  })
  const backdrop = await aiBackdrop(job.templateKey, job.colorScheme)
  const art = await buildPosterArtwork({
    dishes: dishes.map((d) => ({ name: d.name, imageUrl: d.imageUrl })),
    colorScheme: job.colorScheme,
    templateKey: job.templateKey,
    backdropImage: backdrop,
  })
  fs.writeFileSync(path.join(DIR, `${job.file}.jpg`), art.buffer)
  const used = new Set(art.usedDishNames)
  const shown = dishes.filter((d) => used.has(d.name)).map((d) => ({ name: d.name, price: d.price }))
  manifest.push({ file: `/preview/${job.file}.jpg`, templateKey: job.templateKey, dishes: shown })
  console.log(`${job.file}: ${JSON.stringify(shown)} (${art.usedDishNames.length} photos)`)
}
fs.writeFileSync(path.join(DIR, "manifest.json"), JSON.stringify(manifest, null, 2))
console.log("\nartworks ->", DIR)