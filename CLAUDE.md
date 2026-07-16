# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Next.js dev server on port 3000
npm run build      # Production build with type checking
npm run lint       # ESLint (next lint)
npm run start      # Start production server
npm run dev        # Start Next.js dev server on port 3000
npm run build      # Production build with type checking
npm run lint       # ESLint (next lint)
npm run start      # Start production server
npx playwright test              # Run all e2e tests
npx playwright test --ui         # Run e2e tests with UI mode
npx playwright test --debug      # Run e2e tests with Playwright inspector
node e2e/website-test.mjs        # Quick smoke test on digitalmenue.com (no server needed)
```

## Project Architecture

### Route Groups (App Router)

```
app/(auth)/              # Login/signup flows (guest only)
app/(customer)/          # Customer-facing: restaurant browsing, menu, cart, checkout
app/(owner)/dashboard/   # Restaurant owner admin (noindex, behind auth)
app/staff/dashboard/      # Staff operations (noindex, staff-session auth)
app/(superadmin)/        # Super admin panel (noindex, admin email check)
app/                     # Public pages: landing, pricing, contact, faq, privacy, terms
```

**Key customer routes:** `/restaurants` (browse), `/menu/[slug]` (restaurant menu), `/cart`, `/checkout`, `/order-confirm/[id]`, `/account` (orders), `/favorites`

**Key owner routes:** `/dashboard` (home/stats), `/dashboard/menu`, `/dashboard/orders`, `/dashboard/settings`, `/dashboard/subscription`, `/dashboard/qr`, `/dashboard/branding`, `/dashboard/analytics`, `/dashboard/deals`, `/dashboard/staff`, `/dashboard/tables`

### Route Groups & Shared Layouts

- **Auth pages** (`/(auth)`) centered card, `max-w-sm`
- **Customer pages** (`/(customer)`) — has bottom mobile nav, top desktop nav, AppFooter
- **Owner dashboard** (`/(owner)`) — has sidebar drawer on mobile, top nav on desktop, safe-area-aware
- **Staff** (`/staff/dashboard/`) — staff-session cookie auth via `middleware.ts`, separate layout with 6 pages: Dashboard, Menu (take order), Orders, Kitchen, Tables, Profile
- **Super admin** — email-gated login, tabbed interface

### API Route Structure (`app/api/`)

- `api/orders/` — create order, get order details, cancel, ready-check
- `api/staff/` — staff auth (login/logout/me), orders, menu, tables
- `api/owner/` — dishes CRUD, categories CRUD, deals, staff, tables, announcements, AI posts, alerts
- `api/auth/` — login, signup (customer + restaurant), session management
- `api/payments/jazzcash/` — JazzCash payment initiation callback
- `api/admin/` — subscription management for super admin
- `api/contact/` — contact form submission
- `api/cron/` — rate-limit cleanup, daily stats refresh

### Component Organization

```
components/shared/       # Reusable: AppFooter, LandingHeader, ErrorBoundary, OrderReceipt, QRCodeDisplay, etc.
components/customer/     # Customer flow: DishGrid, CartBar, CartDrawer, MenuHeader, MenuContent, DealBanner, etc.
components/owner/        # Owner dashboard: DishCard, DealCard, AddDishForm, DashboardStats, etc.
components/checkout/     # Checkout forms: DeliveryForm, DineInForm, TakeawayForm, OrderTypeSelector
components/ui/           # shadcn-style primitives: button, card, dialog, input, badge, separator, switch, tabs, label
components/superadmin/   # Admin panel: RestaurantTable, CustomerTable, PlanManager, AnalyticsView, etc.
components/pricing/      # PricingSection
components/contact/      # ContactForm
```

### State Management

- **Zustand stores:** `stores/cartStore.ts` (cart items, restaurant metadata, deals), `stores/orderStore.ts` (order form fields, payment method)
- **React hooks** in `lib/hooks/`: `useSubscription`, `useFavorites`, `useCompanySettings`, `useDeals`, `usePushNotifications`, `useAiPosts`, `usePlans`

### Data Layer

- **Supabase** client (`lib/supabase/client.ts` — browser, `lib/supabase/server.ts` — server component, `lib/supabase/middleware.ts` — middleware)
- **Real-time subscriptions** via Supabase channels (used for order updates, restaurant open status, live feeds)
- **i18n** via React context (`lib/i18n/context.tsx`) with English/Urdu toggling

### Styling

- **Tailwind CSS v3** with custom theme in `tailwind.config.js`:
  - Primary: black (`#000000`), Accent: WhatsApp green (`#25D366`)
  - 60-30-10 color system (white/light → black → green)
  - Custom animations: slide-up, slide-down, scale-up, fade-in
  - Custom border radius tokens (`card: "12px"`, `button: "8px"`)
- **Responsive pattern:** Mobile-first with breakpoints at `sm:` (640px), `md:` (768px), `lg:` (1024px)
- Some complex pages use **dual-layout** pattern: `md:hidden` for mobile, `hidden md:block` for desktop

### Key Types (`types/index.ts`)

`Restaurant`, `Category`, `Dish`, `Deal`, `Order`, `DailyStats`, `OrderType`, `PaymentMethod`, `BrandingConfig`

## Testing

### data-testid Convention

When writing E2E tests, use `data-testid` attributes on interactive elements. Key test IDs already in the app:
- `restaurant-card-{slug}` — Each restaurant card
- `menu-link-{slug}` — View menu button
- `search-input` / `city-filter-all` / `city-filter-{city}` — Search & filters
- `browse-restaurants-btn` — Hero CTA
- `checkout-link-mobile/desktop` / `place-order-btn-mobile/desktop` — Checkout flow
- `pricing-section` / `clear-search-btn` — Pricing & search clear
- `error-refresh-btn` — ErrorBoundary refresh

### Middleware (`middleware.ts`)

- Staff routes protected by `staff_session` cookie
- Standard Supabase session management
