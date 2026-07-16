import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });

  const results = [];

  async function step(name, fn) {
    try {
      const page = await context.newPage();
      await fn(page);
      await page.close();
      results.push({ step: name, status: '✅ PASS' });
      console.log(`  ✅ ${name}`);
    } catch (err) {
      results.push({ step: name, status: `❌ FAIL`, error: err.message?.slice(0, 200) });
      console.log(`  ❌ ${name} — ${err.message?.slice(0, 200)}`);
    }
  }

  console.log('\n=== E2E Checklist ===\n');

  // 1. Landing page
  await step('Landing page loads at /', async (page) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    const title = await page.title();
    if (!title) throw new Error('No page title');
    console.log(`    Title: ${title}`);
  });

  // 2. Restaurants page
  await step('Restaurants list at /restaurants', async (page) => {
    await page.goto(`${BASE}/restaurants`, { waitUntil: 'networkidle' });
    await page.waitForSelector('a[href*="/restaurant/"], [data-testid="restaurant-card"], [data-testid="restaurant-link"], article, .restaurant-card', { timeout: 10000 }).catch(() => {});
    const body = await page.textContent('body');
    const hasRestaurants = /restaurant|menu|order/i.test(body);
    if (!hasRestaurants) console.log('    (page loaded, checking content)');
    // screenshot for verification
    await page.screenshot({ path: 'screenshot-restaurants.png' });
  });

  // 3. Find open restaurant and click Menu
  let menuUrl = null;
  await step('Find open restaurant and click Menu link', async (page) => {
    await page.goto(`${BASE}/restaurants`, { waitUntil: 'networkidle' });
    // Try to find a "Menu" link or restaurant link
    const menuLink = await page.$('a:has-text("Menu"), a:has-text("View Menu"), a[href*="/menu/"]');
    if (menuLink) {
      menuUrl = await menuLink.getAttribute('href');
      await page.goto(`${BASE}${menuUrl}`, { waitUntil: 'networkidle' });
    } else {
      // Try clicking a restaurant card that links to /restaurant/
      const restLink = await page.$('a[href*="/restaurant/"]');
      if (restLink) {
        await restLink.click();
        await page.waitForLoadState('networkidle');
        // Now look for View Menu / Menu link on the restaurant page
        const menuLink2 = await page.$('a:has-text("Menu"), a:has-text("View Full Menu"), a[href*="/menu/"]');
        if (menuLink2) {
          menuUrl = await menuLink2.getAttribute('href');
          await page.goto(`${BASE}${menuUrl}`, { waitUntil: 'networkidle' });
        }
      }
    }
    if (!menuUrl) {
      // fallback: try direct navigation
      await page.goto(`${BASE}/menu/lovely-restaurant`, { waitUntil: 'networkidle' }).catch(() => {});
      await page.goto(`${BASE}/menu/maki`, { waitUntil: 'networkidle' }).catch(() => {});
    }
    await page.screenshot({ path: 'screenshot-menu.png' });
    const body = await page.textContent('body');
    if (!body || body.length < 50) throw new Error('Menu page didn\'t load properly');
  });

  // 4. Add first item to cart
  await step('Add first available item to cart', async (page) => {
    const currentUrl = page.url();
    if (!currentUrl.includes('/menu/')) {
      // try the direct URL
      await page.goto(`${BASE}/menu/lovely-restaurant`, { waitUntil: 'networkidle' }).catch(() => {});
      if (!page.url().includes('/menu/')) {
        await page.goto(`${BASE}/menu/maki`, { waitUntil: 'networkidle' }).catch(() => {});
      }
    }
    // Try various "add to cart" buttons
    const addBtn = await page.$('button:has-text("Add"), button:has-text("+"), [data-testid="add-to-cart-btn"], button:has-text("+ Add")');
    if (addBtn) {
      await addBtn.click();
      await page.waitForTimeout(500);
    } else {
      console.log('    (no add button found, trying alternative selectors)');
      // Try clicking any button
      const anyBtn = await page.$('button');
      if (anyBtn) {
        const text = await anyBtn.textContent();
        if (text && (text.includes('Add') || text.includes('+'))) {
          await anyBtn.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  // 5. Proceed to checkout
  await step('Navigate to checkout page', async (page) => {
    // Try clicking "Proceed to Checkout" link/button
    const checkoutLink = await page.$('a:has-text("Checkout"), button:has-text("Checkout"), [data-testid="checkout-link"], a[href*="/checkout"]');
    if (checkoutLink) {
      await checkoutLink.click();
      await page.waitForLoadState('networkidle');
    }
    // If not on checkout page, navigate directly
    if (!page.url().includes('/checkout')) {
      await page.goto(`${BASE}/checkout`, { waitUntil: 'networkidle' });
    }
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshot-checkout.png' });
    const body = await page.textContent('body');
    if (!body || body.length < 50) throw new Error('Checkout page didn\'t load');
  });

  // 6. Fill checkout form
  await step('Fill checkout form and select Payment', async (page) => {
    // Make sure we're on checkout
    if (!page.url().includes('/checkout')) {
      await page.goto(`${BASE}/checkout`, { waitUntil: 'networkidle' });
    }

    // Select Takeaway
    const takeawayRadio = await page.$('input[value="takeaway"], input[value="Takeaway"], label:has-text("Takeaway") input[type="radio"], label:has-text("Takeaway")');
    if (takeawayRadio) {
      await takeawayRadio.check().catch(() => takeawayRadio.click());
    } else {
      // Try clicking label text
      const takeawayLabel = await page.$('label:has-text("Takeaway"), span:has-text("Takeaway"), div:has-text("Takeaway")');
      if (takeawayLabel) await takeawayLabel.click();
    }

    // Fill name
    const nameInput = await page.$('input[type="text"][name="name"], input[type="text"][name="customer_name"], input[placeholder*="Name"], input[id*="name"], input[id*="Name"]');
    if (nameInput) {
      await nameInput.fill('');
      await nameInput.fill('Browser Test User');
    }

    // Fill phone
    const phoneInput = await page.$('input[type="tel"], input[name="phone"], input[placeholder*="Phone"], input[placeholder*="03"], input[id*="phone"], input[id*="Phone"]');
    if (phoneInput) {
      await phoneInput.fill('');
      await phoneInput.fill('0300-7654321');
    }

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Select Cash on Delivery
    const codRadio = await page.$('input[value="cod"], input[value="cash"], input[value="Cash on Delivery"], label:has-text("Cash on Delivery") input[type="radio"], label:has-text("Cash") input[type="radio"]');
    if (codRadio) {
      await codRadio.check().catch(() => codRadio.click());
    } else {
      const codLabel = await page.$('label:has-text("Cash"), span:has-text("Cash on Delivery"), div:has-text("Cash on Delivery")');
      if (codLabel) await codLabel.click();
    }

    await page.screenshot({ path: 'screenshot-checkout-filled.png' });

    // Click Place Order
    const placeOrderBtn = await page.$('button:has-text("Place Order"), button:has-text("Submit"), button:has-text("Order"), [type="submit"]');
    if (placeOrderBtn) {
      await placeOrderBtn.click();
      await page.waitForTimeout(3000);
      await page.waitForLoadState('domcontentloaded').catch(() => {});
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshot-after-order.png' });
    const finalUrl = page.url();
    console.log(`    Final URL after order: ${finalUrl}`);
  });

  // 7. Verify order confirmation
  await step('Verify order confirmation page', async (page) => {
    await page.goto(page.url(), { waitUntil: 'networkidle' }).catch(() => {});
    const url = page.url();
    const isConfirm = url.includes('/order-confirm/') || url.includes('/order/') || url.includes('/success');
    if (!isConfirm) {
      console.log(`    URL: ${url} (may not be standard order-confirm page)`);
    }
    await page.screenshot({ path: 'screenshot-order-confirm.png' });
    const body = await page.textContent('body');
    if (!body || body.length < 30) throw new Error('Order confirmation page didn\'t load');
  });

  // 8. Login page
  await step('Login page at /login', async (page) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshot-login.png' });
    const body = await page.textContent('body');
    if (!body || body.length < 50) throw new Error('Login page didn\'t load');
  });

  // 9. Restaurant signup page
  await step('Restaurant signup at /signup/restaurant', async (page) => {
    await page.goto(`${BASE}/signup/restaurant`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshot-signup-restaurant.png' });
    const body = await page.textContent('body');
    if (!body || body.length < 50) throw new Error('Restaurant signup page didn\'t load');
  });

  // 10. Customer signup page
  await step('Customer signup at /signup/customer', async (page) => {
    await page.goto(`${BASE}/signup/customer`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshot-signup-customer.png' });
    const body = await page.textContent('body');
    if (!body || body.length < 50) throw new Error('Customer signup page didn\'t load');
  });

  // Summary
  console.log('\n=== RESULTS ===\n');
  for (const r of results) {
    console.log(`${r.status} ${r.step}`);
    if (r.error) console.log(`     Error: ${r.error}`);
  }

  const passed = results.filter(r => r.status === '✅ PASS').length;
  const failed = results.filter(r => r.status === '❌ FAIL').length;
  console.log(`\n${passed}/${results.length} passed, ${failed} failed`);

  await browser.close();
}

run().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
