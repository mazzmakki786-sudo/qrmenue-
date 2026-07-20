# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start Next.js dev server on localhost:3000
npm run build            # Full production build with type checking
npm run start            # Start production server
npm run lint             # ESLint check (Next.js built-in)
npm run deploy           # Alias: vercel --prod
npx tsc --noEmit         # Type check only (faster than full build)

# E2E Tests (Playwright)
npx playwright test                    # Run all E2E tests
npx playwright test --headed           # Run with browser visible
npx playwright test -g "test name"     # Run specific test by name
npx playwright show-report             # View last HTML report
npx playwright test --debug            # Debug tests with Playwright inspector
npx playwright codegen                 # Record interactive test

# Supabase (via MCP tools — no local CLI required)
# use apply_migration tool for DDL, execute_sql for queries
```

## Project Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript 5.8 (strict mode)
- **Styling**: Tailwind CSS 3.4, `class-variance-authority` + `tailwind-merge` for UI primitives
- **Database**: Supabase PostgreSQL (hosted, 24 tables), RLS policies in migration
- **Auth**: Supabase SSR with cookie-based sessions; middleware intercepts `/dashboard/*`, `/api/owner/*`, `/superadmin/*`, `/api/superadmin/*`, `/account/*`
- **State**: Zustand 5 with localStorage persistence (cart, order tracking, toasts)
- **Forms**: react-hook-form + Zod validation (Zod schemas in each form component)
- **Email**: Resend (primary) + nodemailer fallback
- **Payments**: Cash on delivery, bank transfer, Easypaisa — PKR only, no card gateway
- **Push**: Web Push API (VAPID keys) + Supabase Realtime for in-app toasts
- **Charts**: Recharts (analytics dashboard)
- **Icons**: Lucide React
- **QR**: qrcode.react
- **i18n**: Custom implementation (Context + JSON files, no next-intl), Urdu RTL support

## Project Structure

```
app/
├── (auth)/            # Login, signup (restaurant/customer)
├── (customer)/        # Menu/[slug], cart, checkout, favorites, orders, restaurants, account
├── (owner)/           # Dashboard: menu, orders, analytics, settings, qr, deals, tables, branding, subscription, announcements
├── (superadmin)/      # Super admin panel: restaurants, plans, users, analytics, subscriptions, settings, announcements
├── api/               # ~60 route handlers — public, owner, superadmin, auth, cron
├── blog/              # Blog pages — articles stored as JSON in messages/blog.json
└── pricing/           # Public pricing page (server component)

components/
├── customer/          # Menu display, cart drawer, category tabs, dish grid, deal banner, reviews
├── owner/             # Dashboard stats, dish/deal CRUD forms, charts, bell notifications, menu editor
├── superadmin/        # Restaurant table, plan editor, analytics, activity logs, company settings
├── checkout/          # Dine-in / takeaway / delivery forms, WhatsApp redirect
├── shared/            # Language toggle, DashboardFooter, header, QR code display, ErrorBoundary, Toaster, PageLoader, OrderReceipt
├── ui/                # Primitive UI: button, card, badge, input, switch, separator, dialog, tabs
└── pricing/           # Pricing section + demo cards

lib/
├── supabase/          # client.ts (browser), server.ts (admin/client/pooled), middleware.ts
├── i18n/              # Translation context + hook (en.json / ur.json) — uses next/navigation detectLanguage
├── hooks/             # useSubscription, useFavorites, useDeals, usePushNotifications, usePlans, useCompanySettings
├── email/             # Email templates: plan expiration, trial reminders, order limit alerts
├── api-error.ts       # safeRoute() wrapper — catches errors, enforces 1MB payload, returns {error, message}
├── csrf.ts            # Origin/referer validation for state-changing endpoints
├── rate-limiter.ts    # In-memory sliding window + periodic DB fallback
├── cache.ts           # In-memory Map<string, {data, expiresAt}> — Redis not needed for single-instance Vercel
├── subscription*.ts   # Plan limits, billing, trial logic — getSubscriptionStatus(), getEffectiveLimits()
├── superadmin-security.ts  # Email whitelist check for superadmin access
├── realtime.ts        # uid() — generates random-suffixed channel names to prevent cross-tab conflicts
├── auth-validation.ts # Signup field validation rules
├── push-server.ts     # Web push sending + subscription cleanup (410/404)
├── customer-notifications.ts  # Push + in-app notifications for customers
├── restaurant-hours.ts  # isRestaurantOpen() — checks time against opening_hours schedule
└── sound.ts           # Web Audio API: playOrderAlert(), playStatusChange(), playNotification()

stores/                # Zustand (all use zustand/middleware persist where needed)
├── cartStore.ts       # Cart persisted as "qrmenu-cart" in localStorage
├── orderStore.ts      # Order tracking state
└── toastStore.ts      # Toast notification queue

types/
├── index.ts           # Restaurant, Category, Dish, Order, CartItem, Deal, SubscriptionStatus, PlanLimits, BlogArticle
└── supabase.ts        # Generated Supabase Database types

supabase_migrations/   # Applied migrations in order
├── 00000_initial_schema.sql            # 24 tables (restaurants, dishes, categories, orders, etc.)
├── 00001_rls_policies.sql              # Row-level security
├── 00002_jazzcash_removal.sql          # Payment method cleanup
├── 00003_remove_ai_features.sql        # Removed AI post/image generation tables
├── 00004_add_can_have_tables.sql       # Table booking plan gating column
├── security_rls_fix.sql                # Additional RLS hardening
└── trial_reminder_emails.sql           # Trial expiry reminder triggers

e2e/                   # Playwright E2E tests
├── customer-flow.spec.ts  # Full customer journey test
├── debug.spec.ts
└── ...

deploy/                # Standalone Next.js output bundle
├── server.js / loader.js
├── start.bat / start.sh
└── .env
```

## Route Groups & Auth

| Group | Routes | Auth |
|---|---|---|
| `(auth)` | `/login`, `/signup/restaurant`, `/signup/customer` | Public — redirects if already logged in |
| `(customer)` | `/menu/[slug]`, `/cart`, `/checkout`, `/favorites`, `/orders`, `/account` | Menu/cart is public; checkout/account require auth |
| `(owner)` | `/dashboard/*` | JWT session + restaurant ownership (middleware in-process cache, 5s TTL) |
| `(superadmin)` | `/superadmin/*` | JWT session + `SUPER_ADMIN_EMAIL` check via `lib/superadmin-security.ts` |

**Middleware** (`middleware.ts` → `lib/supabase/middleware.ts`):
- Intercepts protected paths, injects `x-restaurant-id` and `x-owner-id` headers for API routes
- Uses Supabase SSR cookie-based session check (fast, no `getUser()` call unless needed)
- In-memory cache maps owner_id → restaurant_id (5s TTL) to avoid repeated DB queries during warm-Instance processing

## Key Architectural Patterns

### API Route Patterns
- Every handler wraps with `safeRoute()` from `lib/api-error.ts` (catches thrown errors, returns structured `{error, message}`, enforces 1MB payload limit on POST/PUT/PATCH)
- Route pattern: `export const GET/POST = safeRoute(async (req) => { ... })`
- State-changing endpoints call `csrfGuard(request)` early in the handler
- Owner/superadmin routes use `createAdminClient()` (service role, bypasses RLS) for DB ops
- **Rate limit** sensitive endpoints with `checkRateLimit(req, "tier")` — throws `RateLimitError` caught by safeRoute
- CORS headers set globally in `next.config.ts` (allowed origins, methods, credentials)
- Server components use `getCachedClient()` / `getCachedAdminClient()` (React cache dedup)
- **Always pass `restaurant_id` filter** when querying orders/dishes/categories — the DB has row-level security but the service-role client bypasses it, so manual scoping prevents cross-restaurant data leaks
- Return consistent error shape: `{ error: "ERROR_CODE", message: "Human readable" }`

### Caching & Rendering
- Menu page (`/menu/[slug]`): ISR with `revalidate = 60` — server-rendered, cache invalidates every 60s
- API menu endpoint: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`
- Public pages (pricing, about, contact, terms, privacy): ISR with `revalidate = 3600`
- Auth/dashboard/settings pages: `export const dynamic = "force-dynamic"` — always fresh
- In-memory cache (`lib/cache.ts`): restaurant lookups 5s, dish prices 15s, order counts 10s, plan config 5min
- No Redis or external cache — single Vercel instance assumption

### Announcement / Notification Flow (Superadmin → Owner)
1. Superadmin creates draft announcement in `qr_announcements` via superadmin UI
2. On publish: iterates all active restaurants, **always inserts** into `owner_notifications` (DB), then sends push notifications (via web-push), then emails (via Resend) — three independent delivery channels
3. Browser Realtime subscription on `owner_notifications` triggers announcement modal + sound + bell badge on owner's dashboard, regardless of which screen they're on
4. Owners can view all announcements at `/dashboard/announcements` with read/unread filtering

### Order Flow
1. Customer browses menu at `/menu/[slug]` (server component, ISR revalidate=60s)
2. Cart managed via Zustand `cartStore` — persisted to localStorage as `"qrmenu-cart"`
3. Deals: applied at checkout via `selectedDeal` — supports percentage, flat, and bundle types. `computeDiscount()` in cartStore recalculates on cart changes
4. Customer info (name, phone, address) persisted to localStorage as `"qrmenu-customer-info"`
5. Checkout → POST `/api/orders` (rate-limited 20/min per IP, CSRF protected)
6. **Per-restaurant serialization**: Orders queue via `enqueueOrder()` — a Promise chain keyed by `restaurant_id` that serializes writes to prevent concurrency issues on the same restaurant's orders
7. Order items stored as JSONB array inside `orders.items` column (no separate `order_items` table)
8. Dine-in orders mark `restaurant_tables.is_occupied = true` on placement; set to `false` when order completes or is cancelled
9. Owner sees orders via realtime Realtime subscription on `orders` table
10. Status flow: `received → preparing → ready → completed` (can be cancelled from received/preparing)

### Supabase Clients
| Client | When to use | Auth |
|---|---|---|
| `lib/supabase/client.ts` — `createClient()` | Browser components (`useEffect`, event handlers) | Anon key + browser session cookie |
| `lib/supabase/server.ts` — `createClient()` | Route handlers, server components | Anon key + request cookie |
| `lib/supabase/server.ts` — `createAdminClient()` | Superadmin routes, background ops | Service role key (bypasses RLS) |
| `lib/supabase/server.ts` — `createPooledClient()` | High-concurrency serverless (pgBouncer) | Service role + pool URL |
| `getCachedClient()` / `getCachedAdminClient()` | Server components (React cache dedup) | Same as above |

### Realtime Subscriptions
- Channel names use `uid('prefix-' + restaurantId)` from `lib/realtime.ts` — appends random suffix to prevent cross-tab channel conflicts
- Pattern: subscribe in `useEffect`, cleanup in return `() => supabase.removeChannel(channel)`
- Connection health monitor: `setInterval` checks last event timestamp, shows WiFi/WifiOff icon if >90s stale
- Tables that need realtime must be added to `supabase_realtime` publication in a migration (currently: `orders`, `restaurants`, `customers`, `company_settings`, `owner_notifications`)
- Bell notification component uses three channels: orders INSERT (new order alert + sound), orders UPDATE (status change toast), owner_notifications INSERT (announcement modal)

### Rate Limiting
- In-memory sliding window per IP (`lib/rate-limiter.ts`)
- Tiers: login (10/min), orders (20/min), owner write (15/min), owner read (30/min), superadmin write (10/min)
- Periodic DB write as fallback for cross-instance defense when traffic is distributed
- Expired entries cleaned every 60s

### Cron Jobs (Vercel cron)
- `/api/cron/refresh-stats` — recalculates daily_order_stats from orders table
- `/api/cron/cleanup-rate-limits` — purges expired in-memory rate-limit entries
- `/api/cron/check-subscriptions` — checks subscription/trial expiry and sends reminder emails
- `/api/trial/reminders/check` — sends trial expiration reminder emails at configured intervals

### i18n
- Custom context provider at `lib/i18n/context.tsx` (no third-party library)
- Translation files: `messages/en.json`, `messages/ur.json`
- Blog content: `messages/blog.json` per-locale articles. Also DB-backed via `blog_articles` table for superadmin CRUD
- Urdu support: `name_ur`/`description_ur` DB columns on dishes/categories, RTL-aware layouts
- Toggle via `LanguageToggle` component rendered in shared headers/footers

### Database Schema (24 tables, centered on restaurants)
- `restaurants` — core table, FK'd by most others: dishes, categories, orders, deals, tables, daily_order_stats, etc.
- `orders` — stores items as JSONB `{dish_id, name_en, quantity, subtotal}[]`, no normalized order_items table
- `categories` + `dishes` — menu structure, dishes reference categories; `dish_options` for modifiers
- `restaurant_tables` — table management with `is_occupied` boolean for dine-in occupancy tracking
- `daily_order_stats` — materialized aggregate per restaurant per date (queried for dashboard monthly stats)
- `owner_notifications` + `customer_notifications` — in-app notification tables
- `push_subscriptions` — VAPID web push subscriptions per user
- `notification_logs` — audit trail of pushed notifications
- `subscriptions`, `plan_limits` — billing data
- `plans` — plan definitions with per-feature columns (can_have_qr, can_have_whatsapp, can_have_tables, etc.)
- `contact_inquiries` — customer support form submissions
- `blog_articles` — blog posts (DB-backed, for superadmin CRUD)

### Deployment
- Hosted on Vercel (Singapore region `sin1`)
- Custom domains: `digitalmenue.com` (primary), `www.digitalmenue.com`
- Legacy domain redirects: `qr-menue-one.vercel.app`, `qrmenu.vercel.app` → `digitalmenue.com`
- Function max durations: analytics 60s, heavy routes 30s
- Security headers via `next.config.ts`: CSP, HSTS (63072s + preload), X-Frame-Options: DENY, Permissions-Policy (no camera/mic/geo)

### Plan Gating (Table Booking)
- Tables feature is gated behind growth+ plans via `canHaveTables: boolean` in `PlanLimits`
- Owner sidebar hides "Tables" nav item for non-eligible plans; page shows upgrade prompt
- POST `/api/owner/tables` rejects creation on non-eligible plans with 403
- `/api/public/tables` returns `can_have_tables` flag; checkout disables dine-in when false
- Checked at three layers: nav sidebar → page render → API endpoint

### Sound & Notification System
- **Sound**: Web Audio API via `lib/sound.ts` — no audio files. Three distinct sounds: `playOrderAlert()` (two-tone ascending), `playStatusChange()` (single ascending), `playNotification()` (short single note). Lazy-resumes suspended AudioContext on first call.
- **Toast store** (`stores/toastStore.ts`): Zustand without persistence. `addToast()` deduplicates by `order_id + title`. Auto-removes after `duration` (default 4s). Used by BellNotification for status-change toasts.
- **BellNotification** (`components/owner/BellNotification.tsx`): Three Realtime channels — orders INSERT (new order toast + `playOrderAlert`), orders UPDATE (status toast + `playStatusChange`), owner_notifications INSERT (announcement modal + `playNotification`). Only the owner dashboard mounts this.
- **CSS animations**: Pure CSS keyframes in `globals.css`. Toast progress bar uses `@keyframes toast-progress` (no JS RAF). Entry/exit: `animate-toast-enter` / `animate-toast-exit` with GPU-composited `transform`/`opacity`.
- **Push**: VAPID web push via `lib/push-server.ts`. Subscriptions stored in `push_subscriptions` table. Cleanup on 410/404 responses.

### Zustand Store Patterns
- `cartStore`: persisted to localStorage as `"qrmenu-cart"`. Contains items, selectedDeal, customerInfo. `computeDiscount()` recalculates on cart changes.
- `orderStore`: tracks current order state (not persisted).
- `toastStore`: in-memory only (no persist). Toast queue with dedup by order_id.
- **Pattern**: Always use `useXxxStore((s) => s.field)` selector to avoid unnecessary re-renders. Never subscribe to the entire store.

### Restaurant Hours & Availability
- `restaurants.opening_hours` stores JSON string of weekly schedule. `lib/restaurant-hours.ts` → `isRestaurantOpen()` checks current time against it.
- `restaurants.is_open` is a boolean override — if false, restaurant shows as closed regardless of hours.
- Menu page checks both `is_open` and `opening_hours` before displaying the menu. Closed restaurants show `RestaurantUnavailable` component.

### Common Gotchas
- **Service-role queries need explicit scoping**: `createAdminClient()` bypasses RLS. Always pass `restaurant_id = ?` or `.eq("restaurant_id", id)` when querying tenant-scoped tables. Missing this filter = leaking all restaurants' data.
- **Realtime tables must be in publication**: Adding a new table to Realtime subscriptions requires a migration adding it to the `supabase_realtime` publication. The subscription won't work otherwise.
- **CSRF on state-changing endpoints**: Every POST/PUT/PATCH/DELETE handler must call `csrfGuard(request)` early. Origin/referer validation — set `CORS_ORIGINS` env var for custom domains.
- **Rate limit tiers are per-IP**: Login 10/min, orders 20/min, owner write 15/min, owner read 30/min. Not configurable per-restaurant.
- **Orders use serialized writes**: `enqueueOrder()` serializes per `restaurant_id`. Don't bypass it — concurrent order creation on the same restaurant causes race conditions.
- **i18n is custom**: Not next-intl. Translations in `messages/{en,ur}.json`. Blog articles in `messages/blog.json`. DB columns use `_ur` suffix (e.g. `name_ur`, `description_ur`).
- **Standalone deploy**: The `deploy/` directory contains a standalone Next.js bundle. Requires `start.bat` (Windows) or `start.sh` (Linux) to boot the Node server. `.env` must be alongside the bundle.

### Environment Variables (see `.env.example`)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — Supabase
- `SUPABASE_POOL_URL` — pgBouncer connection pooler (port 6543)
- `RESEND_API_KEY` — transactional email
- `SUPER_ADMIN_EMAIL` — superadmin access whitelist
- `NEXT_PUBLIC_APP_URL` — canonical app URL for links/redirects
- `NEXT_PUBLIC_APP_NAME` — app brand name (QRMenu.pk)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` — Web Push notifications
- `NEXT_PUBLIC_NOINDEX_MENU_PAGES` — SEO: block menu pages from index

## Supabase MCP Tools Available

This session has Supabase MCP tools for database operations:
- `execute_sql` — run queries (read/write data)
- `apply_migration` — DDL operations (schema changes)
- `list_tables` / `list_migrations` — explore schema
- `get_logs` / `get_advisors` — debug issues (check before making changes)
- `generate_typescript_types` — regenerate `types/supabase.ts` after schema changes
- `search_docs` — look up Supabase documentation
- `list_edge_functions` / `get_edge_function` / `deploy_edge_function` — for Supabase Edge Functions

When modifying the DB schema: (1) change the migration SQL file in `supabase_migrations/`, (2) apply with `apply_migration` tool to the hosted DB.
