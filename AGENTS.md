# QRMenu.pk — Agent Instructions

## Project Overview

QR-menu SaaS for Pakistani restaurants. Next.js 15 (App Router) + Supabase + Vercel.

Three user roles with separate route groups:
- **Owner** — `app/(owner)/dashboard/` — manages menu, orders, analytics, QR, subscription
- **Customer** — `app/(customer)/` — browses restaurants, places orders, tracks status
- **Super Admin** — `app/(superadmin)/superadmin/` — manages all restaurants, settings, subscriptions

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build (use before committing)
npm run lint       # ESLint check (deprecated in Next 16 — use npx eslint directly)
npx tsc --noEmit   # Type check (fastest way to catch errors)
```

No test suite exists. Verify changes with `npx tsc --noEmit` + `npm run build`.

## Architecture

- **Framework**: Next.js 15 App Router, React 19, TypeScript 5.8
- **Database/Auth/Realtime**: Supabase (PostgreSQL + RLS + Realtime subscriptions)
- **State**: Zustand (cart), React useState (everything else)
- **Styling**: Tailwind CSS 3.4, no component library (custom UI in `components/ui/`)
- **Charts**: Recharts
- **Email**: Resend
- **Deployment**: Vercel (primary), Netlify config exists

### Key Directories

```
app/(owner)/        # Owner dashboard pages
app/(customer)/     # Customer-facing pages
app/(superadmin)/   # Super admin panel
app/api/            # API routes (superadmin, orders, settings, etc.)
components/owner/   # Owner-specific components (BellNotification, DishCard, OrdersChart)
components/customer/# Customer components (MenuHeader, MenuContent, CartBar, etc.)
components/shared/  # Shared components (DashboardFooter, OrderReceipt, QRCodeDisplay)
components/ui/      # Base UI components (Button, Input, Badge, Dialog, Card)
lib/                # Core logic (subscription, branding, supabase clients, email)
stores/             # Zustand stores (cart)
types/              # TypeScript interfaces (index.ts = app types, supabase.ts = DB types)
```

## Critical Patterns

### Supabase Clients

Two client factories in `lib/supabase/`:
- `client.ts` — `createClient()` for browser (uses `@supabase/ssr` createBrowserClient)
- `server.ts` — `createClient()` for server components/API routes, `createAdminClient()` for superadmin (uses service role key)

**Always use the correct client for the context.** Server components use server client, client components use browser client.

### Realtime Subscriptions

Pattern used everywhere:
```typescript
const supabase = createClient()
const channel = supabase
  .channel(uid("unique-name"))  // uid() from lib/realtime.ts ensures unique channel names
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders", filter: `restaurant_id=eq.${id}` }, handler)
  .subscribe()
return () => { supabase.removeChannel(channel) }
```

Always use `uid()` from `lib/realtime.ts` for channel names to avoid collisions. Always clean up in useEffect return.

### RLS Policies

All tables have Row Level Security. Orders can only be updated by the restaurant owner. Settings can only be written by the super admin email (`SUPER_ADMIN_EMAIL` env var).

### Company Settings

Stored in `company_settings` table (key-value). Consumed via `useCompanySettings()` hook which queries Supabase directly (not through API) and subscribes to realtime changes. **Never cache settings** — always `cache: "no-store"`.

### Subscription/Plan System

Plans: `trial` → `starter` → `growth` → `premium`

Limits defined in `lib/subscription.ts` (`PLAN_LIMITS`). Enforced in:
- Client: `useSubscription()` hook
- Server: `lib/subscription-server.ts` (`loadTrialLimitsFromDB()`)

Trial limits are configurable from super admin panel and stored in `company_settings`.

### Menu URL Pattern

Customer menus: `${APP_URL}/menu/${restaurant.slug}`
QR codes link to this URL.

## Environment Variables

Required (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase client
- `SUPABASE_SERVICE_ROLE_KEY` — server-side admin operations
- `SUPER_ADMIN_EMAIL` — gates superadmin API access
- `NEXT_PUBLIC_APP_URL` — used for QR codes, emails, WhatsApp links
- `RESEND_API_KEY` — transactional email

## Deployment

- **Vercel**: Auto-deploys from git. Some API routes have extended `maxDuration` in `vercel.json`.
- **Self-hosted**: `deploy/` directory has `server.js` + `start.sh`/`start.bat` for standalone Next.js output.
- **Database migrations**: SQL files in `supabase_migration.sql` and `supabase_migrations/`. Run manually against Supabase SQL editor.

## Common Gotchas

- The `daily_order_stats` materialized view must be refreshed. A trigger handles this on order INSERT/UPDATE, but if empty, the app falls back to querying orders directly.
- `html2canvas` is used for order receipt PNG downloads — imported dynamically (`await import("html2canvas")`).
- Mobile bottom nav is in `app/(customer)/layout.tsx` — customer pages need `pb-24` for bottom padding.
- Owner layout has both desktop header (hidden on mobile) and mobile header with hamburger menu — both in `app/(owner)/layout.tsx`.
- `formatPrice()` returns `Rs X,XXX` format (Pakistani Rupees).
- WhatsApp links use `92` prefix (Pakistan country code).

## Security & Rate Limiting

### Rate Limiting (`lib/rate-limiter.ts`)

All API routes have rate limiting. Two patterns:

**Pattern A — `rateLimit(ip, max, window)` (older routes):**
```typescript
const ip = getClientIp(request)
const allowed = await rateLimit(ip, 15, 60)
if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 })
```

**Pattern B — `checkRateLimit(request, "tier")` (newer routes):**
```typescript
await checkRateLimit(request, "owner:write")
```

**Current limits (professional grade):**

| Tier | Limit | Window |
|------|-------|--------|
| `orders:create` | 5/min | 60s |
| `orders:update` | 10/min | 60s |
| `orders:check` | 15/min | 60s |
| `owner:write` | 15/min | 60s |
| `owner:read` | 30/min | 60s |
| `admin:write` | 10/min | 60s |
| `menu:read` | 30/min | 60s |
| `notifications:send` | 5/min | 60s |
| `superadmin:write` | 10/min | 60s |
| `superadmin:read` | 30/min | 60s |
| `default` | 20/min | 60s |

The limiter **fails closed** — if the database is unreachable, requests are denied (not allowed through). Localhost/127.0.0.1 bypasses rate limiting.

### CSRF Protection (`lib/csrf.ts`)

All state-changing methods (POST, PUT, PATCH, DELETE) have Origin/Referer header validation:

```typescript
import { csrfGuard } from "@/lib/csrf"

export async function POST(request: Request) {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse
  // ...
}
```

Allowed origins come from `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`, and `CORS_ORIGINS` env var.

### Audit Logging

**Superadmin** — all actions logged to `superadmin_audit_log` via `logAudit()` in `lib/superadmin-security.ts`.

**Owner** — key actions logged to `owner_audit_log` table via `lib/owner-audit.ts`:
```typescript
import { logOwnerAction, getIpSimple } from "@/lib/owner-audit"

await logOwnerAction(restaurantId, ownerId, "dish_created", { dish_id: id }, getIpSimple(request))
```

Logged actions: `dish_created`, `dish_updated`, `category_created`, `category_deleted`, `order_updated`, `plan_updated`.

### Key Security Files

- `lib/rate-limiter.ts` — Rate limiting (IP-based, DB-backed)
- `lib/csrf.ts` — CSRF origin/referer validation
- `lib/owner-audit.ts` — Owner action audit logging
- `lib/superadmin-security.ts` — Superadmin auth + rate limit + audit
