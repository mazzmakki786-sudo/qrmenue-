# Customer Restaurants Browser — UI/UX Redesign Plan

## Overview
Current scope: **Customer Side — Restaurants Browser** (`/restaurants` page) + **Restaurant Menu Screen** (`/menu/[slug]` page)  
Report: UI/UX analysis `.md` file  
Design direction: **Clean & Minimal** — use existing color palette (Black/White/Green)

---

## Phase 1: UI/UX Analysis Report

**File:** `docs/ui-ux-report.md`

Will document:
1. Current state analysis (what exists)
2. Strengths (real-time sync, bilingual support, clean cards)
3. Weaknesses (spacing inconsistencies, missing micro-interactions, search UX gaps, card hierarchy)
4. Specific recommendations per component
5. Before/after comparison summary

---

## Phase 2: Restaurants Browser Redesign (`/restaurants`)

### Changes to `RestaurantsClient.tsx`:

| Element | Current | Redesigned |
|---------|---------|------------|
| **Header** | Plain "QRMenu.pk" text | Smarter header with location-aware subtitle ("Restaurants near you") |
| **Search bar** | Basic input | Better placeholder, smoother clear animation, search icon animation on focus |
| **City chips** | Basic filter pills | Enhanced with subtle shadow, active chip gets green accent ring |
| **Restaurant Cards** | Cover gradient + logo overlay | Improved card spacing, hover state refinement, better info hierarchy |
| **Status badge** | Simple text | Pulse animation for "Open" state |
| **Delivery info** | Clock & Bike icons | Better icon sizing, grouped delivery info |
| **Empty state** | Basic icon + text | More helpful empty state with illustration and suggestion text |
| **Loading skeleton** | Basic pulse | Smoother shimmer animation matching design system |

### Key improvements:
- **Card layout**: Better vertical rhythm, more breathing room
- **Search UX**: Real-time count of results, smoother transitions
- **Animations**: Subtle entrance animations for cards (staggered fade-in)
- **Accessibility**: Better ARIA labels, focus management
- **Performance**: Memo optimization for card rendering

---

## Phase 3: Restaurant Menu Screen Redesign (`/menu/[slug]`)

### Changes to `MenuHeader.tsx`:

| Element | Current | Redesigned |
|---------|---------|------------|
| **Hero section** | Basic gradient/cover | Cleaner overlay gradients, refined typography hierarchy |
| **Logo positioning** | 56px at bottom-left | Better proportioned, optional slight elevation shadow |
| **Info row** | MapPin + Phone + Address inline | More structured info chips with clearer visual separation |
| **Status indicator** | Simple dot + text | More prominent status pill with gradient background |

### Changes to `MenuContent.tsx`:

| Element | Current | Redesigned |
|---------|---------|------------|
| **Search bar** | Plain input | Better focus ring, smoother transitions, icon color change on focus |
| **Language toggle** | EN/اردو button | More compact, better active state indicator |
| **Category tabs** | Basic pills with count | Slightly larger touch targets, better scroll indicators |
| **Dish cards** | Standard card | Refined spacing, better image proportions, improved typography |

### Changes to `DishGrid.tsx` / `Card`:

| Element | Current | Redesigned |
|---------|---------|------------|
| **Dish card layout** | 24h×96 image + text | Same structure, refined spacing and borders |
| **Add button** | Rounded pill "Add" | Same style, slight hover scale improvement |
| **Quantity selector** | Gray background | Smoother transition between Add → Quantity state |
| **Price display** | Bold right-aligned | Better alignment with card structure |
| **Unavailable state** | Opacity 50% overlay | Clearer visual treatment |

### Changes to `CategoryTabs.tsx`:
- Slightly larger tap targets (min-h-9)
- Better gradient fade edges
- Smoother active state transition

### Changes to `CartBar.tsx`:
- Refined shadow depth
- Smoother slide-up animation
- Better item count badge positioning

---

## Phase 4: File-by-File Implementation Plan

### Files to modify (6 files):

1. **`app/(customer)/restaurants/RestaurantsClient.tsx`** — Main restaurants browser
2. **`components/customer/MenuHeader.tsx`** — Menu page hero header
3. **`components/customer/MenuContent.tsx`** — Menu page search + filter area
4. **`components/customer/DishGrid.tsx`** — Dish cards grid
5. **`components/customer/CategoryTabs.tsx`** — Category tab navigation
6. **`components/customer/CartBar.tsx`** — Floating cart bar

### Files to create:

1. **`docs/ui-ux-report.md`** — UI/UX analysis report

---

## Files NOT modified (out of scope for this phase):
- `app/(customer)/layout.tsx` — Bottom nav stays same
- `app/(customer)/restaurants/page.tsx` — Server component, no UI changes needed
- `app/(customer)/menu/[slug]/page.tsx` — Server component, no UI changes needed
- `app/(customer)/cart/page.tsx` — Out of scope
- `app/(customer)/restaurant/[slug]/*` — Uses old detail route, no changes

---

## Design Principles Used:
1. **Existing color palette**: Black (#000), White, Green (#25D366), gray scale
2. **Existing border radius**: 12-14px cards, 8-10px buttons
3. **Existing animations**: slide-up, fade-in, scale animations
4. **Mobile-first**: All components max-w-[600px]
5. **Touch-friendly**: Min 44px touch targets
6. **Accessibility**: Focus rings, ARIA labels, semantic HTML

---

## Process:
1. ✅ Create `docs/ui-ux-report.md` (analysis)
2. 🔄 Update `RestaurantsClient.tsx` (browser page)
3. 🔄 Update `MenuHeader.tsx` (menu hero)
4. 🔄 Update `MenuContent.tsx` (menu search/filter)
5. 🔄 Update `DishGrid.tsx` (dish cards)
6. 🔄 Update `CategoryTabs.tsx` (tabs)
7. 🔄 Update `CartBar.tsx` (cart bar)
8. ✅ Final review

Approximate total: **7 files** (1 new + 6 modified)
