# SEO EXECUTION PLAN — digitalmenue.com

**Created:** August 4, 2026
**Status:** IN PROGRESS
**Target Keywords:** digital menu, qr menu, digital qr menu, digital menu for restaurants in pakistan

---

## CURRENT STATE (Aug 4, 2026)

| Metric | Value | Source |
|--------|-------|--------|
| Clicks (3mo) | 24 | GSC |
| Impressions (3mo) | 583 | GSC |
| Avg Position | 9 | GSC |
| CTR | 4.1% | GSC |
| Pages not indexed | 15 discovered + 1 crawled + 3 noindex (correct) + 3 redirect (correct) + 1 404 | GSC |
| Performance | 96/100 | Lighthouse |
| Accessibility | 84/100 | Lighthouse |
| Best Practices | 96/100 | Lighthouse |
| SEO | 100/100 | Lighthouse |
| DA | 1 | Moz |
| PA | 9 | Moz |

---

## GSC INDEXING ISSUES

### Discovered — Currently Not Indexed (15 pages) — CRITICAL
| URL | Priority | Action |
|-----|----------|--------|
| `/best-digital-menu-for-restaurants` | CRITICAL | Add internal links + request indexing |
| `/free-digital-menu` | CRITICAL | Add internal links + request indexing |
| `/restaurants` | CRITICAL | Add internal links + request indexing |
| `/digital-menu-app` | High | Expand content + add internal links |
| `/digital-menu-design` | High | Expand content + add internal links |
| `/digital-menu-tablet` | High | Expand content + add internal links |
| `/qr-menu-app` | High | Add internal links + request indexing |
| `/scan-menu-code-online-free` | High | Create/expand page + add internal links |
| `/qr-menu-login` | Medium | Add internal links |
| `/contact` | Medium | Add internal links |
| `/blog` | Medium | Add internal links |
| `/blog/benefits-qr-code-menu-pakistani-restaurants` | Medium | Add internal links from other posts |
| `/blog/digital-menu-app-vs-native-app` | Medium | Add internal links from other posts |
| `/blog/how-to-make-qr-code-menu-for-restaurant` | Medium | Add internal links from other posts |
| `/blog/whatsapp-ordering-restaurant-pakistan-guide` | Medium | Add internal links from other posts |

### Crawled — Currently Not Indexed (1 page)
| URL | Action |
|-----|--------|
| Need to identify | Improve content quality |

### Excluded by noindex (3 pages) — CORRECT, DO NOT CHANGE
| URL | Why Correct |
|-----|-------------|
| `/favorites` | User-specific page |
| `/maki-faisalabad` | Dynamic restaurant slug |
| `/signup/restaurant` | Auth page |

### Page with redirect (3 pages) — CORRECT, EXPECTED
| URL | Redirects To |
|-----|-------------|
| `http://digitalmenue.com` | `https://www.digitalmenue.com` |
| `http://www.digitalmenue.com` | `https://www.digitalmenue.com` |
| `https://digitalmenue.com` | `https://www.digitalmenue.com` |

### Not found — 404 (1 page)
| URL | Action |
|-----|--------|
| Unknown | Need to identify from GSC |

---

## PHASE 1: CRITICAL INDEXATION FIXES (Day 1-2)

### Task 1.1 — Fix Sitemap: Remove Auth Pages
**File:** `lib/blog-articles.ts`
**Lines:** 374-377
**Action:** Remove these entries from `publicRoutes`:
```
{ path: "signup/restaurant", lastModified: "2026-07-30" },
{ path: "signup/customer", lastModified: "2026-07-30" },
{ path: "login", lastModified: "2026-07-30" },
{ path: "login/customer", lastModified: "2026-07-30" },
```
**Why:** These pages are behind `(auth)` layout which has noindex. Including them in sitemap causes errors.

### Task 1.2 — Add Missing Pages to Sitemap
**File:** `lib/blog-articles.ts`
**Action:** Add to `publicRoutes`:
```
{ path: "best-digital-menu-for-restaurants", lastModified: "2026-08-01" },
{ path: "free-digital-menu", lastModified: "2026-08-01" },
{ path: "scan-menu-code-online-free", lastModified: "2026-08-01" },
{ path: "qr-menu-app", lastModified: "2026-08-01" },
```

### Task 1.3 — Add Internal Links on Homepage
**File:** `app/page.tsx`
**Action:** Add a "Resources" section before footer linking to all 15 unindexed pages.

### Task 1.4 — Add Internal Links in Footer
**File:** `components/shared/AppFooter.tsx`
**Action:** Add more links to Resources column and create "More Cities" column.

---

## PHASE 2: NEW CITY PAGES (Day 2-4)

### Task 2.1 — Create Faisalabad City Page
**File:** `app/(customer)/digital-menu-faisalabad/page.tsx` (NEW)
**Template:** Copy from `app/(customer)/digital-menu-islamabad/page.tsx`
**Target Keyword:** digital menu faisalabad
**Word Count:** 1,500+
**Requirements:**
- H1: "Digital Menu for Restaurants in Faisalabad"
- Local references: D Ground, Clock Tower, Ghulam Muhammad Abad, Madina Town, Kohinoor
- FAQ section (5 questions)
- Schema: LocalBusiness + FAQ + BreadcrumbList
- Canonical: `https://www.digitalmenue.com/digital-menu-faisalabad`
- Internal links to: `/digital-menu-pakistan`, `/pricing`, `/signup/restaurant`

### Task 2.2 — Create Rawalpindi City Page
**File:** `app/(customer)/digital-menu-rawalpindi/page.tsx` (NEW)
**Target Keyword:** digital menu rawalpindi
**Word Count:** 1,500+
**Local references:** Saddar, Commercial Market, Chur Chowk, Committee Chowk

### Task 2.3 — Create Peshawar City Page
**File:** `app/(customer)/digital-menu-peshawar/page.tsx` (NEW)
**Target Keyword:** digital menu peshawar
**Word Count:** 1,500+
**Local references:** University Road, Saddar, Hayatabad, Ring Road

### Task 2.4 — Create Multan City Page
**File:** `app/(customer)/digital-menu-multan/page.tsx` (NEW)
**Target Keyword:** digital menu multan
**Word Count:** 1,500+
**Local references:** Hussain Agahi, Gulgasht, Bosan Road, MDA Chowk

### Task 2.5 — Update Sitemap with City Pages
**File:** `lib/blog-articles.ts`
**Action:** Add to `publicRoutes`:
```
{ path: "digital-menu-faisalabad", lastModified: "2026-08-01" },
{ path: "digital-menu-rawalpindi", lastModified: "2026-08-01" },
{ path: "digital-menu-peshawar", lastModified: "2026-08-01" },
{ path: "digital-menu-multan", lastModified: "2026-08-01" },
```

---

## PHASE 3: EXPAND THIN PAGES (Day 3-5)

### Task 3.1 — Expand digital-menu-app
**File:** `app/(customer)/digital-menu-app/page.tsx`
**Current:** ~372 lines
**Add:** 300+ words (setup guide, cost comparison table, testimonials)
**Target:** 2,000+ total words

### Task 3.2 — Expand digital-menu-design
**File:** `app/(customer)/digital-menu-design/page.tsx`
**Add:** 500+ words (photography tips, color psychology, mobile-first rules)
**Target:** 1,800+ total words

### Task 3.3 — Expand digital-menu-tablet
**File:** `app/(customer)/digital-menu-tablet/page.tsx`
**Add:** 500+ words (tablet vs QR comparison, best tablets, setup guide)
**Target:** 1,800+ total words

### Task 3.4 — Expand qr-menu-login
**File:** `app/(customer)/qr-menu-login/page.tsx`
**Add:** 300+ words (dashboard guide, phone management, troubleshooting)
**Target:** 1,500+ total words

### Task 3.5 — Create/Expand scan-menu-code-online-free
**File:** `app/(customer)/scan-menu-code-online-free/page.tsx` (NEW or expand)
**Add:** 800+ words (iPhone/Android guide, safety tips, FAQ)
**Target:** 1,500+ total words

---

## PHASE 4: SCHEMA & STRUCTURED DATA (Day 4-5)

### Task 4.1 — Add Product Schema to Pricing
**File:** `components/JsonLd.tsx`
**Action:** Create `PricingJsonLd` component
**Render in:** `app/pricing/page.tsx`

### Task 4.2 — Add BreadcrumbList to All Pages
**Files:** All page files
**Action:** Add `BreadcrumbListJsonLd` to pages missing it

### Task 4.3 — Add Article Schema to Blog
**File:** `app/blog/[slug]/page.tsx`
**Action:** Add Article schema with headline, author, dates

---

## PHASE 5: ACCESSIBILITY FIXES (Day 5-6)

### Task 5.1 — Fix Button Accessibility
**Files:** WhatsAppFloatButton, LanguageToggle, BellNotification
**Action:** Add `aria-label` to icon-only buttons

### Task 5.2 — Fix Contrast Ratios
**Files:** globals.css, components
**Action:** Ensure 4.5:1 ratio for all text

### Task 5.3 — Fix Heading Order
**Files:** All page files
**Action:** Ensure H1→H2→H3 sequential order

### Task 5.4 — Fix Touch Targets
**Files:** All interactive components
**Action:** Ensure minimum 48x48px tap targets

---

## PHASE 6: PERFORMANCE OPTIMIZATION (Day 6-7)

### Task 6.1 — Reduce Unused JS (126 KiB)
**Files:** next.config.ts, page components
**Action:** Dynamic imports, code splitting

### Task 6.2 — Reduce Unused CSS (12 KiB)
**Files:** tailwind.config.js
**Action:** Verify purge working

### Task 6.3 — Defer Render-Blocking Resources (400ms)
**File:** app/layout.tsx
**Action:** Add defer/async to scripts

### Task 6.4 — Optimize LCP (2.6s → <2.5s)
**File:** app/page.tsx
**Action:** Preload hero image, optimize fonts

---

## PHASE 7: NEW PILLAR PAGES (Week 2-3)

### Task 7.1 — QR Code Menu Restaurant
**File:** `app/(customer)/qr-code-menu-restaurant/page.tsx` (NEW)
**Target:** qr code menu restaurant
**Words:** 2,500+

### Task 7.2 — Restaurant Ordering System Pakistan
**File:** `app/(customer)/restaurant-ordering-system-pakistan/page.tsx` (NEW)
**Target:** restaurant ordering system pakistan
**Words:** 2,500+

### Task 7.3 — Foodpanda vs Digital Menu
**File:** `app/(customer)/foodpanda-vs-digital-menu/page.tsx` (NEW)
**Target:** foodpanda alternative pakistan
**Words:** 2,000+

---

## MANUAL ACTIONS

### Today
- [ ] Request indexing for 15 pages in GSC
- [ ] Find 404 URL in GSC
- [ ] Resubmit sitemap after code changes

### This Week
- [ ] Set up Google Business Profile
- [ ] Submit to Pakistan business directories
- [ ] Create social media profiles
- [ ] Set up Bing Webmaster Tools

### Ongoing
- [ ] Monitor GSC validation daily
- [ ] Track keyword rankings weekly
- [ ] Collect customer reviews 1/week

---

## EXPECTED RESULTS

| Metric | Current | 2 Weeks | 1 Month | 3 Months |
|--------|---------|---------|---------|----------|
| Indexed pages | ~30 | 42 | 48 | 55+ |
| Clicks/month | 8 | 30 | 80 | 250+ |
| Impressions/month | 194 | 800 | 2,500 | 8,000+ |
| Avg Position | 9 | 6 | 4 | 2-3 |
| Accessibility | 84 | 92 | 95 | 95+ |
| DA | 1 | 1 | 2 | 5 |

---

*Plan created by RankOps SEO Agent — Aug 4, 2026*
