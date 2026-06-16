# QRMenu.pk — Full Codebase Audit Report

> **Date:** June 16, 2026  
> **Stack:** Next.js 15.5.18 / React 19 / TypeScript 5.8 / Supabase / Zustand / Vercel  
> **Build:** ✅ 46/46 pages, zero TypeScript errors, zero build warnings

---

## 1. EXECUTIVE SUMMARY

| Metric | Status |
|--------|--------|
| Build | ✅ Passes (46 pages) |
| TypeScript | ✅ Zero errors |
| API Routes | ✅ All 52 handlers wrapped with `safeRoute()` |
| Rate Limiting | ✅ All 35 routes rate-limited |
| CSRF Protection | ✅ Applied to 22/30 state-changing routes |
| Audit Logging | ✅ Owner + Superadmin |
| RLS Policies | ⚠️ 1 overly permissive (`orders` SELECT) |
| Accessibility | ⚠️ 12 issues found |
| Type Safety (`any`) | ⚠️ 11 files use `any` casts |
| Missing Indexes | ⚠️ 3 missing on `orders` table |

---

## 2. BUILD STATUS

```
npx tsc --noEmit  →  ✅ PASS (0 errors)
npm run build     →  ✅ PASS (46/46 pages, 0 warnings)
```

---

## 3. CRITICAL ISSUES

These can crash the app, leak data, or cause data loss.

### C1 — `orders` RLS Policy Too Permissive
**File:** `supabase_migration.sql` (orders RLS policy)  
**Risk:** Any authenticated user can SELECT all orders from all restaurants  
**Fix:** Add `customer_id = auth.uid() OR restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())`

### C2 — Missing RLS on `owner_notifications` INSERT
**File:** `supabase_migration.sql`  
**Risk:** Any authenticated user could insert fake notifications  
**Fix:** Add RLS policy restricting INSERT to service-role only

### C3 — `notifications/email` Duplicate Join Still Present
**File:** `app/api/notifications/email/route.ts:27`  
**Risk:** Query crashes with Supabase error on order notification  
**Fix:** ✅ Already fixed in previous deployment

### C4 — `orderStore` Missing Zustand Persist
**File:** `stores/orderStore.ts`  
**Risk:** Order progress lost on page refresh / navigation  
**Fix:** Add Zustand `persist` middleware (like `cartStore`)

### C5 — `order-confirm` Notification Text Mismatch
**File:** `app/(customer)/order-confirm/[id]/page.tsx`  
**Risk:** Shows "Order Confirmed!" when status is "ready" — customer confusion  
**Fix:** Change text to "Order is now being prepared"

---

## 4. HIGH ISSUES

### H1 — CSRF Missing on Superadmin API Routes
**Files:**
- `app/api/superadmin/announcements/route.ts` (POST)
- `app/api/superadmin/announcements/[id]/route.ts` (PATCH, DELETE)
- `app/api/superadmin/announcements/[id]/publish/route.ts` (POST)
- `app/api/superadmin/settings/route.ts` (PATCH)
- `app/api/superadmin/restaurants/[id]/route.ts` (PATCH)
- `app/api/superadmin/restaurants/[id]/toggle/route.ts` (PATCH)
- `app/api/superadmin/restaurants/[id]/reset-trial/route.ts` (POST)
- `app/api/superadmin/subscriptions/route.ts` (POST)
- `app/api/superadmin/trial-limits/route.ts` (PATCH, PUT)

**Risk:** CSRF attack could modify settings, publish announcements, change subscriptions  
**Fix:** Add `csrfGuard(request)` before all state-changing handlers

### H2 — Missing Indexes on `orders` Table
**Tables/Columns:**
- `orders.order_number` (no index — used in lookups)
- `orders.order_type` (no index — used in analytics)
- `orders.payment_status` (no index — used in filtering)

**Impact:** Slow queries on large datasets (1000+ orders)  
**Fix:** Add `CREATE INDEX` migration

### H3 — `branding/page.tsx` Uploads to Wrong Bucket
**File:** `app/(owner)/dashboard/branding/page.tsx`  
**Issue:** Banner images uploaded to `dish-images` bucket under `banners/` prefix  
**Risk:** Storage bucket `dish-images` RLS policy may reject uploads from wrong path  
**Fix:** Create dedicated `banners` bucket OR update RLS to allow `banners/` path

### H4 — Unhandled `resend` API Key Missing
**File:** `lib/resend.ts`  
**Issue:** If `RESEND_API_KEY` env var is not set, throws runtime error with no fallback  
**Fix:** Graceful fallback — log warning and skip email sending

### H5 — Owner Audit Not Called From All Mutation Routes
**Files:**
- `app/api/owner/notifications/route.ts` (PATCH)
- `app/api/owner/alerts/check/route.ts` (POST)

**Risk:** Owner actions not fully traceable  
**Fix:** Add `logOwnerAction()` calls to remaining mutation routes

### H6 — Missing Loading/Error States in 5 Pages
**Files:**
- `app/(owner)/dashboard/settings/page.tsx`
- `app/(owner)/dashboard/subscription/page.tsx`
- `app/(customer)/checkout/page.tsx`
- `app/(customer)/account/page.tsx`
- `app/(superadmin)/superadmin/restaurants/[id]/page.tsx`

**Risk:** User sees blank/partial page on slow connection or API failure  
**Fix:** Add loading skeleton + error state + retry button

### H7 — `any` Type Usage (11 Files)
**Files:** `MenuContent.tsx`, `MenuHeader.tsx`, `branding/page.tsx`, `subscription/page.tsx`, `qr/page.tsx`, `analytics/page.tsx`, `order-confirm/[id]/page.tsx`, `resend.ts`, `subscription.ts`, `useSubscription.ts`, `RestaurantsClient.tsx`

**Risk:** Runtime crashes from unexpected data shapes  
**Fix:** Replace with proper TypeScript types from `types/index.ts`

---

## 5. MEDIUM ISSUES

### M1 — Accessibility Missing (12 Items)
| File | Issue |
|------|-------|
| `menu/page.tsx` | Dish action buttons lack `aria-label` |
| `CategoryTabs.tsx` | Tabs lack `role="tab"` / `aria-selected` |
| `layout.tsx` (owner) | Desktop nav items lack `aria-label` |
| `layout.tsx` (customer) | Bottom nav lacks `role="navigation"` |
| `DishBadges.tsx` | Badges lack `aria-label` |
| Skeleton loaders (6 files) | Missing `aria-hidden="true"` |
| ToggleCard (superadmin) | Missing `role="switch"` / `aria-checked` |

**Fix:** Add ARIA attributes per spec

### M2 — `useEffect` Missing Dependencies (Stale Closures)
**Files:**
- `BellNotification.tsx:148` — `announcementChannel` reads `restaurantId` but it's in dependency
- `dashboard/page.tsx:127` — `fetchData` depends on `restaurant?.id` but effect only depends on `fetchData`
- `useCompanySettings.ts` — realtime subscription not cleaned up properly

**Risk:** Stale data, memory leaks  
**Fix:** Add proper dependency arrays + cleanup return

### M3 — Missing Key Props in Lists
**Files:**
- `BellNotification.tsx:251` — `alert.items.slice(0,3).map()` missing `key`
- `MenuContent.tsx:85` — dish items missing stable key
- `analytics/page.tsx:90` — chart data points missing key

**Risk:** React reconciliation issues, DOM re-renders  
**Fix:** Use stable unique IDs as keys

### M4 — Unused/Dead Code
- `PremiumBanner.tsx` — no longer imported anywhere
- `gradients` array in deleted `RestaurantsClient.tsx` — already removed
- `security-report.md` — duplicate file (also have `SECURITY-REVIEW.md`)

---

## 6. LOW ISSUES

### L1 — Missing TypeScript Interfaces for DB Tables
**File:** `types/supabase.ts`  
**Issue:** `owner_notifications`, `qr_announcements`, `owner_audit_log` not in Database type  
**Impact:** IntelliSense incomplete, `as any` required in consumers

### L2 — i18n Files Incomplete
**Files:** `messages/en.json`, `messages/ur.json`  
**Issue:** Urdu translations about 40% complete  
**Impact:** Urdu UI shows English fallback for many strings

### L3 — Console Logs in Production Code
**Files:**
- `lib/rate-limiter.ts` — `console.error` for debug logging
- `BellNotification.tsx:76` — empty catch block

**Impact:** Minor, but debug logs in production

### L4 — Duplicate Price Data
**Files:** `app/page.tsx` vs `app/pricing/PricingClient.tsx`  
**Issue:** Pricing plans and features hardcoded in both files  
**Risk:** Drift between landing page and pricing page

---

## 7. DATABASE HEALTH

| Table | RLS | Indexes | Foreign Keys | Status |
|-------|-----|---------|-------------|--------|
| `restaurants` | ✅ | ✅ | ✅ | Good |
| `orders` | ⚠️ Overly permissive SELECT | ❌ Missing 3 | ✅ | **Needs fix** |
| `dishes` | ✅ | ✅ | ✅ | Good |
| `categories` | ✅ | ✅ | ✅ | Good |
| `customers` | ✅ | ✅ | ✅ | Good |
| `company_settings` | ✅ | ✅ | — | Good |
| `subscriptions` | ✅ (fixed) | ✅ | ✅ | Good |
| `notification_logs` | ✅ (fixed) | ✅ | ✅ | Good |
| `owner_notifications` | ❌ Missing | ✅ | ✅ | **Needs fix** |
| `qr_announcements` | ❌ Missing | ✅ | ✅ | **Needs fix** |
| `owner_audit_log` | ✅ | ✅ | — | Good |
| `superadmin_audit_log` | ✅ | ✅ | — | Good |
| `daily_order_stats` (MV) | — | ✅ | — | ✅ Fixed with SECURITY DEFINER |

---

## 8. RECOMMENDATION PRIORITY

```
Sprint 1 (CRITICAL — 1-2 days):
  ├─ C1 Fix orders RLS SELECT policy
  ├─ C2 Add RLS to owner_notifications + qr_announcements
  ├─ C4 Add persist to orderStore
  ├─ C5 Fix notification text mismatch
  └─ H1 Add CSRF to all 9 superadmin routes

Sprint 2 (HIGH — 2-3 days):
  ├─ H2 Add 3 missing indexes on orders
  ├─ H3 Fix bucket naming + RLS for banner uploads
  ├─ H4 Add resend fallback
  ├─ H5 Add owner audit to remaining routes
  ├─ H6 Add loading/error states to 5 pages
  └─ H7 Fix `any` types in 11 files

Sprint 3 (MEDIUM — 2-3 days):
  ├─ M1 Accessibility fixes (12 items)
  ├─ M2 Fix useEffect stale closures (3 files)
  ├─ M3 Add key props to lists (3 files)
  └─ M4 Remove dead code

Sprint 4 (LOW — 1 day):
  ├─ L1 Generate updated Supabase types
  ├─ L2 Complete Urdu translations
  ├─ L3 Clean up console logs
  └─ L4 Deduplicate pricing data
```

---

## 9. SUMMARY STATS

| Priority | Count | Key Areas |
|----------|-------|-----------|
| 🔴 CRITICAL | 5 | RLS, persist, notification text |
| 🟠 HIGH | 7 | CSRF, indexes, bucket, types, audit, errors |
| 🟡 MEDIUM | 4 | A11y, closures, keys, dead code |
| 🟢 LOW | 4 | Types, i18n, logs, dupes |
| **Total** | **20 unique issues** | |

**Currently Working:** ✅ Build passes, rate limiting applied, CSRF on majority of routes, all API routes error-safe.
