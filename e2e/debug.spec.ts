import { test, expect } from "@playwright/test"

test("debug home page", async ({ page }) => {
  const response = await page.goto("http://localhost:3000")
  console.log("Status:", response?.status())
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(3000)

  console.log("URL:", page.url())
  const text = await page.locator("body").innerText()
  console.log("=== BODY TEXT (first 4000) ===")
  console.log(text.substring(0, 4000))
})

test("debug restaurants page", async ({ page }) => {
  const response = await page.goto("http://localhost:3000/restaurants")
  console.log("Status:", response?.status())
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(3000)

  console.log("URL:", page.url())
  const text = await page.locator("body").innerText()
  console.log("=== BODY TEXT ===")
  console.log(text.substring(0, 4000))
})
