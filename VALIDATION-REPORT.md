# Sitemap Validation Report

**Site:** https://www.digitalmenue.com  
**Date:** 2026-07-16  
**Tool:** SEO Sitemap Analyzer  

---

## Summary

| Metric | Status |
|--------|--------|
| Sitemap exists | ✅ Yes — Next.js dynamic sitemap (`app/sitemap.ts`) |
| Referenced in robots.txt | ✅ Yes — `${baseUrl}/sitemap.xml` |
| Valid XML format | ✅ Yes — generated via `MetadataRoute.Sitemap` |
| URL count | ✅ ~24 URLs — well under 50k limit |
| All HTTP(S) | ✅ Uses `https://` throughout |
| Sitemap index needed | ❌ No — far below 50k |

---

## Issues Found

### 1. 🔴 `NEXT_PUBLIC_NOINDEX_MENU_PAGES=true` in Production

**Severity:** High  
**File:** `.env.production`  
**Impact:** Restaurant menu pages (`/menu/[slug]`) are **excluded from the sitemap** in production. Only **9** active restaurants exist currently, but this kills the entire menu page indexation.

The `robots` meta for menu pages is also set to `noindex, nofollow` when this flag is true.

**Recommendation:** Either:
- Set `NEXT_PUBLIC_NOINDEX_MENU_PAGES=false` for live/real restaurants, OR
- Keep the flag but create a whitelist of production-quality restaurant pages to include in the sitemap

### 2. 🟡 All Static Pages Use `new Date()` as `lastModified`

**Severity:** Low  
**Location:** `app/sitemap.ts` lines 29, 35, 41, 47, 53, 59, 65, 93-98  
**Impact:** Every sitemap generation stamps today's date on pages that haven't actually changed. Google uses this signal; identical dates across all pages reduce its usefulness.

**Recommendation:** Set factual dates for static pages:
- Landing: `2026-07-16` (or launch date)
- Pricing: `2026-07-16`
- FAQ: `2026-07-16`
- Blog: use real publish dates from the article data
- Privacy/Terms: actual last-update dates

### 3. 🟡 `changeFrequency` and `priority` Tags Included

**Severity:** Info  
**Location:** `app/sitemap.ts` — all URL entries  
**Impact:** Google explicitly states these tags are **ignored**. They add noise to the sitemap XML without benefit.

**Recommendation:** Remove `changeFrequency` and `priority` to simplify the sitemap.

### 4. 🟢 Missing Important Pages

**Severity:** Medium  
**Missing but indexable:**
- `/signup/restaurant` — key conversion / signup page (no auth required)
- `/signup/customer` — customer signup (minor)

**Correctly excluded (auth required or noindex):**
- `/cart` — checkout flow ❌
- `/checkout` — checkout flow ❌
- `/account` — auth required ❌
- `/dashboard/*` — auth required ❌
- `/favorites` — auth required ❌
- `/order-confirm/*` — auth required ❌
- `/menu` — redirects to `/restaurants` ❌
- `/restaurant/[slug]` — redirects to `/menu/[slug]` ❌

**Recommendation:** Add `/signup/restaurant` to the sitemap with priority appropriate for a conversion page.

### 5. 🟢 Blog Slug List is Hardcoded

**Severity:** Low  
**Location:** `app/sitemap.ts` line 15-21  
**Impact:** Requires a code change every time a blog article is added or removed. Easy to forget.

**Recommendation:** Consider deriving the slug list from a shared constant or data source (e.g., the `articles` object exported from the blog page).

---

## Quality Signals

| Signal | Status |
|--------|--------|
| Sitemap index file (>50k URLs) | ✅ Not needed |
| Split by content type | ✅ Static, Menu, Blog — naturally grouped |
| Non-canonical URLs in sitemap | ✅ None found |
| Noindexed URLs in sitemap | ✅ None (menu pages excluded via flag) |
| Redirected URLs in sitemap | ✅ None |
| HTTPS only | ✅ Yes |

---

## Recommendations Summary

1. **Review `NEXT_PUBLIC_NOINDEX_MENU_PAGES`** — this flag is the biggest gating factor for SEO value
2. **Set static `lastModified` dates** — use factual dates instead of `new Date()`
3. **Add `/signup/restaurant`** to the sitemap
4. **Remove `changeFrequency` / `priority`** — ignored by Google
5. **DRY the blog slug list** — share with the blog page instead of duplicating

---

## Updated Sitemap Preview (Proposed)

```
https://www.digitalmenue.com/                   (landing)
https://www.digitalmenue.com/pricing            (pricing)
https://www.digitalmenue.com/restaurants        (restaurant listings)
https://www.digitalmenue.com/faq                (FAQ)
https://www.digitalmenue.com/contact            (contact)
https://www.digitalmenue.com/privacy            (privacy policy)
https://www.digitalmenue.com/terms              (terms of service)
https://www.digitalmenue.com/signup/restaurant  (restaurant signup)
https://www.digitalmenue.com/blog               (blog index)
  + 5 blog articles
  + menu/[slug] for active restaurants (if indexable)
```
