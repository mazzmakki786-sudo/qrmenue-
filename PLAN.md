# Implementation Plan - Order Notification Fixes

## Issues Identified

### 1. Bell Dropdown Shows "View All Orders" Instead of Today's Orders
**File:** `components/owner/BellNotification.tsx` (lines 181-187)
**Problem:** Clicking the bell icon shows a dropdown with only a "View all orders" link.
**Fix:** Remove the link. Instead, fetch and display today's received orders directly in the dropdown. Each order links to its detail page.

### 2. Mobile: Toast Notifications & Bell Icon Not Working Properly
**File:** `components/owner/BellNotification.tsx`, `app/(owner)/layout.tsx`
**Problem:** 
- Dropdown uses `absolute top-full right-0 w-72` — on mobile screens (< 375px), this overflows off-screen to the left.
- Toast notifications (`fixed bottom-4 left-4 right-4`) may conflict with mobile safe areas and not be visible.
- Z-index conflicts on mobile between header (`z-40`) and notification overlay (`z-40`).

**Fixes:**
- Make dropdown responsive: on mobile (`max-sm:`), use `right-0` with `min-w-[280px]` or better positioning
- Or use a full-width bottom panel on mobile
- Add `safe-bottom` padding to toast container for iOS safe area
- Ensure z-index layers are clean

### 3. Toast/Order Widget Goes Off-Screen on New Order
**File:** `components/owner/BellNotification.tsx` (lines 130-171)
**Problem:** Toast notifications stack upward from `bottom-4`. On some viewports, especially with multiple toasts, they can overflow and appear cut off.
**Fix:** Ensure proper max-height constraints, scrollable container, and responsive positioning.

### 4. Orders Screen Shows All Orders (Not just Today's)
**File:** `app/(owner)/dashboard/orders/page.tsx`
**Problem:** Already has `"today" | "week" | "all"` filters with default `"today"`. No changes needed — this already works correctly.

---

## Implementation Steps

### Step 1: Rewrite `BellNotification.tsx`
- Replace static "View all orders" link with dynamic today's orders list
- Fetch orders from Supabase on dropdown open (or use already-loaded alerts)
- Make dropdown responsive for mobile
- Fix toast positioning with safe-area awareness
- Limit toast notifications to max 5 and add scrollable container

### Step 2: Update `layout.tsx` if needed
- Ensure z-index on mobile header doesn't conflict with notifications layer
- Currently no changes needed — BellNotification handles its own z-index

### Step 3: Verify orders page filtering
- `app/(owner)/dashboard/orders/page.tsx` already correct — confirm no regressions

---

## Files Modified
| File | Changes |
|------|---------|
| `components/owner/BellNotification.tsx` | Rewrite dropdown content, responsive positioning, toast fix |
