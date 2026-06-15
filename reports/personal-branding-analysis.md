# Personal Branding — Analysis Report

> **Date:** 2026-06-15
> **Scope:** Full analysis of personal branding features across all subscription plans, including implementation status and control points.

---

## 1. Overview

Personal branding allows restaurants to remove QRMenu.pk references from their customer-facing menu and present a white-label experience. Currently this feature is **displayed in pricing/UI but NOT yet enforced in the customer-facing menu code**.

---

## 2. Plan-Wise Breakdown

### Free Trial (`trial`)

| Aspect | Status |
|--------|--------|
| Price | PKR 0 (7 days) |
| `customBranding` flag | `false` |
| Logo upload | ✅ Available (unrestricted) |
| Logo display on menu | ✅ Always shown |
| "Powered by QRMenu.pk" hiding | ❌ No branding  |
| Custom theme/colors | ❌ Not implemented |

### Starter (`starter`)

| Aspect | Status |
|--------|--------|
| Price | PKR 1,200/mo |
| `customBranding` flag | `false` |
| Logo upload | ✅ Available |
| Logo display on menu | ✅ Always shown |
| Custom branding in UI description | ❌ "No branding" shown |
| Actual branding enforcement | ❌ None |

### Growth (`growth`)

| Aspect | Status |
|--------|--------|
| Price | PKR 2,500/mo |
| `customBranding` flag | `true` |
| Logo upload | ✅ Available |
| Logo display on menu | ✅ Always shown |
| Custom branding in UI description | ✅ "Custom branding" shown |
| Priority support | ✅ Included |
| "Everything in Starter" | ✅ Inherits all Starter features |
| Actual branding enforcement | ❌ None (flag not checked in customer menu) |

### Premium (`premium`)

| Aspect | Status |
|--------|--------|
| Price | PKR 4,500/mo |
| `customBranding` flag | `true` |
| Logo upload | ✅ Available |
| Logo display on menu | ✅ Always shown |
| Custom branding in UI description | ✅ "Custom branding" shown |
| Priority support | ✅ Included |
| "Everything in Growth" | ✅ Inherits all Growth features |
| Maximum dishes | 100 |
| Maximum images | 100 |
| Actual branding enforcement | ❌ None (flag not checked in customer menu) |

---

## 3. Where Personal Branding is Controlled

### 3.1. Plan Definition — `lib/subscription.ts`

- **`PlanLimits` interface** (line 3): Defines `customBranding: boolean` field
- **`PLAN_LIMITS` record** (line 68): Sets per-plan values:
  - `trial`: `customBranding: false` (line 75)
  - `starter`: `customBranding: false` (line 85)
  - `growth`: `customBranding: true` (line 95)
  - `premium`: `customBranding: true` (line 105)
- **`getPlanFeatures()`** (line 288): Adds "Custom branding" text to feature list when `limits.customBranding === true`
- **`getEffectiveLimits()`** (line 154): Merges plan defaults with per-restaurant overrides (but `override` only supports numeric limits, NOT `customBranding` — so `customBranding` can't be overridden per restaurant)

### 3.2. Trial Configuration — `lib/subscription-server.ts`

- **`buildTrialLimitsFromConfig()`** (line 28): Always sets `customBranding: false` for trial (line 35)

### 3.3. Client Hook — `lib/hooks/useSubscription.ts`

- **`EMPTY_LIMITS`** (line 38): Default fallback has `customBranding: false`
- **`useSubscription()`**: Exposes `planLimits` to all components

### 3.4. UI Display Points

| File | Line(s) | What It Does |
|------|---------|-------------|
| `app/page.tsx` | 79 | Comparison table: "Custom restaurant branding" = false for trial/starter, true for growth/premium |
| `app/page.tsx` | 50 | Growth card: "Custom branding" listed as feature |
| `app/page.tsx` | 66 | Premium card: "Custom branding" listed as feature |
| `app/pricing/PricingClient.tsx` | 15 | Uses `getPlanFeatures()` which conditionally adds "Custom branding" |
| `app/(owner)/dashboard/subscription/page.tsx` | 130 | Shows "Custom branding" or "No branding" per plan in feature comparison |
| `components/shared/SubscriptionBanner.tsx` | — | Shows plan status but doesn't reference branding |

### 3.5. Database

| Table | Column | Type | Purpose |
|-------|--------|------|---------|
| `restaurants` | `plan` | `TEXT` with CHECK constraint | Stores current plan: `'trial'`, `'starter'`, `'growth'`, `'premium'` |
| `restaurants` | `logo_url` | `TEXT` | Restaurant logo (available to ALL plans, no gating) |
| `restaurants` | `plan_limits_override` | `JSONB` | Per-restaurant override (only numeric limits, NOT `customBranding`) |

### 3.6. Superadmin Controls

| File | What It Controls |
|------|-----------------|
| `components/superadmin/PlanEditor.tsx` | Change plan, set end date, override numeric limits per restaurant |
| `components/superadmin/TrialLimitsEditor.tsx` | Globally override trial limits (dishes, categories, orders, duration, grace period) |
| `app/api/superadmin/restaurants/[id]/toggle/route.ts` | Toggle plan, suspension, image upload |

---

## 4. Current Implementation Gap

### What IS implemented:
- `customBranding` boolean flag in plan configuration ✅
- Feature list generation based on flag ✅
- Display in pricing tables and subscription comparison pages ✅
- Logo upload (available to all plans regardless of flag) ✅

### What is NOT implemented:
- **No "Powered by QRMenu.pk" watermark/badge** exists on the customer-facing menu
- **No plan-based gating** of branding in `components/customer/MenuHeader.tsx` or `components/customer/MenuContent.tsx`
- **No custom theme/color scheme** control tied to `customBranding`
- **No hiding of QRMenu.pk references** in menu metadata (Open Graph, Twitter cards, canonical URL all reference QRMenu.pk)
- The `todo.md` (line 106) mentions: `- [ ] Use QRMenu.pk branding with green (#25D366) theme` — confirming branding is planned but not yet built

### Consequence:
**All plans (trial, starter, growth, premium) currently display identical customer-facing menus.** The `customBranding` flag only controls textual descriptions on pricing and subscription pages — it has zero enforcement in the actual menu rendering.

---

## 5. What "Personal Branding" Should Include (Recommended Implementation)

For `customBranding: true` (Growth & Premium), the following should be hidden or customizable:

| Branding Element | Current Behavior | Expected for Personal Branding |
|-----------------|-----------------|-------------------------------|
| "QRMenu.pk" in page title/meta | Always present | Remove or let restaurant customize |
| "QRMenu.pk" in OG tags | Always present | Remove or let restaurant customize |
| "Powered by QRMenu.pk" badge | Not yet built | Hide when `customBranding: true` |
| WhatsApp order mention branding | Generic | No QRMenu.pk reference |
| Footer branding | Not yet built | Hide when `customBranding: true` |
| Color scheme | Fixed green (#25D366) theme | Allow customization (Premium only) |
| Custom domain | Not yet built | Premium-only feature |

---

## 6. Summary Table

| Plan | Price | `customBranding` Flag | Logo Upload | Logo Display | Branding Enforcement | Actual Difference |
|------|-------|----------------------|-------------|--------------|---------------------|-------------------|
| Trial | Free | `false` | ✅ | ✅ | ❌ Not implemented | None |
| Starter | PKR 1,200 | `false` | ✅ | ✅ | ❌ Not implemented | None |
| Growth | PKR 2,500 | `true` | ✅ | ✅ | ❌ Not implemented | None |
| Premium | PKR 4,500 | `true` | ✅ | ✅ | ❌ Not implemented | None |

**Bottom line:** The plan infrastructure and feature flags are ready, but the actual personal branding enforcement in the customer-facing menu has not been built yet.

---

## 7. Key Files Reference

### Plan Configuration
| File | Purpose |
|------|---------|
| `lib/subscription.ts` | Core plan types, limits, features, status logic |
| `lib/subscription-server.ts` | Server-side trial config loader |
| `lib/hooks/useSubscription.ts` | React hook exposing subscription state |
| `types/index.ts` | Restaurant type definition |

### UI Display
| File | Purpose |
|------|---------|
| `app/page.tsx` | Landing page with pricing cards + comparison table |
| `app/pricing/PricingClient.tsx` | Pricing page with feature lists |
| `app/(owner)/dashboard/subscription/page.tsx` | Owner subscription management |
| `components/shared/SubscriptionBanner.tsx` | Plan status banner |

### Customer Menu (where branding enforcement should go)
| File | Purpose |
|------|---------|
| `components/customer/MenuHeader.tsx` | Restaurant header with logo, cover, name |
| `components/customer/MenuContent.tsx` | Menu content, search, category tabs |
| `app/(customer)/menu/[slug]/page.tsx` | Customer menu page with metadata |

### Superadmin
| File | Purpose |
|------|---------|
| `components/superadmin/PlanEditor.tsx` | Plan editor with override controls |
| `components/superadmin/TrialLimitsEditor.tsx` | Trial limit configuration |
| `app/api/superadmin/restaurants/[id]/toggle/route.ts` | Plan toggle API |

### Database
| File | Purpose |
|------|---------|
| `supabase_migration.sql` | Schema with restaurants table, plan constraint |
| `supabase_migrations/security_rls_fix.sql` | RLS policies |
