# Implementation Tasks

## Phase 1: Bug Fixes & Core Changes

### Task 1: Fix Super Admin Mobile Responsiveness
- [ ] `AnalyticsView.tsx` — Fix `grid-cols-3` charts to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, wrap in overflow-x-auto, add responsive padding
- [ ] `RestaurantDetailPage` — Fix stat grid `grid-cols-4` to `grid-cols-2 sm:grid-cols-4`, wrap tables in overflow-x-auto, add mobile padding
- [ ] `CompanySettingsForm.tsx` — Fix input fields responsive layout
- [ ] `TrialLimitsEditor.tsx` — Fix `grid-cols-5` to responsive grid

### Task 2: Fix Restaurant Detail Page Lag/Crash
- [ ] Reduce order fetch limit from 500 to 100 in `RestaurantDetailPage`
- [ ] Add proper error boundaries and debounce
- [ ] Clean up real-time subscription + polling to prevent cascading re-renders

### Task 3: Fix Analytics Recent Orders Not Showing
- [ ] Add `recent` property to `last7` type in `AnalyticsView.tsx`
- [ ] Verify rendering logic for recent orders list

### Task 4: Announcements Real-time Center Popup + Bell
- [ ] Extend `BellNotification.tsx` to subscribe to `owner_notifications` for announcements
- [ ] Create centered modal popup component for new announcements
- [ ] Add announcement badge count to bell icon

### Task 5: Remove Expired Trial Post-Expiry Section
- [ ] Remove "Expired Trial — Post-Expiry Limits" section from `TrialLimitsEditor.tsx`

### Task 6: Fix Company Settings Save to Database
- [ ] Fix `app/api/superadmin/settings/route.ts` — use `createAdminClient()` instead of `createClient()`

### Task 7: Fix Subscription Numbers Not Adding
- [ ] Create server API route `/api/superadmin/subscriptions/route.ts` for subscription insert
- [ ] Update `RestaurantDetailPage` to use the API instead of client-side Supabase insert

### Task 8: Super Admin High Security
- [ ] Create migration for `superadmin_login_attempts` table
- [ ] Implement 3-attempt lockout in `/api/superadmin/check/route.ts`
- [ ] Show `notFound()` page on 3rd failed attempt
- [ ] Add pgcrypto encryption for company_settings values
- [ ] Create unlock recovery flow (WhatsApp/email support)
- [ ] Add rate limiting to superadmin API routes
- [ ] Add 15-min session timeout
- [ ] Add audit logging for superadmin logins

## Phase 2: Build & Deploy
- [ ] Run `npm run build` and fix any errors
- [ ] Deploy to Vercel (`vercel --prod`)
- [ ] Verify all fixes on live deployment

---

## Phase 3: SEO Implementation (URGENT — This Week)

### 🔴 CRITICAL — Day 1-2 (Must Do First)

#### SEO-1: Create robots.txt
- [ ] Create `public/robots.txt`
- [ ] Add crawl rules: Allow public pages, Disallow dashboard/admin/cart/checkout
- [ ] Add sitemap URL reference

#### SEO-2: Create Dynamic Sitemap
- [ ] Create `app/sitemap.ts`
- [ ] Add static pages: /, /pricing, /restaurants, /login, /signup
- [ ] Query Supabase `restaurants` table for dynamic `/menu/[slug]` URLs
- [ ] Set correct priorities and change frequencies

#### SEO-3: Add Metadata to Menu Page (MOST IMPORTANT)
- [ ] Edit `app/(customer)/menu/[slug]/page.tsx`
- [ ] Add `generateMetadata()` function
- [ ] Dynamic title: "{Restaurant Name} Menu — {Cuisine} in {City} | QRMenu.pk"
- [ ] Dynamic description per restaurant
- [ ] Open Graph tags with restaurant logo
- [ ] Twitter card tags
- [ ] Canonical URL

#### SEO-4: Add Metadata to Restaurants Directory
- [ ] Edit `app/(customer)/restaurants/page.tsx`
- [ ] Add `generateMetadata()` function
- [ ] Title: "Restaurants in Pakistan — Browse Menus | QRMenu.pk"
- [ ] Description with city names
- [ ] Open Graph tags

#### SEO-5: Add Metadata to Pricing Page
- [ ] Edit `app/pricing/page.tsx`
- [ ] Add `generateMetadata()` function
- [ ] Title: "Pricing — QR Menu Plans | QRMenu.pk"
- [ ] Description with pricing info

#### SEO-6: Fix Homepage Dynamic Rendering
- [ ] Edit `app/page.tsx`
- [ ] Remove `export const dynamic = "force-dynamic"` (line 6)
- [ ] This allows static generation for faster loading

#### SEO-7: Enhanced Root Layout Metadata
- [ ] Edit `app/layout.tsx`
- [ ] Add `metadataBase: new URL("https://qrmenu.pk")`
- [ ] Add title template: `"%s | QRMenu.pk"`
- [ ] Add keywords array
- [ ] Add Open Graph configuration
- [ ] Add Twitter card configuration
- [ ] Add robots directives
- [ ] Add alternates/hreflang for EN/UR

#### SEO-8: Create OG Image
- [ ] Create `public/og-image.png` (1200x630px)
- [ ] Use QRMenu.pk branding with green (#25D366) theme
- [ ] Include tagline: "Pakistan's #1 QR Menu Platform"

---

### 🟡 HIGH PRIORITY — Day 2-3

#### SEO-9: Add Noindex to Dashboard Pages
- [ ] Edit `app/(owner)/layout.tsx`
- [ ] Add `export const metadata` with `robots: { index: false, follow: false }`
- [ ] Edit `app/(superadmin)/layout.tsx`
- [ ] Same noindex metadata

#### SEO-10: Fix Image Alt Text
- [ ] Edit `app/(owner)/dashboard/onboarding/page.tsx:59`
- [ ] Change `alt=""` to `alt={`${restaurant.name} logo`}`

#### SEO-11: Update Copyright Year
- [ ] Edit `app/page.tsx:431`
- [ ] Change `© 2024` to `© 2026`

#### SEO-12: Add Hreflang Tags
- [ ] Edit `app/layout.tsx`
- [ ] Add `alternates` with `languages` for EN and UR
- [ ] Set `x-default` to English version

---

### 🟢 IMPORTANT — Day 3-4

#### SEO-13: Create JSON-LD Component
- [ ] Create `components/JsonLd.tsx`
- [ ] Reusable component for structured data

#### SEO-14: Add Organization Schema
- [ ] Edit `app/layout.tsx`
- [ ] Add Organization JSON-LD script
- [ ] Include name, url, logo, description, contactPoint

#### SEO-15: Add Restaurant + Menu Schema
- [ ] Edit `app/(customer)/menu/[slug]/page.tsx`
- [ ] Add Restaurant JSON-LD with menu items
- [ ] Include MenuItem schema with prices in PKR

#### SEO-16: Add ItemList Schema to Directory
- [ ] Edit `app/(customer)/restaurants/page.tsx`
- [ ] Add ItemList JSON-LD for restaurant listings

#### SEO-17: Expand Homepage Content
- [ ] Edit `app/page.tsx`
- [ ] Add new section: "Why Pakistan's Restaurants Choose QRMenu.pk"
- [ ] Add 200+ words of keyword-rich content
- [ ] Include target keywords naturally

#### SEO-18: Add FAQ Schema to Pricing
- [ ] Edit `app/pricing/page.tsx`
- [ ] Add FAQPage JSON-LD
- [ ] Include 5 FAQs from existing accordion

---

### 🔵 BONUS — Day 4-5

#### SEO-19: Google Search Console Setup Guide
- [ ] Add instructions to opencode.md
- [ ] Include verification meta tag code
- [ ] Include sitemap submission steps

#### SEO-20: Add Loading States
- [ ] Create `app/(customer)/loading.tsx`
- [ ] Create `app/(customer)/menu/[slug]/loading.tsx`
- [ ] Improve perceived performance

#### SEO-21: Add Error Boundaries
- [ ] Create `app/(customer)/error.tsx`
- [ ] Create `app/(customer)/menu/[slug]/error.tsx`

---

## Phase 4: Post-Deployment SEO Tasks

### Manual Actions (User Must Do)
- [ ] Set up Google Search Console account
- [ ] Verify domain ownership
- [ ] Submit sitemap: `https://qrmenu.pk/sitemap.xml`
- [ ] Request indexing for key pages
- [ ] Set up Google Analytics / Plausible
- [ ] Create Google Business Profile for QRMenu.pk
- [ ] Share menu links on social media for faster indexing

### Ongoing Monitoring
- [ ] Check Google Search Console weekly for crawl errors
- [ ] Monitor keyword rankings monthly
- [ ] Update sitemap when new restaurants are added
- [ ] Review and fix any 404 errors
