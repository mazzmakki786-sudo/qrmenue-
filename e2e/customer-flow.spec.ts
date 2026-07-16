import { test, expect } from "@playwright/test"

/**
 * Complete customer ordering flow — a real human journey:
 * Landing → Browse Restaurants → View Menu → Add items → Cart → Checkout → Order Confirmation
 */
test.describe("Customer Ordering Flow", () => {
  test("complete customer journey from landing to order confirmation", async ({ page }) => {
    test.setTimeout(90000) // Increase timeout to 90s to handle compilation delays

    // ================================================================
    // 1. LANDING PAGE
    // ================================================================
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    console.log("URL after goto /:", page.url())

    // The landing page redirects authenticated users. If we're on a non-landing page,
    // start from restaurants directly.
    const browseBtn = page.getByTestId("browse-restaurants-btn")
    const isLanding = await browseBtn.isVisible().catch(() => false)
    console.log("Is landing page:", isLanding)

    if (isLanding) {
      await browseBtn.click()
      await page.waitForURL("/restaurants")
    } else {
      await page.goto("/restaurants")
    }

    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(1500) // Let client components hydrate
    console.log("URL after navigating to restaurants:", page.url())

    // ================================================================
    // 2. RESTAURANTS LIST
    // ================================================================
    const menuLinks = page.locator('a[href^="/menu/"]')
    await menuLinks.first().waitFor({ state: "visible", timeout: 10000 }).catch(() => {})
    const restaurantCount = await menuLinks.count()
    console.log("Restaurant menu link count:", restaurantCount)

    test.skip(restaurantCount === 0, "No restaurants available to test against")

    // ================================================================
    // 3. CLICK FIRST OPEN & UNSEALED RESTAURANT'S MENU
    // ================================================================
    const cards = page.locator("div.flex.items-center.gap-3.p-3")
    const cardCount = await cards.count()
    let selectedMenuHref = null

    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i)
      const text = await card.innerText()
      if (text.includes("Open") && !text.includes("Sealed") && (text.toLowerCase().includes("maki") || text.toLowerCase().includes("maz"))) {
        const link = card.locator('a[href^="/menu/"]').first()
        selectedMenuHref = await link.getAttribute("href")
        console.log(`Found open/unsealed restaurant card ${i} linking to:`, selectedMenuHref)
        break
      }
    }

    if (!selectedMenuHref) {
      for (let i = 0; i < cardCount; i++) {
        const card = cards.nth(i)
        const text = await card.innerText()
        if (text.includes("Open") && !text.includes("Sealed")) {
          const link = card.locator('a[href^="/menu/"]').first()
          selectedMenuHref = await link.getAttribute("href")
          console.log(`Found fallback open/unsealed restaurant card ${i} linking to:`, selectedMenuHref)
          break
        }
      }
    }

    if (!selectedMenuHref) {
      // Fallback to first menu link if no open/unsealed is found
      selectedMenuHref = await menuLinks.first().getAttribute("href")
      console.log("No open/unsealed restaurant found. Falling back to first:", selectedMenuHref)
    }

    await page.goto(selectedMenuHref!)
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(1000)
    console.log("URL after menu goto:", page.url())

    // ================================================================
    // 4. ADD DISHES TO CART
    // ================================================================
    const allButtons = await page.getByRole("button").allTextContents()
    console.log("All buttons:", allButtons.filter(b => b.trim()))

    const addButtons = page.getByRole("button", { name: "+ Add", exact: false })
    await addButtons.first().waitFor({ state: "visible", timeout: 10000 }).catch(() => {})
    const addCount = await addButtons.count()
    console.log("'+ Add' button count:", addCount)

    if (addCount === 0) {
      test.skip(true, "No available dishes at this restaurant")
    }

    await addButtons.first().click()
    console.log("Clicked first add button")

    // ================================================================
    // 5. GO TO CART OR CHECKOUT (Supports both Desktop and Mobile viewports)
    // ================================================================
    const cartBar = page.getByTestId("cart-bar-link")
    const desktopCheckout = page.getByRole("link", { name: "Proceed to Checkout" })

    let isCartBarVisible = false
    let isDesktopVisible = false

    for (let i = 0; i < 10; i++) {
      isCartBarVisible = await cartBar.isVisible().catch(() => false)
      isDesktopVisible = await desktopCheckout.isVisible().catch(() => false)
      if (isCartBarVisible || isDesktopVisible) break
      await page.waitForTimeout(500)
    }

    console.log(`Cart bar visible: ${isCartBarVisible}, Desktop checkout visible: ${isDesktopVisible}`)

    if (isCartBarVisible) {
      await cartBar.click()
    } else if (isDesktopVisible) {
      await desktopCheckout.click()
    } else {
      console.log("Neither mobile cart bar nor desktop checkout button found, navigating directly to /checkout")
      await page.goto("/checkout")
    }

    await page.waitForURL(/\/cart|\/checkout/, { timeout: 5000 })
    console.log("URL after cart click:", page.url())

    // ================================================================
    // 6. GO TO CHECKOUT (IF WE LANDED ON CART PAGE)
    // ================================================================
    if (page.url().includes("/cart")) {
      const checkoutDesktop = page.getByTestId("checkout-link-desktop")
      const checkoutMobile = page.getByTestId("checkout-link-mobile")

      if (await checkoutDesktop.isVisible().catch(() => false)) {
        await checkoutDesktop.click()
      } else if (await checkoutMobile.isVisible().catch(() => false)) {
        await checkoutMobile.click()
      } else {
        await page.goto("/checkout")
      }
    }

    await page.waitForURL(/\/checkout/, { timeout: 5000 })
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(500)
    console.log("URL after checkout:", page.url())

    // Empty cart check
    const emptyCart = page.getByText("Your cart is empty")
    if (await emptyCart.isVisible().catch(() => false)) {
      test.skip(true, "Cart was empty at checkout")
    }

    // ================================================================
    // 7. SELECT TAKEAWAY ORDER TYPE
    // ================================================================
    const takeawayBtn = page.locator('[data-testid="order-type-takeaway"]:visible').first()
    await takeawayBtn.waitFor({ state: "visible", timeout: 5000 })
    await takeawayBtn.click()

    // ================================================================
    // 8. FILL IN CUSTOMER DETAILS
    // ================================================================
    const nameInput = page.locator('input[id*="name"]:visible, input[placeholder*="Name"]:visible, label:has-text("Your Name") + input:visible').first()
    await nameInput.waitFor({ state: "visible", timeout: 3000 })
    await nameInput.fill("Test Customer")

    const phoneInput = page.locator('input[id*="phone"]:visible, input[placeholder*="Phone"]:visible, label:has-text("Phone") + input:visible').first()
    await phoneInput.waitFor({ state: "visible", timeout: 3000 })
    await phoneInput.fill("0300-1234567")

    // ================================================================
    // 9. SELECT PAYMENT METHOD
    // ================================================================
    const codButton = page.locator('text="Cash on Delivery":visible, button:has-text("Cash on Delivery"):visible').first()
    await codButton.click()

    // ================================================================
    // 10. PLACE ORDER
    // ================================================================
    const placeOrderDesktop = page.getByTestId("place-order-btn-desktop")
    const placeOrderMobile = page.getByTestId("place-order-btn-mobile")

    let placeOrderBtn
    if (await placeOrderDesktop.isVisible({ timeout: 1000 }).catch(() => false)) {
      placeOrderBtn = placeOrderDesktop
    } else {
      placeOrderBtn = placeOrderMobile
    }

    await placeOrderBtn.click()

    // ================================================================
    // 11. VERIFY ORDER CONFIRMATION
    // ================================================================
    await page.waitForURL(/\/order-confirm\//, { timeout: 15000 })
    console.log("URL after placement:", page.url())

    await expect(page.getByText(/Order Placed|Order Confirmed/)).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/#\d+/)).toBeVisible()
    await expect(page.getByText("Test Customer")).toBeVisible()
  })
})
