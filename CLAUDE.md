# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Next.js dev server on localhost:3000
npm run build            # Full production build (type checking + compilation)
npm run start            # Start production server
npm run lint             # ESLint (Next.js built-in)
npm run deploy           # Alias: vercel --prod
npx tsc --noEmit         # Type check only (faster than full build)

# E2E Tests (Playwright)
npx playwright test                    # All E2E tests (headless)
npx playwright test --headed           # Run with browser visible
npx playwright test -g "test name"     # Run specific test by name
npx playwright test --debug            # Debug with Playwright inspector
npx playwright test --ui               # UI mode for interactive debugging
npx playwright codegen                 # Record interactive test
npx playwright show-report             # View last HTML report
npx playwright test e2e/customer-flow.spec.ts  # Single test file

# Supabase (via MCP tools — no local CLI)
# use apply_migration for DDL, execute_sql for data queries
# generate_typescript_types — regenerate types/supabase.ts after schema changes
```

## Project Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript 5.8 (strict mode)
- **Styling**: Tailwind CSS 3.4, `class-variance-authority` + `tailwind-merge` for UI primitives
- **Database**: Supabase PostgreSQL (~24 tables, RLS policies in migration)
- **Auth**: Supabase SSR (cookie-based sessions, Google OAuth, email/password)
- **State**: Zustand 5 with localStorage persistence (`cartStore`, `orderStore`, `toastStore`)
- **Forms**: react-hook-form + Zod validation
- **Email**: Resend (primary) + nodemailer fallback
- **Payments**: Cash on delivery, bank transfer — PKR only
- **Push**: Web Push API (VAPID) + Supabase Realtime for in-app toasts
- **Charts**: Recharts (analytics dashboard)
- **Icons**: Lucide React
- **QR**: qrcode.react
- **i18n**: Custom context + JSON files in `messages/{en,ur}.json`, Urdu RTL support
- **Fonts**: Inter (latin) + Noto Nastaliq Urdu (urdu), via next/font in root layout
- **Hosting**: Vercel production, GitHub Pages (static export CI)

## Route Groups & Auth

| Group | Routes | Auth |
|---|---|---|
| **Root** | `/[slug]` (restaurant menu), `/pricing`, `/blog`, `/about`, `/contact` | Public |
| `(auth)` | `/login`, `/signup/*` | Public — redirects if logged in |
| `(customer)` | `/cart`, `/checkout`, `/favorites`, `/orders`, `/account`, `/restaurants`, SEO landing pages | `/checkout` and `/account` require auth; menu/cart public |
| `(owner)` | `/dashboard/*` (orders, menu, deals, branding, analytics, tables, qr, settings, subscription) | JWT session + restaurant ownership (middleware cache, 5s TTL) |
| `(superadmin)` | `/superadmin/*` (restaurants, users, subscriptions, plans, logs) | JWT session + `SUPER_ADMIN_EMAIL` whitelist |

**Note**: The `[slug]` route (`app/[slug]/page.tsx`) sits at the root level (NOT inside `(customer)`), so it gets no site navbar by default — only the root layout wrapper. A slim site bar is rendered inside `RestaurantDetailClient.tsx`.

## Key Architecture

### Project Layout

```
app/
├── (auth)/              # Login/signup pages
├── (customer)/          # Customer-facing pages (cart, checkout, restaurants, etc.)
│   ├── cart/
│   ├── checkout/
│   ├── restaurants/
│   ├── restaurant/[slug]/
│   ├── menu/[slug]/
│   ├── order-confirm/[id]/
│   └── ✕ SEO landing pages (/digital-menu-for-restaurants, /qr-menu-app, etc.)
├── (owner)/             # Owner dashboard (dashboard/)
├── (superadmin)/        # Superadmin panel (superadmin/)
├── [slug]/              # Restaurant menu (root level, no site nav)
├── api/                 # ~50 API routes
│   ├── orders/          # Order CRUD, serialization, ready-check, cancel
│   ├── owner/           # Dishes, categories, deals, tables, announcements
│   ├── superadmin/      # Restaurants, users, plans, subscriptions, settings
│   ├── auth/            # Login, signup, logout
│   ├── menu/            # Public menu & deals
│   ├── push/            # Web Push subscriptions
│   └── cron/            # Subscription checks, cleanup, refresh-stats
├── layout.tsx           # Root layout (fonts, GA, JSON-LD, I18nProvider)
├── page.tsx             # Homepage (~31KB)
├── sitemap.ts           # Dynamic XML from 4 sources
└── robots.ts            # AI crawler rules + sitemap ref
lib/
├── supabase/            # Client (browser), server (SSR), admin (service-role), middleware
├── hooks/               # useCompanySettings, usePlans, useDeals, useFavorites, etc.
├── email/               # Templates (planEndingAlert, orderLimitAlert, trialReminders)
├── stores/              # cartStore, orderStore, toastStore (Zustand)
└── (singletons)         # cache, csrf, rate-limiter, api-error, slug, realtime, branding, etc.
components/
├── shared/              # AppFooter, LandingHeader, Toaster, QRCodeDisplay, etc.
├── ui/                  # button, dialog, input, tabs, card, badge, pricing-cards, etc.
└── JsonLd.tsx           # ~15 schema.org components in one file
```

### Middleware Flow (`middleware.ts` → `lib/supabase/middleware.ts`)
- Intercepts: `/dashboard/*`, `/superadmin/*`, `/account/*`, `/api/owner/*`, `/api/superadmin/*`
- Uses Supabase SSR cookie-based session check (calls `getUser()` for accuracy)
- In-memory cache maps owner_id → restaurant_id (5s TTL) to avoid repeated DB queries
- Injects `x-restaurant-id`, `x-owner-id` headers for API routes
- Logged-in user without a restaurant → redirect to `/restaurants`

### API Route Pattern
- Every handler wraps with `safeRoute()` from `lib/api-error.ts` (catches errors, enforces 1MB payload on POST/PUT/PATCH, returns structured `{error, message}`)
- Pattern: `export const GET/POST = safeRoute(async (req) => { ... })`
- State-changing endpoints: call `csrfGuard(request)` early (returns `NextResponse` with 403 on failure)
- Rate limiting: `rateLimit(ip, maxRequests, windowSeconds)` from `lib/rate-limiter.ts` — returns boolean, caught by safeRoute as 429
- **Always pass `restaurant_id` filter** with service-role clients — RLS is bypassed, manual scoping prevents cross-restaurant leaks
- **Safe JSON parsing**: use `safeJson(request)` from `lib/api-error.ts` instead of raw `request.json()`

### Supabase Clients
| Client | File | Use |
|---|---|---|
| `createClient()` (browser) | `lib/supabase/client.ts` | Browser components — anon key + session cookie |
| `createClient()` (server) | `lib/supabase/server.ts` | Route handlers, server components — anon key + request cookie |
| `createAdminClient()` | `lib/supabase/server.ts` | Superadmin routes, bg ops — service role key (bypasses RLS) |
| `createPooledClient()` | `lib/supabase/server.ts` | High-concurrency (pgBouncer 6543) — service role + pool URL |

### Zustand Stores
| Store | File | Persistence | Purpose |
|---|---|---|---|
| `useCartStore` | `stores/cartStore.ts` | `qrmenu-cart` (localStorage) | Items, deals, discount computation, delivery fee |
| `useOrderStore` | `stores/orderStore.ts` | sessionStorage | Active order tracking, status polling |
| `useToastStore` | `stores/toastStore.ts` | In-memory with dedup | Push notification toasts, dedup by `order_id + title` |

### Caching & Rendering
- Menu page `/[slug]`: ISR `revalidate = 60` (also via legacy `/menu/[slug]` → 308 redirect)
- Public/pricing/blog/SEO landing pages: ISR `revalidate = 3600`
- Auth/dashboard/settings: `export const dynamic = "force-dynamic"`
- API menu: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`
- In-memory cache (`lib/cache.ts`): restaurant lookups 5s, dish prices 15s, order counts 10s, plan config 5min
- No Redis — single Vercel instance assumption

### Order Flow
1. Customer browses menu at `/[slug]` (ISR 60s)
2. Cart via Zustand `cartStore` — persisted as `"qrmenu-cart"` in localStorage
3. Deals: percentage, flat, bundle types. `computeDiscount()` in cartStore
4. Customer info persisted as `"qrmenu-customer-info"` in localStorage
5. Checkout → POST `/api/orders` (rate-limited 20/min per IP, CSRF protected)
6. **Per-restaurant serialization**: `enqueueOrder()` — Promise chain keyed by `restaurant_id`
7. Order items: JSONB array inside `orders.items` (no `order_items` table)
8. Dine-in: marks `restaurant_tables.is_occupied = true` on placement
9. Status flow: `received → preparing → ready → completed`
10. First order load auto-sends WhatsApp message after 1.5s delay

### Order Status State Machine (PATCH `/api/orders/[id]`)
- `received → preparing`: sets `prepared_at` + `ready_at` (based on `restaurant.delivery_time_min` or 30 min default); sends push + customer notifications
- `preparing → ready`: sends customer notification
- `ready → completed`: frees table occupancy
- Cancel (from `received`/`preparing`): uses optimistic concurrency check (validates current `order_status` matches before update); frees table occupancy

### Security (next.config.ts)
- CSP: `default-src 'self'` with explicit allowlists (GTM, GA, Supabase, Google Fonts)
- HSTS: `max-age=63072000; includeSubDomains; preload`
- X-Frame-Options: `DENY`, Permissions-Policy: no camera/mic/geo
- CORS scoped to `APP_URL` env var
- `serverExternalPackages`: bcryptjs, nodemailer, web-push (excluded from bundle)

### i18n System
- Custom context provider (`lib/i18n/context.tsx`) — not next-intl
- Translation files: `messages/en.json`, `messages/ur.json`
- Hook: `useI18n()` returns `{ lang, setLang, t }`
- Restaurant names: `name_ur`/`description_ur` DB columns, RTL-aware
- Blog articles are inline in code — NOT translated via JSON files

### Realtime Subscriptions
- Channel names: `uid('prefix-' + restaurantId)` from `lib/realtime.ts` — random suffix prevents cross-tab conflicts
- Subscribe in `useEffect`, always return `() => supabase.removeChannel(channel)` cleanup
- Tables must be added to `supabase_realtime` publication via migration (the `orders` table publishes all columns)
- **Order tracking** (`useOrderTracking.ts`): subscribes to `orders` UPDATE events. **Polling fallback** — if no realtime event for 8s, polls every 5s for `order_status, ready_at, updated_at, prepared_at`. Critical for live countdown: `ready_at` must be fetched by polling since the realtime payload may miss status transitions.
- **Menu page** (`RestaurantDetailClient.tsx`): subscribes to `restaurants` UPDATE to live-update open/closed status.
- **Owner order detail**: subscribes to `orders` UPDATE on a single order id.
- Bell notifications: 3 channels — orders INSERT (alert+sound), orders UPDATE (status toast), owner_notifications INSERT (announcement modal)
- Push notifications layer on top: Web Push API (VAPID) via `lib/push-server.ts` for owners, `lib/customer-notifications.ts` for customers.

### Structured Data (`components/JsonLd.tsx`)
~15 exported schema components in one file, from `OrganizationJsonLd` to `ServiceJsonLd`. Rendered as `<script type="application/ld+json">` — one component per page.

### CSS Design Tokens (globals.css)
Custom CSS variables drive all colors: `--color-primary` (black), `--color-accent` (#25D366), `--color-text-secondary`, `--color-border`, etc. Change these root variables instead of per-component colors.
- `font-sans` → `--font-inter` (Inter)
- `font-urdu` → `--font-urdu` (Noto Nastaliq Urdu)
- Utility classes: `safe-top`/`safe-bottom` for notched devices, `min-touch` for 44×44px touch targets, iOS input zoom prevention (`font-size: 16px !important`)

### localStorage Keys
| Key | Store | Content |
|---|---|---|
| `qrmenu-cart` | `cartStore.ts` (Zustand persist) | Items, selectedDeal, discountAmount, deliveryFee |
| `qrmenu-customer-info` | Manual (checkout/page) | Customer name/phone, table, order type, payment |

### Error Boundaries
- `app/error.tsx` — root error boundary (retry/home buttons)
- `app/global-error.tsx` — replaces root layout on critical errors
- `app/not-found.tsx` — custom 404 (links to restaurants, pricing, FAQ)
- `components/shared/ErrorBoundary.tsx` — reusable client wrapper

### Superadmin
- All superadmin pages under `(superadmin)/superadmin/` with auth check in layout
- Superadmin API routes under `/api/superadmin/` checked via `SUPER_ADMIN_EMAIL` env var
- `lib/superadmin-security.ts` — `requireSuperAdmin()` middleware for API routes
- `lib/superadmin-audit.ts` — audit logging table for all superadmin actions
- Routes: restaurants CRUD, toggle restaurant status, manage plans/subscriptions, view customers, contact inquiries, announcements, settings, analytics

### SEO Landing Pages
- ~10 static SEO pages under `(customer)/` (`/digital-menu-for-restaurants`, `/qr-menu-app`, `/free-digital-menu`, etc.)
- All ISR `revalidate = 3600`
- Canonical URLs consolidate into `/digital-menu-for-restaurants` via next.config redirects
- Shared JSON-LD structured data across pages

## Common Gotchas

### Routing
- **`[slug]` catches all unmatched single-segment paths**. Unknown slugs return `notFound()` (404) — no redirect. Only serves restaurants with `is_active=true` AND `is_suspended=false`.
- **`old_slug`** stores previous slug on rename — NOT read for redirects; old URLs 404.
- **Reserved slugs** in `lib/slug.ts` must stay synced with route structure.
- `MenuContent`, `DishGrid`, and `CategoryTabs` are **dead code** — not imported anywhere. `RestaurantDetailClient` is the active menu renderer.

### Database & API
- **Service-role queries need explicit `.eq("restaurant_id", id)`** — RLS is bypassed by `createAdminClient()`.
- **Orders use serialized writes**: `enqueueOrder()` per `restaurant_id` — don't bypass.
- **Rate limiter is dual-layer**: in-memory (fast) + DB (fallback). When in-memory hits limit, verifies against DB before denying to prevent per-instance skew.
- **Adding a Realtime subscription?** The table must be in the `supabase_realtime` publication (add via migration).
- `supabase_migrations/` contains all schema migrations. Apply new ones via `apply_migration` MCP tool — ALSO update the corresponding `.sql` file.

### State & UI
- **Carts are per-restaurant**: switching restaurants clears cart via `clearCart()` in `useEffect`.
- **Toasts deduplicate**: `addToast()` dedup by `order_id + title`. Replaced-in-place, no duplicate animation.
- **Starter price**: PKR 1,500/month on marketing pages, PKR 1,200 in JSON-LD — keep consistent.
- **Brand colors stored in DB but not yet wired** to frontend (`brand_primary_color`, `brand_accent_color` columns exist, `buildBrandingConfig()` reads them but no UI applies them yet).

### Subscription & Restaurant Sealing
- A restaurant is "sealed" when trial + `GRACE_PERIOD_DAYS` (3 days) has passed, OR their plan ended. Sealed → `opacity-50` on cards + `RestaurantUnavailable` component.
- Plan check runs in two places: `app/[slug]/page.tsx` (server-side, before render) AND `lib/restaurant-sealed.ts` (client-side for card rendering).
- Subscription types: manual billing only. Plans stored in `plans` table, subscriptions in `subscriptions` table. No Stripe/Paddle integration.

### Environment Variables (.env.example)
- `NEXT_PUBLIC_SUPABASE_URL=https://zkwwqcopkwbzbsqqxoiq.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_POOL_URL`
- `RESEND_API_KEY` — transactional email
- `SUPER_ADMIN_EMAIL=mazzmakki786@gmail.com`
- `NEXT_PUBLIC_APP_URL=https://www.digitalmenue.com`
- `NEXT_PUBLIC_SITE_URL=https://www.digitalmenue.com`
- `NEXT_PUBLIC_APP_NAME=Digital QR Menue`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` — Web Push
- `NEXT_PUBLIC_NOINDEX_MENU_PAGES=true` — block menu pages from search engines (set in production)

### Auth & OAuth
- Google OAuth callback: `app/auth/callback/route.ts` uses dynamic `origin` (no hardcoded URLs)
- Google provider configured in Supabase Dashboard + Google Cloud Console OAuth credentials
- Authorized redirect URIs in Google Cloud Console must match Supabase Auth's callback URL (`https://zkwwqcopkwbzbsqqxoiq.supabase.co/auth/v1/callback`)

## Supabase MCP Tools Available

- `execute_sql` — run queries (read/write data)
- `apply_migration` — DDL operations (schema changes; also update the `.sql` file in `supabase_migrations/`)
- `list_tables` / `list_migrations` — explore schema
- `get_logs` / `get_advisors` — debug issues
- `generate_typescript_types` — regenerate `types/supabase.ts`
- `search_docs` — look up Supabase docs
- `get_project_url` / `get_publishable_keys` — get project info

## Mobile Layout & Fixed Positioning

- **Customer layout** (`app/(customer)/layout.tsx`): provides desktop top nav + mobile bottom nav (`h-14`). All customer pages share this wrapper. Mobile content needs `pb-20` minimum to avoid bottom nav overlap.
- **Menu page** (`/[slug]` via `RestaurantDetailClient`): at root level (NOT inside customer layout), has its own unified top bar. `CartBar` uses `bottom-3` since there's no mobile bottom nav.
- **Cart/Checkout pages**: separate mobile + desktop layouts. Fixed checkout bars use `bottom-[56px]` on mobile (above the nav) and `bottom-0` on desktop.
- **Order confirm page**: own sticky header. Uses `pb-20` to prevent mobile nav overlap.
- **Dialog component** (`components/ui/dialog.tsx`): Radix-based, bottom-sheet style on mobile (`fixed left-0 right-0 bottom-0 rounded-t-[20px]`).

## Countdown Timer

- `StatusHeroSection.tsx` shows a live countdown when `order.order_status === "preparing"`.
- Depends on `order.ready_at` — set server-side in `PATCH /api/orders/[id]` (uses `restaurant.delivery_time_min` or defaults to 30 min).
- Countdown re-renders every 1s via `setInterval`.

## Owner Dashboard Order Management

- **Order detail page** (`app/(owner)/dashboard/orders/[id]/page.tsx`): fetches restaurant + order in parallel. Status buttons: "Start Preparing" → "Mark as Ready" → "Mark as Completed". Cancel button for `received`/`preparing`. Realtime subscription to `orders` UPDATE.
- **Order list page** (`app/(owner)/dashboard/orders/page.tsx`): defaults to today's orders, order number search bar.
- **PATCH API** (`app/api/orders/[id]/route.ts`): sets `prepared_at` + `ready_at` when status becomes "preparing". Uses optimistic concurrency for cancel (checks `order_status` matches). Sends push notifications.
- **Customer notifications**: `sendCustomerPushNotification()` and `createCustomerNotification()` are called on preparing/ready transitions.
