import { chromium } from "playwright"
import fs from "fs"
import path from "path"

const OUT = process.cwd()
const browser = await chromium.launch({ channel: "chrome" })
const page = await browser.newPage({ viewport: { width: 2400, height: 1400 }, deviceScaleFactor: 2 })
await page.goto("http://localhost:3111/poster-preview", { waitUntil: "networkidle" })
await page.waitForTimeout(2500)

const nodes = page.locator("[data-design]")
const n = await nodes.count()
console.log("designs found:", n)

const sizes = [420, 1024]
for (const size of sizes) {
  for (const tpl of ["classic", "modern", "bold", "elegant"]) {
    const el = page.locator(`[data-design="${tpl}"][data-size="${size}"] > div`).first()
    if ((await el.count()) === 0) { console.log("missing", tpl, size); continue }
    const file = path.join(OUT, `design-${tpl}-${size}.png`)
    await el.screenshot({ path: file })
    console.log(`saved design-${tpl}-${size}.png`)
  }
}
await browser.close()