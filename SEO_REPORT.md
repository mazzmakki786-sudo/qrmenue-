# 🏆 SEO Audit Report — QRMenu.pk / digitalmenue.com

**Date:** July 5, 2026  
**Domain:** https://digitalmenue.com  
**Project:** qr_menue (Next.js 15 + Supabase)  
**Target Market:** Pakistan (Restaurant QR Menu SaaS)

---

## 📊 Overall Scores

| Asset | Score |
|---|---|
| **digitalmenue.com (Live Site)** | **68/100** |
| **qr_menue (Repo Code)** | **76/100** |

---

## 1️⃣ Live Site: digitalmenue.com

### Category Breakdown

| Category | Score | Status |
|---|---|---|
| Technical SEO | 85/100 | 🟢 Good |
| On-Page SEO | 70/100 | 🟡 Needs Work |
| Content (E-E-A-T) | 65/100 | 🟡 Needs Blog |
| Performance | 75/100 | 🟡 Needs CWV data |
| Mobile Friendliness | 95/100 | 🟢 Excellent |
| Structured Data | 55/100 | 🔴 Missing Restaurant LD |
| OG / Social | 60/100 | 🟡 Missing Twitter cards |
| i18n / Hreflang | 25/100 | 🔴 Critical |
| Backlinks / DA | 25/100 | 🔴 New domain |
| Local SEO | 40/100 | 🟡 Weak |
| GEO / AI Overviews | 50/100 | 🟡 AI crawlers blocked |

### Estimated Domain Metrics

| Metric | Estimate |
|---|---|
| Domain Authority (Moz) | 5-15 |
| Domain Rating (Ahrefs) | 8-18 |
| Authority Score (Semrush) | 5-12 |
| Referring Domains | 5-20 |
| Total Backlinks | 50-200 |
| Monthly Traffic | <1,000 |
| Indexed Pages | 10-15 |

### Competitors (Pakistan Market)

1. **getmenuqr.com** (MenuQR) — strongest, has blog + active CEO
2. **nibzo.pk** — food discovery with QR menus
3. **onlinemenu.pk** — menu directory
4. **ozpos.com.pk** — QR ordering + POS
5. **software.net.pk** — sells QR menu scripts
6. International: qrmenu.com, digitalmenu.co, menumate.net

---

## 2️⃣ Repo Code: qr_menue (Next.js)

### 15-Point Analysis

| # | Category | Score |
|---|---|---|
| 1 | App Directory Structure | 9/10 |
| 2 | Metadata & Head Tags | 6/10 |
| 3 | Sitemap Generation | 9/10 |
| 4 | Robots.txt | 10/10 ✅ |
| 5 | Structured Data / JSON-LD | 7/10 |
| 6 | Open Graph & Twitter Cards | 6/10 |
| 7 | Canonical URLs | 7/10 |
| 8 | Hreflang Tags | 3/10 🔴 |
| 9 | i18n / SEO | 4/10 🔴 |
| 10 | Page Loading Performance | 8/10 |
| 11 | Mobile Responsiveness | 9/10 |
| 12 | Semantic HTML | 6/10 |
| 13 | next.config.ts | 9/10 |
| 14 | Middleware | 8/10 |
| 15 | JSON-LD Components | 8/10 |

---

## 3️⃣ Critical Issues & Fixes

### 🔴 CRITICAL: i18n / Hreflang (Score 3/10)
- **Problem:** en + ur both point to same URL. Urdu is client-side only — Google sees no Urdu content.
- **Fix Phase 2:** Implement `/en/` + `/ur/` URL routing, server-side locale detection, separate sitemaps.

### 🔴 CRITICAL: RestaurantJsonLd Not Rendered
- **Problem:** `components/JsonLd.tsx` has `RestaurantJsonLd` with Menu → MenuSection → MenuItem. **Never used.**
- **Fix ✅ Applied:** Added to `menu/[slug]` and `restaurant/[slug]` pages.

### 🔴 CRITICAL: Backlinks / Domain Authority
- **Problem:** New domain, very low backlink profile.
- **Fix:** Start content marketing (blog), directory submissions, HARO, guest posts.

### 🟡 HIGH: Missing Metadata on Auth/Cart/Checkout
- **Fix ✅ Applied:** Layout wrappers with metadata for login, signup, cart, checkout.

### 🟡 HIGH: Missing Twitter Cards
- **Fix ✅ Applied:** Added to pricing, restaurants, FAQ pages.

### 🟡 HIGH: FAQ not in Sitemap
- **Fix ✅ Applied:** Added to sitemap.ts with priority 0.7.

### 🟡 HIGH: No ISR on Restaurant Detail Page
- **Fix ✅ Applied:** Added `revalidate = 300` to `restaurant/[slug]/page.tsx`.

---

## 4️⃣ Recommended SEO Keywords

| Keyword | Intent | Priority |
|---|---|---|
| QR menu Pakistan | Commercial | 🏆 High |
| digital menu for restaurant | Commercial | 🏆 High |
| restaurant QR code Pakistan | Commercial | High |
| WhatsApp ordering system | Commercial | High |
| free QR code menu | Transactional | High |
| restaurant ordering system Pakistan | Commercial | Medium |
| online menu generator | Informational | Medium |
| contactless menu Pakistan | Informational | Medium |
| ریسٹورنٹ کے لیے کیو آر مینو | Urdu | High |
| ڈیجیٹل مینو پاکستان | Urdu | High |
| best QR menu for restaurants | Commercial | Medium |
| no commission restaurant ordering | Commercial | Medium |

---

## 5️⃣ Action Plan

### Phase 1 — Immediate (Done ✅)
- [x] Add `RestaurantJsonLd` to menu + restaurant pages
- [x] Add `/faq` to sitemap
- [x] Add Twitter cards to pricing, restaurants, FAQ
- [x] Add ISR to restaurant detail page
- [x] Add metadata layouts for login, signup, cart, checkout
- [x] Add `BreadcrumbListJsonLd` component

### Phase 2 — Short-term (1 Week)
- [ ] URL-based i18n (`/en/` + `/ur/` prefixes)
- [ ] Server-side locale detection in middleware
- [ ] Separate sitemaps per language
- [ ] Proper hreflang tags per page
- [ ] Create blog section (content marketing)
- [ ] Submit to Google Search Console
- [ ] Create Google Business Profile for brand

### Phase 3 — Medium-term (2-3 Weeks)
- [ ] Add breadcrumb UI + BreadcrumbList LD to main pages
- [ ] Semantic HTML audit (`<main>`, `<article>`, `<section>`)
- [ ] Convert OG image SVG → PNG
- [ ] Create `getSEOMetadata()` shared utility
- [ ] Add `LocalBusiness` + `BreadcrumbList` schemas
- [ ] City/neighborhood landing pages for local SEO

### Phase 4 — Long-term (1 Month+)
- [ ] Urdu metadata for all pages
- [ ] Urdu sitemap entries
- [ ] Backlink building campaign (guest posts, directories, PR)
- [ ] Case studies page with customer success stories
- [ ] Core Web Vitals monitoring
- [ ] AI crawlers — consider selective unblocking for GEO

---

## 6️⃣ Tools (from serpapi/awesome-seo-tools)

| Tool | Use |
|---|---|
| Ahrefs / SEMrush | Backlinks, competitor research |
| Screaming Frog | Technical crawl |
| Google Search Console | Free — essential |
| BrightLocal | Local SEO |
| AnswerThePublic | Content ideas |
| SEOnaut | Open source technical audit |
| Python SEO Analyzer | CLI-based analysis |
| SERPWatcher / AccuRanker | Rank tracking |
| Yoast SEO | WordPress (if blog added) |

---

*Report generated by NexusForge Global — SEO Division*
