import { chromium } from 'playwright'

const SITE = 'https://digitalmenue.com'
const results = []
const screenshots = []

async function testCustomerFlow() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
  const page = await context.newPage()

  const logs = []
  page.on('console', msg => { if (msg.type() === 'error') logs.push(`[console.error] ${msg.text()}`) })
  page.on('pageerror', err => logs.push(`[pageerror] ${err.message}`))

  // 1. Homepage
  await page.goto(SITE, { waitUntil: 'networkidle', timeout: 30000 })
  results.push('✅ Homepage loaded')
  screenshots.push('homepage')
  await page.screenshot({ path: 'test-screenshots/01-homepage.png', fullPage: true })

  // 2. Check key elements
  const title = await page.title()
  results.push(`📋 Title: ${title}`)

  // Look for CTA buttons
  const buttons = await page.getByRole('button').all()
  results.push(`🔘 Found ${buttons.length} buttons on homepage`)

  // 3. Navigate to restaurants
  try {
    await page.goto(`${SITE}/restaurants`, { waitUntil: 'networkidle', timeout: 20000 })
    results.push('✅ /restaurants loaded')
    await page.screenshot({ path: 'test-screenshots/02-restaurants.png', fullPage: true })
  } catch (e) {
    results.push(`❌ /restaurants failed: ${e.message}`)
  }

  // 4. Navigate to a menu (try common slug)
  try {
    await page.goto(`${SITE}/menu`, { waitUntil: 'networkidle', timeout: 20000 })
    results.push('✅ /menu loaded')
    await page.screenshot({ path: 'test-screenshots/03-menu.png', fullPage: true })
  } catch (e) {
    results.push(`❌ /menu failed: ${e.message}`)
  }

  // 5. Pricing
  try {
    await page.goto(`${SITE}/pricing`, { waitUntil: 'networkidle', timeout: 20000 })
    results.push('✅ /pricing loaded')
    await page.screenshot({ path: 'test-screenshots/04-pricing.png', fullPage: true })
  } catch (e) {
    results.push(`❌ /pricing failed: ${e.message}`)
  }

  // 6. Contact
  try {
    await page.goto(`${SITE}/contact`, { waitUntil: 'networkidle', timeout: 20000 })
    results.push('✅ /contact loaded')
    await page.screenshot({ path: 'test-screenshots/05-contact.png', fullPage: true })
  } catch (e) {
    results.push(`❌ /contact failed: ${e.message}`)
  }

  // 7. Mobile viewport test
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true
  })
  const mobilePage = await mobileContext.newPage()
  await mobilePage.goto(SITE, { waitUntil: 'networkidle', timeout: 20000 })
  await mobilePage.screenshot({ path: 'test-screenshots/06-mobile-home.png', fullPage: true })
  results.push('📱 Mobile viewport screenshot taken')

  // 8. Performance check
  const perf = await page.evaluate(() => ({
    domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
    loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
  }))
  results.push(`⚡ Load time: DOM ${perf.domContentLoaded}ms, Full ${perf.loadComplete}ms`)

  if (logs.length > 0) {
    results.push(`\n🐛 Console errors (${logs.length}):`)
    logs.slice(0, 10).forEach(l => results.push(`   ${l}`))
  } else {
    results.push('✅ No console errors detected')
  }

  await browser.close()
}

testCustomerFlow().then(() => {
  console.log('\n=== TEST RESULTS ===')
  console.log(results.join('\n'))
}).catch(e => {
  console.error('Test failed:', e)
})
