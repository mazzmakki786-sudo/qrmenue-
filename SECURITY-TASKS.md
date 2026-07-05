# 📋 QRMenu.pk — Pending Tasks Report

**Generated**: July 4, 2026
**Status**: ✅ All Critical + High tasks completed

---

## ✅ CRITICAL #1: IP Spoofing Fix — DONE

**File**: `lib/rate-limiter.ts:36-46`

**Problem**: Attacker sends fake `x-forwarded-for: 1.2.3.4` header → gets new IP each request → bypasses all rate limits.

**Current Code**:
```typescript
const forwarded = request.headers.get("x-forwarded-for")
if (forwarded) {
  return forwarded.split(",")[0].trim()  // User-controlled!
}
```

**Fix Required**: Validate against trusted proxy IPs or use `cf-connecting-ip` (Cloudflare) as primary. Remove raw `x-forwarded-for` parsing.

**Impact**: Without this, login brute force, order spam, and all rate-limited attacks are possible.

---

## ✅ CRITICAL #2: Middleware on API Routes — DONE

**File**: `middleware.ts:9-13`

**Problem**: Middleware only matches `/dashboard/*`, `/superadmin/*`, `/account/*`. All `/api/*` routes have zero middleware protection.

**Routes relying on individual auth checks**:
- `/api/owner/*` — 12+ routes, each does `supabase.auth.getUser()` manually
- `/api/superadmin/*` — 15+ routes, each checks `SUPER_ADMIN_EMAIL` manually

**Risk**: If any single route forgets the auth check, it's completely exposed.

**Fix Required**: Add `/api/owner/:path*` and `/api/superadmin/:path*` to middleware matcher. Verify owner_id matches restaurant in middleware, not in each route.

---

## ✅ CRITICAL #3: CSRF Token Mechanism — DONE

**File**: `lib/csrf.ts`

**Problem**: Current CSRF only validates `Origin` and `Referer` headers. No actual token in request body.

**Attack Vector**: Some browsers/proxies strip Origin headers. Some attacks from same-origin contexts bypass header checks.

**Fix Required**: Generate CSRF token per session, embed in meta tag, validate token in POST body for all state-changing routes.

---

## ✅ CRITICAL #4: Order Confirm IDOR — DONE

**File**: `app/(customer)/order-confirm/[id]/page.tsx:32-36`

**Problem**: Client-side fetches order by ID without checking if user owns it:
```typescript
const { data, error } = await supabase
  .from("orders")
  .select("*, restaurants(*)")
  .eq("id", id)
  .single()
```

**Risk**: User A can view User B's order by changing the ID in URL.

**Fix Required**: Either add `customer_id` filter in query, or rely on RLS policy that filters by `customer_id = auth.uid()`.

---

## ✅ HIGH #5: Rate Limit Cleanup Job — DONE

**File**: `lib/rate-limiter.ts:80-89`

**Problem**: Every request inserts a row into `rate_limits` table. No cleanup mechanism.

**Growth Rate**: 1000 req/min = 60,000 rows/hour = 1.4M rows/day.

**Fix Required**: Add cron job (like `refresh-stats`) that deletes rows older than 2 minutes. Or add TTL column with database-level auto-delete.

---

## ✅ HIGH #6: Per-User Rate Limiting — DONE

**File**: `lib/rate-limiter.ts`

**Problem**: All rate limits are IP-based. A logged-in user can make unlimited requests from same IP using different accounts.

**Fix Required**: Add user ID as secondary rate limit key. Combine IP + User ID for authenticated routes.

---

## ✅ HIGH #7: Dev Error Messages — DONE

**File**: `lib/api-error.ts:17-19`

**Problem**:
```typescript
const message = process.env.NODE_ENV === "production"
  ? "An unexpected error occurred"
  : err instanceof Error ? err.message : "An unexpected error occurred"
```

**Risk**: If `NODE_ENV` misconfigured on Vercel, internal errors exposed.

**Fix Required**: Always return generic message. Remove dev-mode error leaking entirely.

---

## ✅ HIGH #8: Customer Audit Logging — DONE

**Files**: Multiple customer API routes

**Problem**: No tracking for:
- Order creation (`/api/orders`)
- Checkout completion
- Favorites changes
- Account updates

**Fix Required**: Create `customer_audit_log` table, log critical customer actions.

---

## 🟢 MEDIUM #9: Request Size Limits

**Files**: All API routes

**Problem**: No `Content-Length` check. Attacker can send 100MB JSON payload.

**Fix Required**: Add body size validation in `safeRoute()` wrapper or middleware. Max 1MB for most routes.

---

## 🟢 MEDIUM #10: CSP Headers

**File**: `next.config.js` or `middleware.ts`

**Problem**: No Content Security Policy. XSS attacks can load external scripts.

**Fix Required**: Add CSP header: `script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:`

---

## 🟢 MEDIUM #11: CORS Headers

**File**: `lib/csrf.ts`

**Problem**: Only validates Origin header. No explicit `Access-Control-Allow-Origin` response headers.

**Fix Required**: Add CORS middleware that sets proper headers for API routes.

---

## 🟢 MEDIUM #12: Key Rotation Plan

**Files**: `.env`, Supabase dashboard

**Problem**: `SUPABASE_SERVICE_ROLE_KEY` never rotated. If leaked, attacker has full DB access bypassing all RLS.

**Fix Required**: Document rotation procedure. Consider rotating every 90 days.

---

## 🔵 LOW #13: Unify Rate Limit Patterns

**Files**: `lib/rate-limiter.ts`, multiple API routes

**Problem**: Two patterns used inconsistently:
- Pattern A: `rateLimit(ip, max, window)` → returns boolean
- Pattern B: `checkRateLimit(request, tier)` → throws error

**Fix Required**: Migrate all routes to Pattern B (tier-based).

---

## 🔵 LOW #14: Silent Catch Blocks

**Files**: `lib/owner-audit.ts:19-23`, `lib/superadmin-security.ts:43,73`

**Problem**: `catch(() => {})` swallows errors silently.

**Fix Required**: At minimum log to console in production. Better: send to error tracking.

---

## 🔵 LOW #15: Error Message Consistency

**Files**: `app/api/superadmin/restaurants/route.ts:27`

**Problem**: Some routes expose raw Supabase error messages:
```typescript
return NextResponse.json({ error: error.message }, { status: 400 })
```

**Fix Required**: Replace with generic "Failed to fetch restaurants" type messages.

---

## Summary Table

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| 🔴 #1 | IP Spoofing Fix | 30 min | Rate limit bypass |
| 🔴 #2 | Middleware on API | 1 hr | Auth bypass risk |
| 🔴 #3 | CSRF Tokens | 2-3 hrs | CSRF attacks |
| 🔴 #4 | Order IDOR | 30 min | Data exposure |
| 🟡 #5 | Rate Limit Cleanup | 1 hr | DB performance |
| 🟡 #6 | Per-User Limits | 2 hrs | Abuse prevention |
| 🟡 #7 | Dev Error Fix | 15 min | Info leakage |
| 🟡 #8 | Customer Audit | 2 hrs | Abuse tracking |
| 🟢 #9 | Request Size | 30 min | DoS prevention |
| 🟢 #10 | CSP Headers | 1 hr | XSS prevention |
| 🟢 #11 | CORS Headers | 30 min | Cross-origin |
| 🟢 #12 | Key Rotation | 1 hr | Key security |
| 🔵 #13 | Unify Rate Limits | 1 hr | Code quality |
| 🔵 #14 | Silent Catches | 15 min | Error visibility |
| 🔵 #15 | Error Messages | 30 min | Info leakage |

**Total Estimated Time: ~14 hours**

---

## ✅ Completed Fixes (This Session)

| Task | Status | File |
|------|--------|------|
| Favorites CSRF + Rate Limit | ✅ Done | `app/api/favorites/route.ts` |
| Favorites Sync CSRF + Rate Limit | ✅ Done | `app/api/favorites/sync/route.ts` |
| Test Email blocked in production | ✅ Done | `app/api/test-email/route.ts` |
| Orders ID rate limit | ✅ Done | `app/api/orders/[id]/route.ts` |
| Favorites rate limit tier | ✅ Done | `lib/rate-limiter.ts` |
