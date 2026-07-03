# QRMenu.pk — Pricing/Plan System Complete Report

> Generated: July 3, 2026

---

## 1. Plan Definitions

| Plan | Price (PKR/mo) | Max Dishes | Max Images | Max Orders | Max Categories | AI Posts/Mo | Custom Branding |
|------|----------------|------------|------------|------------|----------------|-------------|-----------------|
| **Trial** | 0 | 20 | 20 | 10 | 20 | 0 | No |
| **Starter** | 1,200 | 30 | 10 | Unlimited | Unlimited | 0 | No |
| **Growth** | 2,500 | 50 | 20 | Unlimited | Unlimited | 6 | Yes |
| **Premium** | 4,500 | 100 | 100 | Unlimited | Unlimited | 12 | Yes |

- **Trial Duration:** 7 days
- **Grace Period:** 3 days after trial expiry
- **Trial Order Limit:** 10 orders
- **Reminder Emails:** 5, 3, 1 days before trial end (defined but NOT sent)

---

## 2. Architecture — Every File Involved

### Core Library Files
| File | Purpose |
|------|---------|
| `lib/subscription.ts` | Type definitions, hardcoded limits/prices, `getSubscriptionStatus()`, `getEffectiveLimits()`, `getPlanFeatures()` |
| `lib/subscription-server.ts` | Server-side trial limit loader from `company_settings` DB table |
| `lib/subscription-db.ts` | DB-backed plan loader from `plans` table with 60s in-memory cache |
| `lib/hooks/useSubscription.ts` | Client-side React hook — fetches restaurant + counts, subscribes to realtime |
| `lib/email/planEndingAlert.ts` | Resend email alert 7 days before plan expiry |

### Database Tables
| Table | Role |
|-------|------|
| `restaurants` | Stores `plan`, `plan_start_date`, `plan_end_date`, `trial_start`, `trial_end`, `plan_limits_override` (jsonb), `is_suspended` |
| `plans` | DB-driven plan config: slug, price, limits, features (super admin editable) |
| `subscriptions` | Payment history: restaurant_id, plan, amount_pkr, start_date, end_date |
| `company_settings` | Key-value store; key `trial_limits` stores configurable trial limits as JSON |
| `ai_usage` | Monthly AI usage counter: restaurant_id, month, count |
| `notification_logs` | Dedup tracker for plan-ending emails |

### API Routes
| Route | Method | Purpose |
|-------|--------|---------|
| `app/api/plans/route.ts` | GET | Public — returns all active plans from DB |
| `app/api/superadmin/plans/route.ts` | GET | Admin — lists all plans (incl. inactive) |
| `app/api/superadmin/plans/[slug]/route.ts` | PATCH | Admin — updates plan config (price, limits, toggles) |
| `app/api/superadmin/restaurants/[id]/toggle/route.ts` | PATCH | Admin — updates restaurant's plan, plan_end_date |
| `app/api/superadmin/restaurants/[id]/reset-trial/route.ts` | POST | Admin — resets restaurant to trial with fresh 7-day window |
| `app/api/superadmin/subscriptions/route.ts` | POST | Admin — creates subscription payment record |
| `app/api/admin/subscription/route.ts` | PATCH | Owner self-serve — always returns 403 (blocked) |
| `app/api/owner/plan-status/route.ts` | GET | Owner — returns current plan, limits, usage, canAdd* booleans |
| `app/api/owner/dishes/route.ts` | POST/PATCH | Enforces dish + image limits on create/update |
| `app/api/owner/categories/route.ts` | POST | Enforces category limit |
| `app/api/owner/ai/check-limit/route.ts` | GET | Checks AI post monthly limit |
| `app/api/owner/ai/generate-text/route.ts` | POST | Blocks AI generation if plan=0 |
| `app/api/owner/ai/generate-post/route.ts` | POST | Blocks AI generation if plan=0 |
| `app/api/owner/ai/generate-image/route.ts` | POST | Blocks AI generation if plan=0 |
| `app/api/orders/route.ts` | POST | Enforces trial expiry + order limits for trial plans |

### UI Components
| Component | Purpose |
|-----------|---------|
| `app/(owner)/dashboard/subscription/page.tsx` | Owner subscription page — shows current plan, usage meters, upgrade options |
| `components/shared/SubscriptionBanner.tsx` | Dashboard banner — shows trial/grace/expired/suspended/paid states |
| `components/superadmin/PlanManager.tsx` | Super admin plan CRUD — edits plans table fields |
| `components/superadmin/PlanEditor.tsx` | Per-restaurant plan editor with override fields |

---

## 3. Purchase Flow

**There is NO self-serve purchase flow.** The entire system is manual:

1. Owner sees plan cards on `subscription/page.tsx` — each "Choose Plan" button links to **WhatsApp** (`wa.me/...`)
2. Owner sends payment proof via WhatsApp (JazzCash, Easypaisa, or Bank Transfer)
3. Super admin manually:
   - Goes to `superadmin/restaurants/[id]` → selects plan in `PlanEditor` → clicks "Save Plan"
   - This calls `PATCH /api/superadmin/restaurants/[id]/toggle` with `{plan, plan_end_date}`
   - Then calls `POST /api/superadmin/subscriptions` to record payment
4. `toggle/route.ts` validates plan is one of `["trial", "starter", "growth", "premium"]`
5. Restaurant row is updated; realtime subscription in `useSubscription.ts` detects change and refetches

**Trial auto-activation:** On restaurant signup, plan is set to `"trial"` with `trial_end = now + 7 days`.

---

## 4. Limit Enforcement

### Server-Side (Authoritative)
| Resource | API Route | Enforcement |
|----------|-----------|-------------|
| **Orders (trial)** | `app/api/orders/route.ts:100-127` | Checks trial expiry (grace period), then counts non-cancelled orders vs maxOrders |
| **Orders (paid)** | `app/api/orders/route.ts` | **NOT ENFORCED** — no check for starter/growth/premium order limits |
| **Dishes** | `app/api/owner/dishes/route.ts:76-93` | Counts current dishes vs PLAN_LIMITS[plan].maxDishes |
| **Images** | `app/api/owner/dishes/route.ts:95-113` (create) / `:207-219` (update) | Counts images with image_url set vs maxImages |
| **Categories** | `app/api/owner/categories/route.ts:59-71` | Counts categories vs maxCategories |
| **AI posts** | `app/api/owner/ai/check-limit/route.ts:28-50` | Checks aiPostsPerMonth vs ai_usage.count for current month |
| **AI generation** | `app/api/owner/ai/generate-*/route.ts` | Blocks if limits.aiPostsPerMonth === 0 |
| **Restaurant active** | `app/api/owner/dishes/route.ts:56-57` | Checks is_active and is_suspended |

### Client-Side (UX Feedback)
| Component | What it does |
|-----------|-------------|
| `useSubscription.ts` | Exposes canAddDish, canUploadImage, canAddCategory, canAcceptOrder, blockMenu, blockOrders, isExpired, isSuspended |
| `SubscriptionBanner.tsx` | Shows trial/grace/expired/suspended banners with CTA links |
| `subscription/page.tsx` | Usage meters (dishes, images, orders, categories) with progress bars |
| Dashboard DishCard | Disables add button when canAddDish is false |

### Realtime Sync
`useSubscription.ts:131-163` subscribes to `postgres_changes` on restaurants, dishes, and orders tables with 500ms debounce refetch.

---

## 5. What's Working ✅

1. **Trial lifecycle solid** — activation on signup, 7-day window, 3-day grace, hard block after expiry, menu hidden from customers
2. **Dish limit enforcement** — both POST and PATCH check count before insert/update
3. **Image limit enforcement** — counts dishes with image_url before allowing image attachment
4. **Category limit enforcement** — POST checks count before insert
5. **AI post limit enforcement** — monthly counter in ai_usage table, checked before each generation
6. **Realtime updates** — plan changes by super admin propagate to owner dashboard instantly
7. **Trial order limit enforcement** — orders API checks trial limits from DB (configurable via company_settings)
8. **Trial expiry on customer side** — menu page returns "Menu Unavailable" for expired trials
9. **Suspension enforcement** — checked at order creation, dish creation, category creation
10. **Plan config is DB-driven** — plans table allows super admin to change prices/limits without code deploy
11. **Per-restaurant overrides** — plan_limits_override jsonb field allows custom limits per restaurant
12. **Plan ending email alerts** — 7-day warning via Resend, deduped per day via notification_logs
13. **Self-serve plan change blocked** — app/api/admin/subscription/route.ts always returns 403

---

## 6. What's Broken ❌

### BUG 1: Paid Plan Order Limits NOT Enforced (CRITICAL)
**File:** `app/api/orders/route.ts:111`
```typescript
if (restaurant.plan === "trial") {
  // only checks trial plans — paid plan limits ignored
}
```
If superadmin sets a finite order limit on starter/growth via plans table, it is NEVER enforced.

### BUG 2: `useSubscription` Uses Hardcoded Limits, Ignores Overrides
**File:** `lib/hooks/useSubscription.ts:175`
```typescript
const planLimits = PLAN_LIMITS[plan] || EMPTY_LIMITS  // hardcoded!
```
Per-restaurant `plan_limits_override` is completely ignored on client side. Usage meters show wrong limits.

### BUG 3: Subscription Page Shows Hardcoded Prices/Limits
**File:** `app/(owner)/dashboard/subscription/page.tsx:184-185`
```typescript
const price = PLAN_PRICES[planKey]  // hardcoded
const limits = PLAN_LIMITS[planKey] // hardcoded
```
If superadmin changes prices via PlanManager, subscription page shows stale values until redeploy.

### BUG 4: `plan_start_date` Never Updated on Upgrade
**File:** `app/api/superadmin/restaurants/[id]/toggle/route.ts:23-28`
Only `plan` and `plan_end_date` are set. `plan_start_date` retains original signup date.

### BUG 5: PlanManager Can't Edit AI Post Limits
**File:** `components/superadmin/PlanManager.tsx:27-31`
`ai_posts_per_month` not in `allowedFields`. Superadmin must use Supabase dashboard directly.

### BUG 6: Trial Reminder Emails Never Sent
**File:** `lib/email/planEndingAlert.ts:26`
Line 26: `if (restaurant.plan === "trial") return` — skips trials. `TRIAL_REMINDER_DAYS = [5, 3, 1]` defined in `lib/subscription.ts:132` but no code sends these emails.

### BUG 7: `plan-status` API Doesn't Check `is_active`/`is_suspended`
**File:** `app/api/owner/plan-status/route.ts:48-50`
```typescript
canAddDish: dishCount < limits.maxDishes,  // missing isActive && !isSuspended check
```

### BUG 8: Dish/Image Limits Ignore `plan_limits_override`
**File:** `app/api/owner/dishes/route.ts:60`
```typescript
const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.trial  // hardcoded, no override
```
`getEffectiveLimits()` exists but is not used here.

### BUG 9: Subscription Record Has No `status` Column
**File:** `app/api/superadmin/subscriptions/route.ts:26-32`
Request body has `status` field but `subscriptions` table has no `status` column.

### BUG 10: Hardcoded Fake Payment Details
**File:** `app/(owner)/dashboard/subscription/page.tsx:55-60`
```typescript
const jazzcash = settings.jazzcash_number || "03001234567"  // fake default
```

---

## 7. What Needs Fixing

### Priority 1 — Critical

| # | Fix | File(s) |
|---|-----|---------|
| 1 | Use `getEffectiveLimits()` in dish/category APIs instead of hardcoded `PLAN_LIMITS` | `dishes/route.ts:60`, `categories/route.ts:57` |
| 2 | Fix `useSubscription` planLimits to use overrides | `useSubscription.ts:175` |
| 3 | Enforce order limits for ALL plans, not just trial | `orders/route.ts:111` |
| 4 | Implement trial reminder email cron (use `TRIAL_REMINDER_DAYS`) | New API route or cron job |

### Priority 2 — Important

| # | Fix | File(s) |
|---|-----|---------|
| 5 | Set `plan_start_date` on plan change | `toggle/route.ts:23` |
| 6 | Add `ai_posts_per_month` to PlanManager UI | `PlanManager.tsx:27` |
| 7 | Fetch plans from `/api/plans` instead of hardcoded on subscription page | `subscription/page.tsx:184` |
| 8 | Add `is_active`/`is_suspended` checks to `plan-status` API | `plan-status/route.ts:48` |

### Priority 3 — Nice to Have

| # | Fix | File(s) |
|---|-----|---------|
| 9 | Add `status` column to `subscriptions` table or remove from API | DB migration |
| 10 | Remove fake payment defaults | `subscription/page.tsx:55` |
| 11 | Type `Subscription.plan` as `Plan` union instead of `string` | `types/index.ts:114` |

---

## 8. Summary

| Metric | Value |
|--------|-------|
| Total Bugs Found | 10 |
| Critical Bugs | 4 |
| Important Bugs | 4 |
| Nice-to-Have | 3 |
| Files Involved | 20+ |
| Database Tables | 6 |
| API Routes | 15 |
| UI Components | 5 |

**Bottom line:** The trial system works well. The paid plan system has gaps — limits can be configured in DB but are not always enforced, client-side uses hardcoded values, and the subscription page doesn't reflect admin changes. The purchase flow is entirely manual via WhatsApp.
