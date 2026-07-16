# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer-flow.spec.ts >> Customer Ordering Flow >> complete customer journey from landing to order confirmation
- Location: e2e\customer-flow.spec.ts:8:7

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('text="Cash on Delivery":visible, button:has-text("Cash on Delivery"):visible').first()

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - link "D Digital QR Menue" [ref=e5] [cursor=pointer]:
          - /url: /restaurants
          - generic [ref=e6]: D
          - generic [ref=e7]: Digital QR Menue
        - navigation [ref=e8]:
          - link "Home" [ref=e9] [cursor=pointer]:
            - /url: /restaurants
            - img [ref=e10]
            - text: Home
          - link "Favorites" [ref=e13] [cursor=pointer]:
            - /url: /favorites
            - img [ref=e14]
            - text: Favs
          - link "Cart" [ref=e16] [cursor=pointer]:
            - /url: /cart
            - img [ref=e17]
            - text: Cart
            - generic [ref=e21]: "1"
          - link "Orders" [ref=e22] [cursor=pointer]:
            - /url: /account
            - img [ref=e23]
            - text: Orders
    - main [ref=e26]:
      - generic [ref=e27]:
        - generic [ref=e29]:
          - link [ref=e30] [cursor=pointer]:
            - /url: /cart
            - img [ref=e31]
          - generic [ref=e33]:
            - heading "Checkout" [level=1] [ref=e34]
            - paragraph [ref=e35]: Maki
        - generic [ref=e37]:
          - generic [ref=e38]:
            - generic [ref=e39]: "1"
            - generic [ref=e40]: Order Type
          - generic [ref=e42]:
            - generic [ref=e43]: "2"
            - generic [ref=e44]: Details
          - generic [ref=e46]:
            - generic [ref=e47]: "3"
            - generic [ref=e48]: Payment
        - generic [ref=e50]:
          - generic [ref=e51]:
            - generic [ref=e52]:
              - heading "1. Order Type" [level=2] [ref=e53]
              - generic [ref=e54]:
                - heading "How would you like to receive it?" [level=2] [ref=e55]
                - generic [ref=e56]:
                  - button "Dine-in Eat here" [ref=e57] [cursor=pointer]:
                    - img [ref=e58]
                    - generic [ref=e63]: Dine-in
                    - generic [ref=e64]: Eat here
                  - button "Takeaway Pick up" [ref=e65] [cursor=pointer]:
                    - img [ref=e66]
                    - generic [ref=e69]: Takeaway
                    - generic [ref=e70]: Pick up
                  - button "Delivery Home delivery" [ref=e71] [cursor=pointer]:
                    - img [ref=e72]
                    - generic [ref=e77]: Delivery
                    - generic [ref=e78]: Home delivery
            - generic [ref=e79]:
              - heading "2. Your Details" [level=2] [ref=e80]
              - generic [ref=e82]:
                - generic [ref=e83]:
                  - generic [ref=e84]: Your Name*
                  - textbox "Enter your name" [ref=e85]: Test Customer
                - generic [ref=e86]:
                  - generic [ref=e87]: Phone Number*
                  - textbox "0300-XXXXXXX" [active] [ref=e88]: 0300-1234567
            - generic [ref=e89]:
              - heading "3. Payment Method" [level=2] [ref=e90]
              - generic [ref=e91]:
                - button "Cash on Delivery" [ref=e92] [cursor=pointer]:
                  - generic [ref=e95]: Cash on Delivery
                - button "Bank Transfer" [ref=e96] [cursor=pointer]:
                  - generic [ref=e98]: Bank Transfer
          - generic [ref=e101]:
            - generic [ref=e102]:
              - heading "Order Summary" [level=3] [ref=e103]
              - generic [ref=e104]: 1 item
            - generic [ref=e106]:
              - img "Rool" [ref=e108]
              - generic [ref=e109]:
                - paragraph [ref=e110]: Rool
                - paragraph [ref=e111]: 1x Rs 3,000
              - generic [ref=e112]: Rs 3,000
            - generic [ref=e113]:
              - generic [ref=e114]:
                - generic [ref=e115]: Total
                - generic [ref=e116]: Rs 3,000
              - button "Place Order — Rs 3,000" [ref=e117] [cursor=pointer]
    - contentinfo [ref=e119]:
      - generic [ref=e120]:
        - generic [ref=e121]:
          - generic [ref=e122]:
            - generic [ref=e123]:
              - generic [ref=e124]: D
              - text: Digital QR Menue
            - paragraph [ref=e125]: Made in Pakistan with 💚
          - generic [ref=e126]:
            - link "Pricing" [ref=e127] [cursor=pointer]:
              - /url: /pricing
            - link "Restaurants" [ref=e128] [cursor=pointer]:
              - /url: /restaurants
            - link "Contact" [ref=e129] [cursor=pointer]:
              - /url: /contact
          - generic [ref=e130]:
            - link "Privacy Policy" [ref=e131] [cursor=pointer]:
              - /url: /privacy
            - link "Terms of Service" [ref=e132] [cursor=pointer]:
              - /url: /terms
        - generic [ref=e133]: © 2026 Digital QR Menue. All rights reserved.
  - button "Open Next.js Dev Tools" [ref=e139] [cursor=pointer]:
    - img [ref=e140]
  - alert [ref=e143]: Checkout | Digitalmenue.com
```

# Test source

```ts
  84  |     await page.waitForTimeout(1000)
  85  |     console.log("URL after menu goto:", page.url())
  86  | 
  87  |     // ================================================================
  88  |     // 4. ADD DISHES TO CART
  89  |     // ================================================================
  90  |     const allButtons = await page.getByRole("button").allTextContents()
  91  |     console.log("All buttons:", allButtons.filter(b => b.trim()))
  92  | 
  93  |     const addButtons = page.getByRole("button", { name: "+ Add", exact: false })
  94  |     await addButtons.first().waitFor({ state: "visible", timeout: 10000 }).catch(() => {})
  95  |     const addCount = await addButtons.count()
  96  |     console.log("'+ Add' button count:", addCount)
  97  | 
  98  |     if (addCount === 0) {
  99  |       test.skip(true, "No available dishes at this restaurant")
  100 |     }
  101 | 
  102 |     await addButtons.first().click()
  103 |     console.log("Clicked first add button")
  104 | 
  105 |     // ================================================================
  106 |     // 5. GO TO CART OR CHECKOUT (Supports both Desktop and Mobile viewports)
  107 |     // ================================================================
  108 |     const cartBar = page.getByTestId("cart-bar-link")
  109 |     const desktopCheckout = page.getByRole("link", { name: "Proceed to Checkout" })
  110 | 
  111 |     let isCartBarVisible = false
  112 |     let isDesktopVisible = false
  113 | 
  114 |     for (let i = 0; i < 10; i++) {
  115 |       isCartBarVisible = await cartBar.isVisible().catch(() => false)
  116 |       isDesktopVisible = await desktopCheckout.isVisible().catch(() => false)
  117 |       if (isCartBarVisible || isDesktopVisible) break
  118 |       await page.waitForTimeout(500)
  119 |     }
  120 | 
  121 |     console.log(`Cart bar visible: ${isCartBarVisible}, Desktop checkout visible: ${isDesktopVisible}`)
  122 | 
  123 |     if (isCartBarVisible) {
  124 |       await cartBar.click()
  125 |     } else if (isDesktopVisible) {
  126 |       await desktopCheckout.click()
  127 |     } else {
  128 |       console.log("Neither mobile cart bar nor desktop checkout button found, navigating directly to /checkout")
  129 |       await page.goto("/checkout")
  130 |     }
  131 | 
  132 |     await page.waitForURL(/\/cart|\/checkout/, { timeout: 5000 })
  133 |     console.log("URL after cart click:", page.url())
  134 | 
  135 |     // ================================================================
  136 |     // 6. GO TO CHECKOUT (IF WE LANDED ON CART PAGE)
  137 |     // ================================================================
  138 |     if (page.url().includes("/cart")) {
  139 |       const checkoutDesktop = page.getByTestId("checkout-link-desktop")
  140 |       const checkoutMobile = page.getByTestId("checkout-link-mobile")
  141 | 
  142 |       if (await checkoutDesktop.isVisible().catch(() => false)) {
  143 |         await checkoutDesktop.click()
  144 |       } else if (await checkoutMobile.isVisible().catch(() => false)) {
  145 |         await checkoutMobile.click()
  146 |       } else {
  147 |         await page.goto("/checkout")
  148 |       }
  149 |     }
  150 | 
  151 |     await page.waitForURL(/\/checkout/, { timeout: 5000 })
  152 |     await page.waitForLoadState("networkidle")
  153 |     await page.waitForTimeout(500)
  154 |     console.log("URL after checkout:", page.url())
  155 | 
  156 |     // Empty cart check
  157 |     const emptyCart = page.getByText("Your cart is empty")
  158 |     if (await emptyCart.isVisible().catch(() => false)) {
  159 |       test.skip(true, "Cart was empty at checkout")
  160 |     }
  161 | 
  162 |     // ================================================================
  163 |     // 7. SELECT TAKEAWAY ORDER TYPE
  164 |     // ================================================================
  165 |     const takeawayBtn = page.locator('[data-testid="order-type-takeaway"]:visible').first()
  166 |     await takeawayBtn.waitFor({ state: "visible", timeout: 5000 })
  167 |     await takeawayBtn.click()
  168 | 
  169 |     // ================================================================
  170 |     // 8. FILL IN CUSTOMER DETAILS
  171 |     // ================================================================
  172 |     const nameInput = page.locator('input[id*="name"]:visible, input[placeholder*="Name"]:visible, label:has-text("Your Name") + input:visible').first()
  173 |     await nameInput.waitFor({ state: "visible", timeout: 3000 })
  174 |     await nameInput.fill("Test Customer")
  175 | 
  176 |     const phoneInput = page.locator('input[id*="phone"]:visible, input[placeholder*="Phone"]:visible, label:has-text("Phone") + input:visible').first()
  177 |     await phoneInput.waitFor({ state: "visible", timeout: 3000 })
  178 |     await phoneInput.fill("0300-1234567")
  179 | 
  180 |     // ================================================================
  181 |     // 9. SELECT PAYMENT METHOD
  182 |     // ================================================================
  183 |     const codButton = page.locator('text="Cash on Delivery":visible, button:has-text("Cash on Delivery"):visible').first()
> 184 |     await codButton.click()
      |                     ^ Error: locator.click: Test timeout of 90000ms exceeded.
  185 | 
  186 |     // ================================================================
  187 |     // 10. PLACE ORDER
  188 |     // ================================================================
  189 |     const placeOrderDesktop = page.getByTestId("place-order-btn-desktop")
  190 |     const placeOrderMobile = page.getByTestId("place-order-btn-mobile")
  191 | 
  192 |     let placeOrderBtn
  193 |     if (await placeOrderDesktop.isVisible({ timeout: 1000 }).catch(() => false)) {
  194 |       placeOrderBtn = placeOrderDesktop
  195 |     } else {
  196 |       placeOrderBtn = placeOrderMobile
  197 |     }
  198 | 
  199 |     await placeOrderBtn.click()
  200 | 
  201 |     // ================================================================
  202 |     // 11. VERIFY ORDER CONFIRMATION
  203 |     // ================================================================
  204 |     await page.waitForURL(/\/order-confirm\//, { timeout: 15000 })
  205 |     console.log("URL after placement:", page.url())
  206 | 
  207 |     await expect(page.getByText(/Order Placed|Order Confirmed/)).toBeVisible({ timeout: 5000 })
  208 |     await expect(page.getByText(/#\d+/)).toBeVisible()
  209 |     await expect(page.getByText("Test Customer")).toBeVisible()
  210 |   })
  211 | })
  212 | 
```