# Fix: Order Screen Top Navbar Glitch

## Context

The user reports a layout-breaking glitch in the **top navbar** on the **order confirmation page** (`/order-confirm/[id]`) — affects **both mobile and desktop**.

The root cause is a **double-header stacking conflict** between the customer layout's sticky navbar and the page's own sticky header, plus z-index issues that cause headers to overlap or disappear when scrolling.

## Problem Analysis

### On Desktop (both `<div class="hidden md:block">` sections)

The customer layout (`app/(customer)/layout.tsx`) provides a sticky top navbar:
```
sticky top-0 z-50   ← Layout's desktop nav ("Digital QR Menue" + nav links)
```

The order-confirm page (`app/(customer)/order-confirm/[id]/page.tsx`) has its **own** sticky header inside its content area:
```
sticky top-0 z-40   ← Page's own header (← back + title)
```

This creates two problems:
1. **Two top bars** — the layout's nav AND the page's own header both visible at the top
2. **Z-index conflict** — when scrolling, the page's header sticks at `top:0` but has `z-40` vs the layout's `z-50`, so it **disappears behind** the layout navbar

### On Mobile (both `<div class="md:hidden min-h-screen ...">` sections)

The order-confirm page has its own sticky header:
```
sticky top-0 z-50   ← Page's mobile header (← back + title)
```

The layout's mobile **bottom nav** is also `z-50`. While they don't overlap (top vs bottom), the stacking context can create visual glitches when content scrolls behind the sticky header, and the shadow/border effects can misbehave.

### Affected Pages

The same double-header pattern exists on:
1. **`app/(customer)/order-confirm/[id]/page.tsx`** — page header on desktop is `sticky top-0 z-40`
2. **`app/(customer)/account/page.tsx`** — page header is `fixed top-0 w-full z-50`, which overlaps and blocks clicks on the layout's top navbar (same z-index, later in DOM = renders on top)

## Fix Plan

### Fix 1: Order-Confirm Page Desktop Header

**File:** `app/(customer)/order-confirm/[id]/page.tsx`

Remove `sticky top-0 z-40` from the desktop `<header>` (line 627). The layout already provides a sticky top navbar — the page just needs a plain section header.

**Change:**
- Line 627: `<header className="bg-white border-b border-border sticky top-0 z-40">`
- → `<header className="bg-white border-b border-border">`

This eliminates the double-sticky conflict. The header remains visible in normal flow below the layout navbar, and scrolls naturally without stacking.

### Fix 2: Account Page Header

**File:** `app/(customer)/account/page.tsx`

The account page's `fixed top-0 w-full z-50` header (line 193) conflicts with the layout's desktop sticky navbar — both at `z-50`, causing the page header to render on top and block nav clicks.

**Change on desktop:** Replace the fixed positioning to be a normal flow header on desktop. The simplest approach is to make the header non-fixed and use padding from the layout:

- Line 193: `<header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#F0F0F0] ...">`
- - The `fixed` and `z-50` classes need removal. The `pt-16` on `<main>` (line 200) exists to account for the fixed header.

Actually, a cleaner approach: Remove `fixed top-0 w-full z-50` entirely and use a normal in-flow header. The page is already inside the layout which provides its own sticky top bar on desktop.

**Change:**
- Line 193: Remove `fixed top-0 w-full z-50` → just use `bg-white/80 backdrop-blur-md border-b border-[#F0F0F0]`
- Line 200: Change `pt-16` to `pt-4` (since the header is now in flow, no extra padding needed for it)

Wait, this needs careful handling — the account page's header is needed on mobile too (where there's no layout top nav). So:

- Keep the header as-is for mobile: `fixed top-0 w-full z-50` is fine for mobile
- But on desktop, the layout's top navbar handles navigation

Since the `<header>` tag doesn't have any `md:hidden` — it renders on both mobile and desktop. The fix: Add `md:relative md:z-auto` to override the fixed positioning on desktop. Or wrap in conditional display classes.

Actually, simplest fix: add `md:sticky md:top-0 md:z-40` and remove `fixed top-0 w-full z-50`. But let me think...

The simplest approach: Remove `fixed top-0 w-full z-50` and replace with top padding on the `<main>`:

Actually no, the account page needs a header visible on mobile too since there's no layout top nav. Let me just change the classes:

**Change:** On line 193:
```
className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#F0F0F0] ...
```
→
```
className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#F0F0F0] ...
```

Wait, this still has the same z-index conflict on desktop. Let me think more simply.

The cleanest fix: Since the layout already provides the top navbar on desktop, the account page's own header should be **hidden on desktop** and shown only on mobile. Add `md:hidden` to it, and for desktop add a simple section header or rely on the layout navbar for navigation context.

**Change to line 193:**
```diff
- <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#F0F0F0] flex items-center justify-between px-4" style={{ height: "calc(48px + env(safe-area-inset-top, 0px))", paddingTop: "env(safe-area-inset-top, 0px)" }}>
+ <header className="md:hidden fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#F0F0F0] flex items-center justify-between px-4" style={{ height: "calc(48px + env(safe-area-inset-top, 0px))", paddingTop: "env(safe-area-inset-top, 0px)" }}>
```

And add a desktop-specific section header after it or inside a `hidden md:block` wrapper.

Actually wait, this gets complex because there's a lot of layout. The simplest meaningful fix for the account page is:

**Change line 193:** Add `md:relative md:z-auto md:border-b-0` to override:
```
className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#F0F0F0] ..."
→
className="fixed md:relative top-0 w-full z-50 md:z-auto bg-white/80 backdrop-blur-md border-b md:border-b-0 border-[#F0F0F0] ..."
```

And adjust the `<main>` padding on line 200 to not over-pad on desktop:
```
className="pt-16 pb-8 px-4 max-w-[600px] mx-auto"
→
className="md:pt-4 pt-16 pb-8 px-4 max-w-[600px] mx-auto"
```

Hmm, this is getting complicated. Let me keep it simple and focused.

**Simplest fix for account page:** Same pattern as order-confirm: just remove the sticky/fixed from desktop and let the layout navbar handle desktop navigation. The account's mobile header stays as-is.

Add `md:hidden` to the existing fixed header (mobile only), and for desktop add a simple back-link in normal flow:

**Line 193:** Add `md:hidden`
```diff
- <header className="fixed top-0 w-full z-50 ...
+ <!-- Mobile header -->
+ <header className="md:hidden fixed top-0 w-full z-50 ...
```

**After line 198** (end of that header), add a desktop header:
```html
<!-- Desktop header -->
<header className="hidden md:block bg-white border-b border-[#F0F0F0] px-4 h-14 flex items-center justify-between">
  <h1 className="text-lg font-semibold">My Orders</h1>
  <button onClick={handleLogout} className="text-sm text-[#DC2626] flex items-center gap-1 hover:underline">
    <LogOut className="w-4 h-4" /> Sign Out
  </button>
</header>
```

And line 200: Change `pt-16` to `pt-4` (since no more fixed header taking space on desktop):
```diff
- <main className="pt-16 pb-8 px-4 max-w-[600px] mx-auto">
+ <main className="md:pt-4 pt-16 pb-8 px-4 max-w-[600px] mx-auto">
```

This is clean but involves more changes. Let me pick the simplest approach.

### Simplified Fix Plan

**1. Order-confirm page (line 627) — DESKTOP top bar**

Remove `sticky top-0 z-40` from the desktop `<header>`. The layout's top navbar already provides sticky navigation.

```
<header className="bg-white border-b border-border sticky top-0 z-40">
→
<header className="bg-white border-b border-border">
```

This is the primary fix for the reported glitch.

**2. Account page (line 193) — Fixed header overlap**

Deconflict the account page's fixed header from the layout's navbar on desktop.

Change line 193 to hide the fixed header on desktop (where the layout navbar handles nav), and add a desktop-equivalent header in normal flow.

See details above. This is a secondary fix.

## Verification

1. `npm run build` — type check
2. Navigate to `/order-confirm/[id]` on desktop:
   - Confirm only ONE top bar is visible (the layout navbar)
   - Confirm the page's "Order Confirmed" / status header is visible below it as a plain section header
   - Scroll down — no headers should disappear or overlap
3. Navigate to `/order-confirm/[id]` on mobile:
   - Confirm the sticky top header works correctly
   - Confirm the bottom nav is not overlapped
4. Check `/account` on desktop:
   - Confirm layout navbar is visible and clickable
   - Confirm no double header
5. Test the full order flow end-to-end: picking items → cart → checkout → order confirm
