# Staff / Waiter Management System Plan (Revised)

## Context
Restaurant owners need to give multiple staff members (waiters, kitchen staff) the ability to take orders, view tables, and manage orders — like human waiters in a restaurant. 

**Plan Gating**: This feature is ONLY available on **Growth** and **Premium** plans:
- Trial: No staff access
- Starter: No staff access  
- **Growth**: Max **2** staff members
- **Premium**: Max **5** staff members

**Auth approach**: PIN-code only. Owner creates staff with a PIN. Staff logs in with PIN + restaurant code (slug).

---

## Database Changes

### New Table: `restaurant_staff`
- `id` UUID PK
- `restaurant_id` UUID FK → restaurants (CASCADE)
- `name` TEXT NOT NULL
- `pin_code` TEXT NOT NULL (4-6 digits, unique per restaurant)
- `role` TEXT: 'waiter' | 'kitchen' | 'manager'
- `is_active` BOOLEAN default true
- `created_by` UUID → auth.users
- `created_at`, `updated_at`
- UNIQUE(restaurant_id, pin_code)

### New Table: `restaurant_tables`
- `id` UUID PK
- `restaurant_id` UUID FK → restaurants (CASCADE)
- `table_number` TEXT NOT NULL
- `capacity` INTEGER default 4
- `is_active` BOOLEAN default true
- `created_at`, `updated_at`
- UNIQUE(restaurant_id, table_number)

### New Table: `staff_sessions`
- `id` UUID PK
- `staff_id` UUID FK → restaurant_staff (CASCADE)
- `restaurant_id` UUID FK → restaurants (CASCADE)
- `token` TEXT UNIQUE NOT NULL
- `expires_at` TIMESTAMPTZ
- `created_at`, `last_used_at`

### Existing Table Changes: `orders`
- ADD `staff_id` UUID FK → restaurant_staff (SET NULL)
- ADD `table_id` UUID FK → restaurant_tables (SET NULL)

---

## Plan Limits Changes

### File: `lib/subscription.ts` — Add `maxStaff` to `PlanLimits`
```typescript
export interface PlanLimits {
  // ... existing fields ...
  maxStaff: number  // 0 for trial/starter, 2 for growth, 5 for premium
}
```

### Updated Plan Limits:
```typescript
PLAN_LIMITS = {
  trial:   { ...existing, maxStaff: 0 },
  starter: { ...existing, maxStaff: 0 },
  growth:  { ...existing, maxStaff: 2 },
  premium: { ...existing, maxStaff: 5 },
}
```

### File: `lib/subscription-db.ts` — Update `DBPlan` interface and fallback plans
- Add `max_staff` field to `DBPlan`
- Update `dbPlanToLimits()` to map `max_staff`
- Update fallback plans with max_staff values

### File: `lib/hooks/useSubscription.ts` — Return `canAddStaff` boolean
Add derived `canAddStaff` boolean to `UseSubscriptionReturn`.

---

## File-by-File Plan

### Phase 1: Database & Types
1. **Migration SQL**: Create 3 new tables + alter orders
2. **`types/index.ts`**: Add `RestaurantStaff`, `RestaurantTable`, `StaffRole`, `StaffSession` types. Add `staff_id`, `table_id` to `Order` interface.
3. **`lib/subscription.ts`**: Add `maxStaff` to `PlanLimits`, update all plan definitions
4. **`lib/subscription-db.ts`**: Add `max_staff` to `DBPlan`, update helpers
5. **`lib/hooks/useSubscription.ts`**: Add `canAddStaff` to the hook return

### Phase 2: Staff Auth (PIN-Based)
6. **`lib/staff-auth.ts`**: Server utilities — `createStaffSession()`, `getStaffFromSession()`, `deleteStaffSession()`
7. **`lib/staff-permissions.ts`**: Permission helpers — `canTakeOrders()`, `canUpdateStatus()`, `canManageStaff()`
8. **`app/api/staff/auth/login/route.ts`**: POST — validate PIN + restaurant slug, create session, set cookie
9. **`app/api/staff/auth/logout/route.ts`**: POST — delete session, clear cookie
10. **`app/api/staff/auth/me/route.ts`**: GET — return current staff member + restaurant info

### Phase 3: Staff Middleware
11. **`middleware.ts`**: 
    - Add `"/staff/:path*"`, `"/api/staff/:path*"` to matcher
    - Add staff session validation (read cookie, query `staff_sessions` table)
    - Inject `x-staff-id`, `x-restaurant-id`, `x-staff-role` headers for API routes
    - Redirect to `/staff/login` if invalid

### Phase 4: Owner Management Pages & API
12. **`app/api/owner/staff/route.ts`**: GET (list staff for restaurant), POST (create staff — checks `maxStaff` limit via `getEffectiveLimits`)
13. **`app/api/owner/staff/[id]/route.ts`**: PATCH (update name/role), DELETE (deactivate)
14. **`app/api/owner/tables/route.ts`**: GET (list tables), POST (create table)
15. **`app/api/owner/tables/[id]/route.ts`**: PATCH/DELETE
16. **`app/(owner)/dashboard/staff/page.tsx`**: Staff management page — list, add, deactivate staff. Shows "Upgrade to Growth" if plan doesn't support staff.
17. **`app/(owner)/dashboard/tables/page.tsx`**: Table management page — add/remove tables
18. **`app/(owner)/layout.tsx`**: Add "Staff" and "Tables" nav items

### Phase 5: Staff UI Pages
19. **`app/(staff)/layout.tsx`**: Staff layout — minimal nav (Menu, Orders, Tables), restaurant name header
20. **`app/(staff)/login/page.tsx`**: PIN login — restaurant slug + PIN fields
21. **`app/(staff)/dashboard/page.tsx`**: Dashboard — active orders summary + quick actions
22. **`app/(staff)/dashboard/menu/page.tsx`**: Full menu browser for taking orders
23. **`app/(staff)/dashboard/orders/page.tsx`**: Active orders list with realtime
24. **`app/(staff)/dashboard/orders/[id]/page.tsx`**: Order detail with status actions (role-gated)
25. **`app/(staff)/dashboard/tables/page.tsx`**: Visual table grid — occupied/vacant

### Phase 6: Order Taking
26. **`stores/staffOrderStore.ts`**: Non-persisted Zustand store for staff order cart
27. **`app/api/staff/orders/route.ts`**: GET (list orders for restaurant), POST (create order with staff_id, table_id)
28. **`app/api/staff/orders/[id]/route.ts`**: PATCH — role-gated status updates
29. **`components/staff/TableGrid.tsx`**: Visual table grid component
30. **`components/staff/OrderTakingPanel.tsx`**: Staff order cart panel + table selector
31. **`app/api/orders/route.ts`**: Accept optional `staff_id`, `table_id` in schema

---

## Plan Gating Logic

### Owner Side (Staff Management Page)
```typescript
const { plan, planLimits, canAddStaff } = useSubscription()

if (plan === "trial" || plan === "starter") {
  // Show: "Upgrade to Growth or Premium to add staff members"
  // Hide the "Add Staff" button
  // Show upgrade CTA
}

// When adding staff, check:
if (currentStaffCount >= planLimits.maxStaff) {
  // Show: "You've reached your plan's limit of {maxStaff} staff members"
  // Show upgrade CTA
}
```

### Staff Session Creation (API)
App API validates:
1. Restaurant exists and is active
2. Staff member exists, is_active, and belongs to this restaurant
3. PIN matches
4. Create session with 24h expiry
5. Return staff + restaurant data

---

## Key Architecture: PIN Login Flow
```
1. Staff visits /staff/login → enters restaurant slug + PIN
2. POST /api/staff/auth/login 
   → Find restaurant by slug
   → Find staff by restaurant_id + pin_code
   → Check is_active
   → Create staff_sessions row with random token, expires 24h
   → Set cookie: staff_session=<token>; Path=/staff; HttpOnly
3. Middleware reads cookie on /staff/* routes
   → Validate token in staff_sessions
   → Check expiry
   → Fetch staff member, check is_active
   → Set x-staff-id, x-restaurant-id, x-staff-role headers
4. Staff UI uses these headers for API calls
```

---

## Verification
1. Staff login with valid PIN → success, redirected to dashboard
2. Staff login with wrong PIN → error message
3. Growth plan owner adds 2 staff → success, 3rd shows limit error
4. Premium plan owner adds 5 staff → success, 6th shows limit error  
5. Trial/Starter plan owner sees "upgrade" message, no add button
6. Waiter takes order → order appears with staff_id in owner dashboard
7. Table grid shows occupied/vacant correctly
8. Real-time: staff creates order → owner sees it in realtime
