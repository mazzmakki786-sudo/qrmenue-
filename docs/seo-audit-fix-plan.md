# SEO / GEO / AEO Fix Plan — digitalmenue.com

**Source:** `seo-audit-output/seo-audit-digitalmenue-2026-07-31.md` (Full Audit, 2026-07-31)
**Scope:** Implement the highest-value audit findings in the codebase.
**Verification:** All file locations below verified against the current codebase.

---

## Corrected audit findings (verified against code)

The live-crawl audit flagged several issues. Code-level verification corrected a few:

| # | Audit finding | Verified in code | Verdict |
|---|---|---|---|
| 1 | `/login` canonical → homepage | `app/layout.tsx:123` sets `canonical: SITE_URL` globally; `/login`, `/signup/*`, `/login/customer` inherit it (no override) | ✅ REAL BUG |
| 2 | Restaurant title "Restaurant in |" empty city | `app/[slug]/page.tsx:37` — `${name} — ${cuisine_type || "Restaurant"} in ${city} | Digital QR Menue`. Empty `city` → broken "in |" | ✅ REAL BUG |
| 3 | Pricing page has zero H1 | `components/pricing/PricingSection.tsx` + `PricingClient.tsx` use only H2/H3; no `<h1>` | ✅ REAL |
| 4 | Blog posts "no visible byline" | `app/blog/[slug]/page.tsx:847-851` renders `<time>` + "By {author}" | ❌ FALSE — already visible |
| 5 | Footer "no visible social links" | `components/shared/AppFooter.tsx` renders social icons from `company_settings` keys (`social_facebook`, etc.) | ❌ FALSE — already present when settings exist |
| 6 | Brand naming "Menue" vs "Menü" vs "Menu" | Root layout `APP_NAME="Digital QR Menue"`, title template `%s | Digital QR Menue Pakistan`; menu pages use "Digital Menu". "Menü" not found in app/ code | ⚠️ PARTIAL — unify to "Digital QR Menue" |
| 7 | City schema 20× per page | `components/JsonLd.tsx` likely injects city list in a LocalBusiness/Service context | ⚠️ VERIFY before changing (see below) |
| 8 | Blog pillar posts thin (412 words) | `app/blog/[slug]/page.tsx` content arrays are short | ✅ REAL — content task |
| 9 | llms.txt exists but unreferenced | `public/llms.txt` present; not linked in sitemap/robots | ✅ REAL — add reference |
| 10 | No HowTo schema | `components/JsonLd.tsx` lacks HowToJsonLd | ✅ REAL — add |

---

## Implementation plan

### P0 — Critical (bugs, low effort)

**1. Fix auth-page canonicals (login/signup)**
- Files: `app/(auth)/login/page.tsx`, `app/(auth)/login/customer/page.tsx`, `app/(auth)/signup/customer/page.tsx`, `app/(auth)/signup/restaurant/page.tsx`
- Add `export const metadata: Metadata` (or merge into existing) with `alternates: { canonical: "https://www.digitalmenue.com/login" }` (etc. per page).
- Keep title/description from layout; only override `alternates`.

**2. Fix restaurant title template (empty city/cuisine)**
- File: `app/[slug]/page.tsx:37`
- Change to:
  ```ts
  const cityPart = restaurant.city ? ` in ${restaurant.city}` : ""
  const typePart = restaurant.cuisine_type || "Restaurant"
  const title = `${restaurant.name} — ${typePart}${cityPart} | Digital QR Menue`
  ```
- Optional hardening: trim/collapse whitespace in city (e.g. `restaurant.city?.trim()`), and strip if it's a placeholder.

**3. Add H1 to Pricing page**
- File: `components/pricing/PricingSection.tsx` (or `PricingClient.tsx`)
- Add `<h1>` at top: "Pricing — Digital QR Menue Plans" (mirroring metadata title), demote if any existing H2 was serving that role.

### P1 — High (GEO/AEO, medium effort)

**4. Add HowTo schema for the "3 simple steps" flow**
- File: `components/JsonLd.tsx` — add `HowToJsonLd` component; render on homepage (`app/page.tsx`) where the "Get started in 3 simple steps" H2 lives.

**5. Reference llms.txt from sitemap/robots**
- File: `app/robots.ts` — add `llms.txt` line to `rules` (or a new `sitemap`-style link). Keep the existing `sitemap` pointer.
- Optional: link `llms.txt` from the homepage footer or `<head>`.

**6. Unify brand naming → "Digital QR Menue"**
- Search for "Digital QR Menu" (the misspelling variant used in titles/OG) and decide a single canonical spelling. Update title/OG strings in `app/layout.tsx` and any page-level titles.
- ⚠️ Coordinate with the dev so this doesn't conflict with existing brand decisions.

### P2 — Medium

**7. Thicken 2-3 thin blog pillar posts (content)**
- File: `app/blog/[slug]/page.tsx` articles map. Add 2-3 substantial sections + facts to the top pillar posts ("What Is a Digital Menu", "How to Make a QR Code Menu", "Foodpanda Commission vs Direct").
- Add one authoritative external citation per post (AEO source-citation signal).

**8. City schema audit (verify first, then prune)**
- File: `components/JsonLd.tsx` — inspect where the 20 City entities come from. If they're in a `Service`/`areaServed` context, they're valid; if they're page-level noise, remove or reduce to the relevant city.

---

## Non-goals (explicitly skipped)

- Blog author bylines — **already present** (verified).
- Footer social links — **already present** (verified).
- Core Web Vitals / backlinks / real SERP rankings — require external tools; out of scope.
- Full content rewrite of all 13 blog posts — time-boxed to 2-3 pillar posts.

---

## Verification checklist (after execution)

- [ ] `curl https://www.digitalmenue.com/login` → canonical = `.../login` (not homepage)
- [ ] `curl https://www.digitalmenue.com/makii2` → title has no "Restaurant in |"
- [ ] `curl https://www.digitalmenue.com/pricing` → has exactly one `<h1>`
- [ ] Homepage source contains `HowTo` JSON-LD
- [ ] `robots.txt` references `llms.txt`; `llms.txt` 200s
- [ ] Brand spelling consistent across root layout + auth pages
- [ ] Blog pillar posts ≥ ~800 words with ≥1 external citation
- [ ] `npx tsc --noEmit` passes; `npm run build` passes
