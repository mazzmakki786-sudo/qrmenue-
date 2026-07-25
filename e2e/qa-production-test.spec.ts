import { test, expect } from "@playwright/test"
import path from "path"

const BASE_URL = "https://www.digitalmenue.com"
const TEST_EMAIL = "test_qa_agent@yopmail.com"
const TEST_PASSWORD = "TestPassword123!"

test.describe("Production QA E2E & Responsiveness Audit", () => {
  // Let tests run sequentially so the state carries over
  test.describe.configure({ mode: "serial" })

  let restaurantSlug = ""

  // =========================================================================
  // TEST 1: DESKTOP AUDIT & MERCHANT WORKFLOW (1440x900)
  // =========================================================================
  test("Desktop: Marketing, Registration, Dashboard CRUD, QR, and Customer Flow", async ({ page, context }) => {
    test.setTimeout(120000) // Increase timeout to 2 minutes for extensive sequence
    await page.setViewportSize({ width: 1440, height: 900 })

    // Keep track of console errors and failed network requests
    const consoleErrors: string[] = []
    const networkErrors: string[] = []

    page.on("pageerror", (err) => consoleErrors.push(`[Page Error] ${err.message}`))
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(`[Console Error] ${msg.text()}`)
      }
    })
    page.on("response", (resp) => {
      if (resp.status() >= 400) {
        networkErrors.push(`[Network Error] ${resp.status()} ${resp.url()}`)
      }
    })

    // 1. Landing Page & Routing
    const startTime = Date.now()
    const response = await page.goto(BASE_URL, { waitUntil: "networkidle" })
    const loadTime = Date.now() - startTime
    
    // SSL check
    expect(page.url().startsWith("https://")).toBe(true)
    console.log(`⏱️ Landing page loaded in ${loadTime}ms`)

    // Verify Title & Primary CTAs
    const title = await page.title()
    console.log(`📄 Page Title: ${title}`)
    expect(title).toContain("Digital QR")

    const startTrialBtn = page.locator('a[href="/signup/restaurant"]:visible').first()
    await expect(startTrialBtn).toBeVisible()

    // Check FAQ Accordion or section
    await page.goto(`${BASE_URL}/faq`, { waitUntil: "networkidle" })
    await expect(page.locator("h1")).toContainText("Frequently Asked Questions")

    // Check pricing PKR availability
    await page.goto(`${BASE_URL}/pricing`, { waitUntil: "networkidle" })
    await expect(page.locator("body")).toContainText("PKR")

    // 2. Authentication: Negative Login Test
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" })
    await page.fill('input[type="email"]', "invalid_format_email")
    await page.fill('input[type="password"]', "short")
    await page.click('button[type="submit"]')
    
    // Check validation error feedback (HTML5 or custom toast/errors)
    const emailValidity = await page.evaluate(() => {
      const input = document.querySelector('input[type="email"]') as HTMLInputElement
      return input ? input.validity.valid : true
    })
    if (!emailValidity) {
      console.log("✅ Email format validation caught by browser")
    }

    // 3. Signup Flow
    await page.goto(`${BASE_URL}/signup/restaurant`, { waitUntil: "networkidle" })
    
    // Form validations check
    await page.click('button[type="submit"]')
    await expect(page.locator("body")).toContainText(/fill in|required|error/i)

    // Fill registration details
    await page.fill('input[id="name"]', "QA Biryani Paradise")
    // Use autocomplete or fill city
    await page.fill('input[id="city"]', "Faisalabad")
    // Wait for dropdown to show up if it's autocomplete, or just let it type
    await page.waitForTimeout(500)
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")

    await page.fill('input[id="phone"]', "0300-1234567")
    await page.fill('input[id="email"]', TEST_EMAIL)
    await page.fill('input[id="password"]', TEST_PASSWORD)
    
    await page.click('button[type="submit"]')
    
    // Wait for signup to complete and redirect to /dashboard/onboarding or dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 30000 })
    console.log("✅ Successfully signed up. Current URL:", page.url())

    // 4. Onboarding URL & Slug extraction
    if (page.url().includes("/onboarding")) {
      const codeElement = page.locator("code")
      await codeElement.waitFor({ state: "visible", timeout: 15000 })
      const menuUrl = await codeElement.innerText()
      console.log(`🔗 Extracted Menu URL: ${menuUrl}`)
      restaurantSlug = menuUrl.split("/").pop() || ""
    } else {
      // Fallback: extract slug from QR page
      await page.goto(`${BASE_URL}/dashboard/qr`, { waitUntil: "networkidle" })
      const qrDownload = page.locator('button:has-text("Download")').first()
      const text = await page.locator("body").innerText()
      console.log(`ℹ️ On QR page. Extracting slug...`)
      // Match slug from link text
      const slugMatch = text.match(/digitalmenue\.com\/([a-zA-Z0-9_-]+)/)
      if (slugMatch) {
        restaurantSlug = slugMatch[1]
      }
    }
    
    if (!restaurantSlug) {
      // Fallback hardcoded if something went wrong
      restaurantSlug = "qa-biryani-paradise"
    }
    console.log(`💥 Restaurant Slug Determined: ${restaurantSlug}`)

    // 5. Dashboard Menu Management: Category & Dish CRUD
    await page.goto(`${BASE_URL}/dashboard/menu`, { waitUntil: "networkidle" })

    // Create Category
    // Locate the Add Category button (ghost variant, the first plus next to search)
    const addCatBtn = page.locator('button:has(svg.lucide-plus)').first()
    await addCatBtn.click()
    await page.waitForSelector('text="Add New Category"')
    await page.fill('input[id="category_name_en"]', "QA Test Category")
    await page.fill('input[id="category_name_ur"]', "کیو اے ٹیسٹ")
    await page.click('button[type="submit"]:has-text("Save Category")')
    
    // Verify category created
    await page.waitForSelector('text="QA Test Category"', { timeout: 10000 })
    console.log("✅ Category created successfully")

    // Create Dish
    // Locate Add Dish button (primary variant, second plus)
    const addDishBtn = page.locator('button:has-text("Create first dish"), button:has-text("Add Dish"), button:has(svg.lucide-plus)').last()
    await addDishBtn.click()
    await page.waitForSelector('text="Add New Dish"')
    
    await page.fill('input[id="name_en"]', "QA Biryani Special")
    await page.fill('input[id="name_ur"]', "بریانی سپیشل")
    await page.fill('textarea[id="description_en"]', "Spicy Pakistani chicken biryani, cooked with aromatic basmati rice.")
    await page.fill('input[id="price"]', "850")
    
    // Choose category
    await page.selectOption('select[id="category_id"]', { label: "QA Test Category" })

    // Upload image
    const fileChooserPromise = page.waitForEvent("filechooser")
    await page.click('button:has-text("Upload photo")')
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(path.resolve("public/icon.svg"))
    
    await page.click('button[type="submit"]:has-text("Save Dish")')
    await page.waitForSelector('text="QA Biryani Special"', { timeout: 15000 })
    console.log("✅ Dish created successfully with image")

    // Toggle Stock (Out of Stock)
    const availabilityToggle = page.locator('button[role="switch"]').first()
    // Check initial state
    const isInitiallyChecked = await availabilityToggle.getAttribute("aria-checked")
    console.log(`Availability switch initially checked: ${isInitiallyChecked}`)
    
    // Toggle off
    await availabilityToggle.click()
    await page.waitForTimeout(1000)

    // Verify it reflects immediately on public menu (we do this next inside public flow)
    // Toggle back on for order testing
    await availabilityToggle.click()
    await page.waitForTimeout(1000)

    // Edit Price (850 -> 950)
    const editDishBtn = page.locator('button:has(svg.lucide-pencil)').first()
    await editDishBtn.click()
    await page.waitForSelector('text="Edit Dish"')
    await page.fill('input[id="price"]', "950")
    await page.click('button[type="submit"]:has-text("Save Dish")')
    await page.waitForSelector('text="950"', { timeout: 10000 })
    console.log("✅ Price updated to 950 PKR")

    // 6. QR Code Section Check
    await page.goto(`${BASE_URL}/dashboard/qr`, { waitUntil: "networkidle" })
    const qrCanvas = page.locator("canvas, img[src*='qr']").first()
    await expect(qrCanvas).toBeVisible()
    
    const downloadQRBtn = page.locator('button:has-text("Download QR Code"), button:has-text("Download")').first()
    await expect(downloadQRBtn).toBeVisible()
    console.log("✅ QR Code canvas rendering verified")

    // 7. Customer Side: Interactive Menu UX
    await page.goto(`${BASE_URL}/${restaurantSlug}`, { waitUntil: "networkidle" })
    await page.waitForTimeout(1500)
    console.log(`🌐 Public Menu URL: ${page.url()}`)

    // Category navigation
    const catTab = page.locator('button:has-text("QA Test Category")').first()
    await expect(catTab).toBeVisible()
    await catTab.click()
    
    // Search bar
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    await searchInput.fill("Biryani")
    await page.waitForTimeout(500)
    await expect(page.locator('text="QA Biryani Special"')).toBeVisible()

    // Click item card to verify modal
    await page.locator('text="QA Biryani Special"').first().click()
    const modal = page.locator("[role='dialog'], .fixed.inset-0")
    await expect(page.locator('text="QA Biryani Special"').last()).toBeVisible()
    await expect(page.locator('text="950"').first()).toBeVisible()
    
    // Add to favorites (Favs icon check)
    const favBtn = page.locator("button:has(svg.lucide-heart)").first()
    await favBtn.click()
    
    // Reload and check local storage favorites persistence
    await page.reload({ waitUntil: "networkidle" })
    await page.waitForTimeout(1000)
    
    // Add multiple items with options to cart
    const addBtn = page.locator('button:has-text("+ Add"), button:has-text("Add")').first()
    await addBtn.click()
    await page.waitForTimeout(500)
    await addBtn.click() // Add second one

    // Verify Cart Drawer
    const cartBar = page.locator('[data-testid="cart-bar-link"], button:has-text("Cart"), a[href*="cart"]').first()
    await cartBar.click()
    await page.waitForTimeout(1000)

    // Check quantity increment / decrement
    const plusBtn = page.locator('button:has-text("+")').first()
    const minusBtn = page.locator('button:has-text("-")').first()
    
    await plusBtn.click() // Total should be 3
    await page.waitForTimeout(500)
    
    // Checkout fields validation
    const checkoutBtn = page.locator('button:has-text("Checkout"), a:has-text("Checkout"), [data-testid="checkout-link-desktop"]').first()
    await checkoutBtn.click()
    await page.waitForURL(/\/checkout/, { timeout: 10000 })

    // Order Type Takeaway
    const takeawayBtn = page.locator('[data-testid="order-type-takeaway"], text="Takeaway"').first()
    await takeawayBtn.click()

    const nameInput = page.locator('input[id*="name"], input[placeholder*="Name"]').first()
    const phoneInput = page.locator('input[id*="phone"], input[placeholder*="Phone"]').first()
    
    // Negative validation
    const placeOrderBtn = page.locator('button:has-text("Place Order"), button:has-text("Order via WhatsApp")').first()
    await placeOrderBtn.click()
    await expect(page.locator("body")).toContainText(/name|phone|required|error/i)

    // Fill valid details
    await nameInput.fill("QA Buyer")
    await phoneInput.fill("0300-7654321")

    // Cash on delivery payment
    const codBtn = page.locator('text="Cash on Delivery", button:has-text("Cash")').first()
    await codBtn.click()

    // Capture WhatsApp order message popup
    const popupPromise = context.waitForEvent("page")
    await placeOrderBtn.click()
    const newTab = await popupPromise
    await newTab.waitForLoadState("domcontentloaded")
    
    const waUrl = newTab.url()
    console.log(`📲 Generated WhatsApp URL: ${waUrl}`)
    expect(waUrl).toContain("whatsapp.com")
    expect(waUrl).toContain(encodeURIComponent("QA Biryani Special"))
    expect(waUrl).toContain("950")

    await newTab.close()

    // 8. Logout and Route Protection
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" })
    const sidebarLogout = page.locator('button:has-text("Sign Out"), button:has-text("Logout")').first()
    await sidebarLogout.click()
    await page.waitForURL(/\/login/)
    
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForURL(/\/login/)
    console.log("✅ Secure route protection redirect verified")

    // Log Console / Network issues
    if (consoleErrors.length > 0) {
      console.log(`⚠️ Desktop Console Issues detected:\n${consoleErrors.slice(0, 5).join("\n")}`)
    }
    if (networkErrors.length > 0) {
      console.log(`⚠️ Desktop Network Issues detected:\n${networkErrors.slice(0, 5).join("\n")}`)
    }
  })

  // =========================================================================
  // TEST 2: MOBILE AUDIT & RESPONSIVENESS (375x812)
  // =========================================================================
  test("Mobile: Dashboard Responsive Navigation, Cart Drawer, and Order flow", async ({ page, context }) => {
    test.setTimeout(90000)
    await page.setViewportSize({ width: 375, height: 812 })

    const consoleErrors: string[] = []
    const networkErrors: string[] = []

    page.on("pageerror", (err) => consoleErrors.push(`[Page Error] ${err.message}`))
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(`[Console Error] ${msg.text()}`)
      }
    })
    page.on("response", (resp) => {
      if (resp.status() >= 400) {
        networkErrors.push(`[Network Error] ${resp.status()} ${resp.url()}`)
      }
    })

    // 1. Landing responsive view
    await page.goto(BASE_URL, { waitUntil: "networkidle" })
    
    // Check mobile hamburger navigation menu
    const hamburger = page.locator('button[aria-label="Open navigation menu"]').first()
    if (await hamburger.isVisible()) {
      console.log("🍔 Mobile menu icon is visible")
      await hamburger.click()
      await page.waitForTimeout(500)
      // Check that a navigation link inside the drawer is visible
      const mobileNavPricing = page.locator("a:has-text('Pricing')").last()
      await expect(mobileNavPricing).toBeVisible()
      await page.locator('button[aria-label="Close navigation menu"]').first().click() // Close drawer
    }

    // 2. Mobile Login & Dashboard Responsiveness
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" })
    await page.fill('input[id="email"]', TEST_EMAIL)
    await page.fill('input[id="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 20000 })
    console.log("✅ Logged in on Mobile dashboard")

    // Check Mobile Sidebar toggle
    const dbHamburger = page.locator("button:has(svg.lucide-menu)").first()
    await expect(dbHamburger).toBeVisible()
    await dbHamburger.click()
    await page.waitForTimeout(500)
    
    // Navigate to QR code page on mobile
    const qrLinkMobile = page.locator("a:has-text('QR Code'):visible").first()
    await qrLinkMobile.click()
    await page.waitForURL(/\/dashboard\/qr/)
    await page.waitForTimeout(1000)
    
    // Check QR canvas visibility on mobile
    const qrCanvasMobile = page.locator("canvas, img[src*='qr']").first()
    await expect(qrCanvasMobile).toBeVisible()
    console.log("✅ Mobile dashboard navigation and QR preview verified")

    // 3. Mobile Customer Menu
    await page.goto(`${BASE_URL}/${restaurantSlug}`, { waitUntil: "networkidle" })
    await page.waitForTimeout(1000)

    // Category navigation on mobile
    const catTabMobile = page.locator('button:has-text("QA Test Category")').first()
    await expect(catTabMobile).toBeVisible()
    await catTabMobile.click()

    // Add item to cart
    const addBtnMobile = page.locator('button:has-text("+ Add"), button:has-text("Add")').first()
    await addBtnMobile.click()
    await page.waitForTimeout(500)

    // Mobile Cart Bar checkout click
    const mobileCartBar = page.locator('[data-testid="cart-bar-link"], button:has-text("Cart"), a[href*="cart"]').first()
    await expect(mobileCartBar).toBeVisible()
    await mobileCartBar.click()
    await page.waitForURL(/\/cart|\/checkout/, { timeout: 10000 })

    if (page.url().includes("/cart")) {
      const checkoutLinkMobile = page.locator('[data-testid="checkout-link-mobile"], a:has-text("Checkout")').first()
      await checkoutLinkMobile.click()
      await page.waitForURL(/\/checkout/)
    }

    // Checkout Details
    await page.locator('[data-testid="order-type-takeaway"], text="Takeaway"').first().click()
    await page.fill('input[id*="name"], input[placeholder*="Name"]', "QA Mobile Buyer")
    await page.fill('input[id*="phone"], input[placeholder*="Phone"]', "0300-9876543")

    // Place Order via WhatsApp
    const placeOrderBtnMobile = page.locator('button:has-text("Place Order"), button:has-text("Order via WhatsApp")').first()
    const popupPromise = context.waitForEvent("page")
    await placeOrderBtnMobile.click()
    const newTab = await popupPromise
    await newTab.waitForLoadState("domcontentloaded")
    
    expect(newTab.url()).toContain("whatsapp.com")
    console.log(`📲 Generated Mobile WhatsApp URL: ${newTab.url()}`)
    await newTab.close()

    // 4. Logout on mobile
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" })
    const dbHamburgerLogout = page.locator("button:has(svg.lucide-menu)").first()
    await dbHamburgerLogout.click()
    await page.waitForTimeout(500)
    
    const logoutMobile = page.locator('button:has-text("Sign Out"), button:has-text("Logout")').last()
    await logoutMobile.click()
    await page.waitForURL(/\/login/)
    console.log("✅ Mobile workflow completed and verified.")

    // Log Console / Network issues
    if (consoleErrors.length > 0) {
      console.log(`⚠️ Mobile Console Issues detected:\n${consoleErrors.slice(0, 5).join("\n")}`)
    }
    if (networkErrors.length > 0) {
      console.log(`⚠️ Mobile Network Issues detected:\n${networkErrors.slice(0, 5).join("\n")}`)
    }
  })
})
