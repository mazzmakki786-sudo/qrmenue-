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
npm run typecheck        # Same as tsc --noEmit (alias)

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

- **Framework**: Next.js 15 (App Router), React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS 3.4, `class-variance-authority` + `tailwind-merge` for UI primitives
- **Database**: Supabase PostgreSQL (~24 tables, RLS policies in migration)
- **Auth/Security**: Supabase SSR (cookie-based sessions) for owners. Customer auth is **phone + password** (no OAuth, no email). Phone stored in `customers.phone`, internal email auto-generated (`customer_<digits>@customer.digitalmenue.com`) for Supabase Auth.
- **State**: Zustand 5 with localStorage persistence (`cartStore`, `orderStore`, `toastStore`). `orderStore` persists form state (order type, name, phone, table, address, payment method) as `order-form-storage`. `toastStore` is in-memory only.
- **Forms**: react-hook-form + Zod validation
- **Email**: Resend (primary) + nodemailer fallback
- **Payments**: Cash on delivery, bank transfer — PKR only
- **Push**: Web Push API (VAPID) + Supabase Realtime for in-app toasts
- **Charts**: Recharts (analytics dashboard)
- **Icons**: Lucide React
- **QR**: qrcode.react
- **i18n**: Custom context + JSON files in `messages/{en,ur}.json`, Urdu RTL support
- **Fonts**: Inter (latin) + Noto Nastaliq Urdu (urdu), via next/font in root layout
- **Hosting**: Vercel production (primary), GitHub Pages (static export CI)

## Route Groups & Auth

| Group | Routes | Auth |
|---|---|---|
| **Root** | `/[slug]` (restaurant menu), `/pricing`, `/blog`, `/about`, `/contact`, `/terms`, `/privacy` | Public |
| `(auth)` | `/login` (owner), `/login/customer` (phone+password with signin/signup toggle), `/signup/customer` (standalone), `/signup/restaurant` | Public — redirects if logged in |
| **Root** | (removed) | `/setup-restaurant` was deleted — Google users create their restaurant directly on `/signup/restaurant` |
| `(customer)` | `/cart`, `/checkout`, `/favorites`, `/orders`, `/account`, `/restaurants`, ~9 SEO landing pages | `/checkout` and `/account` require auth; menu/cart public |
| `(owner)` | `/dashboard/*` (orders, menu, deals, branding, analytics, tables, qr, settings, subscription) | JWT session + restaurant ownership (middleware cache, 5s TTL) |
| `(superadmin)` | `/superadmin/*` (restaurants, users, subscriptions, plans, logs, announcements, analytics, settings) | JWT session + `SUPER_ADMIN_EMAIL` whitelist |

### Menu Page — Language Toggle & Layout
- `RestaurantDetailClient.tsx` renders the unified menu page (mobile + desktop in one component)
- **Language toggle** in the top nav: `?lang=ur` URL param switches dish names, descriptions, and categories to Urdu. `getName(dish)`, `getDesc(dish)`, `getCatName(cat)` helpers render the right language based on param.
- Top nav is `sticky top-0 z-50 h-14` with back button (Link to `/restaurants`, not router.back())
- Banner image has skeleton pulse animation while loading, then smooth fade-in
- Mobile uses 2-column grid (`grid-cols-2`), desktop uses 3-column (`xl:grid-cols-3`)
- `DesktopCartPanel` (right sidebar) and `CartBar` (mobile bottom) are the two cart entry points
- `DesktopDishCard` and `MobileDishCard` have nearly identical logic but different sizing

## Key Architecture

### Project Layout

```
app/
├── (auth)/              # Login/signup pages
│   ├── login/page.tsx          # Owner login (email/password + Google)
│   ├── login/customer/page.tsx # Customer login (phone+password, toggles signin/signup)
│   ├── signup/customer/page.tsx# Customer stand-alone signup (name+phone+password)
│   └── signup/restaurant/page.tsx # Owner signup with restaurant creation
├── (customer)/          # Customer-facing pages (cart, checkout, restaurants, etc.)
│   ├── cart/
│   ├── checkout/        # Order type (dine-in/delivery/takeaway), payment, tables
│   ├── restaurants/     # Restaurant directory (SSR + client search)
│   ├── restaurant/[slug]/  # SEO wrapper for restaurant detail (redirects to /[slug])
│   ├── menu/[slug]/     # Legacy menu route (308 redirect to /[slug])
│   ├── order-confirm/[id]/  # Order success page with countdown timer
│   ├── account/         # Customer account (favorites, order history)
│   ├── favorites/       # Favorites list
│   └── ✕ SEO landing pages (/digital-menu-for-restaurants, /qr-menu-app, /free-digital-menu, /digital-menu-design, /digital-menu-tablet, /digital-menu-pdf, /qr-menu-login, /digital-menu-app, /faq)
├── (owner)/             # Owner dashboard (dashboard/)
│   ├── dashboard/menu/         # Dish + category CRUD
│   ├── dashboard/orders/       # Order list + detail with status transitions
│   ├── dashboard/deals/        # Percentage/flat/bundle deals
│   ├── dashboard/analytics/    # Recharts dashboard
│   ├── dashboard/qr/           # QR code generation + download
│   ├── dashboard/tables/       # Table management (dine-in)
│   ├── dashboard/branding/     # Premium branding colors + banner
│   ├── dashboard/onboarding/   # First-time setup wizard
│   └── dashboard/settings/     # Restaurant info, hours, sounds, announcement
├── (superadmin)/        # Superadmin panel (superadmin/)
├── [slug]/              # Restaurant menu (root level, no site nav)
├── api/                 # ~62 API route files (~80+ handlers) across these directories
│   ├── auth/            # /login, /customer-login, /logout, /signup/{customer,restaurant,slug}, /check-slug, /suggest-slugs
│   ├── orders/          # Order CRUD, serialization, ready-check, cancel, check-limit, validate-restaurant
│   ├── owner/           # Dishes, categories, deals, tables, announcements, notifications, alerts, plan-status
│   ├── superadmin/      # Restaurants, users, plans, subscriptions, settings, analytics, audit-log, announcements, customers, contact-inquiries, trial-limits, check
│   ├── menu/            # Public menu & deals by slug
│   ├── public/          # Public tables endpoint (unauthenticated)
│   ├── admin/           # Admin subscription + dishes
│   ├── push/            # Web Push subscribe/unsubscribe/send/test + customer-subscribe/customer-unsubscribe
│   ├── payments/        # Payment-related endpoints
│   ├── notifications/   # Email notifications, new dish alerts, plan-request notifications
│   ├── favorites/       # Favorites CRUD + sync
│   ├── contact/         # Contact form submissions
│   ├── settings/        # Company settings
│   ├── trial/           # Trial reminders + check
│   ├── cron/            # Subscription checks, cleanup, refresh-stats
│   ├── plans/           # Public plans listing
│   └── test-email/      # Email testing
├── layout.tsx           # Root layout (fonts, GA, JSON-LD, I18nProvider)
├── page.tsx             # Homepage (~31KB hero + features + pricing)
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
├── checkout/            # DineInForm, TakeawayForm, DeliveryForm
├── owner/               # Owner dashboard components
├── superadmin/          # PlanManager, etc.
├── contact/             # Contact form
├── order-confirm/       # Order confirmation components
├── customer/            # Customer-specific components
├── pricing/             # Pricing page components
└── JsonLd.tsx           # ~15 schema.org components in one file
```

### Email (`lib/email/`)

| Template | File | Purpose |
|---|---|---|
| `planEndingAlert` | `planEndingAlert.ts` | Plan ending soon notification to owner |
| `orderLimitAlert` | `orderLimitAlert.ts` | Monthly order limit reached alert |
| `trialReminderAlert` | `trialReminderAlert.ts` | Trial ending warning |
| `trialReminders` | `trialReminders.ts` | Trial phase drip emails |
| `planRequestAlert` | `planRequestAlert.ts` | New plan request alert to superadmin when restaurant requests paid plan |

All use Resend SDK (primary) with nodemailer fallback.

**Resend sender**: `noreply@<NEXT_PUBLIC_APP_URL hostname>` — the domain MUST be verified
on https://resend.com/domains or all transactional email is rejected with 403. If signup
emails silently stop, check the Resend domain status first.

### Owner Auth — Google OAuth Only (as of Aug 2026)

Restaurant owner signup **and** login are **Google OAuth only**. The old email/password
signup (6-digit code verification), the `verify-email-code` / `resend-code` / `signup/slug`
routes, `lib/email-verification.ts`, `lib/email/confirm-email.ts`, and the
`/setup-restaurant` route were all **deleted**.

- `/signup/restaurant` requires a Google session. Signed-out visitors see only a
  "Continue with Google" button. Once authenticated, the form (name/city/phone + permanent
  URL) creates the restaurant directly via `restaurants.insert` and lands on
  `/dashboard/onboarding`.
- `/login` shows only the Google button (no email/password form).
- `POST /api/auth/login` is now **superadmin-only**: it signs in, then rejects any
  non-superadmin with a 403 and revokes the session.
- The `restaurant_signup_verification` table remains in the DB (historical data, unused).
- Existing owners log in via Google — their Supabase email must match their Google account.

## Customer Auth Flow

Customer auth is **phone-based** (no email, no OAuth):

```
Signup:  Name + Phone + Password → POST /api/auth/signup/customer
         → Internal email generated (customer_<digits>@customer.digitalmenue.com)
         → Supabase admin.createUser() + customers table insert
         → Client auto-signs in via POST /api/auth/customer-login

Login:   Phone + Password → POST /api/auth/customer-login
         → Lookup email from customers.phone
         → Supabase signInWithPassword(email, password)
         → Full security: CSRF, rate limit (10/min), account lockout, progressive delay
```

**"Remember Me"** (login page checkbox): saves phone to localStorage key `qrmenu-remembered-phone`, auto-fills on next visit.

Two entry points: `/login/customer` (combined signin/signup toggle) and `/signup/customer` (standalone). The `/api/auth/login` endpoint is used **only by the superadmin panel** (see below).

## Owner Auth Flow

### Owner Auth — Google OAuth Only
```
/login → Google OAuth → /auth/callback?redirect=...
→ If no restaurant → redirect to /signup/restaurant (NOT /restaurants as before)
→ If owner → /dashboard

/signup/restaurant (signed out) → "Continue with Google"
→ /auth/callback?redirect=/signup/restaurant
→ Returns to signup page authenticated → Fill form (name, city, phone) + choose URL
→ Submit → restaurant created directly (restaurants.insert) → /dashboard/onboarding
```

Key rules:
- **Email/password owner auth was removed** (Aug 2026). The signup form shows **no email or
  password field** — Google OAuth is the only identity provider for owners.
- The URL field appears for **all authenticated** signups (it's required — permanent, can't change).
- `POST /api/auth/login` is **superadmin-only**: after `signInWithPassword` it verifies
  `isSuperAdmin()` and rejects non-superadmins with 403 + session revoke. No
  `needsVerification` path anymore (deleted with the email-verification flow).
- Existing email/password owners sign in via Google; their Supabase email must match their Google account.

### Plan Activation (Superadmin-Only)
**Restaurants are always created as `trial`** regardless of selected plan. Paid plans require superadmin activation:

1. **Signup with paid plan** → restaurant created with `plan: "trial"` + `requested_plan: "starter|growth|premium"`
2. **Email notification** sent to superadmin via `lib/email/planRequestAlert.ts` (Resend)
3. **Owner dashboard** `/dashboard/subscription` shows "X Plan Requested" green banner
4. **Superadmin** activates via superadmin panel → `PATCH /api/superadmin/restaurants/[id]/toggle` sets `plan` + nullifies `requested_plan`
5. **Subscription page "Choose Plan"** also persists `requested_plan` to DB + opens WhatsApp to superadmin

### Key API Files
| Endpoint | File | Purpose |
|---|---|---|
| `GET /auth/callback` | `app/auth/callback/route.ts` | Google OAuth callback — owner → `/dashboard`, no restaurant → `/signup/restaurant` (respects `redirect` param for `/dashboard*`/`/signup*`) |
| `POST /api/auth/login` | `app/api/auth/login/route.ts` | **Superadmin-only** email/password login (CSRF + rate limit + lockout; 403 for non-superadmins) |
| `POST /api/auth/customer-login` | `app/api/auth/customer-login/route.ts` | Phone-based customer login with lockout |
| `POST /api/auth/signup/customer` | `app/api/auth/signup/customer/route.ts` | Phone-based customer signup (internal email) |
| `GET /api/auth/check-slug` | `app/api/auth/check-slug/route.ts` | Real-time slug availability |
| `GET /api/auth/suggest-slugs` | `app/api/auth/suggest-slugs/route.ts` | Alternative slug suggestions |
| `POST /api/notifications/plan-request` | `app/api/notifications/plan-request/route.ts` | Notify superadmin of new paid-plan request via Resend email |

## Cron Jobs

| Route | Schedule | Purpose |
|---|---|---|
| `/api/cron/check-subscriptions` | Daily | Seal expired plans/trials |
| `/api/cron/cleanup-rate-limits` | Hourly | Prune stale rate limit records from DB |
| `/api/cron/refresh-stats` | Hourly | Refresh restaurant analytics cache |

### Middleware Flow (`middleware.ts` → `lib/supabase/middleware.ts`)
- Intercepts: `/dashboard/*`, `/superadmin/*`, `/account/*`, `/api/owner/*`, `/api/superadmin/*`
- Uses Supabase SSR cookie-based session check (calls `getUser()` for accuracy)
- In-memory cache maps owner_id → restaurant_id (5s TTL) to avoid repeated DB queries
- Injects `x-restaurant-id`, `x-owner-id` headers for API routes
- Logged-in user without a restaurant → redirect to `/signup/restaurant` (was `/restaurants` — fixed)

### Checkout Flow
1. Cart via Zustand `cartStore` — persisted as `"qrmenu-cart"` in localStorage
2. Customer info persisted as `"qrmenu-customer-info"` in localStorage (name, phone, table, address, payment method)
3. Order type selection: dine-in (fetches `public.restaurant_tables`), delivery, takeaway
4. Dine-in validates table occupancy (checks available tables via `/api/public/tables`)
5. Submit → POST `/api/orders` (rate-limited 20/min per IP, CSRF protected)
6. **Per-restaurant serialization**: `enqueueOrder()` — Promise chain keyed by `restaurant_id`

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

### WhatsApp Integration (`lib/whatsapp.ts`)
`buildWhatsAppURL(order)` generates a `wa.me` link with formatted order details (items list, total, customer info, payment method). Sent on first order load after 1.5s delay from the client side.

### Public API Routes
- `/api/public/tables` — unauthenticated endpoint returning table numbers and QR codes for dine-in customers. No auth required.

### Admin API Routes
- `/api/admin/subscription` — admin subscription management
- `/api/admin/dishes` — admin dish CRUD (superadmin-level)

### API Route Pattern
- Every handler wraps with `safeRoute()` from `lib/api-error.ts` — catches thrown errors, enforces 1MB payload limit on POST/PUT/PATCH, returns `{error: "INTERNAL_SERVER_ERROR", message}` with status 500 on unhandled exceptions.
- Pattern: `export const GET/POST = safeRoute(async (req) => { ... })`
- State-changing endpoints: call `csrfGuard(request)` early (returns `NextResponse` with 403 on failure)
- Rate limiting: `rateLimit(ip, maxRequests, windowSeconds)` from `lib/rate-limiter.ts` — returns boolean
- **Always pass `restaurant_id` filter** with service-role clients — RLS is bypassed, manual scoping prevents cross-restaurant leaks
- **Safe JSON parsing**: use `safeJson(request)` from `lib/api-error.ts` instead of raw `request.json()`

### Rate Limiter Named Configs (`lib/rate-limiter.ts`)
Predefined configs per endpoint context: `login` (10/min), `customer-login` (10/min), `orders:create` (20/min), `orders:update` (10/min), `owner:write` (15/min), `owner:read` (30/min), `superadmin:write` (10/min), `superadmin:read` (30/min), `menu:read` (30/min), `notifications:send` (5/min), `favorites:write` (30/min), `settings:read` (20/min). Default: 20/min. Dual-layer: in-memory (fast path) + DB (fallback to prevent per-instance skew).

### Auth Security Layer
- `lib/auth-validation.ts` — Zod schemas for login, customer-login, customer-signup, restaurant-signup with input sanitization (strips HTML tags). Password requires min 6 chars, mixed case, a digit, a special char.
- `lib/account-lockout.ts` — progressive delay + lockout on failed login attempts. `checkLockout(email)` → state with `locked`/`attemptNumber`, `getProgressiveDelay()`, `recordLoginAttempt()`, `clearLoginAttempts()`. Lockout sends alert via `sendLockoutAlert()` (Resend).
- `lib/csrf.ts` — CSRF guard for state-changing endpoints.

### Supabase Clients
| Client | File | Use |
|---|---|---|
| `createClient()` (browser) | `lib/supabase/client.ts` | Browser components — anon key + session cookie |
| `createClient()` (server) | `lib/supabase/server.ts` | Route handlers, server components — anon key + request cookie |
| `createAdminClient()` | `lib/supabase/server.ts` | Superadmin routes, bg ops — service role key (bypasses RLS) |
| `createPooledClient()` | `lib/supabase/server.ts` | High-concurrency (pgBouncer 6543) — service role + pool URL |

### Custom Hooks (`lib/hooks/`)

Data-fetching hooks abstracted from Zustand: `usePlans`, `useDeals`, `useFavorites`, `useSubscription`, `useCompanySettings`, `usePushNotifications`, `useCustomerPushNotifications`. These wrap `useEffect` + Supabase queries and return `{ data, loading, error }` — not persisted, not global state.

### Zustand Stores
| Store | File | Persistence | Purpose |
|---|---|---|---|
| `useCartStore` | `stores/cartStore.ts` | `qrmenu-cart` (localStorage) | Items, deals, discount computation, delivery fee |
| `useOrderStore` | `stores/orderStore.ts` | `order-form-storage` (localStorage) | Checkout form state (order type, name, phone, table, address, payment method) |
| `useToastStore` | `stores/toastStore.ts` | In-memory with dedup | Push notification toasts, dedup by `order_id + title` |

### Caching & Rendering
- Menu page `/[slug]`: ISR `revalidate = 60` (also via legacy `/menu/[slug]` → 308 redirect)
- Public/pricing/blog/SEO landing pages: ISR `revalidate = 3600`
- Auth/dashboard/settings: `export const dynamic = "force-dynamic"`
- API menu: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`
- In-memory cache (`lib/cache.ts`): restaurant lookups 5s, dish prices 15s, order counts 10s, plan config 5min
- No Redis — single Vercel instance assumption

### Security (next.config.ts)
- CSP: `default-src 'self'` with explicit allowlists (GTM, GA, Supabase, Google Fonts)
- HSTS: `max-age=63072000; includeSubDomains; preload`
- X-Frame-Options: `DENY`, Permissions-Policy: no camera/mic/geo
- CORS scoped to `APP_URL` env var
- `serverExternalPackages`: bcryptjs, nodemailer, web-push (excluded from bundle)

### Branding System (`lib/branding.ts`)
`buildBrandingConfig(plan, planLimits, dbRow?)` → `BrandingConfig` with `primaryColor`, `accentColor`, `bannerEnabled`, `hasCustomBranding`. Premium plan only. **DB columns** (`brand_primary_color`, `brand_accent_color`) exist and are read but **no UI applies them yet**.

### Banner Feature
Available to all plan owners. Owners can upload a banner image in **Settings** or **Branding** page. Menu page shows banner → logo fallback → gradient on both mobile + desktop. Upload goes to `dish-images` bucket under `banners/` path.

### Sound System (`lib/sound.ts`)
Client-side audio notifications. `playOrderAlert()`, `playStatusChange()`, `playNotification()`, `playOrderConfirmed()` — Web Audio API synthesizer tones, no audio files. `setSoundEnabled()` toggle. Used by realtime subscription callbacks in the owner dashboard and on checkout success.

### i18n System
- Custom context provider (`lib/i18n/context.tsx`) — not next-intl
- Translation files: `messages/en.json`, `messages/ur.json`
- Hook: `useI18n()` returns `{ lang, setLang, t }`
- Restaurant names: `name_ur`/`description_ur` DB columns, RTL-aware
- Blog articles are inline in code — NOT translated via JSON files

### Realtime Subscriptions
- Channel names: `uid('prefix-' + restaurantId)` from `lib/realtime.ts` — random suffix prevents cross-tab conflicts
- Subscribe in `useEffect`, always return cleanup `() => supabase.removeChannel(channel)`
- Tables must be added to `supabase_realtime` publication via migration (the `orders` table publishes all columns)
- **Order tracking** (`components/order-confirm/useOrderTracking.ts`): subscribes to `orders` UPDATE events. **Polling fallback** — if no realtime event for 8s, polls every 5s for `order_status, ready_at, updated_at, prepared_at`. Critical for live countdown: `ready_at` must be fetched by polling since the realtime payload may miss status transitions.
- **Menu page** (`RestaurantDetailClient.tsx`): subscribes to `restaurants` UPDATE to live-update open/closed status + opening hours (via payload).
- **Owner order detail**: subscribes to `orders` UPDATE on a single order id.
- **Bell notifications**: 3 channels — orders INSERT (alert+sound), orders UPDATE (status toast), owner_notifications INSERT (announcement modal)
- Push notifications layer on top: Web Push API (VAPID) via `lib/push-server.ts` for owners, `lib/customer-notifications.ts` for customers.

### Logger (`lib/logger.ts`)
- `createLogger(moduleName)` produces a tagged logger with `error`, `warn`, `info`, `debug` methods
- Output format: `ISO_TIMESTAMP [LEVEL] [ModuleName] message {"json":"meta"}`
- Used in all API route handlers via `const log = createLogger("module-name")`
- Plain console calls also exist (~197 total) — all use structured `[Module Name]` prefixes; acceptable for production monitoring

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
| `qrmenu-remembered-phone` | Manual (login/customer/page) | Saved phone number for Remember Me |

### Error Boundaries
- `app/error.tsx` — root error boundary (retry/home buttons)
- `app/global-error.tsx` — replaces root layout on critical errors
- `app/not-found.tsx` — custom 404 (links to restaurants, pricing, FAQ)
- `components/shared/ErrorBoundary.tsx` — reusable client wrapper

### Superadmin
- All superadmin pages under `(superadmin)/superadmin/` with auth check in layout
- Superadmin API routes under `/api/superadmin/` checked via `SUPER_ADMIN_EMAIL` env var
- `lib/superadmin-security.ts` — `isSuperAdmin(email)` check, `checkRateLimit()`, `ensureSuperAdminEmail()`, `logAudit()`, `recordLoginAttempt()`, `seedFromEnvVar()`
- `lib/superadmin-audit.ts` — audit logging table for all superadmin actions
- Routes: restaurants CRUD (including DELETE), toggle/restore/suspend, manage plans/subscriptions/customers, contact inquiries, announcements, system settings, analytics, audit log
- Super admins stored in `super_admins` table (email-based)
- **Add Owner** (`POST /api/superadmin/users` + `AddUserModal.tsx`): creates auth user + restaurant with auto-generated slug. Accessible from main nav tab bar.
- **Delete Restaurant** (`DELETE /api/superadmin/restaurants/[id]`): cascading delete of all related records (orders, dishes, categories, deals, tables, subs, etc.). Two-step confirmation (must type "DELETE").
- **Clear Lockout** (`POST /api/superadmin/clear-lockout`): resets `superadmin_login_attempts` + `login_attempts`. Triggered from AccessDenied / locked LoginForm "Reset Lockout" button.
- **Session auto-detect**: `SuperAdminClient.tsx` checks `supabase.auth.getSession()` on mount — already-logged-in users skip the LoginForm.

### SEO Landing Pages
- ~9 static SEO pages under `(customer)/` (`/digital-menu-for-restaurants`, `/qr-menu-app`, `/free-digital-menu`, `/digital-menu-design`, `/digital-menu-tablet`, `/digital-menu-pdf`, `/qr-menu-login`, `/digital-menu-app`, `/faq`)
- All ISR `revalidate = 3600`
- Canonical URLs consolidate into `/digital-menu-for-restaurants` via next.config redirects
- Shared JSON-LD structured data across pages

## Common Gotchas

### Routing
- **`[slug]` catches all unmatched single-segment paths**. Unknown slugs return `notFound()` (404) — no redirect. Only serves restaurants with `is_active=true` AND `is_suspended=false`.
- **`old_slug`** stores previous slug on rename — NOT read for redirects; old URLs 404.
- **Reserved slugs** in `lib/slug.ts` must stay synced with route structure. Current routes needing reservation: `setup-restaurant` (kept reserved — route deleted, 404s safely), login/signup/auth/api, customer routes, dashboard, superadmin, SEO landing pages.
- **Non-owner redirects**: logged-in users without a restaurant are now sent to `/signup/restaurant` (not `/restaurants` as before). This applies in middleware, callback route, login page, and homepage.
- **Dead components removed** (Jul 2026): `MenuContent`, `DishGrid`, `CategoryTabs`, `MenuHeader`, `MenuFooter`, `CartDrawer` in `components/customer/` were all dead code (not imported anywhere) and have been deleted. `RestaurantDetailClient` is the active menu renderer.

### Database & API
- **Service-role queries need explicit `.eq("restaurant_id", id)`** — RLS is bypassed by `createAdminClient()`.
- **Orders use serialized writes**: `enqueueOrder()` per `restaurant_id` — don't bypass.
- **`deal_id` FK can cause silent INSERT failure**: If a stale deal (e.g. deleted by owner) is in the cart at checkout, the `orders.deal_id` FK constraint to `deals(id)` rejects the INSERT. The API handles this gracefully — validates the deal's existence against the DB and clears it before inserting.
- **Rate limiter is dual-layer**: in-memory (fast) + DB (fallback). When in-memory hits limit, verifies against DB before denying to prevent per-instance skew.
- **Adding a Realtime subscription?** The table must be in the `supabase_realtime` publication (add via migration).
- `supabase_migrations/` contains all schema migrations. Apply new ones via `apply_migration` MCP tool — ALSO update the corresponding `.sql` file.
- **Customer auth is phone-based**: don't ask customers for email. The `/api/auth/customer-login` endpoint resolves phone → email internally.
- **Owner signup is Google-only** (removed email/password signup, 6-digit verification, and `/setup-restaurant`): Google users create the restaurant directly client-side on `/signup/restaurant` (no `POST /api/auth/signup/restaurant` or `signup/slug` anymore).
- **`/api/auth/login` is superadmin-only**: it rejects non-superadmins (403 + session revoke). Owners and customers never use it.
- **Google OAuth signups**: Google-authenticated users who have no restaurant go to `/signup/restaurant`, not `/restaurants`. If they come from the signup page, the callback param `redirect=/signup/restaurant` returns them to the form.
- **`createAdminClient()` is NOT truly bypassing RLS with `@supabase/ssr`**: `createAdminClient()` in `lib/supabase/server.ts` uses `createServerClient` with the service-role key but empty cookie handlers. `@supabase/ssr`'s `createServerClient` wraps the underlying `@supabase/supabase-js` client, which sends the key as the `apiKey` parameter. When using the service-role key here, Supabase interprets the auth context by checking the `Authorization` header (set to `Bearer <service-role-key>`). This DOES bypass RLS — the `auth.role()` resolves to `service_role` in RLS policies, which by default bypasses row-level security. However, always add explicit `.eq("restaurant_id", id)` as a safety measure. For truly explicit bypass with no cookie layer, use `createClient` from `@supabase/supabase-js` directly:
  ```ts
  import { createClient } from "@supabase/supabase-js"
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  ```
- **Order API validates `deal_id` exists before INSERT**: The `POST /api/orders` handler checks the `deals` table for the submitted `deal_id`. If the deal was deleted or expired, the API clears it silently rather than failing the order.
- **`checkout` page fetches `/api/orders/validate-restaurant`**: This validates the restaurant is still active before showing the checkout form. If the response is not OK, the cart is cleared and the user is redirected to `/cart`.
- **Order confirm page has no back arrow**: The OrderConfirmation page (`app/(customer)/order-confirm/[id]/page.tsx`) explicitly excludes the `ArrowLeft` back button — customers should not navigate away from the tracking screen via header nav.

### Receipt Download/Print
- `OrderReceipt.tsx` snapshots order status on mount via `useState` — the receipt never updates after initial render (status is frozen at snapshot time).
- Download uses `html-to-image` (primary) → `html2canvas` (fallback) → `window.print()` (last resort).
- Print opens a self-contained HTML window with all CSS inline; calls `window.print()` then `window.close()`.
- The download button shows a loading spinner while capturing to prevent double-clicks.

### State & UI
- **Carts are per-restaurant**: switching restaurants clears cart via `clearCart()` in `useEffect`.
- **Toasts deduplicate**: `addToast()` dedup by `order_id + title`. Replaced-in-place, no duplicate animation.
- **Banner images**: upload to `dish-images` bucket under `banners/` path. Menu page shows banner → logo fallback → gradient. Smooth skeleton loading (`animate-pulse` + `transition-opacity`).
- **Brand colors read from DB but not yet applied to menu page CSS** (`brand_primary_color`, `brand_accent_color` columns exist, `buildBrandingConfig()` reads them but `RestaurantDetailClient` doesn't consume them for styling).
- **Mobile layout**: Customer pages (`(customer)`) use `pb-20` to avoid bottom nav overlap. Menu page (`/[slug]`) is NOT inside customer layout, has its own sticky top bar; `CartBar` uses `bottom-3`.
- **i18n on menu page**: uses URL param `?lang=ur` via `useSearchParams` — not the `useI18n()` context hook. Dish names/descriptions and category names switch between `name_en`/`name_ur` based on the param.

### Subscription & Restaurant Sealing
- Plans: `trial`, `starter`, `growth`, `premium` (each also has `*-yearly` variant for annual billing). PlanLimits interface includes `maxDishes`, `maxImages`, `maxOrders`, `maxCategories`, `canHaveTables` — see `lib/subscription.ts`.
- **Plans only activated by superadmin**: restaurants always created as `trial`. `requested_plan` column stores the paid plan owner wants. Superadmin sets `plan` + nullifies `requested_plan` via superadmin panel. See `lib/email/planRequestAlert.ts` for the email notification sent on new requests.
- A restaurant is "sealed" via `isRestaurantSealed()` in `lib/restaurant-sealed.ts`: trial end + `GRACE_PERIOD_DAYS` (3 days) passed, OR plan end date passed. Sealed → `opacity-50` on cards + `RestaurantUnavailable` component.
- Plan check runs in two places: `app/[slug]/page.tsx` (server-side, before render) AND `lib/restaurant-sealed.ts` (client-side for card rendering).
- Pricing plan mapping: `lib/map-plans.ts` — `mergeYearlyPlans()` takes DB plan rows → `PricingPlan[]` for the UI. `mapPlan()` legacy mapper for carousel.
- Subscription types: manual billing only. Plans stored in `plans` table, subscriptions in `subscriptions` table. No Stripe/Paddle integration.
- Trial limits load from DB `company_settings` table key `trial_limits` via `lib/subscription-server.ts` → `loadTrialLimitsFromDB()`, fallback to `DEFAULT_TRIAL_LIMITS`.

### One Restaurant Per Owner (DB-enforced)
- **`restaurants_owner_id_unique`** — partial unique index on `restaurants(owner_id) WHERE owner_id IS NOT NULL` (migration `00018_one_restaurant_per_owner.sql`, applied Aug 2026). No owner can ever have a second restaurant row; the DB rejects it with `unique_violation`.
- **Never use `.maybeSingle()` / `.single()` for owner-restaurant lookups.** PostgREST returns error `PGRST116` ("multiple rows") with `data = null` when an owner has >1 row, and a **zero-row** query also errors on `.single()`. Any code that only inspects `data` misreads these as "no restaurant" → wrongly redirects owners to `/signup/restaurant`. Use `fetchOwnerRestaurant(supabase, ownerId)` from `lib/owner-restaurant.ts` instead — it fetches `.limit(2)`, resolves multiple rows to the first (oldest), and returns `{ restaurant, error }` so callers can distinguish "genuinely no restaurant" from "query failed" (RLS/network). Never redirect to signup on a query error.
- Aug 2026 production incident: owner `mazmakki@gmail.com` had 6 restaurants (`lahore-grill` + test slugs `999`/`111112`/`11111`/`6666`/`aliii`); the dedupe kept `lahore-grill` (earliest `created_at` — never sort UUIDs by `id`; byte order ≠ creation order) and the unique index now prevents recurrence.

### Custom Restaurant Slug (One-Time URL)
Restaurant owners choose their URL once — permanent, can't be changed later.

**Single phase (Google signup):** The slug is chosen on the signup page — the URL field
renders for all authenticated (Google) users. The `restaurants` row is inserted directly
(client-side) on submit, then the owner lands on `/dashboard/onboarding`. There is no
post-confirmation `/setup-restaurant` step anymore (route deleted).

- **Real-time check**: debounced 400ms call to `GET /api/auth/check-slug?slug=...` — validates against reserved list + DB
- **Suggestions**: `GET /api/auth/suggest-slugs?desired=...&city=...` returns available alternatives when slug is taken
- **Validation**: only lowercase `a-z`, `0-9`, hyphens; no consecutive hyphens; min 2, max 100 chars
- **Server-side**: `lib/slug.ts` exports `validateCustomSlug()` (used for API-side checks; Google signup validates client-side + relies on the DB unique constraint)
- **Reserved slugs** in `lib/slug.ts` — sync with route structure (`setup-restaurant` kept reserved to 404 safely)
- **QR codes**: generate for the chosen custom URL, never changes

### Environment Variables (.env.example)
- `NEXT_PUBLIC_SUPABASE_URL=https://zkwwqcopkwbzbsqqxoiq.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_POOL_URL`
- `RESEND_API_KEY` — transactional email (the `noreply@<APP_URL hostname>` domain MUST be verified on resend.com or all email is rejected 403)
- `SUPER_ADMIN_EMAIL=mazzmakki786@gmail.com`
- `NEXT_PUBLIC_APP_URL=https://www.digitalmenue.com`
- `NEXT_PUBLIC_SITE_URL=https://www.digitalmenue.com`
- `NEXT_PUBLIC_APP_NAME=Digital QR Menue`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` — Web Push
- `NEXT_PUBLIC_NOINDEX_MENU_PAGES` — deprecated, not consumed by any code

## Known Tech Debt & Production Issues (Jul 2026 Audit - Score: 92/100)

### Remaining Issues (Low Priority)
| # | Issue | Type |
|---|---|---|
| 1 | 149 `:any` annotations across 55 files — mostly Supabase data mapping callbacks | Types |
| 2 | 3 duplicate IP extraction functions in `rate-limiter.ts`, `owner-audit.ts`, `superadmin-security.ts` | Duplication |
| 3 | 2 duplicate web-push init functions in `push-server.ts` and `customer-notifications.ts` | Duplication |
| 4 | 1 ESLint a11y warning: `CityAutocomplete.tsx` combobox missing `aria-controls`, `aria-expanded` | Accessibility |
| 5 | GitHub Pages deploy workflow (`.github/workflows/deploy.yml`) won't work — builds static export but project needs server runtime for API routes | CI |

### Cleaned Up
- **Organization schema added to root layout**: `OrganizationJsonLd` was exported but never rendered — now imported and rendered alongside WebSite, SoftwareApplication, LocalBusiness, and FAQPage schemas
- **Auth page noindex removed**: `/signup/restaurant`, `/signup/customer`, `/login`, `/login/customer` now return `index, follow` (had `robots: noindex, nofollow`)
- **Sitemap updated**: Added missing auth pages, fixed blog slug mismatch (`restaurant-marketing-lahore-guide` → `faisalabad-guide`), uses per-article dates instead of hardcoded `2026-07-16`
- **Title tag trimmed**: 83 chars → 52 chars (`Free Digital QR Menu for Restaurants in Pakistan — No Commission`)
- **Duplicate H3s fixed**: Mobile "How It Works" step titles changed from `<h3>` to `<p>` to avoid duplicate heading outline
- **Urdu hreflang fixed**: `/restaurants` → `/?lang=ur`
- **FAQ count aligned**: Added 4 missing questions to visible accordion (10 now match JSON-LD)
- **Schema URLs normalized**: All use `www.digitalmenue.com` consistently
- **Dead components removed** (6 files): `MenuContent`, `DishGrid`, `CategoryTabs`, `MenuHeader`, `MenuFooter`, `CartDrawer`
- **Stale env files deleted**: `.env.prod`, `.env.vercel`, `.env.vercel.prod` (contained old Vercel OIDC tokens and empty vars)
- **`.gitignore` fixed**: Changed `.env*` catch-all to explicit patterns so `.env.example` stays tracked
- **Console statements**: ~197 total — all use `createLogger()` or structured `[Module Name]` prefixes; acceptable for production monitoring

### Auth & OAuth
- Google OAuth callback: `app/auth/callback/route.ts` uses dynamic `origin` (no hardcoded URLs)
- Google provider configured in Supabase Dashboard + Google Cloud Console OAuth credentials
- Authorized redirect URIs in Google Cloud Console must match Supabase Auth's callback URL (`https://zkwwqcopkwbzbsqqxoiq.supabase.co/auth/v1/callback`)
- **Important**: Only owner auth uses Google OAuth. Customer auth is phone + password only.

## Types
- `types/supabase.ts` — Auto-generated from `generate_typescript_types`. Regen after schema changes.
- `types/index.ts` — Shared type helpers and re-exports (Restaurant, Category, Dish, Order, OrderType, PaymentMethod interfaces).

## Superadmin Plans Manager (`components/superadmin/PlanManager.tsx`)
In-app plan editor for superadmins. Full CRUD on plans table: prices, limits, offer/discount fields, features, custom features list. Has real-time Supabase subscription. Edits call `PATCH /api/superadmin/plans/[slug]` which invalidates the plans cache server-side.

## Audit Logging
- **Owner audit** (`lib/owner-audit.ts`): `logOwnerAction(restaurantId, ownerId, action, details, ip)` writes to `owner_audit_log` table. Used in owner API routes.
- **Superadmin audit** (`lib/superadmin-audit.ts`): `logSuperadminAction(userId, action, details, ip)` writes to `superadmin_audit_log` table. Used in all superadmin API routes.
- **Customer audit** (`lib/owner-audit.ts`): `logCustomerAction(customerId, action, details, ip)` — used in orders API (create, cancel).

## Migration History (`supabase_migrations/`)
| File | What |
|---|---|
| `00000_initial_schema.sql` | All tables + indexes + triggers |
| `00001_rls_policies.sql` | Row-level security policies |
| `00002_jazzcash_removal.sql` | Removed JazzCash payment columns |
| `00003_remove_ai_features.sql` | Removed AI features tables/columns |
| `00004_add_can_have_tables.sql` | Added `can_have_tables` column to plans |
| `00005_add_customers_phone_unique.sql` | Unique constraint on customers.phone for phone-based auth |
| `00006_add_requested_plan_column.sql` | Added `requested_plan` TEXT column to restaurants for superadmin-only plan activation |
| `00007_add_delivery_fee_to_orders.sql` | Added `delivery_fee` + `table_id` columns to orders table |
| `00008_add_restaurant_payment_till_qr.sql` | Added `payment_till_id` + `payment_qr_url` columns to restaurants for Bank Transfer display |
| `00009_restaurant_signup_verification.sql` | `restaurant_signup_verification` table — hashed 6-digit signup codes + confirmation action_link. **Unused since email signup removal (Aug 2026)** — left in place for historical data |
| `security_rls_fix.sql` | RLS policy fixes |
| `trial_reminder_emails.sql` | Trial reminder email settings |

**Note**: Some columns like `delivery_fee` and `table_id` on `orders` were added directly to the DB (no migration file tracked at the time). `00007_add_delivery_fee_to_orders.sql` was created retroactively for parity. The auto-generated `types/supabase.ts` is the source of truth for the actual schema — regenerate after any schema change.

## Supabase MCP Tools Available

- `execute_sql` — run queries (read/write data)
- `apply_migration` — DDL operations (schema changes; also update the `.sql` file in `supabase_migrations/`)
- `list_tables` / `list_migrations` — explore schema
- `get_logs` / `get_advisors` — debug issues
- `generate_typescript_types` — regenerate `types/supabase.ts`
- `search_docs` — look up Supabase docs
- `get_project_url` / `get_publishable_keys` — get project info

## Notable Files Outside App

| File | Purpose |
|---|---|
| `plan.md` | Legacy AI image generation blueprint (not implemented) |
| `CLAUDE.md` | This file |
| `stores/` | Zustand stores (cart, order, toast) |
| `messages/` | i18n JSON files (en, ur) |
| `.env.example` | Environment variable reference |
