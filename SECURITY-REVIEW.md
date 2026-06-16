# QRMenu.pk — Security & Rate Limit Review Report

## CRITICAL

| # | Issue | File(s) | Risk | Fix |
|---|-------|---------|------|-----|
| C1 | **No CSRF protection on any API route** | All `/api/*` routes | Attackers can forge authenticated requests via phishing links | Add Origin/Referer header validation middleware on all state-changing endpoints |
| C2 | **Rate limits too generous** | `lib/rate-limiter.ts` (60/60s owner write) | Brute force / abuse possible on dish/order APIs before rate limiter kicks in | Reduce to professional-grade limits (orders: 5/min, owner write: 15/min, superadmin: 10/min) |

## HIGH

| # | Issue | File(s) | Risk | Fix |
|---|-------|---------|------|-----|
| H1 | **Rate limiting absent on 28/34 API routes** | Most `/api/*` routes except orders, dishes, categories, menu, new-dish | Unprotected endpoints can be spammed (settings, notifications, admin endpoints) | Add `checkRateLimit()` to all unprotected routes |
| H2 | **Owner actions not audited** | No audit table for owner operations | No traceability when an owner deletes dishes, cancels orders, changes settings | Add `owner_audit_log` table + logging utility |
| H3 | **Sensitive data in plain text** | `orders.customer_phone`, `orders.delivery_address` | PII data stored without encryption at rest | Encrypt at application level or use Supabase Vault |
| H4 | **SERVICE_ROLE_KEY in route files** | `app/api/superadmin/*/route.ts` (6 files) | Accidentally logging `process.env.SUPABASE_SERVICE_ROLE_KEY` could leak it | Move to `lib/supabase/server.ts` only, never reference directly in route files |

## MEDIUM

| # | Issue | File(s) | Risk | Fix |
|---|-------|---------|------|-----|
| M1 | **No request body size limits** | All POST/PATCH routes | Large payloads can cause OOM on serverless functions | Add 100KB body limit middleware |
| M2 | **Uploaded image validation lacking** | Storage RLS (only checks `auth.role() = 'authenticated'`) | Any authenticated user can upload arbitrary files | Add owner-only bucket policy |
| M3 | **No brute-force on owner login** | Only superadmin has `isLockedOut()` | Owner passwords can be brute-forced via Supabase Auth | Add rate limiting on auth callback |
| M4 | **Rate limiter silently fails open** | `rate-limiter.ts:66` (`catch { return false }`) | If database is down, rate limiter passes all requests | Fail closed — return 429 when limiter can't check |
| M5 | **No HTTPS enforcement in application code** | Vercel handles at edge but no code-level redirect | Mixed content possible in development/staging | Add redirect middleware for non-HTTPS |

## LOW

| # | Issue | File(s) | Risk | Fix |
|---|-------|---------|------|-----|
| L1 | **`unknown` IP fallback on rate-limit** | `rate-limiter.ts:32` | All rate limits collapse to single bucket behind proxies without `x-forwarded-for` | Use `x-real-ip` + CF-Connecting-IP as additional fallbacks |
| L2 | **No rate limit headers in response** | All rate-limited routes | Clients can't know when to retry | Add `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers |
| L3 | **Toast errors expose internal details** | Order detail page (`err.error` shown to user) | SQL/database error messages could leak schema info | Sanitize error messages before showing to user |
| L4 | **No input sanitization on dish names** | `app/api/owner/dishes/route.ts` | XSS possible if dish name rendered without escaping | Add HTML entity escaping on render or sanitize on input |
| L5 | **Environment variable validation missing** | `.env.local` only | Missing required vars cause silent failures | Add startup validation that checks all required env vars |

---

## Recommendation Priority

```
Week 1 (CRITICAL + HIGH):
  └─ C1  CSRF protection
  └─ C2  Reduce rate limits
  └─ H1  Add rate limits to all routes
  └─ H2  Owner audit logging

Week 2 (MEDIUM):
  └─ M1  Request body limits
  └─ M2  Image upload validation
  └─ M3  Owner brute-force protection
  └─ M4  Rate limiter fail-closed

Week 3 (LOW):
  └─ L1  Better IP detection
  └─ L2  Rate limit headers
  └─ L3  Error sanitization
  └─ L4  Input sanitization
  └─ L5  Env var validation
```

---

## Rate Limit Policy (Updated — Professional Grade)

| Endpoint Group | Old Limit | New Limit | Window |
|---------------|-----------|-----------|--------|
| Orders: Create | 20/min | **5/min** | 60s |
| Owner: Write (dishes, categories) | 60/min | **15/min** | 60s |
| Owner: Read | unlimited | **30/min** | 60s |
| Superadmin: Write | 30/min | **10/min** | 60s |
| Superadmin: Read | 100/min | **30/min** | 60s |
| Menu (public) | 60/min | **30/min** | 60s |
| Notifications | unlimited | **5/min** | 60s |
| Settings | unlimited | **10/min** | 60s |
| Default | 60/min | **20/min** | 60s |
