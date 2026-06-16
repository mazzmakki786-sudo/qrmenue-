# QRMenu.pk — Security & Bug Audit Report

**Date:** June 16, 2026
**Scope:** Full codebase — API routes, client components, config, RLS policies, dependencies

---

## Executive Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 5 |
| HIGH | 12 |
| MEDIUM | 14 |
| LOW | 10 |
| **Total** | **41** |

---

## CRITICAL

### CRIT-01: Orders RLS Allows Anyone to Read ALL Orders
**File:** `supabase_migration.sql:316-318`
```sql
CREATE POLICY "Anyone can view orders" ON orders FOR SELECT USING (true);
```
**Impact:** Any authenticated user (or anon key) can SELECT every order across ALL restaurants — customer names, phones, addresses, payment info.
**Fix:** Remove this policy. Restrict to `customer_id = auth.uid()` or owner-only.

---

### CRIT-02: Orders RLS Allows Anonymous Order Creation
**File:** `supabase_migration.sql:328-330`
```sql
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
```
**Impact:** Anyone with the anon key can insert orders directly, bypassing API rate limits, trial checks, and validation.
**Fix:** Remove this policy. Orders should only be created through the API.

---

### CRIT-03: Owners Can Self-Assign Any Subscription Plan
**File:** `app/api/admin/subscription/route.ts:36-48`
**Impact:** Any owner can PATCH their own plan to `"premium"` with a far-future end date. No payment verification.
**Fix:** Remove owner self-plan-setting. Plans should only be managed by superadmin or payment gateway.

---

### CRIT-04: Unauthenticated Company Settings Endpoint
**File:** `app/api/settings/route.ts:8-31`
**Impact:** Returns ALL `company_settings` key-value pairs to any unauthenticated request.
**Fix:** Add auth check. Split into public (theme colors) and private endpoints.

---

### CRIT-05: No CSRF on Order Creation
**File:** `app/api/orders/route.ts:32`
**Impact:** State-changing POST endpoint with no CSRF guard. Malicious pages can forge orders.
**Fix:** Add `csrfGuard(request)` at the top.

---

## HIGH

### HIGH-01: `safeRoute` Leaks Error Messages to Clients
**File:** `lib/api-error.ts:14-22`
**Impact:** Returns `err.message` (DB errors, Supabase errors, file paths) to all 35 routes.
**Fix:** Return generic message in production. Log details server-side only.

---

### HIGH-02: Email HTML Injection (XSS in Emails)
**File:** `lib/resend.ts:23,30,55-58`
**Impact:** User-controlled restaurant/dish names interpolated into email HTML without `escapeHtml()`.
**Fix:** Apply `escapeHtml()` to all user data in email templates.

---

### HIGH-03: DOM XSS via `innerHTML` in Print Functions
**File:** `components/shared/OrderReceipt.tsx:50`, `app/(owner)/dashboard/orders/[id]/page.tsx:101`
**Impact:** Print handlers copy `innerHTML` into new windows — HTML in customer names executes.
**Fix:** Use DOM cloning or sanitize HTML before injection.

---

### HIGH-04: Rate Limiter Bypass via Missing IP Headers
**File:** `lib/rate-limiter.ts:34-48`
**Impact:** `getClientIp()` returns `"unknown"` when headers missing. `shouldBypassRateLimit()` allows `"unknown"` through → unlimited requests.
**Fix:** Remove `"unknown"` from bypass list. Require IP header or use fallback that still rate-limits.

---

### HIGH-05: Missing CSRF on 3 State-Changing Routes
- `app/api/owner/notifications/route.ts:36` (PATCH)
- `app/api/notifications/new-dish/route.ts:8` (POST)
- `app/api/orders/route.ts:32` (POST)

**Fix:** Add `csrfGuard(request)` to each.

---

### HIGH-06: Menu API Returns Full Restaurant Object
**File:** `app/api/menu/[slug]/route.ts:19-24`
**Impact:** `select("*")` exposes `owner_id`, `phone`, `plan`, `plan_limits_override`, `is_suspended`, etc. to public.
**Fix:** Whitelist: `name, slug, city, logo_url, language, categories(...)`.

---

### HIGH-07: Storage Bucket `dish-images` Overly Permissive
**File:** `supabase_migration.sql:256-269`
**Impact:** Any authenticated user can upload/update/delete files in any restaurant's directory.
**Fix:** Add path-based RLS: `storage.foldername(name) = auth.uid()`.

---

### HIGH-08: Missing RLS on `owner_notifications` Table
**Impact:** No RLS = any authenticated user can read/modify all notifications.
**Fix:** `ALTER TABLE owner_notifications ENABLE ROW LEVEL SECURITY` + policies.

---

### HIGH-09: Missing RLS on `qr_announcements` Table
**Impact:** Same as HIGH-08.
**Fix:** Add RLS policies restricting to superadmin.

---

### HIGH-10: Missing Rate Limiting on 12 Superadmin Endpoints
**Files:** All `app/api/superadmin/*/route.ts` GET endpoints
**Fix:** Add `checkRateLimit(request, "superadmin:read")` / `"superadmin:write"`.

---

### HIGH-11: No Security Headers in `next.config.ts`
**File:** `next.config.ts`
**Impact:** No CSP, HSTS, X-Frame-Options, X-Content-Type-Options configured for Vercel deployment.
**Fix:** Add `headers()` config with all security headers.

---

### HIGH-12: Rate Limit Code vs Documentation Mismatch
**File:** `lib/rate-limiter.ts:9-21`
**Impact:** Actual limits are 2-4x more generous than documented in AGENTS.md.
**Fix:** Tighten code limits to match or exceed documented values.

---

## MEDIUM

### MED-01: Error Message Leakage (Multiple Routes)
**Files:** `app/api/orders/route.ts:122`, `app/api/orders/[id]/route.ts:122`, `app/api/owner/dishes/route.ts:117,207`, `app/api/owner/categories/route.ts:84,149`, `app/api/admin/dishes/route.ts:66`, `app/api/test-email/route.ts:50`, `app/api/trial/reminders/check/route.ts:43,80`
**Fix:** Return generic errors. Log details server-side.

---

### MED-02: `owner/dishes` PATCH Missing Input Validation
**File:** `app/api/owner/dishes/route.ts:135-215`
**Impact:** No Zod validation on PATCH body (unlike POST). Unexpected field types possible.
**Fix:** Add Zod update schema.

---

### MED-03: Admin Dish Creation Bypasses Plan Limits
**File:** `app/api/admin/dishes/route.ts:22-74`
**Impact:** Owners can call `/api/admin/dishes` to bypass maxDishes/maxImages limits.
**Fix:** Add plan limit checks or remove endpoint.

---

### MED-04: Superadmin Toggle Allows Unchecked `plan_limits_override`
**File:** `app/api/superadmin/restaurants/[id]/toggle/route.ts:32-34`
**Fix:** Validate against schema (positive numeric values).

---

### MED-05: Superadmin Settings Allows Arbitrary Key-Value Writes
**File:** `app/api/superadmin/settings/route.ts:45-50`
**Fix:** Whitelist allowed setting keys.

---

### MED-06: Public Endpoint Exposes Restaurant Plan Type
**File:** `app/api/orders/check-limit/[slug]/route.ts:74-81`
**Fix:** Remove `plan` from response, replace with `isTrial` boolean.

---

### MED-07: Order Limit Race Condition
**File:** `app/api/orders/route.ts:72-88`
**Impact:** Count check and INSERT are non-atomic. Concurrent requests bypass trial limits.
**Fix:** Use DB-level constraint or `SELECT ... FOR UPDATE`.

---

### MED-08: PII Persisted Unencrypted in localStorage
**Files:** `stores/orderStore.ts:37-57`, `app/(customer)/checkout/page.tsx:28-31`
**Impact:** Customer name, phone, address in localStorage. XSS can exfiltrate.
**Fix:** Use sessionStorage or encrypt data.

---

### MED-09: Hardcoded Email Fallback in Production
**File:** `app/api/test-email/route.ts:19`
```typescript
const testEmail = process.env.SUPER_ADMIN_EMAIL || "mazzmakki786@gmail.com"
```
**Fix:** Remove hardcoded fallback.

---

### MED-10: `localhost:3000` Hardcoded in CSRF Origins
**File:** `lib/csrf.ts:6`
**Fix:** Gate behind `NODE_ENV !== "production"`.

---

### MED-11: `dangerouslySetInnerHTML` in JsonLd
**File:** `components/JsonLd.tsx:9`
**Impact:** Restaurant names with `</script>` could break JSON-LD context.
**Fix:** Sanitize data before serialization.

---

### MED-12: Missing Audit Logging on Most Superadmin Endpoints
**Files:** All superadmin routes except a few
**Fix:** Add `logAudit()` calls.

---

### MED-13: Unsanitized JSON.parse of localStorage
**File:** `app/(customer)/checkout/page.tsx:24`
**Fix:** Add schema validation after parsing.

---

### MED-14: Order Number Generation Predictable
**File:** `lib/utils.ts:12-16`
**Impact:** `Math.random()` + 4-digit range = 9000 possible numbers/year. Not cryptographically secure.
**Fix:** Use `crypto.randomUUID()` or similar.

---

## LOW

### LOW-01: `console.error` in Production Code
**Files:** `lib/owner-audit.ts:20`, `components/shared/ErrorBoundary.tsx:27`, multiple hooks
**Fix:** Gate behind `NODE_ENV !== "production"`.

---

### LOW-02: QR Code Download Unicode Encoding Bug
**Files:** `components/shared/QRCodeDisplay.tsx:21-34`, `lib/qr.ts:7-20`
**Impact:** `btoa()` fails on non-ASCII. Owner QR page uses correct `btoa(unescape(encodeURIComponent(...)))`.
**Fix:** Apply same pattern everywhere.

---

### LOW-03: `any` Types in Shared Components
**Files:** `components/shared/OrderReceipt.tsx:10-11`, `components/shared/SubscriptionBanner.tsx:8`
**Fix:** Define proper interfaces.

---

### LOW-04: Internal HTTP Call in `owner/dishes` POST
**File:** `app/api/owner/dishes/route.ts:120-125`
**Impact:** `fetch("/api/notifications/new-dish")` — should be direct function call.
**Fix:** Import and call the notification function directly.

---

### LOW-05: `superadmin/check` Logs Failed Attempts Without Auth
**File:** `app/api/superadmin/check/route.ts:6-35`
**Impact:** Any user can probe whether an email is the superadmin.
**Fix:** Restrict to superadmin login flow only.

---

### LOW-06: Silent Error Swallowing
**Files:** `app/api/superadmin/announcements/[id]/publish/route.ts:73,91`, `lib/superadmin-security.ts:43,73`
**Fix:** Log errors server-side even if caught.

---

### LOW-07: `safeJson` Type Mismatch
**File:** `lib/api-error.ts:26-34`
**Impact:** Returns `NextResponse` but typed as `unknown`.

---

### LOW-08: `supabase_realtime_migration.sql` Over-Exposes Tables
**Lines:** 1-3
**Impact:** `customers` and `company_settings` added to Realtime publication — leaks PII.

---

### LOW-09: `@playwright/mcp` in devDependencies
**File:** `package.json:35`
**Impact:** MCP dev tool in repo. Ensure not deployed.

---

### LOW-10: Missing Audit on Owner Endpoints
**Files:** `app/api/owner/notifications/route.ts`, `app/api/owner/plan-status/route.ts`

---

## Priority Remediation Order

### Immediate (Do Now)
1. **Fix Orders RLS** — Remove `USING (true)` SELECT and `WITH CHECK (true)` INSERT policies
2. **Fix Privilege Escalation** — Remove owner self-plan-setting in `admin/subscription`
3. **Add Auth to Settings** — Require authentication on `GET /api/settings`
4. **Add CSRF to Orders** — Add `csrfGuard()` to order creation

### This Week
5. **Fix `safeRoute` error leakage** — Generic messages in production (fixes all 35 routes)
6. **Add CSRF to remaining routes** — `owner/notifications` PATCH, `notifications/new-dish` POST
7. **Whitelist menu API fields** — Stop exposing internal restaurant data
8. **Add security headers** — CSP, HSTS, X-Frame-Options in `next.config.ts`
9. **Add RLS to `owner_notifications` and `qr_announcements`**

### This Month
10. **Add rate limiting to all superadmin endpoints**
11. **Fix rate limiter bypass** — Remove `"unknown"` from bypass list
12. **Apply `escapeHtml()` to `lib/resend.ts`**
13. **Fix innerHTML XSS in print functions**
14. **Add audit logging to all superadmin endpoints**
15. **Validate `plan_limits_override` and settings keys**
