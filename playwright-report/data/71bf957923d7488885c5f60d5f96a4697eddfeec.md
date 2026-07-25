# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: qa-production-test.spec.ts >> Production QA E2E & Responsiveness Audit >> Desktop: Marketing, Registration, Dashboard CRUD, QR, and Customer Flow
- Location: e2e\qa-production-test.spec.ts:17:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('body')
Expected pattern: /fill in|required|error/i
Received string:  "BackRegister Your RestaurantStart your 30-day free trial todayRestaurant Name **City *Phone / WhatsApp **Email **Password *Create Restaurant & Start TrialorContinue with GoogleAlready have an account? Sign inBack to homeSign Up | Digital QR Menu Pakistan"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('body')
    13 × locator resolved to <body class="min-h-screen bg-white font-sans antialiased overflow-x-hidden">…</body>
       - unexpected value "BackRegister Your RestaurantStart your 30-day free trial todayRestaurant Name **City *Phone / WhatsApp **Email **Password *Create Restaurant & Start TrialorContinue with GoogleAlready have an account? Sign inBack to homeSign Up | Digital QR Menu Pakistan"

```

```yaml
- main:
  - button "Back":
    - img
    - text: Back
  - img
  - heading "Register Your Restaurant" [level=1]
  - paragraph: Start your 30-day free trial today
  - text: Restaurant Name **
  - textbox "Restaurant Name **":
    - /placeholder: Al-Habib Grill
  - text: City *
  - combobox "City *"
  - text: Phone / WhatsApp **
  - textbox "Phone / WhatsApp **":
    - /placeholder: 0300-XXXXXXX
  - text: Email **
  - textbox "Email **":
    - /placeholder: owner@restaurant.com
  - text: Password *
  - textbox "Password *":
    - /placeholder: Create a strong password
  - button:
    - img
  - button "Create Restaurant & Start Trial"
  - text: or
  - button "Continue with Google":
    - img
    - text: Continue with Google
  - link "Already have an account? Sign in":
    - /url: /login
  - link "Back to home":
    - /url: /
- alert
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test"
  2   | import path from "path"
  3   | 
  4   | const BASE_URL = "https://www.digitalmenue.com"
  5   | const TEST_EMAIL = "test_qa_agent@yopmail.com"
  6   | const TEST_PASSWORD = "TestPassword123!"
  7   | 
  8   | test.describe("Production QA E2E & Responsiveness Audit", () => {
  9   |   // Let tests run sequentially so the state carries over
  10  |   test.describe.configure({ mode: "serial" })
  11  | 
  12  |   let restaurantSlug = ""
  13  | 
  14  |   // =========================================================================
  15  |   // TEST 1: DESKTOP AUDIT & MERCHANT WORKFLOW (1440x900)
  16  |   // =========================================================================
  17  |   test("Desktop: Marketing, Registration, Dashboard CRUD, QR, and Customer Flow", async ({ page, context }) => {
  18  |     test.setTimeout(120000) // Increase timeout to 2 minutes for extensive sequence
  19  |     await page.setViewportSize({ width: 1440, height: 900 })
  20  | 
  21  |     // Keep track of console errors and failed network requests
  22  |     const consoleErrors: string[] = []
  23  |     const networkErrors: string[] = []
  24  | 
  25  |     page.on("pageerror", (err) => consoleErrors.push(`[Page Error] ${err.message}`))
  26  |     page.on("console", (msg) => {
  27  |       if (msg.type() === "error") {
  28  |         consoleErrors.push(`[Console Error] ${msg.text()}`)
  29  |       }
  30  |     })
  31  |     page.on("response", (resp) => {
  32  |       if (resp.status() >= 400) {
  33  |         networkErrors.push(`[Network Error] ${resp.status()} ${resp.url()}`)
  34  |       }
  35  |     })
  36  | 
  37  |     // 1. Landing Page & Routing
  38  |     const startTime = Date.now()
  39  |     const response = await page.goto(BASE_URL, { waitUntil: "networkidle" })
  40  |     const loadTime = Date.now() - startTime
  41  |     
  42  |     // SSL check
  43  |     expect(page.url().startsWith("https://")).toBe(true)
  44  |     console.log(`⏱️ Landing page loaded in ${loadTime}ms`)
  45  | 
  46  |     // Verify Title & Primary CTAs
  47  |     const title = await page.title()
  48  |     console.log(`📄 Page Title: ${title}`)
  49  |     expect(title).toContain("Digital QR")
  50  | 
  51  |     const startTrialBtn = page.locator('a[href="/signup/restaurant"]:visible').first()
  52  |     await expect(startTrialBtn).toBeVisible()
  53  | 
  54  |     // Check FAQ Accordion or section
  55  |     await page.goto(`${BASE_URL}/faq`, { waitUntil: "networkidle" })
  56  |     await expect(page.locator("h1")).toContainText("Frequently Asked Questions")
  57  | 
  58  |     // Check pricing PKR availability
  59  |     await page.goto(`${BASE_URL}/pricing`, { waitUntil: "networkidle" })
  60  |     await expect(page.locator("body")).toContainText("PKR")
  61  | 
  62  |     // 2. Authentication: Negative Login Test
  63  |     await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" })
  64  |     await page.fill('input[type="email"]', "invalid_format_email")
  65  |     await page.fill('input[type="password"]', "short")
  66  |     await page.click('button[type="submit"]')
  67  |     
  68  |     // Check validation error feedback (HTML5 or custom toast/errors)
  69  |     const emailValidity = await page.evaluate(() => {
  70  |       const input = document.querySelector('input[type="email"]') as HTMLInputElement
  71  |       return input ? input.validity.valid : true
  72  |     })
  73  |     if (!emailValidity) {
  74  |       console.log("✅ Email format validation caught by browser")
  75  |     }
  76  | 
  77  |     // 3. Signup Flow
  78  |     await page.goto(`${BASE_URL}/signup/restaurant`, { waitUntil: "networkidle" })
  79  |     
  80  |     // Form validations check
  81  |     await page.click('button[type="submit"]')
> 82  |     await expect(page.locator("body")).toContainText(/fill in|required|error/i)
      |                                        ^ Error: expect(locator).toContainText(expected) failed
  83  | 
  84  |     // Fill registration details
  85  |     await page.fill('input[id="name"]', "QA Biryani Paradise")
  86  |     // Use autocomplete or fill city
  87  |     await page.fill('input[id="city"]', "Faisalabad")
  88  |     // Wait for dropdown to show up if it's autocomplete, or just let it type
  89  |     await page.waitForTimeout(500)
  90  |     await page.keyboard.press("ArrowDown")
  91  |     await page.keyboard.press("Enter")
  92  | 
  93  |     await page.fill('input[id="phone"]', "0300-1234567")
  94  |     await page.fill('input[id="email"]', TEST_EMAIL)
  95  |     await page.fill('input[id="password"]', TEST_PASSWORD)
  96  |     
  97  |     await page.click('button[type="submit"]')
  98  |     
  99  |     // Wait for signup to complete and redirect to /dashboard/onboarding or dashboard
  100 |     await page.waitForURL(/\/dashboard/, { timeout: 30000 })
  101 |     console.log("✅ Successfully signed up. Current URL:", page.url())
  102 | 
  103 |     // 4. Onboarding URL & Slug extraction
  104 |     if (page.url().includes("/onboarding")) {
  105 |       const codeElement = page.locator("code")
  106 |       await codeElement.waitFor({ state: "visible", timeout: 15000 })
  107 |       const menuUrl = await codeElement.innerText()
  108 |       console.log(`🔗 Extracted Menu URL: ${menuUrl}`)
  109 |       restaurantSlug = menuUrl.split("/").pop() || ""
  110 |     } else {
  111 |       // Fallback: extract slug from QR page
  112 |       await page.goto(`${BASE_URL}/dashboard/qr`, { waitUntil: "networkidle" })
  113 |       const qrDownload = page.locator('button:has-text("Download")').first()
  114 |       const text = await page.locator("body").innerText()
  115 |       console.log(`ℹ️ On QR page. Extracting slug...`)
  116 |       // Match slug from link text
  117 |       const slugMatch = text.match(/digitalmenue\.com\/([a-zA-Z0-9_-]+)/)
  118 |       if (slugMatch) {
  119 |         restaurantSlug = slugMatch[1]
  120 |       }
  121 |     }
  122 |     
  123 |     if (!restaurantSlug) {
  124 |       // Fallback hardcoded if something went wrong
  125 |       restaurantSlug = "qa-biryani-paradise"
  126 |     }
  127 |     console.log(`💥 Restaurant Slug Determined: ${restaurantSlug}`)
  128 | 
  129 |     // 5. Dashboard Menu Management: Category & Dish CRUD
  130 |     await page.goto(`${BASE_URL}/dashboard/menu`, { waitUntil: "networkidle" })
  131 | 
  132 |     // Create Category
  133 |     // Locate the Add Category button (ghost variant, the first plus next to search)
  134 |     const addCatBtn = page.locator('button:has(svg.lucide-plus)').first()
  135 |     await addCatBtn.click()
  136 |     await page.waitForSelector('text="Add New Category"')
  137 |     await page.fill('input[id="category_name_en"]', "QA Test Category")
  138 |     await page.fill('input[id="category_name_ur"]', "کیو اے ٹیسٹ")
  139 |     await page.click('button[type="submit"]:has-text("Save Category")')
  140 |     
  141 |     // Verify category created
  142 |     await page.waitForSelector('text="QA Test Category"', { timeout: 10000 })
  143 |     console.log("✅ Category created successfully")
  144 | 
  145 |     // Create Dish
  146 |     // Locate Add Dish button (primary variant, second plus)
  147 |     const addDishBtn = page.locator('button:has-text("Create first dish"), button:has-text("Add Dish"), button:has(svg.lucide-plus)').last()
  148 |     await addDishBtn.click()
  149 |     await page.waitForSelector('text="Add New Dish"')
  150 |     
  151 |     await page.fill('input[id="name_en"]', "QA Biryani Special")
  152 |     await page.fill('input[id="name_ur"]', "بریانی سپیشل")
  153 |     await page.fill('textarea[id="description_en"]', "Spicy Pakistani chicken biryani, cooked with aromatic basmati rice.")
  154 |     await page.fill('input[id="price"]', "850")
  155 |     
  156 |     // Choose category
  157 |     await page.selectOption('select[id="category_id"]', { label: "QA Test Category" })
  158 | 
  159 |     // Upload image
  160 |     const fileChooserPromise = page.waitForEvent("filechooser")
  161 |     await page.click('button:has-text("Upload photo")')
  162 |     const fileChooser = await fileChooserPromise
  163 |     await fileChooser.setFiles(path.resolve("public/icon.svg"))
  164 |     
  165 |     await page.click('button[type="submit"]:has-text("Save Dish")')
  166 |     await page.waitForSelector('text="QA Biryani Special"', { timeout: 15000 })
  167 |     console.log("✅ Dish created successfully with image")
  168 | 
  169 |     // Toggle Stock (Out of Stock)
  170 |     const availabilityToggle = page.locator('button[role="switch"]').first()
  171 |     // Check initial state
  172 |     const isInitiallyChecked = await availabilityToggle.getAttribute("aria-checked")
  173 |     console.log(`Availability switch initially checked: ${isInitiallyChecked}`)
  174 |     
  175 |     // Toggle off
  176 |     await availabilityToggle.click()
  177 |     await page.waitForTimeout(1000)
  178 | 
  179 |     // Verify it reflects immediately on public menu (we do this next inside public flow)
  180 |     // Toggle back on for order testing
  181 |     await availabilityToggle.click()
  182 |     await page.waitForTimeout(1000)
```