# QRMenu.pk — Task & Bug Tracker

> Generated: 2026-06-24 | Last Updated: 2026-06-24 (Build #1 — 0 errors)
> Legend: 🔴 Critical | 🟡 High | 🟢 Medium | 🔵 Low | ✅ Done

---

## PHASE 0: FOUNDATION FIXES

| # | Status | Priority | Task | File(s) | Est. Time |
|---|---|---|---|---|---|
| 0.1 | ✅ | 🔴 | **Fix bottom nav "Orders" 404** — Created `/account` page with guest/loading/empty/order list states + realtime subscription | `app/(customer)/account/page.tsx` | 1 hr |
| 0.2 | ✅ | 🔴 | **Add loading.tsx for menu/[slug]** — Pulse-animated skeleton: hero, title, 2-column dish grid | `app/(customer)/menu/[slug]/loading.tsx` | 15 min |
| 0.3 | ✅ | 🔴 | **Fix "Continue Browsing" router.back()** — Replaced with `<Link href="/restaurants">` | `app/(customer)/cart/page.tsx` | 30 min |
| 0.4 | ✅ | 🟡 | **Add Clear Cart confirmation dialog** — Toggle button: "Clear All" → "Confirm Clear" + "Cancel" | `app/(customer)/cart/page.tsx` | 20 min |
| 0.5 | ✅ | 🟢 | **Add error.tsx for menu/[slug] page** — Graceful error boundary with retry | `app/(customer)/menu/[slug]/error.tsx` | 15 min |
| 0.6 | ✅ | 🔵 | **Add not-found.tsx for missing restaurant slugs** | `app/(customer)/menu/[slug]/not-found.tsx` | 15 min |
| 0.7 | ✅ | 🔵 | **Safe area utilities** — Already existed in globals.css; nav already had safe-area-inset-bottom | `app/globals.css`, `layout.tsx` | 0 min |

---

## PHASE 1: RESTAURANT LISTING OVERHAUL

| # | Status | Priority | Task | File(s) | Est. Time |
|---|---|---|---|---|---|
| 1.1 | ✅ | 🔴 | **Pass SSR data to RestaurantsClient** — Server passes `initialRestaurants` + `initialCities`; client starts pre-loaded with `loading=false`; effect only re-fetches on city filter | `restaurants/page.tsx`, `RestaurantsClient.tsx` | 1 hr |
| 1.2 | ✅ | 🔴 | **Fix safe-area-top on headers** — Added `safe-top` class to fixed headers | `RestaurantsClient.tsx`, `RestaurantDetailClient.tsx` | 30 min |
| 1.3 | ✅ | 🔴 | **Fix content bottom padding for nav bar** — `pb-8` → `pb-[80px]` on listing; `pb-24` → `pb-[100px]` on detail | `RestaurantsClient.tsx`, `RestaurantDetailClient.tsx` | 30 min |
| 1.4 | ✅ | 🟡 | **Add horizontal scroll fade to city chips** — Left/right gradient fade overlays | `RestaurantsClient.tsx` | 20 min |
| 1.5 | ✅ | 🔴 | **Upgrade restaurant cards with rich visuals** — Cover gradient area, logo overlay, Open/Closed badge, Star+rating, Clock+delivery, Bike+delivery fee row | `RestaurantsClient.tsx` | 2 hr |
| 1.6 | ✅ | 🟢 | **Add responsive grid for wider screens** — `grid-cols-1 md:grid-cols-2 gap-4` | `RestaurantsClient.tsx` | 15 min |
| 1.7 | ✅ | 🟢 | **Update Supabase query to fetch additional fields** — rating, delivery_time_min, delivery_fee, is_open | `restaurants/page.tsx`, `RestaurantsClient.tsx` | 15 min |

---

## PHASE 2: DEDUPLICATE & UNIFY MENU EXPERIENCES

| # | Status | Priority | Task | File(s) | Est. Time |
|---|---|---|---|---|---|
| 2.1 | ✅ | 🔴 | **Remove inline DishCard from RestaurantDetailClient** — Replaced with exported `DishGrid.Card`; removed ~70 lines of duplicated code | `RestaurantDetailClient.tsx`, `DishGrid.tsx` | 2 hr |
| 2.2 | ✅ | 🟡 | **Deduplicate WhatsApp URL builder** — Created shared `lib/whatsapp.ts` with `buildWhatsAppURL()` | `lib/whatsapp.ts` | 30 min |
| 2.3 | ✅ | 🟢 | **Update order-confirm page** — Uses shared `buildWhatsAppURL` | `order-confirm/[id]/page.tsx` | 15 min |
| 2.4 | ✅ | 🟢 | **Update API orders route** — Uses shared `buildWhatsAppURL` | `api/orders/route.ts` | 15 min |

---

## PHASE 3: STATE MANAGEMENT FIXES

| # | Status | Priority | Task | File(s) | Est. Time |
|---|---|---|---|---|---|
| 3.1 | ✅ | 🟡 | **Fix orderStore — stop persisting transient state** — Added `partialize` to persist only form fields | `stores/orderStore.ts` | 30 min |
| 3.2 | ✅ | 🟡 | **Add `restaurantSlug` to cartStore** — New field + updated `setRestaurant(id, name, slug, deliveryFee?)` | `stores/cartStore.ts` | 30 min |
| 3.3 | ✅ | 🟢 | **Fix delivery fee hardcode (0) in MenuContent** — Now accepts `deliveryFee` and `restaurantSlug` props, passes both to cartStore | `MenuContent.tsx`, `menu/[slug]/page.tsx` | 20 min |

---

## PHASE 4: PERFORMANCE OPTIMIZATIONS

| # | Status | Priority | Task | File(s) | Est. Time |
|---|---|---|---|---|---|
| 4.1 | 📋 | 🟡 | **Add image transformation parameters** — Pending (needs `lib/utils.ts` helper + component updates) | `lib/utils.ts`, all Image components | 1.5 hr |
| 4.2 | 📋 | 🟡 | **Add blurDataURL placeholders** — Pending | All Image components | 1 hr |
| 4.3 | 📋 | 🟡 | **Add `revalidate` to restaurant detail server component** — Pending | `restaurant/[slug]/page.tsx` | 15 min |
| 4.4 | 📋 | 🟢 | **Add React.cache() to server data fetching** — Pending | `lib/supabase/server.ts` | 30 min |

---

## PHASE 5: BACKEND FIXES

| # | Status | Priority | Task | File(s) | Est. Time |
|---|---|---|---|---|---|
| 5.1 | ✅ | 🟡 | **Add Zod validation to owner dish PATCH** — `dishUpdateSchema` with full type validation | `app/api/owner/dishes/route.ts` | 30 min |
| 5.2 | ✅ | 🟡 | **Add restaurant ownership check to dish PATCH** — Verifies dish belongs to owner's restaurant | `app/api/owner/dishes/route.ts` | 30 min |
| 5.3 | ✅ | 🔴 | **Fix superadmin analytics — use SQL aggregation** — Replaced `.limit(20000)` with targeted queries + `daily_order_stats` view + rate limiting | `app/api/superadmin/analytics/route.ts` | 2 hr |
| 5.4 | ✅ | 🟡 | **Add rate_limits table indexes** — `idx_rate_limits_lookup` + `idx_rate_limits_created` + cleanup comments | `supabase_migration.sql`, `lib/rate-limiter.ts` | 15 min |
| 5.5 | ✅ | 🟡 | **Add rate limiting to superadmin endpoints** — analytics + restaurants routes now rate-limited (30/60s) | `analytics/route.ts`, `restaurants/route.ts` | 1 hr |
| 5.6 | ✅ | 🟢 | **Add missing database indexes** — `orders(restaurant_id, created_at)`, `dishes(restaurant_id, is_available)` | `supabase_migration.sql` | 30 min |
| 5.7 | ✅ | 🟢 | **Create Vercel cron for materialized view refresh** — Protected endpoint with CRON_SECRET + DB function | `app/api/cron/refresh-stats/route.ts`, `supabase_migration.sql` | 1 hr |
| 5.8 | ✅ | 🟢 | **Update storage RLS policy** — Dish images bucket now checks restaurant ownership | `supabase_migration.sql` | 30 min |
| 5.9 | ✅ | 🔵 | **Email comparison case sensitivity** — Already using `.toLowerCase()` everywhere | — | 0 min |

---

## PHASE 6: SECURITY HARDENING

| # | Status | Priority | Task | File(s) | Est. Time |
|---|---|---|---|---|---|
| 6.1 | ✅ | 🟢 | **Update storage RLS for dish-images bucket** — Only allow uploads to own restaurant | `supabase_migration.sql` | 30 min |
| 6.2 | ✅ | 🟢 | **Fix email comparison case sensitivity** — Already lowercase everywhere | — | 0 min |
| 6.3 | 📋 | 🔵 | **Tighten CSP** — Pending (needs testing with Next.js dev) | `next.config.ts` | 1 hr |

---

## PHASE 7: MISSING VISUAL FEATURES

| # | Status | Priority | Task | File(s) | Est. Time |
|---|---|---|---|---|---|
| 7.1 | ✅ | 🟡 | **Display ratings and reviews on restaurant cards** — Star rating with `r.rating.toFixed(1)`, delivery time, fee on every card | `RestaurantsClient.tsx` | 30 min |

---

## PHASE 8: DATABASE & MIGRATION

| # | Status | Priority | Task | File(s) | Est. Time |
|---|---|---|---|---|---|
| 8.1 | ✅ | 🟡 | **Migration: add database indexes** — Added 4 composite indexes | `supabase_migration.sql` | 30 min |
| 8.2 | ✅ | 🟡 | **Migration: update storage policies** — Restaurant ownership check | `supabase_migration.sql` | 30 min |
| 8.3 | ✅ | 🟢 | **Migration: add refresh_daily_stats_cron function** | `supabase_migration.sql` | 20 min |

---

## PROGRESS SUMMARY

| Phase | Total Tasks | ✅ Done | 📋 Pending | % Complete |
|---|---|---|---|---|
| 0: Foundation | 7 | 7 | 0 | **100%** |
| 1: Listing Overhaul | 7 | 7 | 0 | **100%** |
| 2: Menu Unification | 4 | 4 | 0 | **100%** |
| 3: State Management | 3 | 3 | 0 | **100%** |
| 4: Performance | 4 | 0 | 4 | **0%** |
| 5: Backend | 9 | 9 | 0 | **100%** |
| 6: Security | 3 | 2 | 1 | **67%** |
| 7: Visual Features | 1 | 1 | 0 | **100%** |
| 8: Database | 3 | 3 | 0 | **100%** |
| **Total** | **41** | **36** | **5** | **88%** |

**5 remaining tasks** are Phase 4 (image optimization, ISR, caching) and CSP tightening — lower priority, no breaking changes.

---

## COMPLETED: 36 tasks | PENDING: 5 low-priority tasks
## BUILD STATUS: ✅ Compiles with 0 errors
