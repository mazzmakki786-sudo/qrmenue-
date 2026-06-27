# QRMenu.pk — Agent Instructions

QR-menu SaaS for Pakistani restaurants. Next.js 15 (App Router) + Supabase (PostgreSQL + RLS + Realtime) + Vercel.

Three role-based route groups:
- **Owner** — `app/(owner)/dashboard/` — menu, orders, analytics, QR, subscription
- **Customer** — `app/(customer)/` — browse restaurants, order, track status
- **Super Admin** — `app/(superadmin)/superadmin/` — manage restaurants, settings, subscriptions

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint
npx tsc --noEmit   # Type check (fastest way to catch errors)
```

No test suite. Verify changes with `npx tsc --noEmit` + `npm run build`.

## Architecture

- **Framework**: Next.js 15 App Router, React 19, TypeScript 5.8 (strict mode)
- **Database/Auth/Realtime**: Supabase (PostgreSQL + RLS + Realtime subscriptions)
- **State**: Zustand with persist middleware (cart, order form). No global state library.
- **Styling**: Tailwind CSS 3.4, custom UI in `components/ui/` (Button, Input, Badge, Dialog, Card, Tabs, PasswordInput)
- **i18n**: Custom provider in `lib/i18n/`, messages in `messages/en.json` + `messages/ur.json`
- **Charts**: Recharts
- **Email**: Resend (transactional: lockout alerts, trial reminders, order alerts, plan ending)
- **Deployment**: Vercel (primary), Netlify config exists (netlify.toml)
- **Fonts**: Inter (latin) + Noto Nastaliq Urdu via `next/font/google`, CSS variables `--font-inter` and `--font-urdu`

### Key Directories

```
app/(owner)/dashboard/     # Owner pages: orders/[id], menu, analytics, qr, settings, subscription, branding, announcements, onboarding
app/(customer)/            # Customer pages: restaurants, restaurant/[slug], menu/[slug], cart, checkout, order-confirm/[id], account
app/(superadmin)/superadmin/ # Super admin: restaurants, customers, plans, analytics, settings
app/(auth)/                # login, signup/restaurant, signup/customer
app/api/                   # Route handlers (auth, orders, menu, superadmin, owner, settings, plans, notifications)
components/owner/          # Owner components (BellNotification, DishCard, OrdersChart)
components/customer/       # Customer components (MenuHeader, MenuContent, CartBar, CheckoutForm, StatusTimeline)
components/shared/         # Shared (DashboardFooter, OrderReceipt, QRCodeDisplay, ErrorBoundary, JsonLd)
components/ui/             # Base UI (Button, Input, Badge, Card, Dialog, Tabs, PasswordInput)
components/checkout/       # Checkout-specific components
lib/supabase/              # client.ts (browser), server.ts (server + admin), middleware.ts (auth session)
lib/hooks/                 # useSubscription, useCompanySettings, usePlans (client hooks)
lib/                       # auth-validation, account-lockout, rate-limiter, csrf, api-error, subscription, email, whatsapp, owner-audit, superadmin-security, realtime, utils, i18n/
stores/                    # cartStore (Zustand + persist), orderStore (Zustand + persist)
types/                     # index.ts (app types), supabase.ts (DB types)
messages/                  # en.json, ur.json (i18n translation files)
```

## Critical Patterns

### Supabase Clients (`lib/supabase/`)

Three client factories:
- `client.ts` → `createClient()` for browser (uses `@supabase/ssr` createBrowserClient)
- `server.ts` → `createClient()` for server components/API routes (uses `@supabase/ssr` createServerClient with cookies)
- `server.ts` → `createAdminClient()` for superadmin operations (uses `SUPABASE_SERVICE_ROLE_KEY`, no cookies)

**Always use the correct client.** Browser components → browser client. Server components/API routes → server client. Admin operations → admin client.

### Auth API Routes (server-side validation only)

Login, restaurant signup, and customer signup all go through API routes in `app/api/auth/`. **Never call `supabase.auth` methods directly from client pages.**

Pattern (login example):
1. `csrfGuard(request)` — CSRF origin/referer validation
2. `rateLimit(ip, 10, 60)` — rate limit by IP (login uses dedicated `"login"` tier at 10 req/min)
3. Zod schema validation (`loginSchema`/`restaurantSignupSchema`/`customerSignupSchema` from `lib/auth-validation.ts`)
4. Input sanitization via `sanitize()` (strips HTML/script tags + special characters)
5. For login only: account lockout check via `checkLockout()` (5 failed attempts → 15 min lockout), then progressive delay `(n-1)×2s capped at 60s`
6. Supabase auth call
7. On failure: record attempt; if now locked send Resend email via `sendLockoutAlert()`
8. On success: clear attempts

**All auth errors return generic messages** — never reveal whether account exists, which field failed, or whether lockout is active:
- Login errors → `"Incorrect email or password"` (all cases)
- Registration errors → generic `"Something went wrong"` (don't confirm email existence)
- Rate limited → `"Something went wrong. Please try again."`
- Password field validation errors → `"Invalid input"` (generic, not specific)

### API Route Handler Pattern

All API routes use `safeRoute()` wrapper from `lib/api-error.ts`:
```typescript
export const POST = safeRoute(async (request) => {
  // rate limit, CSRF, Zod validation, business logic
})
```

This catches all unhandled errors and returns a generic 500 in production.

### Realtime Subscriptions

Pattern used everywhere:
```typescript
const channel = supabase
  .channel(uid("unique-name"))  // uid() from lib/realtime.ts ensures unique channel names
  .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${id}` }, handler)
  .subscribe()
return () => { supabase.removeChannel(channel) }
```

Always use `uid()` from `lib/realtime.ts` for channel names. Always clean up in useEffect return.

### Account Lockout (`lib/account-lockout.ts`)

Uses `login_attempts` PostgreSQL table (no Redis). Queries for consecutive failures within 15-min window.
- `checkLockout(email)` — returns `{ locked, remainingMinutes, attemptNumber }`
- `getProgressiveDelay(attemptNumber)` — returns ms delay: `(n-1)×2s`, capped at 60s
- `recordLoginAttempt(request, email, success)` — inserts row
- `clearLoginAttempts(email)` — deletes all attempts for email

### Restaurant Open/Close (`is_open`)

- Toggle lives on dashboard (`app/(owner)/dashboard/page.tsx`) — not settings page
- `POST /api/orders` checks `restaurants.is_open` before accepting orders (returns 403 if closed)
- Customer pages subscribe to realtime `postgres_changes` on `restaurants` table to sync `is_open` instantly
- `MenuHeader`, `RestaurantDetailClient`, `RestaurantsClient` all have individual realtime subscriptions for `is_open`

### Subscription/Plan System

Plans: `trial` → `starter` (Rs 1,200/mo) → `growth` (Rs 2,500/mo) → `premium` (Rs 4,500/mo)

Limits defined in `lib/subscription.ts` (`PLAN_LIMITS`). Enforced in:
- Client: `useSubscription()` hook — fetches restaurant + counts, subscribes to realtime changes on restaurants/dishes/orders
- Server: `lib/subscription-server.ts` (`loadTrialLimitsFromDB()` — reads from `company_settings`)

Trial limits configurable from super admin panel, stored in `company_settings` key `trial_limits`.

### Audit Logging

- **Superadmin** → `superadmin_audit_log` via `logAudit()` in `lib/superadmin-security.ts`
- **Owner** → `owner_audit_log` via `logOwnerAction()` in `lib/owner-audit.ts`
  - Logged actions: `dish_created`, `dish_updated`, `category_created`, `category_deleted`, `order_updated`, `plan_updated`

## Environment Variables

All required vars in `.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY      # Server-side admin operations
SUPER_ADMIN_EMAIL              # Gates superadmin API access
RESEND_API_KEY                 # Transactional email (Resend)
NEXT_PUBLIC_APP_URL            # QR codes, emails, WhatsApp links
NEXT_PUBLIC_APP_NAME           # Display name (default "QRMenu.pk")
NEXT_PUBLIC_SITE_URL           # Optional, for CSRF origins
CORS_ORIGINS                   # Optional, comma-separated for CSRF
TWENTY_FIRST_API_KEY           # Optional, for 21st-dev/magic MCP
FRAMER_PROJECT_URL             # Optional, for Framer MCP
FRAMER_API_KEY                 # Optional, for Framer MCP
```

## Security

### Rate Limiting (`lib/rate-limiter.ts`)

All API routes have IP-based rate limiting backed by `rate_limits` table. **Fails closed** — if DB is unreachable, requests are denied. Localhost/127.0.0.1 bypasses.

Two patterns:
- **Pattern A** (older): `rateLimit(ip, max, window)` → returns boolean
- **Pattern B** (newer): `checkRateLimit(request, "tier")` → throws `RateLimitError`

Tiers: `login`(10/min), `orders:create`(5/min), `orders:update`(10/min), `owner:write`(15/min), `owner:read`(30/min), `admin:write`(10/min), `menu:read`(30/min), `notifications:send`(5/min), `superadmin:write`(10/min), `superadmin:read`(30/min), `default`(20/min) — all 60s windows.

### CSRF Protection (`lib/csrf.ts`)

All POST/PUT/PATCH/DELETE routes use `csrfGuard(request)`. Allowed origins from `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`, `CORS_ORIGINS`.

### Middleware (`middleware.ts`)

Protects `/dashboard/*`, `/superadmin/*`, `/account/*` routes. Redirects unauthenticated users to login. Verifies owner_id matches restaurant for dashboard routes. Verifies email matches `SUPER_ADMIN_EMAIL` for superadmin routes.

## Common Gotchas

- **`rating` column removed from DB** — do not query or reference `rating`/`review_count` on `restaurants` or `dishes` tables. Dashboard disables rating display.
- **`daily_order_stats` materialized view** must be refreshed (trigger on order INSERT/UPDATE). If empty, app falls back to querying orders directly.
- **html2canvas** used for order receipt PNG downloads — imported dynamically (`await import("html2canvas")`). `html-to-image` also installed.
- **Mobile bottom nav** in `app/(customer)/layout.tsx` — customer pages need `pb-24` for bottom padding. Cart badge renders as green circle.
- **Owner layout** has desktop header (hidden on mobile `<md`) + mobile header with hamburger drawer. Both include BellNotification and Sign Out. Owner pages have `noindex, nofollow, noarchive, nosnippet` in `<head>`.
- **`formatPrice()`** returns `Rs X,XXX` format (Pakistani Rupees, space between Rs and number).
- **WhatsApp links** use `wa.me/92` prefix (Pakistan country code). Built via `buildWhatsAppURL()` in `lib/whatsapp.ts`.
- **Password requirements** (server-side Zod): min 6, max 128, must contain uppercase, lowercase, digit, and special character. Client-side `PasswordInput` shows live requirement indicators.
- **`@/*` path alias** maps to root (`./*`) in tsconfig.json.
- **Order status flow**: `received` → `preparing` → `ready` → `completed` | `cancelled`. Order-detail page has Confirm/Cancel buttons (direct action, no confirmation dialog).
- **Supabase Auth** has its own rate limiting (~30 req/min/IP) — second layer beneath our application-level rate limiter.
- **CSS animations**: `slide-up`, `slide-down`, `scale-up`, `fade-in`, `shimmer` defined in tailwind.config.js. Owner drawer uses custom `slideInLeft` keyframe.
- **`loading.tsx`** exists on 5 routes (skeleton placeholders). **`error.tsx`** on 3 routes (error boundaries with retry buttons).
- **ISR**: Menu pages use `revalidate = 300` (5 min). Static pages use default.
