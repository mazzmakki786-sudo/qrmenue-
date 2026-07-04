# QRMenu.pk — Security Remediation Plan

**Date:** July 04, 2026  
**Status:** PENDING APPROVAL  
**Priority:** CRITICAL — Immediate Action Required

---

## Executive Summary

Based on comprehensive security audit, the project has **41 identified vulnerabilities** (5 Critical, 12 High, 14 Medium, 10 Low). This plan provides step-by-step remediation in priority order.

**Estimated Time:** 8-10 hours  
**Risk Level:** HIGH — Production data at risk

---

## Phase 1: CRITICAL Fixes (Do Now) — 2-3 hours

### 1.1 Fix Orders RLS Policy
**Issue:** Anyone can read ALL orders across all restaurants  
**File:** `supabase_migration.sql`  
**Fix:**
```sql
-- Remove existing permissive policies
DROP POLICY IF EXISTS "Anyone can view orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Add restrictive policies
CREATE POLICY "Customers view own orders" ON orders 
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Owners view restaurant orders" ON orders 
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users create orders" ON orders 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 1.2 Remove Owner Self-Plan-Setting
**Issue:** Owners can escalate to premium plan without payment  
**File:** `app/api/admin/subscription/route.ts`  
**Fix:** Remove PATCH endpoint or restrict to superadmin only

### 1.3 Add Auth to Settings Endpoint
**Issue:** Exposes all company settings to unauthenticated requests  
**File:** `app/api/settings/route.ts`  
**Fix:**
```typescript
export const GET = safeRoute(async (request) => {
  // Add authentication check
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Split into public (theme) and private (all settings)
  // Return only public settings for unauthenticated users
})
```

### 1.4 Add CSRF to Order Creation
**Issue:** State-changing endpoint without CSRF protection  
**File:** `app/api/orders/route.ts`  
**Fix:**
```typescript
export const POST = safeRoute(async (request) => {
  // Add at top of handler
  const csrfError = csrfGuard(request)
  if (csrfError) return csrfError
  
  // ... rest of handler
})
```

---

## Phase 2: HIGH Fixes (This Week) — 3-4 hours

### 2.1 Fix safeRoute Error Leakage
**Issue:** Returns internal error messages to clients  
**File:** `lib/api-error.ts`  
**Fix:**
```typescript
export function safeRoute(handler: Function) {
  return async (request: Request, ...args: any[]) => {
    try {
      return await handler(request, ...args)
    } catch (err) {
      // Log detailed error server-side
      console.error("[API Error]", err)
      
      // Return generic message in production
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: "Something went wrong" },
          { status: 500 }
        )
      }
      
      // Development: return details
      return NextResponse.json(
        { error: err.message },
        { status: 500 }
      )
    }
  }
}
```

### 2.2 Add CSRF to Remaining Routes
**Files:**
- `app/api/owner/notifications/route.ts` (PATCH)
- `app/api/notifications/new-dish/route.ts` (POST)

**Fix:** Add `csrfGuard(request)` at top of each handler

### 2.3 Whitelist Menu API Fields
**Issue:** Exposes sensitive restaurant data  
**File:** `app/api/menu/[slug]/route.ts`  
**Fix:**
```typescript
const { data } = await supabase
  .from('restaurants')
  .select(`
    name, slug, city, logo_url, language,
    categories (
      id, name, sort_order,
      dishes (id, name, description, price, image_url, is_available)
    )
  `)
  .eq('slug', slug)
  .single()
```

### 2.4 Add Security Headers
**File:** `next.config.ts`  
**Fix:**
```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { 
            key: 'Content-Security-Policy', 
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
          },
        ],
      },
    ]
  },
}
```

### 2.5 Add RLS to Missing Tables
**Tables:** `owner_notifications`, `qr_announcements`  
**Fix:**
```sql
ALTER TABLE owner_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own notifications" ON owner_notifications
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Superadmin manages announcements" ON qr_announcements
  FOR ALL USING (auth.email() = current_setting('app.settings.admin_email'));
```

---

## Phase 3: MEDIUM Fixes (This Month) — 2-3 hours

### 3.1 Fix Rate Limiter Bypass
**Issue:** `"unknown"` IP bypasses all limits  
**File:** `lib/rate-limiter.ts`  
**Fix:**
```typescript
function shouldBypassRateLimit(identifier: string): boolean {
  // Only bypass localhost, not "unknown"
  return identifier === "127.0.0.1" || identifier === "::1"
}
```

### 3.2 Add escapeHtml to Email Templates
**File:** `lib/resend.ts`  
**Fix:** Apply `escapeHtml()` to all user data before interpolation

### 3.3 Fix innerHTML XSS
**Files:**
- `components/shared/OrderReceipt.tsx`
- `app/(owner)/dashboard/orders/[id]/page.tsx`

**Fix:** Use DOM cloning or sanitize HTML before injection

### 3.4 Add Audit Logging to Superadmin Endpoints
**Files:** All `app/api/superadmin/*/route.ts`  
**Fix:** Add `logAudit()` calls to each endpoint

### 3.5 Validate plan_limits_override
**File:** `app/api/superadmin/restaurants/[id]/toggle/route.ts`  
**Fix:** Add Zod schema validation for numeric values

---

## Phase 4: LOW Fixes (Optional) — 1 hour

### 4.1 Remove Hardcoded Email
**File:** `app/api/test-email/route.ts`  
**Fix:** Remove `|| "mazzmakki786@gmail.com"` fallback

### 4.2 Gate localhost in CSRF
**File:** `lib/csrf.ts`  
**Fix:** Already implemented (line 6) ✅

### 4.3 Sanitize JsonLd
**File:** `components/JsonLd.tsx`  
**Fix:** Escape `</script>` in restaurant names

### 4.4 Remove @playwright/mcp from devDependencies
**File:** `package.json`  
**Fix:** `npm uninstall @playwright/mcp`

---

## Implementation Order

| Step | Phase | Task | Est. Time |
|------|-------|------|-----------|
| 1 | 1.1 | Fix Orders RLS | 30 min |
| 2 | 1.2 | Remove owner self-plan | 15 min |
| 3 | 1.3 | Add auth to settings | 20 min |
| 4 | 1.4 | Add CSRF to orders | 10 min |
| 5 | 2.1 | Fix safeRoute errors | 30 min |
| 6 | 2.2 | Add CSRF to routes | 15 min |
| 7 | 2.3 | Whitelist menu fields | 20 min |
| 8 | 2.4 | Add security headers | 20 min |
| 9 | 2.5 | Add RLS to tables | 20 min |
| 10 | 3.1 | Fix rate limiter | 15 min |
| 11 | 3.2 | Add escapeHtml | 20 min |
| 12 | 3.3 | Fix innerHTML XSS | 20 min |
| 13 | 3.4 | Add audit logging | 30 min |
| 14 | 3.5 | Validate overrides | 15 min |
| 15 | 4.1-4.4 | LOW fixes | 30 min |

**Total Estimated Time:** ~5.5 hours

---

## Testing Checklist

After implementation, verify:
- [ ] Orders only visible to owner/customer
- [ ] Settings endpoint requires auth
- [ ] CSRF blocks cross-origin requests
- [ ] Error messages are generic in production
- [ ] Menu API doesn't expose sensitive fields
- [ ] Security headers present in responses
- [ ] Rate limiter blocks "unknown" IP
- [ ] No XSS in email templates
- [ ] Audit logs created for superadmin actions

---

## Approval Required

**Please review and approve this plan before I begin implementation.**

When approved, I will:
1. Start with Phase 1 (CRITICAL fixes)
2. Test each fix before moving to next
3. Run `npm run build` to verify no regressions
4. Provide summary after each phase completion

---

**Next Step:** Awaiting your approval to begin Phase 1.
