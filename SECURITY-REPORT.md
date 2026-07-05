# 🔒 QRMenu.pk — Security & API Analysis Report

**Date**: July 4, 2026  
**Scope**: Full codebase security audit — API routes, rate limiting, auth, API keys, vulnerabilities

---

## 📊 Executive Summary

| Area | Status | Score |
|------|--------|-------|
| Rate Limiting | ✅ Strong | 8/10 |
| CSRF Protection | ✅ Strong | 8/10 |
| Auth & Lockout | ✅ Strong | 8/10 |
| Input Validation | ✅ Strong | 9/10 |
| API Key Management | ⚠️ Needs Improvement | 6/10 |
| Middleware Protection | ⚠️ Partial Coverage | 5/10 |
| Error Handling | ✅ Good | 7/10 |
| Audit Logging | ✅ Good | 7/10 |

**Overall Security Score: 7.5/10**

---

## 1️⃣ API Routes Architecture

### Total Routes: 55+

| Category | Count | Auth Required | CSRF | Rate Limit |
|----------|-------|---------------|------|------------|
| Auth (login/signup) | 3 | ❌ | ✅ | ✅ |
| Owner Dashboard | 12+ | ✅ | ✅ | ✅ |
| Customer APIs | 5+ | Partial | ❌ | ⚠️ |
| Super Admin | 15+ | ✅ | ✅ | ✅ |
| Menu (Public) | 2 | ❌ | ❌ | ✅ |
| Cron Jobs | 1 | Bearer Token | ❌ | ❌ |
| Favorites | 2 | ✅ | ❌ | ❌ |
| Settings | 1 | ✅ | ❌ | ✅ |
| Notifications | 3 | ✅ | ✅ | ✅ |

---

## 2️⃣ Rate Limiting Analysis

### Current Implementation (`lib/rate-limiter.ts`)

**Method 1: `rateLimit(identifier, max, window)`** — Pattern A (older)
- Uses generic `__generic__` endpoint key
- IP-based identification
- DB-backed (rate_limits table)
- Fails closed (denies on DB error)

**Method 2: `checkRateLimit(request, tier)`** — Pattern B (newer)
- Uses specific endpoint path
- Tier-based configuration
- Throws `RateLimitError`

### Rate Limit Tiers

| Tier | Max Requests | Window | Used By |
|------|-------------|--------|---------|
| `login` | 10 | 60s | Auth login |
| `superadmin:write` | 10 | 60s | Super admin mutations |
| `superadmin:read` | 30 | 60s | Super admin reads |
| `orders:create` | 10 | 60s | Order creation |
| `orders:update` | 10 | 60s | Order updates |
| `owner:write` | 15 | 60s | Owner mutations |
| `owner:read` | 30 | 60s | Owner reads |
| `admin:write` | 10 | 60s | Admin mutations |
| `menu:read` | 30 | 60s | Menu public reads |
| `notifications:send` | 5 | 60s | Email notifications |
| `ai:generate` | 5 | 60s | AI image generation |
| `default` | 20 | 60s | Everything else |

### ⚠️ Rate Limiting Vulnerabilities

| Issue | Severity | Location |
|-------|----------|----------|
| **IP Spoofing via `x-forwarded-for`** | 🔴 HIGH | `lib/rate-limiter.ts:37-40` |
| **Localhost bypass** | 🟡 MEDIUM | `lib/rate-limiter.ts:48-50` |
| **No per-user rate limiting** | 🟡 MEDIUM | All routes |
| **DB table unbounded growth** | 🟡 MEDIUM | `rate_limits` table |
| **No cleanup job for old entries** | 🟡 MEDIUM | `rate_limits` table |

**IP Spoofing Detail**:  
```
x-forwarded-for: 1.2.3.4, 10.0.0.1
```
Attacker can send fake `x-forwarded-for` header to bypass rate limiting. Only the first IP is used, which is user-controlled.

---

## 3️⃣ CSRF Protection Analysis

### Implementation (`lib/csrf.ts`)

- ✅ Checks `Origin` and `Referer` headers
- ✅ Only applies to state-changing methods (POST/PUT/PATCH/DELETE)
- ✅ Uses environment-based allowed origins

### ⚠️ CSRF Vulnerabilities

| Issue | Severity | Location |
|-------|----------|----------|
| **Missing CSRF on some routes** | 🔴 HIGH | See below |
| **No CSRF token mechanism** | 🟡 MEDIUM | `lib/csrf.ts` |
| **Origin header can be empty** | 🟡 MEDIUM | `lib/csrf.ts:18-20` |

### Routes MISSING CSRF Protection:

| Route | Method | Risk |
|-------|--------|------|
| `/api/favorites` | POST | Medium |
| `/api/favorites/sync` | POST | Medium |
| `/api/settings` | GET | Low (read-only) |
| `/api/cron/refresh-stats` | GET | Low (bearer auth) |

---

## 4️⃣ API Keys & Secrets Management

### Keys Used

| Key | Location | Exposure Risk |
|-----|----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client-side | 🟢 Safe (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side | 🟡 Medium (RLS dependent) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | 🔴 Critical |
| `RESEND_API_KEY` | Server-only | 🔴 Critical |
| `SUPER_ADMIN_EMAIL` | Server-only | 🟡 Medium |
| `CRON_SECRET` | Server-only | 🔴 Critical |

### ⚠️ API Key Vulnerabilities

| Issue | Severity | Location |
|-------|----------|----------|
| **`NEXT_PUBLIC_*` exposed to browser** | 🟡 MEDIUM | All client components |
| **No key rotation mechanism** | 🟡 MEDIUM | `.env` files |
| **Service role key used in many places** | 🟡 MEDIUM | `lib/supabase/server.ts:28-40` |
| **No environment separation** | 🟡 MEDIUM | `.env.example` |

**Important**: `SUPABASE_SERVICE_ROLE_KEY` bypasses ALL RLS policies. It's used in:
- Rate limiter
- Account lockout
- Order creation
- Super admin operations
- AI usage tracking
- Audit logging

---

## 5️⃣ Authentication & Authorization

### Auth Flow Security

| Component | Status | Notes |
|-----------|--------|-------|
| Login rate limiting | ✅ | 10 req/min per IP |
| Account lockout | ✅ | 5 failures → 15 min lockout |
| Progressive delay | ✅ | (n-1)×2s, max 60s |
| Password validation | ✅ | Min 6, uppercase, lowercase, digit, special |
| Email sanitization | ✅ | HTML tags stripped |
| Generic error messages | ✅ | Never reveals if account exists |
| Lockout alert email | ✅ | Resend notification |

### Super Admin Security

| Component | Status | Notes |
|-----------|--------|-------|
| Email-based gate | ✅ | Single email check |
| Rate limiting | ✅ | 30 req/min |
| Account lockout | ✅ | 3 failures → 30 min |
| Audit logging | ✅ | All actions logged |
| IP tracking | ✅ | Logged per attempt |

### ⚠️ Auth Vulnerabilities

| Issue | Severity | Location |
|-------|----------|----------|
| **No JWT token rotation** | 🟡 MEDIUM | Supabase auth |
| **No session invalidation on password change** | 🟡 MEDIUM | Auth flow |
| **Middleware only protects 3 routes** | 🔴 HIGH | `middleware.ts:9-13` |
| **No CSRF on login/signup** | 🟡 MEDIUM | Auth routes |

---

## 6️⃣ Middleware Protection Gaps

### Current Coverage (`middleware.ts`)

```typescript
matcher: [
  "/dashboard/:path*",    // ✅ Owner routes
  "/superadmin/:path*",   // ✅ Super admin routes
  "/account/:path*",      // ✅ Customer account routes
]
```

### ❌ UNPROTECTED Routes (No Middleware):

| Route Pattern | Risk Level | Potential Attack |
|---------------|------------|------------------|
| `/api/*` | 🔴 HIGH | Direct API access |
| `/menu/*` | 🟡 MEDIUM | Menu manipulation |
| `/cart` | 🟡 MEDIUM | Cart tampering |
| `/checkout` | 🔴 HIGH | Payment manipulation |
| `/order-confirm/*` | 🟡 MEDIUM | Order manipulation |
| `/restaurants` | 🟢 LOW | Public data |

**Critical**: API routes rely on individual auth checks, not middleware. If any route forgets `supabase.auth.getUser()`, it's exposed.

---

## 7️⃣ Input Validation & Sanitization

### Zod Validation Coverage

| Route | Schema | Status |
|-------|--------|--------|
| Login | `loginSchema` | ✅ |
| Restaurant Signup | `restaurantSignupSchema` | ✅ |
| Customer Signup | `customerSignupSchema` | ✅ |
| Create Order | `createOrderSchema` | ✅ |
| Create Dish | `dishSchema` | ✅ |
| Update Dish | `dishUpdateSchema` | ✅ |
| AI Generate | `schema` | ✅ |

### Sanitization

- ✅ HTML tag stripping (`sanitize()` function)
- ✅ Special character removal
- ✅ Input length limits (max 128 for passwords, max 254 for emails)

### ⚠️ Input Validation Gaps

| Issue | Severity | Location |
|-------|----------|----------|
| **No SQL injection protection (Supabase handles)** | 🟢 LOW | Supabase ORM |
| **No XSS filtering on output** | 🟡 MEDIUM | Client components |
| **Favorites route no Zod validation** | 🟡 MEDIUM | `/api/favorites` |
| **Settings route no input validation** | 🟡 MEDIUM | `/api/settings` |

---

## 8️⃣ Error Handling & Information Leakage

### Current Error Pattern (`lib/api-error.ts`)

```typescript
// Production: Generic message
"An unexpected error occurred"

// Development: Actual error message
err.message
```

### ⚠️ Information Leakage Risks

| Issue | Severity | Location |
|-------|----------|----------|
| **Dev mode exposes error details** | 🟡 MEDIUM | `api-error.ts:18` |
| **Rate limit error reveals retry time** | 🟢 LOW | `rate-limiter.ts:158` |
| **Validation errors reveal field names** | 🟡 MEDIUM | Multiple routes |
| **Supabase errors exposed in some routes** | 🟡 MEDIUM | `superadmin/restaurants/route.ts:27` |

---

## 9️⃣ Audit Logging

### Coverage

| System | Log Table | Actions Logged |
|--------|-----------|----------------|
| Super Admin | `superadmin_audit_log` | Login success/failure, blocked |
| Owner | `owner_audit_log` | dish_created, dish_updated, category_created, category_deleted, order_updated, plan_updated |

### ⚠️ Audit Gaps

| Issue | Severity | Location |
|-------|----------|----------|
| **No audit for customer actions** | 🟡 MEDIUM | Customer APIs |
| **No audit for failed auth attempts** | 🟡 MEDIUM | Auth routes |
| **Silent catch blocks swallow errors** | 🟡 MEDIUM | `superadmin-security.ts:43,73` |

---

## 🔟 Attack Vectors & Threats

### HIGH RISK Attacks

| Attack | Vector | Current Defense | Gap |
|--------|--------|-----------------|-----|
| **Brute Force Login** | `/api/auth/login` | Rate limit + lockout | IP spoofing bypass |
| **CSRF on Owner Actions** | `/api/owner/*` | Origin check | No token mechanism |
| **Service Role Key Leak** | Server environment | Server-only | If env compromised, full DB access |
| **IDOR on Orders** | `/api/orders/[id]` | RLS policies | Depends on RLS config |
| **API Enumeration** | `/api/superadmin/*` | Auth check | Error messages may reveal endpoints |

### MEDIUM RISK Attacks

| Attack | Vector | Current Defense | Gap |
|--------|--------|-----------------|-----|
| **Rate Limit Bypass** | Fake `x-forwarded-for` | IP extraction | No trusted proxy config |
| **Session Hijacking** | Cookie theft | Supabase JWT | No token rotation |
| **XSS via Dish Names** | Menu display | React escaping | No output encoding |
| **Email Harvesting** | Signup/Login errors | Generic messages | ✅ Well handled |

### LOW RISK Attacks

| Attack | Vector | Current Defense | Gap |
|--------|--------|-----------------|-----|
| **DDoS** | API endpoints | Rate limiting | Supabase own limits |
| **Cache Poisoning** | Menu endpoints | Cache-Control headers | ✅ Well handled |
| **Information Disclosure** | Error messages | Generic prod errors | Dev mode risk |

---

## 1️⃣1️⃣ Recommendations

### 🔴 CRITICAL (Fix Immediately)

1. **Add CSRF tokens** — Implement token-based CSRF for all state-changing routes
2. **Fix IP spoofing** — Use trusted proxy headers or X-Forwarded-For validation
3. **Add middleware to API routes** — Protect `/api/owner/*`, `/api/superadmin/*` at middleware level
4. **Remove `test-email` route** — Exposed in production, no rate limit

### 🟡 HIGH (Fix Soon)

5. **Add rate limit cleanup job** — Prevent `rate_limits` table bloat
6. **Implement per-user rate limiting** — Not just per-IP
7. **Add CSRF to favorites/sync routes** — Missing protection
8. **Remove dev error messages** — Never expose `err.message` in production
9. **Add audit logging for customer actions** — Track order creation, checkout

### 🟢 MEDIUM (Improve)

10. **Add rate limiting to favorites routes** — Currently unprotected
11. **Implement key rotation** — Regular Supabase key rotation
12. **Add request size limits** — Prevent large payload attacks
13. **Add CORS headers explicitly** — Don't rely on origin checking alone
14. **Add CSP headers** — Content Security Policy

---

## 1️⃣2️⃣ Security Checklist

- [x] Rate limiting on auth routes
- [x] Account lockout (5 attempts → 15 min)
- [x] Progressive delay on failed logins
- [x] CSRF protection on most state-changing routes
- [x] Zod validation on critical routes
- [x] Input sanitization (HTML strip)
- [x] Generic error messages in production
- [x] Audit logging for super admin
- [x] Audit logging for owner actions
- [x] Lockout alert emails
- [x] Supabase RLS policies
- [ ] CSRF tokens (not just origin check)
- [ ] Trusted proxy IP validation
- [ ] Middleware on all API routes
- [ ] Rate limit cleanup job
- [ ] Per-user rate limiting
- [ ] CSP headers
- [ ] Request size limits
- [ ] Key rotation mechanism

---

## 1️⃣3️⃣ Code Quality Notes

### ✅ Good Practices
- Consistent use of `safeRoute()` wrapper
- Zod validation before processing
- Generic error messages in production
- Audit logging for sensitive actions
- Environment-based configuration

### ⚠️ Inconsistencies
- Two rate limiting patterns (Pattern A vs Pattern B)
- Some routes use `rateLimit()`, others use `checkRateLimit()`
- Missing CSRF on newer routes (favorites)
- Silent `catch(() => {})` blocks in audit logging

---

## 1️⃣4️⃣ Screen-by-Screen Security Status

### 🔐 Auth Screens

| Screen/Route | File | Issues Found |
|--------------|------|--------------|
| Login Page | `app/(auth)/login/page.tsx` | ✅ Safe — CSRF + Rate Limit + Lockout |
| Restaurant Signup | `app/(auth)/signup/restaurant/page.tsx` | ✅ Safe — CSRF + Validation |
| Customer Signup | `app/(auth)/signup/customer/page.tsx` | ✅ Safe — CSRF + Validation |

### 📊 Owner Dashboard Screens

| Screen/Route | File | Issues Found |
|--------------|------|--------------|
| Dashboard Home | `app/(owner)/dashboard/page.tsx` | ✅ Safe — Protected by middleware |
| Orders List | `app/(owner)/dashboard/orders/page.tsx` | ✅ Safe — Auth + Rate Limit |
| Order Detail | `app/(owner)/dashboard/orders/[id]/page.tsx` | ⚠️ Check IDOR — Verify order belongs to restaurant |
| Menu Management | `app/(owner)/dashboard/menu/page.tsx` | ✅ Safe — Auth + Rate Limit + Zod |
| Categories | `app/(owner)/dashboard/menu/categories/page.tsx` | ✅ Safe — Auth + Rate Limit |
| Analytics | `app/(owner)/dashboard/analytics/page.tsx` | ✅ Safe — Read-only |
| QR Code | `app/(owner)/dashboard/qr/page.tsx` | ✅ Safe — Read-only |
| Settings | `app/(owner)/dashboard/settings/page.tsx` | ✅ Safe — Auth required |
| Subscription | `app/(owner)/dashboard/subscription/page.tsx` | ✅ Safe — Auth required |
| Branding | `app/(owner)/dashboard/branding/page.tsx` | ✅ Safe — Auth required |
| Announcements | `app/(owner)/dashboard/announcements/page.tsx` | ✅ Safe — Auth required |

### 🍽️ Customer-Facing Screens

| Screen/Route | File | Issues Found |
|--------------|------|--------------|
| Restaurants List | `app/(customer)/restaurants/page.tsx` | ✅ Safe — Public, no sensitive data |
| Restaurant Detail | `app/(customer)/restaurant/[slug]/page.tsx` | ✅ Safe — Public menu display |
| Menu Page | `app/(customer)/menu/[slug]/page.tsx` | ✅ Safe — Public, rate limited |
| Cart | `app/(customer)/cart/page.tsx` | ⚠️ No CSRF — Client-side only (Zustand) |
| Checkout | `app/(customer)/checkout/page.tsx` | ⚠️ No CSRF on order creation API |
| Order Confirm | `app/(customer)/order-confirm/[id]/page.tsx` | ⚠️ Verify order belongs to user |
| Account | `app/(customer)/account/page.tsx` | ✅ Safe — Protected by middleware |
| Favorites | `app/(customer)/favorites/page.tsx` | 🔴 No CSRF + No Rate Limit |

### 🔴 Super Admin Screens

| Screen/Route | File | Issues Found |
|--------------|------|--------------|
| Super Admin Home | `app/(superadmin)/superadmin/page.tsx` | ✅ Safe — Email gate + Rate Limit |
| Restaurants | `app/(superadmin)/superadmin/restaurants/page.tsx` | ✅ Safe — Auth + Rate Limit |
| Customers | `app/(superadmin)/superadmin/customers/page.tsx` | ✅ Safe — Auth + Rate Limit |
| Plans | `app/(superadmin)/superadmin/plans/page.tsx` | ✅ Safe — Auth + Rate Limit |
| Analytics | `app/(superadmin)/superadmin/analytics/page.tsx` | ✅ Safe — Auth + Rate Limit |
| Settings | `app/(superadmin)/superadmin/settings/page.tsx` | ✅ Safe — Auth + Rate Limit |
| Audit Log | `app/(superadmin)/superadmin/audit-log/page.tsx` | ✅ Safe — Auth + Rate Limit |

### ⚠️ API Routes with Issues

| API Route | Method | Issues |
|-----------|--------|--------|
| `/api/favorites` | POST | 🔴 No CSRF + No Rate Limit |
| `/api/favorites/sync` | POST | 🔴 No CSRF + No Rate Limit |
| `/api/test-email` | GET | 🔴 Exposed in production, no rate limit |
| `/api/cron/refresh-stats` | GET | ⚠️ Bearer token only, no rate limit |
| `/api/orders/[id]` | GET/PUT | ⚠️ Verify order belongs to requesting restaurant |
| `/api/menu/[slug]` | GET | ✅ Safe — Public, rate limited |

### 🎯 Summary of Problem Screens

| Priority | Screen | Issue |
|----------|--------|-------|
| 🔴 HIGH | `/favorites` | No CSRF, No Rate Limit |
| 🔴 HIGH | `/api/test-email` | Exposed endpoint |
| 🟡 MEDIUM | `/checkout` | Order API missing CSRF token |
| 🟡 MEDIUM | `/order-confirm/[id]` | May expose other users' orders |
| 🟡 MEDIUM | `/cart` | Client-side only, no server validation |

---

**Report Generated**: July 4, 2026  
**Auditor**: MiMoCode Security Analysis  
**Next Review**: After implementing critical fixes
