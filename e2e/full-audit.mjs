import { chromium } from 'playwright'

const SITE = 'https://digitalmenue.com'
const TEST_EMAIL = 'test@example.com'
const TEST_PASSWORD = 'Test1234!'

const results = []
const issues = []
const perfMetrics = []

function pass(msg) { results.push(`✅ ${msg}`) }
function fail(msg) { results.push(`❌ ${msg}`) }
function warn(msg) { results.push(`⚠️ ${msg}`) }
function issue(severity, area, msg) { issues.push({ severity, area, msg }) }

async function loadAndCheck(page, url, label) {
  try {
    const start = Date.now()
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 })
    const loadTime = Date.now() - start
    perfMetrics.push({ url, loadTime })
    if (resp.status() >= 400) {
      fail(`${label} returned ${resp.status()}`)
      issue('high', label, `Page returned status ${resp.status()}`)
      return false
    }
    pass(`${label} loaded in ${loadTime}ms (${resp.status()})`)
    return true
  } catch (e) {
    fail(`${label} failed: ${e.message}`)
    issue('high', label, `Page load error: ${e.message}`)
    return false
  }
}

async function checkConsole(page) {
  const errors = []
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  page.on('pageerror', err => errors.push(`PAGE_ERROR: ${err.message}`))
  return errors
}

;(async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
  const page = await context.newPage()

  const routeErrors = []
  page.on('response', r => { if (r.status() >= 400) routeErrors.push({ status: r.status(), url: r.url().substring(0, 120) }) })
  page.on('pageerror', err => routeErrors.push({ status: 'PAGE_ERROR', url: err.message.substring(0, 120) }))

  console.log('\n' + '='.repeat(70))
  console.log('  DIGITALMENUE.COM — COMPREHENSIVE AUDIT')
  console.log('='.repeat(70) + '\n')

  // ════════════════════════════════════════════
  // PHASE 1: PUBLIC PAGES
  // ════════════════════════════════════════════
  console.log('📄 PHASE 1: PUBLIC PAGES\n')

  const publicRoutes = [
    { url: '/', label: 'Homepage' },
    { url: '/restaurants', label: 'Restaurants list' },
    { url: '/menu', label: '/menu (should redirect)' },
    { url: '/pricing', label: 'Pricing' },
    { url: '/contact', label: 'Contact' },
    { url: '/faq', label: 'FAQ' },
    { url: '/privacy', label: 'Privacy' },
    { url: '/terms', label: 'Terms' },
    { url: '/sitemap.xml', label: 'Sitemap' },
  ]

  for (const route of publicRoutes) {
    await loadAndCheck(page, `${SITE}${route.url}`, route.label)

    // Check key content on homepage
    if (route.url === '/') {
      const title = await page.title()
      if (title.includes('Digitalmenue.com')) pass('Title contains "Digitalmenue.com"')
      else warn(`Title may need updating: "${title}"`)

      // Check for key sections
      const cta = page.locator('[data-testid="browse-restaurants-btn"]')
      if (await cta.isVisible()) pass('Hero CTA button is visible')
      else warn('Hero CTA not found — check data-testid')
    }

    if (route.url === '/pricing') {
      const pricing = page.locator('[data-testid="pricing-section"]')
      if (await pricing.isVisible()) pass('Pricing section is visible')
      else warn('Pricing section not found')
    }

    if (route.url === '/restaurants') {
      const searchInput = page.locator('[data-testid="search-input"]')
      if (await searchInput.isVisible()) pass('Restaurant search is present')
      else warn('Search input not found')

      const emptyState = page.locator('[data-testid="restaurants-empty-state"]')
      // If empty state shown, that's informative but note it
    }
  }

  if (routeErrors.length > 0) {
    warn(`Found ${routeErrors.length} route/network issues:`)
    routeErrors.slice(0, 10).forEach(e => {
      issue('high', 'Public Pages', `${e.status}: ${e.url}`)
      warn(`  ${e.status} — ${e.url}`)
    })
  }

  // ════════════════════════════════════════════
  // PHASE 2: AUTH FLOWS
  // ════════════════════════════════════════════
  console.log('\n🔐 PHASE 2: AUTH FLOWS\n')

  // Customer Login
  if (await loadAndCheck(page, `${SITE}/login/customer`, 'Customer Login page')) {
    // Check form exists
    const emailField = page.locator('input[type="email"]')
    if (await emailField.isVisible()) pass('Customer login email field exists')
    else {
      // Try finding any input
      const inputs = await page.locator('input').all()
      warn(`Customer login has ${inputs.length} input fields (couldn't find email input)`)
    }
  }

  // Staff Login
  if (await loadAndCheck(page, `${SITE}/staff/login`, 'Staff Login page')) {
    const slugField = page.locator('input[placeholder*="slug"]')
    const pinField = page.locator('input[type="password"]')
    if (await slugField.isVisible() && await pinField.isVisible()) pass('Staff login has slug + PIN fields')
    else warn('Staff login fields may need checking')
  }

  // Signup flows
  for (const type of ['customer', 'restaurant']) {
    await loadAndCheck(page, `${SITE}/signup/${type}`, `Signup (${type})`)
  }

  // ════════════════════════════════════════════
  // PHASE 3: OWNER DASHBOARD (check auth wall)
  // ════════════════════════════════════════════
  console.log('\n🏪 PHASE 3: OWNER DASHBOARD (Auth-protected)\n')

  const ownerRoutes = [
    '/dashboard', '/dashboard/menu', '/dashboard/orders',
    '/dashboard/settings', '/dashboard/subscription',
    '/dashboard/qr', '/dashboard/branding', '/dashboard/analytics',
    '/dashboard/deals', '/dashboard/staff', '/dashboard/tables',
    '/dashboard/onboarding'
  ]

  for (const route of ownerRoutes) {
    await loadAndCheck(page, `${SITE}${route}`, `Owner: ${route} (expect redirect to login)`)
  }

  // ════════════════════════════════════════════
  // PHASE 4: SUPERADMIN
  // ════════════════════════════════════════════
  console.log('\n👑 PHASE 4: SUPERADMIN\n')

  await loadAndCheck(page, `${SITE}/superadmin`, 'Superadmin (expect redirect)')

  // ════════════════════════════════════════════
  // PHASE 5: MOBILE + RESPONSIVE
  // ════════════════════════════════════════════
  console.log('\n📱 PHASE 5: MOBILE + RESPONSIVE\n')

  const mobileContext = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true })
  const mobilePage = await mobileContext.newPage()

  for (const route of ['/', '/restaurants', '/pricing', '/contact']) {
    if (await loadAndCheck(mobilePage, `${SITE}${route}`, `Mobile: ${route}`)) {
      const vp = mobilePage.viewportSize()
      pass(`  Viewport: ${vp?.width}x${vp?.height}`)
    }
  }
  await mobileContext.close()

  // ════════════════════════════════════════════
  // PHASE 6: PERFORMANCE ANALYSIS
  // ════════════════════════════════════════════
  console.log('\n⚡ PHASE 6: PERFORMANCE\n')

  // Fresh page for performance
  const perfPage = await browser.newPage()
  const perfResults = []

  for (const route of ['/', '/restaurants', '/pricing', '/contact']) {
    const start = Date.now()
    await perfPage.goto(`${SITE}${route}`, { waitUntil: 'networkidle', timeout: 30000 })
    const loadTime = Date.now() - start
    perfResults.push({ route: route || '/', loadTime })

    const perf = await perfPage.evaluate(() => ({
      domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
      domInteractive: performance.timing.domInteractive - performance.timing.navigationStart,
    }))
    pass(`${route || '/'} — DOM Interactive: ${perf.domInteractive}ms, DCL: ${perf.domContentLoaded}ms, Full: ${loadTime}ms`)

    if (loadTime > 3000) issue('medium', 'Performance', `${route} took ${loadTime}ms to load`)
  }

  await perfPage.close()

  // ════════════════════════════════════════════
  // PHASE 7: SUMMARY REPORT
  // ════════════════════════════════════════════
  console.log('\n' + '='.repeat(70))
  console.log('  AUDIT REPORT')
  console.log('='.repeat(70))

  console.log(`\n📋 Total checks: ${results.length}`)
  console.log(`✅ Passed: ${results.filter(r => r.startsWith('✅')).length}`)
  console.log(`⚠️  Warnings: ${results.filter(r => r.startsWith('⚠️')).length}`)
  console.log(`❌ Failed: ${results.filter(r => r.startsWith('❌')).length}`)

  if (issues.length > 0) {
    console.log(`\n🐛 Issues Found: ${issues.length}`)
    issues.forEach((i, idx) => {
      console.log(`  ${idx+1}. [${i.severity}] ${i.area}: ${i.msg}`)
    })
  } else {
    console.log('\n🐛 No issues found!')
  }

  console.log(`\n⚡ Performance Summary:`)
  perfResults.forEach(p => console.log(`  ${p.route}: ${p.loadTime}ms`))

  console.log('\n' + '='.repeat(70) + '\n')

  await browser.close()
})()
