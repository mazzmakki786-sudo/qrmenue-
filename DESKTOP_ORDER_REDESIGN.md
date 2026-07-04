# Desktop Order Flow Redesign — QRMenu.pk

**Date:** July 04, 2026
**Scope:** Desktop/laptop only (≥768px)
**Goal:** Better UX — fewer clicks, smoother flow
**Style:** Clean minimal (white space, simple typography, subtle shadows)

---

## Current Flow vs New Flow

```
CURRENT (5 pages, 4 navigations):
  Restaurants → Menu → /cart → /checkout → Confirmation

NEW (4 pages, 3 navigations):
  Restaurants → Menu (with inline cart) → Merged Checkout → Confirmation
```

**What changes:**
1. `/cart` page **removed** on desktop — cart stays inline on menu page
2. `/checkout` page **merged** with cart — single page for review + details + payment
3. Menu page 3-column layout **improved** with better UX

---

## Screen-by-Screen Desktop Redesign

### SCREEN 1: Restaurants Listing (`/restaurants`)

**Layout:** Full-width, centered content

```
┌──────────────────────────────────────────────────────────────────┐
│  [Logo]  Restaurants near you              [Language: EN ▾]     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [All] [Lahore] [Karachi] [Islamabad] [Rawalpindi]             │
│                                                                  │
│  🔍 Search restaurants...                                        │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   [Restaurant   │  │   [Restaurant   │  │   [Restaurant   │ │
│  │     Logo]       │  │     Logo]       │  │     Logo]       │ │
│  │                 │  │                 │  │                 │ │
│  │  Restaurant Name│  │  Restaurant Name│  │  Restaurant Name│ │
│  │  City • Cuisine │  │  City • Cuisine │  │  City • Cuisine │ │
│  │  ● Open  ○ Close│  │  ● Open  ○ Close│  │  ● Open  ○ Close│ │
│  │                 │  │                 │  │                 │ │
│  │  [View Menu →]  │  │  [View Menu →]  │  │  [View Menu →]  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Changes from current:**
- Wider cards with more breathing room
- Cleaner city filter pills
- Status badge (Open/Closed) more prominent
- Remove "Browse" button — single CTA "View Menu"

---

### SCREEN 2: Menu + Cart (`/menu/[slug]`) — 3 Column

This is the **core screen** — user spends most time here.

```
┌──────────────────────────────────────────────────────────────────┐
│  [← Back]  Restaurant Name          [🌐 EN/UR]  [🔍 Search]   │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────┬──────────────────────────┬────────────────────┐   │
│  │          │                          │                    │   │
│  │ CATEGORIES│    DISHES               │  YOUR CART         │   │
│  │          │                          │                    │   │
│  │ ● All    │  ┌────────────────────┐  │  🛒 3 items        │   │
│  │   (12)   │  │ [Image]  Biryani   │  │  ─────────────── │   │
│  │          │  │          Rs 450    │  │  Chicken Biryani  │   │
│  │ ○ Starters│  │          [- 1 +]  │  │  Rs 450  [- 1 +] │   │
│  │   (5)    │  └────────────────────┘  │                    │   │
│  │          │  ┌────────────────────┐  │  Seekh Kabab       │   │
│  │ ○ Mains  │  │ [Image]  Kabab     │  │  Rs 350  [- 2 +] │   │
│  │   (8)    │  │          Rs 350    │  │                    │   │
│  │          │  │          [- 2 +]   │  │  Naan              │   │
│  │ ○ Breads │  └────────────────────┘  │  Rs 80   [- 3 +] │   │
│  │   (4)    │                          │                    │   │
│  │          │  ┌────────────────────┐  │  ─────────────── │   │
│  │ ○ Desserts│  │ [Image]  Kheer    │  │  Subtotal  Rs 1,610│  │
│  │   (3)    │  │          Rs 200    │  │  Delivery  Rs 100  │   │
│  │          │  │          [Add +]   │  │  ─────────────── │   │
│  │          │  └────────────────────┘  │  TOTAL     Rs 1,710│  │
│  │          │                          │                    │   │
│  │          │  ┌────────────────────┐  │  ┌──────────────┐ │   │
│  │          │  │ [Image]  Naan      │  │  │ Proceed to   │ │   │
│  │          │  │          Rs 80     │  │  │ Checkout →   │ │   │
│  │          │  │          [Add +]   │  │  └──────────────┘ │   │
│  │          │  └────────────────────┘  │                    │   │
│  │          │                          │  [Continue Browsing]│  │
│  └──────────┴──────────────────────────┴────────────────────┘   │
│   w-48         flex-1                      w-80 (sticky)        │
│  (sticky)     (scrollable)               (sticky)              │
└──────────────────────────────────────────────────────────────────┘
```

**Key UX improvements:**
1. **Category count badges** — show item count per category
2. **Dish cards redesigned** — horizontal layout (image left, details right) for better scanning
3. **Quantity controls inline** — no need to open modal
4. **Cart panel** — shows running total, delivery fee, and clear CTA
5. **Sticky cart** — follows user as they scroll dishes
6. **Empty state** — friendly illustration when cart is empty

---

### SCREEN 3: Merged Checkout (`/checkout`) — NEW

**This replaces both /cart and /checkout on desktop.**

```
┌──────────────────────────────────────────────────────────────────┐
│  [← Back to Menu]  Checkout                        Step 1/3     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────┬────────────────────────┐  │
│  │                                  │                        │  │
│  │  ORDER ITEMS                     │  ORDER SUMMARY         │  │
│  │  ─────────────                   │  ────────────────      │  │
│  │  [img] Chicken Biryani    x1    │  Restaurant:           │  │
│  │        Rs 450      [- 1 +] [🗑] │  The Spice Garden      │  │
│  │                                  │                        │  │
│  │  [img] Seekh Kabab        x2    │  Items:                │  │
│  │        Rs 700      [- 2 +] [🗑] │  Chicken Biryani  Rs450│  │
│  │                                  │  Seekh Kabab     Rs700 │  │
│  │  [img] Naan               x3    │  Naan            Rs240 │  │
│  │        Rs 240      [- 3 +] [🗑] │  ─────────────────── │  │
│  │                                  │  Subtotal    Rs 1,390  │  │
│  │  ──────────────────────────      │  Delivery      Rs 100  │  │
│  │                                  │  ─────────────────── │  │
│  │  ORDER TYPE                      │  TOTAL      Rs 1,490  │  │
│  │  ─────────────                   │                        │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐    │                        │  │
│  │  │ 🍽️  │ │ 📦  │ │ 🚗  │    │                        │  │
│  │  │Dine-in│ │Take- │ │Deliv-│    │                        │  │
│  │  │  ●   │ │ away │ │ ery  │    │                        │  │
│  │  └──────┘ └──────┘ └──────┘    │                        │  │
│  │                                  │                        │  │
│  │  YOUR DETAILS                    │                        │  │
│  │  ─────────────                   │                        │  │
│  │  Name *                          │                        │  │
│  │  ┌────────────────────────────┐  │                        │  │
│  │  │ Ahmed Khan                 │  │                        │  │
│  │  └────────────────────────────┘  │                        │  │
│  │                                  │                        │  │
│  │  Phone *                         │                        │  │
│  │  ┌────────────────────────────┐  │                        │  │
│  │  │ 0321-1234567               │  │                        │  │
│  │  └────────────────────────────┘  │                        │  │
│  │                                  │                        │  │
│  │  Table Number * (for Dine-in)    │                        │  │
│  │  ┌────────────────────────────┐  │                        │  │
│  │  │ 5                          │  │                        │  │
│  │  └────────────────────────────┘  │                        │  │
│  │                                  │                        │  │
│  │  ──────────────────────────      │  ┌──────────────────┐ │  │
│  │                                  │  │                  │ │  │
│  │  PAYMENT METHOD                  │  │   Place Order    │ │  │
│  │  ─────────────                   │  │   Rs 1,490       │ │  │
│  │  ● Cash on Delivery             │  │                  │ │  │
│  │  ○ Bank Transfer                │  └──────────────────┘ │  │
│  │                                  │                        │  │
│  └──────────────────────────────────┴────────────────────────┘  │
│   flex-1 (scrollable)                  w-80 (sticky)            │
└──────────────────────────────────────────────────────────────────┘
```

**Key UX improvements:**
1. **Single page** — no stepping, all sections visible
2. **Editable quantities** — can adjust items without going back
3. **Remove items** — trash button to delete from checkout
4. **Order type cards** — visual selection with icons
5. **Dynamic form** — fields change based on order type (table for dine-in, address for delivery)
6. **Sticky summary** — total always visible, CTA follows scroll
7. **Smart defaults** — pre-fills from localStorage if returning customer

---

### SCREEN 4: Order Confirmation (`/order-confirm/[id]`)

```
┌──────────────────────────────────────────────────────────────────┐
│  [← Back]  Order Confirmation                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌──────────────┐                              │
│                    │     ✅       │                              │
│                    │  Order Placed│                              │
│                    └──────────────┘                              │
│                                                                  │
│  Order #1234                         Status: ● Received         │
│  ─────────────────────────────────────────────────────────      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  📱 Contact Restaurant                                   │   │
│  │                                                          │   │
│  │  [WhatsApp]  [Call]                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Order Details                                           │   │
│  │  ───────────────────────────────────────────────────     │   │
│  │  Chicken Biryani  x1  ────────────────────── Rs 450     │   │
│  │  Seekh Kabab      x2  ────────────────────── Rs 700     │   │
│  │  Naan             x3  ────────────────────── Rs 240     │   │
│  │  ───────────────────────────────────────────────────     │   │
│  │  Subtotal                                    Rs 1,390    │   │
│  │  Delivery                                      Rs 100    │   │
│  │  Total                                       Rs 1,490    │   │
│  │                                                          │   │
│  │  Name: Ahmed Khan                                        │   │
│  │  Phone: 0321-1234567                                     │   │
│  │  Type: Dine-in  │  Table: 5                             │   │
│  │  Payment: Cash on Delivery                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │  Reorder       │  │  My Orders     │  │  Browse More   │    │
│  │  [→]           │  │  [→]           │  │  [→]           │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Changes from current:**
- Cleaner status indicator
- Better organized order details
- Action buttons in horizontal row with icons
- WhatsApp/Call buttons more prominent

---

## Navigation Flow Diagram

```
                    ┌─────────────┐
                    │  HOME PAGE  │
                    │  (Landing)  │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ RESTAURANTS │
                    │   LISTING   │
                    └──────┬──────┘
                           │ Click restaurant
                           ▼
                    ┌─────────────┐
                    │    MENU     │◄──── Browse more
                    │  + CART     │      (continue
                    │  (3-col)    │       browsing)
                    └──────┬──────┘
                           │ "Proceed to Checkout"
                           ▼
                    ┌─────────────┐
                    │  CHECKOUT   │◄──── Back to Menu
                    │ (Merged)    │      (edit items)
                    │ All-in-one  │
                    └──────┬──────┘
                           │ "Place Order"
                           ▼
                    ┌─────────────┐
                    │  CONFIRM    │──── Reorder → Menu
                    │  + TRACK    │──── My Orders → /account
                    │             │──── Browse → Restaurants
                    └─────────────┘
```

---

## Files to Modify

| File | Change |
|------|--------|
| `app/(customer)/menu/[slug]/RestaurantDetailClient.tsx` | Redesign 3-col desktop layout, improve dish cards, enhance cart panel |
| `app/(customer)/checkout/page.tsx` | Merge cart + checkout into single desktop page |
| `app/(customer)/cart/page.tsx` | Keep mobile version, hide desktop version (redirect to /checkout) |
| `app/(customer)/restaurants/RestaurantsClient.tsx` | Clean up card design, improve filters |
| `app/(customer)/order-confirm/[id]/page.tsx` | Redesign desktop confirmation layout |
| `components/customer/` | Update DesktopDishCard, DesktopCartPanel, checkout forms |
| `tailwind.config.js` | May need new animation utilities |

---

## UX Principles Applied

1. **Fewer page loads** — cart stays on menu, checkout is single page
2. **Always see total** — sticky summary on every screen
3. **Easy corrections** — edit quantities/remove items in checkout
4. **Visual hierarchy** — clear CTAs, proper spacing
5. **Smart defaults** — remember customer info, auto-select popular options
6. **Consistent patterns** — same card style, same button style across screens

---

## Approval Required

**Please review this redesign plan.** When approved, I will:

1. Start with Screen 2 (Menu + Cart) — core experience
2. Then Screen 3 (Merged Checkout)
3. Then Screen 1 (Restaurants) and Screen 4 (Confirmation)
4. Test responsive behavior (mobile unchanged)
5. Run `npm run build` to verify

**Estimated time:** 6-8 hours
