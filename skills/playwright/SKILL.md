---
name: playwright
description: Browser automation and end-to-end testing with Playwright (Chromium, Firefox, WebKit). Use this skill when the user wants to write E2E tests, automate browser interactions, generate test code, set up Playwright Test, use the Playwright MCP for AI-driven browser control, or needs web scraping/screenshot/PDF generation. Triggers on mentions of "Playwright," "e2e testing," "browser automation," "codegen," "end-to-end tests," "cross-browser testing," "UI tests," or "test automation."
---

# Playwright — Web Testing & Automation

Browser automation framework by Microsoft supporting Chromium, Firefox, and WebKit through a single unified API. Five delivery paths depending on the task.

## 1. Playwright Test (Recommended for E2E Testing)

Full-featured test runner with auto-waiting, isolation, and web-first assertions.

### Quick Start

```bash
# In any project directory
npm init playwright@latest
# Select: TypeScript, ./e2e, add GitHub Actions workflow (Y)
```

### Key Concepts

**Locators** — Resilient element selection (never use CSS selectors or XPath directly):
```typescript
page.getByRole('button', { name: 'Submit' })
page.getByLabel('Email address')
page.getByPlaceholder('Enter your name')
page.getByTestId('submit-button')  // Best for production apps — use data-testid attributes
```

**Web-first assertions** — Auto-retry until conditions are met:
```typescript
await expect(page.locator('.status')).toHaveText('Saved')
await expect(page).toHaveTitle(/Checkout/)
await expect(page.getByRole('listitem')).toHaveCount(3)
```

**Auto-waiting** — Playwright waits for elements to be actionable before interacting. Never add `waitForTimeout` or `sleep`.

**Test isolation** — Each test gets its own browser context (fresh profile, no shared state):
```typescript
test.describe('Cart', () => {
  test('adds item to cart', async ({ page }) => {
    // Fresh context — no cookies, no localStorage from previous tests
    await page.goto('/menu/burger-house')
  })
})
```

### Writing Tests

```typescript
import { test, expect } from '@playwright/test'

test.describe('Restaurant Menu', () => {
  test('displays available dishes', async ({ page }) => {
    await page.goto('/menu/burger-house')
    await expect(page.getByTestId('dish-card')).not.toHaveCount(0)
    await expect(page.getByTestId('dish-card').first()).toBeVisible()
  })

  test('adds dish to cart', async ({ page }) => {
    await page.goto('/menu/burger-house')
    await page.getByTestId('add-to-cart-btn').first().click()
    await expect(page.getByTestId('cart-count')).toHaveText('1')
  })
})
```

### Authentication & State Reuse

```typescript
// Save auth state after login
await page.context().storageState({ path: './e2e/.auth/state.json' })

// Reuse across tests in config
// playwright.config.ts
use: {
  storageState: './e2e/.auth/state.json',
}
```

### Chrome DevTools Protocol (CDP)

For advanced scenarios like performance profiling, console monitoring, or network interception:
```typescript
// Network mocking
await page.route('**/api/orders/**', route => {
  route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) })
})

// Console monitoring
page.on('console', msg => console.log(`[browser] ${msg.type()}: ${msg.text()}`))
```

## 2. Playwright CLI (Agent-Driven Automation)

Token-efficient CLI for coding agents (Claude Code, Copilot, etc.) — no large tool schemas to load:

```bash
# Install globally
npm i -g @playwright/cli@latest

# Usage
playwright-cli open https://digitalmenue.com
playwright-cli type "Email address" user@example.com
playwright-cli click "Sign In"
playwright-cli screenshot --full-page
playwright-cli show  # Opens visual dashboard with live session screencast
```

## 3. Playwright MCP (AI Agent Browser Control)

MCP server for structured browser control via accessibility snapshots — no vision model needed:

```json
// Add to .claude/settings.json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

Uses element refs (`e5`, `e10`) to interact deterministically. Tools include:
- Navigation, clicking, typing
- Screenshots (full-page, element)
- Network interception and mocking
- Storage state management

## 4. Playwright Library (Scripting / Web Scraping)

For non-test automation — web scraping, PDF generation, screenshots:

```typescript
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
await page.goto('https://example.com/menu')
const items = await page.evaluate(() => {
  return document.querySelectorAll('.dish-item').length
})
await page.screenshot({ path: 'menu.png', fullPage: true })
await browser.close()
```

## 5. VS Code Extension

**CodeGen** — Open command palette → "Record new test" → interact with browser → Playwright writes test code automatically.

**Locator picker** — Click the "Pick locator" button, hover over elements, see the best locator string.

**Trace Viewer** — Inspect test failures: timeline, network logs, console output, DOM snapshots.

## Configuration Best Practice

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 15'] } },
  ],
})
```

## Tips for Next.js Projects

- Test against the dev server (`npm run dev`) or a preview deployment
- Mock API routes when testing UI behavior in isolation
- Use `data-testid` attributes on interactive elements for resilient locators
- Set `baseURL` in config to avoid repeating the domain in every test
- For this QR Menue project: use `page.getByTestId('dish-card')`, `getByTestId('add-to-cart-btn')`, etc.