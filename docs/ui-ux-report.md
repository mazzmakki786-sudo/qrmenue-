# QRMenu.pk — Customer Restaurants UI/UX Analysis Report

> **Date:** June 27, 2026  
> **Scope:** Customer-side Restaurants Browser (`/restaurants`) & Menu Screen (`/menu/[slug]`)  
> **Analysis Type:** Visual design audit & UX heuristic evaluation

---

## Table of Contents

1. [Current State Overview](#1-current-state-overview)
2. [Strengths](#2-strengths)
3. [UX Issues Identified](#3-ux-issues-identified)
4. [Component-by-Component Analysis](#4-component-by-component-analysis)
5. [Recommendations Summary](#5-recommendations-summary)
6. [Redesign Direction](#6-redesign-direction)

---

## 1. Current State Overview

### Restaurants Browser (`/restaurants`)

The main restaurants listing page follows a **mobile-first, card-based layout**:

- **Sticky glass header** with brand + search bar + city filter chips
- **City-grouped restaurant cards** in a 1-column (mobile) / 2-column (desktop) grid
- Each card shows: gradient cover area, logo overlay, name, cuisine, city, open/closed badge, delivery time & fee
- **Bottom navigation** bar with Home / Cart / Orders tabs
- Real-time open/closed status updates via Supabase channels

### Menu Screen (`/menu/[slug]`)

The restaurant's digital menu page features:

- **Hero section** with cover image (or gradient fallback), logo overlay, name, city
- **Compact info row** with open/closed status, address, phone
- **Sticky search bar** with EN/اردو language toggle
- **Horizontal scrollable category tabs** with dish counts
- **Dish cards** with image, badges, bilingual name, description, price, add-to-cart
- **Floating cart bar** (appears when items are added)
- Decorative food pattern background (subtle watermark)

### Design Tokens Used

| Token | Value |
|-------|-------|
| Primary | `#000000` (Black) |
| Accent | `#25D366` (WhatsApp Green) |
| Text Primary | `#111111` |
| Text Secondary | `#555555` |
| Text Muted | `#888888` |
| Border | `#E8E8E8` |
| Surface | `#F9FAFB`, `#F5F5F5` |
| Font | Inter (English), Noto Nastaliq Urdu |
| Card radius | `12-14px` |
| Max width | `600px` (mobile container) |

---

## 2. Strengths

### ✅ Real-Time Updates
Supabase Postgres channels sync restaurant open/closed status instantly across all clients — excellent technical foundation.

### ✅ Bilingual Support
Full EN/اردو toggle with proper font loading. Urdu restaurant names and dish names render correctly with Noto Nastaliq Urdu.

### ✅ Clean Card Design
Restaurant cards have clear hierarchy: visual (gradient/logo) → identity (name/cuisine) → status → delivery info.

### ✅ Mobile-First Approach
`max-w-[600px]` container + safe-area-inset support + bottom nav — properly optimized for mobile viewing.

### ✅ Cart Integration
Seamless Zustand cart with persistence, cross-restaurant clearing, and floating CartBar that appears magically.

### ✅ Touch-Friendly
Minimum touch targets respected, `active:scale` press effects provide haptic-like feedback.

### ✅ Performance
Server-side rendering for menu pages, memoized dish cards (`React.memo`), debounced search (300ms).

### ✅ Accessibility Basics
Focus rings on interactive elements, `aria-label` on icon buttons, `role="alert"` on errors.

---

## 3. UX Issues Identified

### 🔴 Critical Issues

| Issue | Location | Impact |
|-------|----------|--------|
| **No restaurant rating/reviews display** | `/restaurants` cards | Users can't gauge quality before clicking |
| **No cuisine type filter** | `/restaurants` browser | Must scroll or search — no top-level filter |
| **No sorting** | `/restaurants` browser | Restaurants appear alphabetically only |
| **Same card link target** | `/restaurants` | Cards link to `/restaurant/[slug]` but main menu is at `/menu/[slug]` — inconsistent routing |

### 🟡 Moderate Issues

| Issue | Location | Impact | Suggested Fix |
|-------|----------|--------|---------------|
| **Cover area has empty gradient** | Restaurant card | Wasted visual space — could show cuisine imagery or delivery estimate | Add subtle pattern or cuisine emoji |
| **No delivery minimum info** | Card / detail | Users don't know minimum order | Show delivery minimum if set |
| **Search resets on city filter** | RestaurantsClient | State coupling issue | Combine filters properly |
| **No recent/favorites** | Browser | Returning users re-browse everything | Consider recent restaurants |
| **Category tabs overlap edge** | Menu page | Gradient fade may hide content on very small screens | Widen fade zones |
| **Add→Quantity transition** | Dish card | Abrupt state swap | Animate the transition |

### 🟢 Minor Issues

| Issue | Location | Suggested Fix |
|-------|----------|---------------|
| **Card entrance animation absent** | Browser | Add staggered fade-in for cards on load |
| **Search placeholder text** | Browser | "Search restaurants or cuisines..." is slightly long — truncate on small screens |
| **City chip active state** | Browser | Could use accent ring instead of full black fill for consistency |
| **Header brand name only** | Browser | Add helpful subtitle ("Browse restaurants near you") |
| **Status dot pulse** | Both | "Open" status could pulse subtly for attention |
| **Empty state could be better** | Browser | Show suggestions instead of just "No restaurants found" |
| **Loading skeleton** | Browser | Use proper shimmer animation from design system |

---

## 4. Component-by-Component Analysis

### 4.1 RestaurantsClient.tsx

```
┌──────────────────────────────────────┐
│ QRMenu.pk                     [glass]│ ← Header — minimal, functional
│ 🔍 Search restaurants...             │ ← Search — good, but basic
│ [All] [Lahore] [Karachi] [Islamabad]│ ← City chips — functional
├──────────────────────────────────────┤
│                                      │
│ LAHORE              [city header]    │
│ ┌──────┐ ┌──────┐                    │
│ │Card 1│ │Card 2│                    │ ← Cards — clean but plain
│ └──────┘ └──────┘                    │
│                                      │
│ KARACHI             [city header]    │
│ ┌──────┐ ┌──────┐                    │
│ │Card 3│ │Card 4│                    │
│ └──────┘ └──────┘                    │
├──────────────────────────────────────┤
│  🏠      🛒       📋        [bottom] │
└──────────────────────────────────────┘
```

**UX Assessment:**
- ✅ Functional and fast
- ❌ Lacks visual hierarchy — all restaurants look equally important
- ❌ No quick-scan affordances (ratings, distance, etc.)
- ❌ City headers use subdued styling — could be more prominent

### 4.2 Restaurant Card Design

```
┌─────────────────────────────┐
│        ░░░░░░░░░░           │ ← Gradient cover (96px)
│        ░░░░░░░░░░           │   (no actual image)
│          ┌────┐             │
│          │Logo│  ← Overlay  │ ← 48px logo, white border
│          └────┘             │
├─────────────────────────────┤
│                             │
│  Restaurant Name       [28px]│ ← 15px semibold
│  Cuisine • City        [20px]│ ← 12px secondary
│                             │
│  [● Open]                  │ ← Status badge
│                             │
│  🕐 20 min  🚲 Free    [16px]│ ← Delivery info
└─────────────────────────────┘
```

**Spacing Analysis:**
- `pt-7` above text is generous — good
- `pb-3` at bottom is slightly tight
- Gradient cover is 112px (h-28) — could be more visually interesting
- Info density is appropriate for scanning

### 4.3 MenuHeader.tsx (Hero)

```
┌─────────────────────────────────┐
│  ┌─────────────────────────┐    │
│  │                         │    │ ← 192px hero
│  │     Cover/Pattern       │    │
│  │                         │    │
│  │  ┌────┐                 │    │
│  │  │Logo│  Restaurant     │    │ ← 56px logo
│  │  └────┘  📍 City        │    │
│  └─────────────────────────┘    │
│                                 │
│  🟢 Open · 09:00 — 23:00       │ ← Status + hours
│  📍 Address...                  │ ← Compact info row
│  📞 0300-xxxxxxx                │
└─────────────────────────────────┘
```

**UX Assessment:**
- ✅ Strong visual hierarchy with hero image
- ✅ Clear status indication with hours
- ❌ Info row crammed — address/phone truncation on small screens
- ❌ Cover image area lacks content when no image provided
- ✅ Bilingual name rendering is excellent

### 4.4 MenuContent + Dish Card

```
┌──────────────────────────────────┐
│ 🔍 Search dishes...  [EN|اردو]  │ ← Sticky search bar
│                                  │
│ [All 12] [Burgers 5] [Drinks 4]│ ← Category tabs (scrollable)
├──────────────────────────────────┤
│                                  │
│ ┌── BURGERS ─────────────────┐  │ ← Category header
│ │                            │  │
│ │ ┌──────┬──────────────────┐│  │
│ │ │ 🍔  │ Chicken Burger   ││  │ ← Dish card
│ │ │img  │ 🔥 Popular       ││  │
│ │ │     │ Zinger with...   ││  │
│ │ │     │           Rs 450 ││  │
│ │ │     │            [+Add]││  │
│ │ └──────┴──────────────────┘│  │
└──────────────────────────────────┘
```

**UX Assessment:**
- ✅ Excellent bilingual support with name_ur fallback
- ✅ Badge system for Popular/Chef Special/Spicy
- ✅ Quantity selector replaces Add button when item in cart
- ❌ Price and Add button compete for bottom-right space
- ❌ Description line-clamp-2 sometimes cuts awkwardly
- ❌ Unavailable state uses 50% opacity — could be more descriptive

### 4.5 CategoryTabs

**UX Assessment:**
- ✅ Horizontal scroll with gradient fade edges
- ✅ Dish count pills on each tab
- ✅ Active state scrolls into view
- ✅ Bilingual labels
- ❌ Gradient fades might hide content on edge devices
- ❌ Tabs have no "sticky" feel — they scroll with page

### 4.6 CartBar

```
┌──────────────────────────────┐
│ 🛒 (3)  View Cart     Rs 1,250 ▸│
└──────────────────────────────┘
  ↑ Fixed at bottom-[60px] (above nav)
```

**UX Assessment:**
- ✅ Appears/disappears based on cart state
- ✅ Shows item count and total price
- ✅ Animated slide-up entrance
- ❌ Could benefit from micro-animation on item add
- ❌ No restaurant name in bar

---

## 5. Recommendations Summary

### High Priority (Implement Now)
1. **Add entrance animation** to restaurant cards on load
2. **Improve loading skeletons** with shimmer animation
3. **Add helpful empty state** with suggestions
4. **Refine spacing** — consistent 4px grid rhythm
5. **Better search feedback** — show results count

### Medium Priority (Next Iteration)
1. **Add cuisine type filter** (alongside city filter)
2. **Improve unavailable dish state** — show "Check back later" text
3. **Smooth Add→Quantity transition** on dish cards
4. **Refine header** with subtitle
5. **Better card cover area** — add pattern or gradient variation

### Low Priority (Future)
1. Ratings & reviews system
2. Delivery minimum info
3. Recent/favorite restaurants
4. Sorting options (rating, distance, delivery time)
5. Map view toggle

---

## 6. Redesign Direction

### Design Principles

| Principle | Application |
|-----------|-------------|
| **Clean & Minimal** | Reduce visual noise, increase whitespace |
| **Mobile-First** | Maintain 600px container, optimize for thumb zones |
| **Consistent Rhythm** | 4px/8px spacing grid throughout |
| **Subtle Feedback** | Micro-animations on interaction |
| **Retain Identity** | Keep Black/White/Green palette, refine not replace |

### Visual Changes Summary

| Component | Change Level | Key Improvement |
|-----------|-------------|-----------------|
| RestaurantsClient | Medium | Animations, spacing, empty state |
| MenuHeader | Low | Refine overlay, info layout |
| MenuContent | Low | Focus states, toggle polish |
| DishGrid | Low-Medium | Transition animations, spacing |
| CategoryTabs | Low | Touch targets, fade edges |
| CartBar | Low | Shadow, animation timing |

### Color Application

```
Primary (Black) ───── Headers, key buttons, active states
  Use: Bold, confident — 30% of visual weight

Accent (Green #25D366) ── Open status, success states
  Use: Affirmative, lively — 10% of visual weight

Grays ──────────────── Backgrounds, borders, secondary text
  Use: Clean, airy — 60% of visual weight
```

---

*Report prepared for QRMenu.pk — Pakistan's #1 QR menu platform.*
