# Design System & UI Specifications
## QRMenu.pk
**Version:** 1.0 | **Style:** Ultra Minimal, Clean, Light Mode Only

---

## 1. DESIGN PRINCIPLES

1. **Whitespace is everything** — Give elements room to breathe
2. **One primary action per screen** — Never confuse the user
3. **Mobile-first always** — 90% traffic is mobile
4. **Speed over beauty** — If it slows the page, cut it
5. **Text-first** — List-based menu for fastest loading
6. **Clarity over cleverness** — Urdu + English both clear

---

## 2. COLOR PALETTE

```css
/* Primary Colors */
--color-primary: #000000;          /* Black — buttons, headings */
--color-primary-hover: #1A1A1A;    /* Dark gray — hover state */

/* Accent */
--color-accent: #FF6B35;           /* Orange — Add to cart, CTA */
--color-accent-hover: #E55A25;     /* Darker orange — hover */

/* Backgrounds */
--color-bg: #FFFFFF;               /* White — main background */
--color-bg-muted: #F8F8F8;         /* Off-white — card backgrounds */
--color-bg-subtle: #F2F2F2;        /* Light gray — input fields */

/* Text */
--color-text: #111111;             /* Near-black — primary text */
--color-text-secondary: #555555;   /* Gray — descriptions */
--color-text-muted: #999999;       /* Light gray — placeholders */

/* Borders */
--color-border: #E8E8E8;           /* Subtle border */
--color-border-strong: #CCCCCC;    /* Stronger border */

/* Semantic */
--color-success: #16A34A;          /* Green — confirmed, available */
--color-error: #DC2626;            /* Red — errors */
--color-warning: #D97706;          /* Amber — trial expiry warning */
--color-info: #2563EB;             /* Blue — info, Google button */
```

---

## 3. TYPOGRAPHY

```css
/* English Font */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Urdu Font */
font-family: 'Noto Naskh Arabic', serif;

/* Scale */
--text-xs: 12px / 1.4;
--text-sm: 14px / 1.5;
--text-base: 16px / 1.6;
--text-lg: 18px / 1.5;
--text-xl: 20px / 1.4;
--text-2xl: 24px / 1.3;
--text-3xl: 30px / 1.2;

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## 4. SPACING & LAYOUT

```css
/* Spacing scale */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;

/* Mobile padding */
--page-padding-mobile: 16px;
--page-padding-tablet: 24px;
--page-padding-desktop: 32px;

/* Border radius */
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
--radius-xl: 20px;
--radius-full: 9999px;  /* Pills, badges */

/* Shadows */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
--shadow-md: 0 4px 12px rgba(0,0,0,0.08);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.10);
```

---

## 5. COMPONENT SPECIFICATIONS

### 5.1 Buttons

```
PRIMARY BUTTON (Black)
─────────────────────
Background: #000000
Text: #FFFFFF, 15px, font-semibold
Padding: 14px 24px
Border-radius: 10px
Hover: #1A1A1A
Active: scale(0.98)
Full-width on mobile: YES

ACCENT BUTTON (Orange)
──────────────────────
Background: #FF6B35
Text: #FFFFFF, 15px, font-semibold
Padding: 14px 24px
Border-radius: 10px
Hover: #E55A25
Use for: Add to Cart, Place Order

GHOST BUTTON (Outline)
──────────────────────
Background: transparent
Border: 1.5px solid #E8E8E8
Text: #111111, 15px
Hover: background #F8F8F8
Use for: Secondary actions

GOOGLE BUTTON
─────────────
Background: #FFFFFF
Border: 1.5px solid #E8E8E8
Text: #111111, 15px
Icon: Google SVG icon (left)
Padding: 14px 24px
Full-width: YES
```

### 5.2 Cards

```
DISH CARD (List-based)
──────────────────────
Background: #FFFFFF
Border: none (use spacing only)
Divider: 1px solid #F0F0F0 between items
Padding: 16px 0
Layout: Horizontal
  Left: Name + Price + Description (flex-1)
  Right: Add button OR quantity control

STATS CARD (Dashboard)
──────────────────────
Background: #FFFFFF
Border: 1.5px solid #E8E8E8
Border-radius: 14px
Padding: 20px
Shadow: shadow-sm
Layout: Number (bold, 28px) + Label (14px, muted)
```

### 5.3 Input Fields

```
TEXT INPUT
──────────
Background: #F8F8F8
Border: 1.5px solid #E8E8E8
Border-radius: 10px
Padding: 12px 16px
Font: 16px (prevents iOS zoom)
Focus: border-color #000000, no outline ring
Error: border-color #DC2626
Label: 14px, font-medium, #111111, margin-bottom 6px
```

### 5.4 Badges

```
AVAILABLE
─────────
Background: #DCFCE7 (green-100)
Text: #16A34A (green-700), 12px, font-medium
Padding: 2px 8px
Border-radius: full

UNAVAILABLE
───────────
Background: #F5F5F5
Text: #999999, 12px
Padding: 2px 8px
Opacity on dish: 0.5

PLAN BADGE
──────────
Trial: Background #FEF3C7, Text #D97706
Starter: Background #F0F0F0, Text #555555
Growth: Background #EFF6FF, Text #2563EB
Premium: Background #FFF7ED, Text #EA580C
```

### 5.5 Navigation

```
BOTTOM NAV (Customer)
─────────────────────
Height: 60px
Background: #FFFFFF
Border-top: 1px solid #F0F0F0
Safe area bottom: env(safe-area-inset-bottom)
Items: Home (menu) | Cart | Account
Active: Icon + label black, underline dot
Inactive: Icon gray (#999)

DASHBOARD SIDEBAR (Owner, Desktop)
───────────────────────────────────
Width: 240px
Background: #FFFFFF
Border-right: 1px solid #F0F0F0
Items: Dashboard | Menu | Orders | Analytics | Settings | Subscription
Active: Background #F8F8F8, border-left 3px solid #000
Font: 14px, font-medium

DASHBOARD TOP BAR (Owner, Mobile)
───────────────────────────────────
Height: 56px
Restaurant name + hamburger menu
Background: #FFFFFF
Border-bottom: 1px solid #F0F0F0
```

---

## 6. SCREEN-BY-SCREEN UI SPECS

### Screen 1: Customer Menu Home

```
┌─────────────────────────────────────────────┐ 375px width
│  ← (no back, this is home)                  │
│                                              │
│  [Restaurant Logo — 48×48]                  │ 16px top padding
│  Restaurant Name                             │ 20px, font-bold
│  📍 Lahore • Pakistani                       │ 14px, color-muted
│                                              │
│ ─────────────────────────────────────────── │ 1px divider
│                                              │
│ [Starters] [Main Course] [Desserts] [Drinks] │ Category tabs
│                                              │ Horizontal scroll
│ ─────────────────────────────────────────── │ Sticky on scroll
│                                              │
│ STARTERS                                     │ 12px, font-semibold
│ ─────────────────────────────────────────── │ uppercase, letter-spacing
│                                              │
│ Chicken Soup              Rs 150  [+ Add]    │ Dish row
│ Light and flavorful                          │ 14px, muted text
│ ─────────────────────────────────────────── │
│ Samosa (2 pcs)            Rs 80   [+ Add]    │
│ Crispy fried               ● Unavailable     │ Greyed out
│ ─────────────────────────────────────────── │
│ Seekh Kabab               Rs 200  [+ Add]    │
│                                              │
│ MAIN COURSE                                  │
│ ─────────────────────────────────────────── │
│ Biryani                   Rs 300  [+ Add]    │
│ Aromatic rice with spices                    │
│ ─────────────────────────────────────────── │
│                                              │
│ ┌──────────────────────────────────────────┐│
│ │ 🛒  3 items              Rs 530  View →  ││ Sticky cart bar
│ └──────────────────────────────────────────┘│ Background #000
│                                              │ Text #FFF
│ [Home] [Cart (3)] [Account]                  │ Bottom nav
└─────────────────────────────────────────────┘
```

---

### Screen 2: Cart

```
┌─────────────────────────────────────────────┐
│ ← Back          Your Cart                   │ Header
│ ─────────────────────────────────────────── │
│                                              │
│ Chicken Soup                                 │
│ Rs 150           [-] 1 [+]    Rs 150         │
│ ─────────────────────────────────────────── │
│ Biryani                                      │
│ Rs 300           [-] 2 [+]    Rs 600         │
│ ─────────────────────────────────────────── │
│                                              │
│ Subtotal                          Rs 750     │
│ Delivery fee               To be confirmed   │
│ ─────────────────────────────────────────── │
│ Total                             Rs 750     │ Bold, 20px
│                                              │
│ [     CHECKOUT →     ]                       │ Full-width, Black
│                                              │
│ [Home] [Cart] [Account]                      │ Bottom nav
└─────────────────────────────────────────────┘
```

---

### Screen 3: Order Type & Info

```
┌─────────────────────────────────────────────┐
│ ← Back          Your Order                  │
│ ─────────────────────────────────────────── │
│                                              │
│ How would you like to receive it?            │ 18px, font-semibold
│                                              │
│ ┌──────────────┐ ┌──────────────┐           │
│ │  🪑 Dine-in  │ │ 🥡 Takeaway  │           │ Option cards
│ │  Eat here    │ │ Pick up      │           │ Border on selected
│ └──────────────┘ └──────────────┘           │
│ ┌──────────────┐                            │
│ │ 🛵 Delivery  │                            │
│ │ Home deliver │                            │
│ └──────────────┘                            │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ Your Name *                                  │ Only fields relevant
│ ┌────────────────────────────────────────┐  │ to selected type
│ │ Enter your name                        │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ Phone Number *                               │
│ ┌────────────────────────────────────────┐  │
│ │ 0300-XXXXXXX                           │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ Delivery Address *    (if delivery selected) │
│ ┌────────────────────────────────────────┐  │
│ │ House #, Street, Area, City            │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ Payment                                      │
│ ● Cash on Delivery    ○ Bank Transfer        │
│                                              │
│ [     PLACE ORDER →     ]                   │ Full-width, Black
│                                              │
│ [Home] [Cart] [Account]                      │
└─────────────────────────────────────────────┘
```

---

### Screen 4: Login (at Checkout)

```
┌─────────────────────────────────────────────┐
│ ← Back                                      │
│                                              │
│ Almost there!                               │ 24px, font-bold
│ Login to complete your order                 │ 16px, muted
│                                              │
│ ┌──────────────────────────────────────────┐│
│ │ 🔵 Continue with Google                  ││ Google button
│ └──────────────────────────────────────────┘│
│                                              │
│          ─────── or ───────                  │
│                                              │
│ Email                                        │
│ ┌────────────────────────────────────────┐  │
│ │ your@email.com                         │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ Password                                     │
│ ┌────────────────────────────────────────┐  │
│ │ ••••••••                     👁         │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ [     SIGN IN →     ]                       │ Full-width, Black
│                                              │
│ Don't have an account?  Sign up →           │ 14px, muted link
│                                              │
│ 🔒 Your data is secure                       │ 12px, muted
└─────────────────────────────────────────────┘
```

---

### Screen 5: Order Confirmation

```
┌─────────────────────────────────────────────┐
│                                              │
│              ✅                              │ 64px icon
│                                              │
│         Order Placed!                        │ 24px, font-bold
│      #ORD-2026-1234                          │ 14px, muted
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ 📱 WhatsApp message sent to restaurant       │ 14px
│    They will confirm shortly                 │ 14px, muted
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ Biryani x2                       Rs 600      │
│ Chicken Soup x1                  Rs 150      │
│ ─────────────────────────────────────────── │
│ Total                            Rs 750      │ Bold
│ Cash on Delivery                             │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ [   Resend WhatsApp Message   ]             │ Ghost button
│ [      Browse More Menu       ]             │ Black button
│                                              │
└─────────────────────────────────────────────┘
```

---

### Screen 6: Owner Dashboard

```
┌─────────────────────────────────────────────┐
│ Al-Habib Grill          🔔(3)  ⚙️           │ Top bar
│ ─────────────────────────────────────────── │
│                                              │
│ ┌───────────────┐ ┌───────────────┐         │
│ │  12           │ │  Rs 4,560     │         │ Stats cards
│ │  Orders Today │ │  Revenue Today│         │
│ └───────────────┘ └───────────────┘         │
│                                              │
│ Orders (Last 7 Days)    [7d] [30d]           │ Graph header + toggle
│ ─────────────────────────────────────────── │
│                                              │
│  15 │         ●                             │
│  12 │      ●     ●     ●                   │ Recharts line chart
│   9 │                        ●             │
│   6 │  ●              ●                    │
│   3 │                                      │
│   0 └──────────────────────────            │
│     M   T   W   T   F   S   S              │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ 🔥 Popular Dishes                            │
│ 1. Biryani           24 orders              │
│ 2. Nihari            18 orders              │
│ 3. Kabab             12 orders              │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ Recent Orders                                │
│ ORD-1234  Rs 750  COD   Dine-in   2:30pm    │
│ ORD-1233  Rs 450  Bank  Delivery  2:15pm    │
│                                              │
│ ─────────────────────────────────────────── │
│ 📊Dashboard │ 🍽️Menu │ 📋Orders │ ⚙️Settings│ Bottom nav
└─────────────────────────────────────────────┘
```

---

### Screen 7: Menu Management (Owner)

```
┌─────────────────────────────────────────────┐
│ ← Dashboard       Menu               + Add  │
│ ─────────────────────────────────────────── │
│                                              │
│ Starters (3 items)                    ✏️ 🗑️  │
│ Main Course (5 items)                 ✏️ 🗑️  │
│ Desserts (2 items)                    ✏️ 🗑️  │
│ + Add Category                               │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ STARTERS                                     │
│                                              │
│ Chicken Soup          Rs 150   ● Available  │
│                                     ✏️ 🗑️   │
│ ─────────────────────────────────────────── │
│ Samosa               Rs 80    ○ Unavailable │
│                                     ✏️ 🗑️   │
│ ─────────────────────────────────────────── │
│ + Add Dish to Starters                       │
│                                              │
│ ─────────────────────────────────────────── │
│ 📊Dashboard │ 🍽️Menu │ 📋Orders │ ⚙️Settings│
└─────────────────────────────────────────────┘
```

---

### Screen 8: Subscription Page (Owner)

```
┌─────────────────────────────────────────────┐
│ ← Dashboard       Subscription              │
│ ─────────────────────────────────────────── │
│                                              │
│ ⚠️ Free Trial — 4 days remaining            │ Warning banner
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ Choose Your Plan                            │ 20px, font-semibold
│                                              │
│ ┌──────────────────────────────────────────┐│
│ │ STARTER          PKR 800 / month         ││
│ │ ✓ Unlimited dishes                       ││
│ │ ✓ Analytics dashboard                    ││
│ │ ✓ QR code                               ││
│ │ ✗ Images                                ││
│ └──────────────────────────────────────────┘│
│                                              │
│ ┌──────────────────────────────────────────┐│
│ │ GROWTH  ⭐       PKR 1,800 / month        ││ Highlighted
│ │ ✓ Everything in Starter                  ││
│ │ ✓ Up to 50 dish images                  ││
│ │ ✓ Custom branding                        ││
│ └──────────────────────────────────────────┘│
│                                              │
│ ┌──────────────────────────────────────────┐│
│ │ PREMIUM          PKR 2,500 / month        ││
│ │ ✓ Everything in Growth                   ││
│ │ ✓ Unlimited images                       ││
│ │ ✓ Priority support                       ││
│ └──────────────────────────────────────────┘│
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ How to Pay                                   │ 18px, font-semibold
│ Send payment to:                             │
│ JazzCash: 0300-XXXXXXX (QRMenu Pakistan)    │ From company settings
│ Easypaisa: 0300-XXXXXXX                     │
│ Bank: Meezan Bank — 01234567890123           │
│                                              │
│ [  Contact us on WhatsApp to upgrade  ]     │ Accent button
│                                              │
└─────────────────────────────────────────────┘
```

---

## 7. RESPONSIVE BREAKPOINTS

```css
/* Mobile first */
Default: 0px – 767px (mobile)
md: 768px – 1023px (tablet)
lg: 1024px+ (desktop)

/* Key behavior changes */
Mobile: Bottom nav, full-width buttons, list layout
Tablet: Side nav (owner), 2-col grid
Desktop: Side nav (owner), 3-col grid, wider content area
```

---

## 8. ANIMATION GUIDELINES

```css
/* Keep animations minimal and fast */
transition: all 0.15s ease;      /* Buttons, toggles */
transition: all 0.2s ease;       /* Cards, dialogs */
transition: transform 0.3s ease; /* Slide-up cart drawer */

/* No complex animations in MVP */
/* No loading skeletons (keep it simple) */
/* Use opacity 0→1 for page transitions */
```

---

## 9. FONT LOADING (next/font)

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// For Urdu: load via CSS (Google Fonts link in head)
// @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap');
```

---

*End of Design System v1.0*
