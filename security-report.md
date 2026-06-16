# QRMenu.pk — Security Audit Report

**Date:** 2026-06-15  
**Auditor:** AI Security Review  
**Scope:** All screens, API routes, authentication, authorization, data protection

---

## Executive Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 3 |
| HIGH | 6 |
| MEDIUM | 10 |
| LOW | 8 |
| **Total** | **27** |

**Overall Security Rating: 5/10** — Functional but has critical vulnerabilities that need immediate attention.

---

## Screen-by-Screen Rating

| Screen | Route | Rating | Issues |
|--------|-------|--------|--------|
| Homepage | `/` | 7/10 | Hardcoded contact info, no CSP headers |
| Pricing | `/pricing` | 7/10 | Payment details exposed via unauthenticated API |
| Login | `/login` | 4/10 | Open redirect vulnerability |
| Restaurant Browse | `/restaurants` | 8/10 | Clean, proper data filtering |
| Customer Menu | `/menu/[slug]` | 7/10 | JSON-LD XSS risk, banner URL not validated |
| Customer Checkout | `/checkout` | 6/10 | PII in localStorage, no CSRF on order POST |
| Customer Order Tracking | `/order-confirm/[id]` | 6/10 | Relies solely on RLS for access |
| Owner Dashboard | `/dashboard` | 7/10 | Clean but no CSP headers |
| Owner Menu | `/dashboard/menu` | 7/10 | Zod validation on POST, missing on PATCH |
| Owner Orders | `/dashboard/orders` | 6/10 | IDOR risk on order detail page |
| Owner Order Detail | `/dashboard/orders/[id]` | 5/10 | innerHTML XSS, no restaurant_id filter |
| Owner Analytics | `/dashboard/analytics` | 8/10 | Clean |
| Owner QR Code | `/dashboard/qr` | 7/10 | Clean after recent fixes |
| Owner Settings | `/dashboard/settings` | 8/10 | Clean after recent changes |
| Owner Subscription | `/dashboard/subscription` | 7/10 | Clean |
| Owner Profile (was Settings) | `/dashboard/settings` | 8/10 | Personal info only |
| Super Admin Dashboard | `/superadmin` | 5/10 | Missing CSRF, missing rate limiting on many routes |
| Super Admin Restaurants | `/superadmin/restaurants` | 6/10 | Missing audit logging |
| Super Admin Settings | `/superadmin/settings` | 5/10 | Arbitrary key injection, no CSRF |
| API: Settings | `/api/settings` | 3/10 | Unauthenticated, exposes payment details |
| API: Orders | `/api/orders` | 6/10 | No CSRF, rate limited |
| API: Owner Dishes | `/api/owner/dishes` | 4/10 | IDOR on PATCH, missing ownership check |
| API: Admin Subscription | `/api/admin/subscription` | 3/10 | Self-upgrade without payment |
| API: Superadmin Routes | `/api/superadmin/*` | 5/10 | Missing CSRF on most, missing rate limiting |

---

## CRITICAL Vulnerabilities (Fix Immediately)

### 1. IDOR: Dish Update Without Ownership Verification
**File:** `app/api/owner/dishes/route.ts:189-203`  
**Impact:** Any restaurant owner can modify ANY dish belonging to ANY other restaurant by guessing the UUID.  
**Fix:** Add `.eq("restaurant_id", restaurant.id)` to the update query.

### 2. Self-Upgrade Subscription Without Payment
**File:** `app/api/admin/subscription/route.ts:35-48`  
**Impact:** Any owner can change their plan to "premium" without paying.  
**Fix:** Gate this endpoint behind superadmin or payment verification.

### 3. Unauthenticated Settings API Exposes Payment Details
**File:** `app/api/settings/route.ts:7-29`  
**Impact:** JazzCash, Easypaisa numbers, bank accounts, and email exposed to anyone.  
**Fix:** Either require authentication or move payment details to env vars.

---

## HIGH Vulnerabilities (Fix Within 1 Week)

### 4. Open Redirect in Auth Callback
**File:** `app/auth/callback/route.ts:7,16` and `app/(auth)/login/page.tsx:14,24,41`  
**Impact:** Attackers can redirect authenticated users to malicious sites after login.  
**Fix:** Validate redirect param is relative path only (starts with `/`, no `//`).

### 5. Superadmin Settings: Arbitrary Key Injection
**File:** `app/api/superadmin/settings/route.ts:42-47`  
**Impact:** Compromised superadmin can overwrite any config key.  
**Fix:** Add allowlist of valid settings keys.

### 6. Missing CSRF on Superadmin State-Changing Routes
**Files:** Multiple superadmin API routes  
**Impact:** Cross-site request forgery can modify restaurants, toggle status, publish announcements.  
**Fix:** Add `csrfGuard()` to all state-changing superadmin routes.

### 7. Missing Rate Limiting on Superadmin Routes
**Files:** Multiple superadmin API routes  
**Impact:** Compromised superadmin session can be used for brute-force or email bombing.  
**Fix:** Add rate limiting to all superadmin routes, especially publish endpoint.

### 8. Superadmin Reset Trial: No Audit Logging
**File:** `app/api/superadmin/restaurants/[id]/reset-trial/route.ts`  
**Impact:** Destructive action with no audit trail.  
**Fix:** Add `logAudit()` call.

### 9. No CSP/HSTS Security Headers
**File:** `next.config.ts`  
**Impact:** Increased XSS vulnerability, no HTTPS enforcement, no clickjacking protection.  
**Fix:** Add security headers in next.config.ts or vercel.json.

---

## MEDIUM Vulnerabilities (Fix Within 2 Weeks)

### 10. Missing CSRF on Owner Notifications
**File:** `app/api/owner/notifications/route.ts`  
### 11. Missing CSRF on Orders POST
**File:** `app/api/orders/route.ts`  
### 12. PATCH Owner Dishes Has No Zod Validation
**File:** `app/api/owner/dishes/route.ts:134-214`  
### 13. Order Detail Page Fetches Without restaurant_id Filter
**File:** `app/(owner)/dashboard/orders/[id]/page.tsx:40`  
### 14. innerHTML in Print Functions (XSS Risk)
**File:** `app/(owner)/dashboard/orders/[id]/page.tsx:101`  
### 15. Client Queries Rely Solely on RLS
**Files:** Multiple client-side pages  
### 16. Missing JSON Parse Error Handling
**Files:** 11+ API routes  
### 17. Predictable Order Numbers
**File:** `lib/utils.ts:12-16`  
### 18. Rate Limiter Bypass for "Unknown" IP
**File:** `lib/rate-limiter.ts:46-48`  
### 19. Superadmin Routes Missing Audit Logging
**Files:** toggle, reset-trial, restaurant update, trial-limits

---

## LOW Vulnerabilities (Fix When Convenient)

### 20. dangerouslySetInnerHTML in JSON-LD
### 21. Customer PII in localStorage
### 22. Banner Link URL Not Validated as URL Scheme
### 23. Hardcoded Email in Test Endpoint
### 24. Inconsistent Error Status Codes (401 vs 403)
### 25. Admin Dishes Route Misnomer
### 26. IP Spoofing via x-forwarded-for
### 27. plan_limits_override Without Type Validation

---

## Security Infrastructure Assessment

| Component | Status | Notes |
|-----------|--------|-------|
| Authentication | ✅ Good | Supabase auth, proper session management |
| Authorization (Owner) | ⚠️ Partial | API routes check ownership, client-side relies on RLS |
| Authorization (Superadmin) | ✅ Good | Email-based check with lockout |
| Rate Limiting | ⚠️ Partial | DB-backed, but "unknown" IP bypasses |
| CSRF Protection | ⚠️ Partial | Only some routes have csrfGuard |
| Input Validation | ⚠️ Partial | Zod on some routes, manual on others |
| SQL Injection | ✅ Good | All queries use Supabase parameterized builder |
| XSS Protection | ⚠️ Partial | React escaping + some innerHTML usage |
| Security Headers | ❌ Missing | No CSP, no HSTS on Vercel |
| Audit Logging | ⚠️ Partial | Some superadmin routes missing |
| RLS Policies | ✅ Good | Properly configured for all tables |

---

## Top 10 Priority Fixes

1. **Fix IDOR in PATCH /api/owner/dishes** — Add restaurant_id filter
2. **Remove/gate plan self-upgrade endpoint** — Require payment verification
3. **Fix open redirect in auth callback** — Validate redirect params
4. **Add CSRF guards to all state-changing routes** — Especially superadmin
5. **Add rate limiting to all superadmin routes** — Especially publish
6. **Add security headers** — CSP, HSTS, X-Frame-Options
7. **Add Zod validation to all PATCH routes** — Currently missing
8. **Add audit logging to all superadmin mutations** — toggle, reset, update
9. **Protect or remove /api/settings endpoint** — Exposes payment details
10. **Wrap all request.json() in try/catch** — Prevent 500 errors

---

## Recommendations

### Immediate (This Week)
- Fix the 3 CRITICAL vulnerabilities
- Add CSRF guards to all state-changing routes
- Add security headers to next.config.ts

### Short-term (2 Weeks)
- Add Zod validation to all PATCH routes
- Add audit logging to all superadmin mutations
- Fix open redirect vulnerability
- Add rate limiting to superadmin routes

### Long-term (1 Month)
- Implement CSP with nonces for inline scripts
- Add comprehensive input sanitization
- Remove test-email route from production
- Add penetration testing suite
- Implement Content-Security-Policy-Report-Only first, then enforce

---

*Report generated by AI security audit. Manual verification recommended for critical findings.*
