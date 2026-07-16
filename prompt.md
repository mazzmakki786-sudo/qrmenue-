# Project Context
- **App:** QR Menu — Next.js 14+ (App Router), Tailwind CSS v3, Supabase
- **Route Groups:** `app/(owner)/dashboard/` (owner/admin), `app/staff/` (staff operations)
- **Staff Auth:** PIN-based login, stored in `staff_sessions` table, cookie `staff_session` scoped to `/staff`
- **Middleware:** `middleware.ts` checks `staff_session` cookie for `/staff/*` and `/api/staff/*` routes, sets `x-staff-id` and `x-restaurant-id` headers on requests
- **Owner API auth:** Owner API routes (`/api/owner/*`) rely on Supabase session cookie, extract `x-restaurant-id` and `x-owner-id` from request headers — these ARE NOT set by middleware for staff sessions hitting owner API routes

## Task
Fix console errors on the Staff Dashboard pages and Owner Staff Management page:

### Errors Observed
1. `[push] Permission denied` — from `usePushNotifications` in owner layout
2. `/api/owner/tables 401` — staff pages call owner API without auth
3. `/api/owner/staff 401` — same issue
4. `staff:1 503` — staff login/panel resource failing

### Detailed Issue Breakdown

#### Issue A: Staff pages calling `/api/owner/*` (401 Unauthorized)
The following staff pages call owner-scoped API endpoints directly, but the middleware only sets staff auth headers (`x-staff-id`, `x-restaurant-id`) for `/api/staff/*` routes — NOT for `/api/owner/*` routes:

- **`app/staff/dashboard/page.tsx`** — calls `fetch("/api/owner/tables")` on load
- **`app/staff/dashboard/tables/page.tsx`** — calls `fetch("/api/owner/tables")` on load
- **`app/staff/dashboard/profile/page.tsx`** — calls `fetch("/api/staff/orders")` (OK — this is a staff route) but the dashboard still logs owner API errors

**Root cause:** Owner API routes check `request.headers.get("x-restaurant-id")` and return 401 if missing. The middleware sets this header only for `/api/staff/*` requests, not for `/api/owner/*` requests made from staff pages.

#### Issue B: Owner Staff Page — Push Notification Permission Denied
- `app/(owner)/layout.tsx` uses `usePushNotifications` hook which calls `Notification.requestPermission()`
- The console error `[push] Permission denied` is from `lib/hooks/usePushNotifications.ts:147` — not a real breakage, just a console.warn when the user declined the browser's notification prompt
- The staff profile page (`app/staff/dashboard/profile/page.tsx`) also has a manual push toggle that calls `Notification.requestPermission()` directly (lines 62-64)

#### Issue C: `staff:1 503`
- Likely caused by rate limiting or a Supabase connection issue when the staff login page loads, or a misconfigured resource
- May be a transient server error from the API route hitting a rate limiter or DB failure

### Staff Login Flow (for reference)
1. Staff visits `/staff/login` — enters restaurant slug + 4-6 digit PIN
2. POST to `/api/staff/auth/login` — finds restaurant by slug, looks up all staff for restaurant, compares PIN with bcrypt hash stored in `restaurant_staff.pin_code`
3. If valid: creates a session in `staff_sessions` table, sets httpOnly cookie `staff_session` scoped to `/staff` path
4. Middleware checks `staff_session` cookie on every `/staff/*` and `/api/staff/*` request — validates expiration and `is_active` status
5. Logout: POST `/api/staff/auth/logout` clears the cookie and deletes the DB session row

**How owners add staff:** Go to Owner Dashboard → Staff page → "Add Staff Member" — enters name, PIN, role. PIN is bcrypt-hashed before storing in `restaurant_staff.pin_code`. The staff member's `restaurant_id` links them to the restaurant.

## Files to Fix

### 1. Create staff-specific table listing endpoint
Create `app/api/staff/tables/route.ts` — GET that lists tables for the staff's restaurant (uses `x-restaurant-id` from middleware headers, identical logic to `/api/owner/tables`).

### 2. Update staff dashboard to use staff API
- **`app/staff/dashboard/page.tsx`** — change `fetch("/api/owner/tables")` → `fetch("/api/staff/tables")`
- **`app/staff/dashboard/tables/page.tsx`** — change `fetch("/api/owner/tables")` → `fetch("/api/staff/tables")`

### 3. (Optional) Add guards for silent 401 failures
Add `.catch(() => {})` or check `res.ok` before processing responses in staff pages that call external endpoints, to prevent console error noise.

### 4. Handle push notification permission gracefully in staff profile
**`app/staff/dashboard/profile/page.tsx`** — the `togglePush` function should:
- Check if notifications are supported (`"Notification" in window`)
- Check if permission is already `"denied"` — if so, inform the user they need to enable in browser settings
- Wrap in try/catch to prevent uncaught errors

## Patterns to Follow

### Staff API Route Pattern
```ts
import { NextResponse } from "next/server"
import { safeRoute } from "@/lib/api-error"
import { createAdminClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limiter"

export const GET = safeRoute(async (request) => {
  await checkRateLimit(request, "staff:read")

  const restaurantId = request.headers.get("x-restaurant-id")
  if (!restaurantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()
  // ... query logic using restaurantId
  return NextResponse.json({ data })
})
```

### Staff Page API Fetch Pattern
```ts
fetch("/api/staff/tables")
  .then((r) => r.json())
  .then((data) => {
    if (data.tables) {
      // handle data
    }
  })
  .catch(() => { /* silent */ })
```

## Types
- `TableItem: { id: string, table_number: string, capacity: number, is_active: boolean, is_occupied: boolean, created_at: string }` (from `restaurant_tables` table)

## Edge Cases
- ✅ Loading state (spinner while fetching)
- ✅ Empty state (no tables configured message)
- ✅ Error state — silent catch, don't crash UI
- ✅ Auth failure — if session expires mid-session, middleware will redirect to `/staff/login`
- ✅ Mobile/Desktop responsive — already handled by existing Tailwind classes
- ✅ i18n (English/Urdu) — follow existing `useI18n` / `lang` patterns

## Implementation Steps
1. Create `app/api/staff/tables/route.ts` with GET handler (mirror the owner tables GET logic)
2. Update `app/staff/dashboard/page.tsx` — replace `/api/owner/tables` with `/api/staff/tables`
3. Update `app/staff/dashboard/tables/page.tsx` — replace `/api/owner/tables` with `/api/staff/tables`
4. Fix push notification handling in `app/staff/dashboard/profile/page.tsx` — add graceful denial handling
5. Test: Staff dashboard loads without 401 errors; tables page works; staff login flow still works
