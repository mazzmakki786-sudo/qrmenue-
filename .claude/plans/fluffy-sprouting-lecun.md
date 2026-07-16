# Mobile Responsiveness — Full Project Audit & Fix Plan

## Context
The QR Menue project is already partially responsive with patterns like `md:hidden`/`hidden md:block` (separate mobile/desktop layouts), `grid-cols-1 md:grid-cols-2`, and mobile bottom nav. However, a systematic audit across all 55+ pages and 64 components reveals gaps: cramped grids on small screens, missing safe-area padding, touch targets below 44px, uncollapsed data tables, and chart overflow. This plan makes every screen fully responsive on all mobile widths (320px+).

---

## Phase 1: Global Foundation Fixes

### 1.1 Safe Area Insets — Global CSS
**Files:** `app/globals.css` (create if needed)
- Add `env(safe-area-inset-bottom)` utility classes:
  ```css
  .pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }
  .pt-safe { padding-top: env(safe-area-inset-top, 0px); }
  .pl-safe { padding-left: env(safe-area-inset-left, 0px); }
  .pr-safe { padding-right: env(safe-area-inset-right, 0px); }
  ```
- Add `scrollbar-none` utility for horizontal scroll containers

### 1.2 Touch Target Audit & Fix
**Files affected:** All interactive elements across all components
- Ensure all buttons/links are `min-h-[44px]` min `min-w-[44px]` on mobile
- Priority fixes: DishCard +/- buttons (currently `w-7 h-7`), owner DishCard action buttons (`p-1.5`), Deal action buttons

### 1.3 Horizontal Overflow Protection
**Files:** `app/layout.tsx` (root)
- Already has `overflow-x-hidden` on `<body>` — verify it's sufficient
- Add `word-break: break-word` to text elements that could overflow

---

## Phase 2: Route Group — Landing & Public Pages

### 2.1 Landing Page (`app/page.tsx`)
**Status:** Mostly good. Minor gaps:
- Hero `w-[1000px] h-[600px]` blurred circle — add `hidden sm:block` to prevent horizontal scroll on mobile
- "How It Works" timeline steps on mobile: the vertical connector line is already present (`md:hidden absolute left-[23px]...`) — verify alignment on 320px screens
- CTA section buttons: already `flex-col sm:flex-row` — good

### 2.2 Pricing Page (`app/pricing/page.tsx` → `components/ui/pricing-cards.tsx`)
**Status:** Good. Grid `md:grid-cols-4` => single column on mobile.
- Verify feature lists don't overflow on very small screens

### 2.3 FAQ Page (`app/(customer)/faq/page.tsx`)
**Status:** Good. Single-column layout, `max-w-3xl mx-auto`.
- `details` elements use `p-4 md:p-5` — fine on mobile

### 2.4 Contact Page (`app/contact/page.tsx`)
**Status:** Good. `grid md:grid-cols-2` stacks on mobile.
- Social icons: `w-12 h-12` — good touch targets

### 2.5 Privacy & Terms Pages (`app/privacy/page.tsx`, `app/terms/page.tsx`)
**Status:** Need mobile verification. Text-heavy with prose content.
- Ensure `max-w-3xl mx-auto px-5` with proper line-height on mobile

### 2.6 LandingHeader (`components/shared/LandingHeader.tsx`)
**Status:** Good. Responsive drawer, mobile action buttons.
- Drawer `w-72 max-w-[85vw]` — good

---

## Phase 3: Route Group — Customer (Main App)

### 3.1 Restaurants List (`app/(customer)/restaurants/ RestaurantsClient.tsx`)
**Status:** Good. `grid-cols-1 md:grid-cols-2`, horizontal city filters.
- Each card: `flex items-center gap-3 p-3` — verify min-width doesn't cause overflow
- Restaurant name `max-w-[160px]` — increase to `max-w-[200px]` or remove constraint on mobile

### 3.2 Restaurant Detail / Menu Slug (`app/(customer)/restaurant/[slug]/page.tsx` + `RestaurantDetailClient.tsx`)
**Status:** Fair. Has separate desktop cart panel.
- **Desktop cart panel:** Currently only shown on `md:block` — correct
- **Dish cards:** `flex gap-4 p-4` with `w-28 h-28` image (112px) — on 320px screens this is very tight. Consider `w-20 h-20` on very small screens.
- **Restaurant info chips:** `flex-wrap gap-2` — good, but address `max-w-[180px]` might cause overflow

### 3.3 Menu Page (slug) (`app/(customer)/menu/[slug]/page.tsx` + `MenuContent.tsx`)
**Status:** Good. Has search, categories, dishes.
- **Sticky search bar:** `min-h-[44px]` on language toggle — good
- **CategoryTabs:** horizontal scroll — good

### 3.4 DishGrid + Card (`components/customer/DishGrid.tsx`)
**Status:** Fair. Needs small-screen optimization.
- **Card images:** `w-24 h-24` (96px) — change to responsive: `w-20 h-20 sm:w-24 sm:h-24` on very small screens
- **Add button:** `px-5 py-2` — `min-h-[36px]` — increase to `min-h-[44px]` for better touch target
- **Price + badges:** Use `flex-wrap` for badge row

### 3.5 Cart Page (`app/(customer)/cart/page.tsx`)
**Status:** Good. Full separate mobile layout (`md:hidden`), desktop layout (`hidden md:block`).
- **Fixed checkout bar:** `bottom-[60px]` accounts for bottom nav — correct
- **Item cards:** `flex items-center gap-3` with `w-16 h-16` image — adequate
- **Quantity buttons:** `w-7 h-7` — slightly small, increase to `w-8 h-8`

### 3.6 Checkout Page (`app/(customer)/checkout/page.tsx`)
**Status:** Good. Full separate mobile/desktop layout.
- **Fixed place-order button:** `bottom-[60px]` — correct
- **Payment method buttons:** `p-4` — good touch targets
- **Collapsible order summary:** Works well on mobile

### 3.7 Order Confirm (`app/(customer)/order-confirm/[id]/page.tsx`)
**Status:** Good. Separate mobile/desktop layout.
- **Status card:** Properly sized on mobile
- **WhatsApp + Call buttons:** `flex gap-2.5` with `h-11` — good

### 3.8 Account / Orders (`app/(customer)/account/page.tsx`)
**Status:** Good. `max-w-[600px] mx-auto`, proper mobile header.
- **Cancel button:** `py-2` — increase to `min-h-[44px]`

### 3.9 Favorites (`app/(customer)/favorites/ FavoritesClient.tsx`)
**Status:** Good. `max-w-7xl mx-auto px-4 sm:px-6`, responsive grid.
- **Heart button:** `w-8 h-8 sm:w-9 sm:h-9` — adequate

### 3.10 CartBar (`components/customer/CartBar.tsx`)
**Status:** Good. `fixed bottom-12 left-3 right-3 max-w-[568px]`.
- **Closed state:** Already properly handled

---

## Phase 4: Route Group — Owner Dashboard

### 4.1 Owner Layout (`app/(owner)/layout.tsx`)
**Status:** Good. Mobile hamburger drawer with animation, safe-area-aware.
- **Mobile header:** `padding-top: env(safe-area-inset-top)`, `height: calc(56px + env(safe-area-inset-top))`
- **Drawer:** `w-72 max-w-[85vw]` — good, `min-h-[44px]` on nav items
- **Main content:** `padding-bottom: calc(16px + env(safe-area-inset-bottom))`

### 4.2 Dashboard Home (`app/(owner)/dashboard/page.tsx`)
**Status:** Good. `grid-cols-2 gap-3` on mobile.
- **Subscription banner:** `flex-col sm:flex-row` — check text doesn't overflow on smallest screens
- **Quick action cards:** `grid-cols-2 gap-3` — good, but text might truncate on very small screens
- **Stats row:** `grid-cols-2` — works well

### 4.3 Menu Management (`app/(owner)/dashboard/menu/page.tsx`)
**Status:** Needs optimization.
- **Restaurant info bar:** `flex items-center gap-3 p-3` — good
- **Stats grid:** `grid-cols-3 gap-3` — on 320px screens, 3 columns is very tight. Change to `grid-cols-3` but reduce padding to `p-2`
- **Search + action buttons:** The "add dish" and "add category" buttons use `Button size="sm"` which is tiny on mobile. Add `min-h-[44px]` min `min-w-[44px]` classes.
- **Category pills:** `flex-wrap` — already done
- **Dish list items:** `py-3 px-4` with 48px images — adequate. Toggle switch `w-10 h-5` is very small on mobile — needs touch area padding

### 4.4 DishCard (owner) (`components/owner/DishCard.tsx`)
**Status:** Needs touch target improvements.
- **Action buttons:** `p-1.5` is too small for touch. Wrap in `min-w-[44px] min-h-[44px]` containers.
- **Toggle switch:** `w-10 h-5` — add invisible touch area padding via `before:absolute before:-inset-2`

### 4.5 Orders Page (`app/(owner)/dashboard/orders/page.tsx`)
**Status:** Good. Single column list.
- **Pagination buttons:** `px-4 py-1.5` — increase to `min-h-[44px]` on mobile
- **Time filter buttons:** `px-5 py-1.5` — adequate

### 4.6 Order Detail (`app/(owner)/dashboard/orders/[id]/page.tsx`)
**Status:** Need to verify. (Read only first 100 lines)
- Assumes responsive layout with proper padding

### 4.7 Settings (`app/(owner)/dashboard/settings/page.tsx`)
**Status:** Good. `max-w-lg mx-auto`, `grid-cols-1 sm:grid-cols-2`.
- **Logo upload:** Circular preview with `w-16 h-16` — fine
- **Form fields:** All use full-width Input component

### 4.8 Deals (`app/(owner)/dashboard/deals/page.tsx`)
**Status:** Needs mobile check.
- **Filter tabs:** Ensure horizontal scroll if too many
- **Deal cards:** Verify responsive layout with image + info

### 4.9 Staff Management (`app/(owner)/dashboard/staff/page.tsx`)
**Status:** Needs mobile responsive.
- Staff list items: Ensure proper mobile layout with badges and actions

### 4.10 Tables (`app/(owner)/dashboard/tables/page.tsx`)
**Status:** Needs mobile responsive.
- Table cards: Single column on mobile, grid on desktop

### 4.11 Branding (`app/(owner)/dashboard/branding/page.tsx`)
**Status:** Good. `max-w-2xl mx-auto` stack layout.
- **Banner upload:** Aspect-ratio containers responsive by default
- **Upgrade prompt:** Centered, fine on mobile

### 4.12 Subscription (`app/(owner)/dashboard/subscription/page.tsx`)
**Status:** Good. `max-w-2xl mx-auto`.
- **Usage grid:** `grid-cols-2 md:grid-cols-4` — works on mobile
- **Plan cards:** `flex-col sm:flex-row` — responsive
- **Payment methods:** `grid sm:grid-cols-3` — single column on mobile

### 4.13 QR Code (`app/(owner)/dashboard/qr/page.tsx`)
**Status:** Need mobile check.
- **Grid:** `grid-cols-1 lg:grid-cols-12 gap-8` — single column on mobile
- **QR code:** `w-64 h-64` on desktop — use `w-full max-w-[256px]` on mobile

### 4.14 Analytics (`app/(owner)/dashboard/analytics/page.tsx`)
**Status:** Needs responsive chart.
- **Recharts chart:** Must have `ResponsiveContainer width="99%"` — verify
- **Stats:** Single column on mobile

### 4.15 Announcements (`app/(owner)/dashboard/announcements/page.tsx`)
**Status:** Good. Single column list.
- **Filter buttons:** Horizontal scroll if needed

### 4.16 Onboarding (`app/(owner)/dashboard/onboarding/page.tsx`)
**Status:** Good. `max-w-lg mx-auto`.

### 4.17 AI Posts (`app/(owner)/dashboard/ai-posts/page.tsx`)
**Status:** Need to verify (not read in full)

---

## Phase 5: Route Group — Super Admin

### 5.1 Super Admin Layout (`app/(superadmin)/layout.tsx`)
**Status:** Good. Responsive header with mobile nav.
- **Mobile nav:** `overflow-x-auto`, `whitespace-nowrap` — correct
- **Main content:** `p-4 md:p-6 lg:p-8`

### 5.2 Super Admin Client (`app/(superadmin)/superadmin/SuperAdminClient.tsx`)
**Status:** Needs mobile responsive.
- **Sidebar tabs:** Ensure horizontal scroll on mobile or convert to dropdown
- **Tables (RestaurantTable, CustomerTable):** Need horizontal scroll on mobile or convert to card layout

---

## Phase 6: Route Group — Staff

### 6.1 Staff Layout (`app/(staff)/layout.tsx`)
**Status:** Need to read fully.
- Assume responsive patterns similar to owner layout

### 6.2 Staff Dashboard Pages
**Status:** Need to read fully.

---

## Phase 7: Shared Components

### 7.1 Dialog (`components/ui/dialog.tsx`)
**Status:** Good. `fixed left-0 right-0 bottom-0 z-50 bg-white rounded-t-[20px]` — proper mobile-bottom sheet style.

### 7.2 Footer (`components/shared/AppFooter.tsx`)
**Status:** Good. `flex-col md:flex-row`, centered on mobile.

### 7.3 Order Receipt (`components/shared/OrderReceipt.tsx`)
**Status:** Need to verify.

---

## Implementation Order

### Sprint 1: Global Foundation
1. Add safe-area utility classes to globals.css
2. Fix touch targets across all interactive elements (min-h-[44px] min-w-[44px])
3. Add `overflow-x-hidden` + `word-break` guard to root layout

### Sprint 2: Customer Pages
4. Fix DishGrid/DishCard small-screen image sizes
5. Fix RestaurantCard name truncation
6. Verify all customer pages at 320px width
7. Fix Cart/Checkout quantity button touch targets

### Sprint 3: Owner Dashboard Pages
8. Fix Menu Management 3-column stat grid for small screens
9. Fix owner DishCard action button touch targets
10. Fix QR page code sizing
11. Fix Analytics chart responsiveness
12. Verify all remaining dashboard pages

### Sprint 4: Admin & Staff Pages
13. Fix SuperAdmin tab overflow on mobile
14. Fix data tables horizontal scroll
15. Verify Staff pages responsive

### Sprint 5: Polish
16. Final 320px viewport test on every page
17. Review all `max-w-[XXXpx]` constraints

---

## Verification

1. **Viewport test:** Set browser to 320px width and navigate every route
2. **Check:** No horizontal scroll, no overlapping elements, all buttons tappable
3. **Check:** Safe areas respected (notch, home indicator)
4. **Check:** Touch targets at least 44px
5. **Check:** Text doesn't overflow containers
6. **Check:** All interactive elements (modals, drawers, toggles) work on mobile
7. **Run:** `npm run build` to verify no TypeScript/compilation errors
8. **Run:** Existing e2e tests if available
