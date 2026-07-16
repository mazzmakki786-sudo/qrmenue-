# Comprehensive Order System & Routing Fix Prompt

## Project Context
- **App**: Digital QR Menue (Next.js 14 App Router, Supabase, Tailwind CSS, Zustand)
- **Route Groups**: `app/(auth)/` (login/signup), `app/(customer)/` (customer-facing), `app/(owner)/dashboard/` (owner), `app/(superadmin)/`
- **Database**: Supabase PostgreSQL with RLS
- **State**: Zustand stores (cart, order form), Supabase Realtime subscriptions for live updates
- **i18n**: React context (`lib/i18n/context.tsx`), English + Urdu
- **Language**: TypeScript

---

## Problem Summary (7 Critical Bugs)

### 🐛 B1: Page Routing Glitches — Clicking "Orders" button sends to wrong pages
**Severity: CRITICAL**

**Symptoms:**
- Dashboard "Orders" button sometimes redirects to `/superadmin`, `/login`, or `/` (root)
- Pages randomly redirect to auth pages
- Owner gets signed out unpredictably while navigating dashboard

**Root Causes:**

1. **`middleware.ts` runs on ALL `/dashboard/:path*` requests and makes fragile auth checks every time:**
   - `supabase.auth.getUser()` makes an API call that can fail intermittently
   - If `getUser()` returns null → user gets redirected to `/login?redirect=/dashboard`
   - If `restaurant` query returns null (e.g., RLS issue, network blip) → user gets redirected to `/`
   - These queries add latency to every navigation within the dashboard

2. **Owner layout (`app/(owner)/layout.tsx`) has no session validation:**
   - If the user session token expires between page navigations, there's no refresh mechanism
   - The middleware's `updateSession` relies on `getUser()` which uses the session cookie — if the cookie refresh token has expired, the user is silently logged out

3. **Auth callback (`app/auth/callback/route.ts`) can cause redirect loops:**
   - After Google auth, if `exchangeCodeForSession` fails silently, user gets redirected to `/login?error=auth_callback_error`
   - `redirectParam` is not validated (could be any URL, including external)

### 🐛 B2: "Start Preparing" button reappears after refresh
**Severity: HIGH**

**Symptoms:**
- Owner clicks "Start Preparing" → status updates to "preparing"
- Page refreshes → "Start Preparing" button shows again
- The order status appears to not persist

**Root Causes:**

1. **`app/(owner)/dashboard/orders/[id]/page.tsx` — `fetchData` doesn't handle the initial fetch correctly when user/restaurant data loads asynchronously:**
   ```typescript
   const { data: restaurantData } = await supabase
       .from("restaurants")
       .select("*")
       .eq("owner_id", user.id)
       .maybeSingle()  // If RLS or user has 2 restaurants, this might return null
   
   const { data } = await supabase
       .from("orders")
       .select("*")
       .eq("id", id)
       .eq("restaurant_id", restaurantData?.id ?? "")
       .maybeSingle()  // If restaurantData?.id is undefined, this returns null
   
   setOrder(data)  // data is null → component shows "Order not found"
   ```
   **Fix:** Add proper null-checking and error handling in fetchData

2. **PATCH endpoint might succeed but return stale data:**
   - The `safeRoute` wrapper catches all errors but doesn't handle partial failures
   - If the order updates successfully but the `.select()` returns cached data, the response would show the old status

### 🐛 B3: Delivery timer on customer side stuck/not starting
**Severity: HIGH**

**Symptoms:**
- Order status changes to "preparing" but countdown timer doesn't show or is stuck
- Timer shows 00:00 or doesn't decrement

**Root Causes:**

1. **PATCH handler sets `ready_at` only if `delivery_time_min` is truthy — but default value is 0 which is falsy:**
   ```typescript
   // app/api/orders/[id]/route.ts line 105
   if (restaurant.delivery_time_min) {  // BUG: if delivery_time_min is 0, this is false!
       const readyAt = new Date(Date.now() + delivery_time_min * 60 * 1000)
       safeBody.ready_at = readyAt.toISOString()
   }
   ```
   Database default for `delivery_time_min` is `0`. Settings page default is `30`. But if a restaurant was created before setting delivery_time_min, OR if the settings weren't saved, `delivery_time_min` remains `0` (falsy), so `ready_at` is NEVER set.

   **Fix:** Change to `if (restaurant.delivery_time_min !== null && restaurant.delivery_time_min !== undefined)`

2. **PreparingCard timer starts fresh on each render (doesn't persist across page navigations):**
   - The timer is calculated client-side from `order.ready_at`
   - If the realtime update arrives late, the card might render before `ready_at` is available

### 🐛 B4: 2-3 minute delay in order status update on customer side
**Severity: MEDIUM**

**Symptoms:**
- Customer doesn't see status change for 2-3 minutes after owner updates it
- Push notification arrives but UI doesn't update

**Root Causes:**

1. **Supabase Realtime might NOT be enabled for the `orders` table:**
   - The app uses `supabase.channel(...).on('postgres_changes', ...)` subscriptions
   - **If the `orders` table doesn't have Realtime replication enabled in the Supabase dashboard, these subscriptions will never fire!**
   - Supabase projects require explicit Realtime enablement per table

2. **`uid()` function creates new channel names every render:**
   ```typescript
   let _id = 0
   export function uid(name: string) {
       _id++
       return `${name}-${_id}`
   }
   ```
   This is a module-level counter. In strict mode (React 18), the component mounts twice, incrementing the counter each time. The first channel is created but never cleaned up properly, causing potential conflicts.

3. **The `prevStatusRef` logic may skip the first update:**
   ```typescript
   // Line 134: prevStatusRef starts as null
   const prevStatusRef = useRef<string | null>(null)
   
   // Line 149-150: On first REAL TIME UPDATE
   const oldStatus = prevStatusRef.current  // null
   const newStatus = newData.order_status
   // oldStatus is null, so the condition "oldStatus && newStatus !== oldStatus" is FALSE
   // The first update's notification is skipped!
   ```

### 🐛 B5: Orders button routing to wrong pages — Link vs button logic
**Severity: CRITICAL** (same as B1, different angle)

**Root Causes:**

1. **Owner dashboard (`app/(owner)/dashboard/page.tsx` line 280) uses `<Link>` for the Orders button:**
   ```typescript
   <Link href="/dashboard/orders" ...>
   ```
   This is fine by itself, but if the middleware's session check fails during navigation, the user gets redirected.

2. **Login redirect logic (`app/(auth)/login/page.tsx` lines 61-67) doesn't handle all cases:**
   ```typescript
   if (data.user) {
       const { data: restaurant } = await supabase
           .from("restaurants")
           .select("id")
           .eq("owner_id", data.user.id)
           .maybeSingle()
       router.push(restaurant ? "/dashboard" : "/restaurants")
   }
   ```
   - If a user has BOTH a customer account and a restaurant (same email), the query returns the restaurant, routing them to dashboard even if they wanted to browse restaurants
   - `router.push` is client-side only — if the route requires middleware auth check and the middleware hasn't run yet, this can cause race conditions

3. **The middleware matcher catches all `/dashboard/:path*` but the `updateSession` function modifies cookies in a way that can cause issues:**
   ```typescript
   setAll(cookiesToSet: { name: string; value: string }[]) {
       cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
       supabaseResponse = NextResponse.next({ request })
       cookiesToSet.forEach(({ name, value }) => supabaseResponse.cookies.set(name, value))
   },
   ```
   Each call to `setAll` creates a NEW `NextResponse.next({ request })`, which means previously set headers/cookies from earlier `setAll` calls in the same request cycle are lost.

### 🐛 B6: Order ready-check auto-transition not working smoothly
**Severity: MEDIUM**

**Symptoms:**
- After timer reaches 0, the order doesn't auto-transition to "ready"
- Customer sees "Almost done!" message indefinitely

**Root Cause:**
1. **`ready-check/route.ts` line 66: Only transitions if status is "preparing":**
   ```typescript
   if (order.order_status !== "preparing") {
       return NextResponse.json({ order_status: order.order_status })
   }
   ```
   If the owner manually set the order to "ready" before the timer expired, the ready-check endpoint just returns the current status. But if the timer expires AND the owner already cancelled the order (set to "cancelled"), this still returns OK instead of an error.

2. **The `PreparingCard` timer has a race condition with `autoReadySent`:**
   ```typescript
   const [autoReadySent, setAutoReadySent] = useState(false)
   // ...
   if (r !== null && r <= 0 && timerRef.current) {
       clearInterval(timerRef.current)
       checkAndSetReady()  // Fires ONE ready-check API call
   }
   ```
   In React strict mode, this effect runs twice, potentially calling `checkAndSetReady` twice. The `autoReadySent` state prevents the second call, but there's a brief window where both could fire.

### 🐛 B7: Missing delivery_time_min in restaurant signup
**Severity: MEDIUM**

**Root Cause:**
1. **Signup route (`app/api/auth/signup/restaurant/route.ts`) doesn't set `delivery_time_min`:**
   ```typescript
   const restaurantInsertData = {
       owner_id: ownerId,
       name, slug, phone, city,
       plan: hasPaidPlan ? selectedPlan : "trial",
       // ... no delivery_time_min set
   }
   ```
   The database default is `0`, which means ALL new restaurants start with 0 delivery time. The settings page shows default 30, but the actual DB value is 0. This means `ready_at` is never calculated for new restaurants.

---

## Fix Implementation Steps

## Phase 1: Backend Fixes (API + Middleware)

### Step 1.1: Fix `delivery_time_min` default in signup
**File:** `app/api/auth/signup/restaurant/route.ts`
**Action:** Add `delivery_time_min: 30` to the restaurant insert data
**Why:** New restaurants should have a sensible default instead of 0, so `ready_at` gets calculated when orders are moved to "preparing"

### Step 1.2: Fix `ready_at` falsy check in PATCH handler
**File:** `app/api/orders/[id]/route.ts`
**Action:** Change line 105 from `if (restaurant.delivery_time_min)` to `if (restaurant.delivery_time_min != null)`
**Why:** The value `0` is falsy in JavaScript, causing `ready_at` to never be set for restaurants with 0 delivery time

### Step 1.3: Fix middleware to use `getSession()` instead of `getUser()`
**File:** `middleware.ts`
**Action:** 
- Replace `supabase.auth.getUser()` with a more reliable session check
- OR use the local cookie check before calling the API
- Add try/catch around the restaurant check with a pass-through instead of redirect on failure
- Add proper error logging for redirect decisions
**Why:** `getUser()` makes an API call that can fail or be slow; using the local session cookie is more reliable for middleware redirect decisions

### Step 1.4: Fix middleware cookie handling
**File:** `lib/supabase/middleware.ts`
**Action:** 
- Use a single `NextResponse.next()` call instead of recreating it in `setAll`
- Collect all cookie mutations and apply them once
**Why:** Each `setAll` call creates a new response, overwriting previously set headers

### Step 1.5: Fix ready-check race condition
**File:** `app/api/orders/[id]/ready-check/route.ts`
**Action:** Add a check that prevents auto-ready if order was cancelled or already marked ready
**Why:** Prevent race condition where ready-check tries to update a cancelled order

### Step 1.6: Enable Supabase Realtime for orders table
**Action:** 
- Run SQL to enable Realtime replication on the `orders` table:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```
- Verify the publication includes the orders table
**Why:** Without Realtime enabled, all `postgres_changes` subscriptions will never fire

### Step 1.7: Fix owner PATCH to return full updated order with restaurant relation
**File:** `app/api/orders/[id]/route.ts`
**Action:** After update, fetch the full order with all relations and return it
**Why:** The client expects the full order object to update its local state

## Phase 2: Customer-Facing Fixes

### Step 2.1: Fix order-confirm page realtime subscription
**File:** `app/(customer)/order-confirm/[id]/page.tsx`
**Actions:**
- Fix the `prevStatusRef` to track initial status so first realtime update isn't missed
- Add a fallback polling mechanism (every 10 seconds) as backup if Realtime doesn't fire
- Add reconnection logic for the channel
- Add a manual refresh button when status seems stale

### Step 2.2: Fix PreparingCard timer reliability
**File:** `app/(customer)/order-confirm/[id]/page.tsx` (PreparingCard component)
**Actions:**
- Add handling for when `ready_at` is null — show "Preparing..." instead of blank
- Add a polling fallback that checks order status every 15 seconds if no realtime update received in 30 seconds
- Fix the strict-mode double-mount issue with a ref to prevent double ready-check calls

## Phase 3: Owner Dashboard Fixes

### Step 3.1: Fix order detail page data loading
**File:** `app/(owner)/dashboard/orders/[id]/page.tsx`
**Actions:**
- Add proper error states when restaurant or order is null
- Add loading retry mechanism
- Add validation that the fetched order's status matches the status action buttons

### Step 3.2: Fix orders list page reliability
**File:** `app/(owner)/dashboard/orders/page.tsx`
**Actions:**
- Add automatic reconnection for realtime subscriptions
- Add a manual refresh button
- Add a "connection lost" indicator

## Phase 4: Database Fixes

### Step 4.1: Fix existing restaurants with `delivery_time_min = 0`
**Action:** Run SQL to update existing restaurants that have `delivery_time_min = 0`:
```sql
UPDATE restaurants SET delivery_time_min = 30 WHERE delivery_time_min = 0 OR delivery_time_min IS NULL;
```

### Step 4.2: Enable Realtime for orders
**Action:** Run SQL:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY orders;
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY customers;
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY restaurants;
```

### Step 4.3: Add missing database indexes
**Action:** Run SQL for performance:
```sql
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status ON orders(restaurant_id, order_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
```

---

## Edge Cases to Handle

- ✅ **Loading state**: Each page must show skeleton/loader while fetching
- ✅ **Error state**: Network failure, API error, timeout — show error with retry
- ✅ **Empty state**: No orders found — show friendly message
- ✅ **Auth**: Session expired — redirect to login with return URL
- ✅ **Realtime disconnect**: Show indicator when connection lost, auto-reconnect
- ✅ **Stale data**: Show last-updated timestamp, manual refresh option
- ✅ **Race conditions**: Multiple rapid status updates, double-button clicks
- ✅ **Responsive**: Mobile and desktop layouts both tested
- ✅ **Offline**: Show offline state gracefully (PWA)

---

## Files to Modify

| # | File Path | Change |
|---|---|---|
| 1 | `middleware.ts` | Fix fragile auth checks, add error tolerance |
| 2 | `lib/supabase/middleware.ts` | Fix cookie handling, single response object |
| 3 | `app/api/orders/[id]/route.ts` | Fix `delivery_time_min` truthy check, improve response |
| 4 | `app/api/orders/[id]/ready-check/route.ts` | Fix race conditions |
| 5 | `app/api/auth/signup/restaurant/route.ts` | Add `delivery_time_min: 30` default |
| 6 | `app/(customer)/order-confirm/[id]/page.tsx` | Fix realtime subscription, timer, notifications |
| 7 | `app/(owner)/dashboard/orders/[id]/page.tsx` | Fix data loading, error states |
| 8 | `app/(owner)/dashboard/orders/page.tsx` | Add reconnection, refresh |
| 9 | `app/(owner)/dashboard/page.tsx` | Verify Orders link routing |
| 10 | `lib/realtime.ts` | Improve `uid()` function for channel naming |
| 11 | `lib/supabase/client.ts` | No changes needed |
| 12 | Database (SQL) | Enable Realtime, fix defaults, add indexes |

---

## Test Checklist

After all fixes:
- [ ] Customer places order → Owner sees it in real-time
- [ ] Owner clicks "Start Preparing" → Customer sees timer start (no refresh needed)
- [ ] Owner refreshes page → Button shows "Mark as Ready" (not "Start Preparing")
- [ ] Timer counts down correctly on customer side
- [ ] When timer expires → Order auto-marks as "ready"
- [ ] Customer sees "ready" status within 5 seconds (not 2-3 minutes)
- [ ] Dashboard navigation doesn't redirect to wrong pages
- [ ] Clicking "Orders" button always goes to `/dashboard/orders`
- [ ] Sign out doesn't happen randomly during navigation
- [ ] New restaurant signup has `delivery_time_min` defaulted to 30
