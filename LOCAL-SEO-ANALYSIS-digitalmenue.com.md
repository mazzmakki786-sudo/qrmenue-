# Local SEO Analysis — digitalmenue.com

**Date:** 2026-08-02
**Domain:** https://www.digitalmenue.com
**Method:** Static codebase audit (on-page NAP, schema, location-page quality, internal linking). Live-SERP / GBP / citation checks could not be executed this session (network tools unavailable) — see Limitations.

---

## 1. Local SEO Score: 42/100

| Dimension | Weight | Score | Verdict |
|---|---|---|---|
| GBP Signals | 25% | 10/100 | No GBP embed, no GBP reference detectable |
| Reviews & Reputation | 20% | 15/100 | No `aggregateRating`, no review velocity signals |
| Local On-Page SEO | 20% | 65/100 | Strong city pages + FAQ content, but **doorway risk** |
| NAP Consistency & Citations | 15% | 45/100 | Visible NAP, but **3 conflicting emails**; no tier-1 citations detected |
| Local Schema Markup | 10% | 55/100 | LocalBusiness present, but generic type, missing `geo`, email mismatch |
| Local Link & Authority | 10% | 10/100 | No chamber/press/local-authority signals detectable in codebase |

---

## 2. Business Type & Vertical

- **Business type:** **Service Area Business (SAB)** — national SaaS serving 20+ Pakistani cities. No street address published (only city-level "Faisalabad, Punjab, Pakistan"). No embedded Google Map on any page.
- **Industry vertical:** **SaaS → Localized** — not a restaurant itself; it *sells to* restaurants. Vertical-specific checks therefore shift from "menu/reservations" to **LocalBusiness + software** signals. `SoftwareApplication` schema (root layout) is correct for this model.

---

## 3. What's Done Well (Strengths)

1. **Site-wide LocalBusiness + Organization + SoftwareApplication schema** rendered in the root layout — good foundation for AI/entity parsing.
2. **City landing pages exist** for the 3 biggest markets (Lahore, Karachi, Islamabad) + a Pakistan hub + a QR-Menu Pakistan page, all with **local FAQ content** (`FaqJsonLd`) and **city-specific Q&A** (Anarkali/Gulberg/DHA print shops for Lahore, F-6/Blue Area for Islamabad). This is exactly the right format for a SAB.
3. **City + service in title and H1** — e.g. "Digital Menu Lahore — QR Menu for Restaurants" / "Digital Menu for Restaurants in Lahore". Strong on-page local keyword alignment.
4. **Visible NAP in footer** (address + WhatsApp + email) and full business hours on `/contact`.
5. **`areaServed`** lists 20 Pakistani cities with City typing — excellent entity scope signal.
6. **Internal linking is deliberate:** footer "Pakistan" column links all 5 location pages; each city page cross-links to the Pakistan hub and sibling cities; homepage deeplinks to `/restaurants?city=X`.
7. **Speakable JSON-LD** on city pages — an AI-search-friendly touch.
8. **`tel:`/WhatsApp click-to-action** — contact page builds `wa.me/923146325823`.

---

## 4. Critical Findings (fix first)

### C1 — 3 Conflicting Email Addresses (NAP inconsistency)
The same business publishes **three different emails** in authoritative locations:

| Source | Email |
|---|---|
| `components/JsonLd.tsx` `OrganizationJsonLd` | `support@digitalmenue.com` |
| `components/JsonLd.tsx` `LocalBusinessJsonLd` | `dmenue@gmail.com` |
| `lib/company-info.ts` `COMPANY_INFO.support.email` (footer + contact) | `maki2@gmail.com` |
| `app/contact/page.tsx` (fallback) | `support@digitalmenue.com` |

**Impact:** Inconsistent NAP is a top local-ranking and AI-visibility negative. Google, ChatGPT, and Bing Places cross-check these signals; three different emails undermines entity trust and can split the profile.

**Fix:** Standardize on one published email. Recommend **`support@digitalmenue.com`** (the one already in schema ContactPoint + contact page). Update `COMPANY_INFO.support.email` and the `LocalBusinessJsonLd` email to match. (Keep `maki2@gmail.com` as the internal owner address only — remove from the public footer.)

### C2 — Location Pages Are Doorway-Risk (Swap Test Fails)
Lahore, Karachi, and Islamabad pages are **each exactly 434 lines** with **identical templated blocks**:
- Same "Save on Printing & Reprints" benefit card verbatim in all three.
- Same benefits grid, same 4-step "How It Works", same "Restaurants We Support" 8-item grid, same pricing section (identical PKR numbers), same 5-FAQ structure.

**Swap test:** replace "Lahore" with "Karachi" and most body content still reads correctly → classic doorway-page pattern. This is the exact pattern Google's March 2024 Core Update deindexed for an HVAC company (80% rankings loss). With only 3 city pages you're under the 30-page warning threshold, but you're building the *template* that will become a doorway pattern at scale.

**Fix:**
- Write **>60% unique body content per city** — real local proof: named neighborhoods, local restaurant types, city-specific pricing context, local owner quotes/testimonials.
- Remove near-identical sections or differentiate them per city (e.g., city-specific print-shop recommendations already in FAQ — expand into body).
- Keep pricing *identical* (it's a fact), but vary the surrounding narrative.

---

## 5. High-Priority Findings

### H1 — LocalBusiness schema is generic; no `geo`
`LocalBusinessJsonLd` uses base type `LocalBusiness` with address `{"@type":"PostalAddress","addressCountry":"PK"}` only — **no streetAddress, no addressLocality, no geo coordinates**. The About/Organization schemas separately list `Faisalabad, Punjab`, so the entity's location is inconsistent across markup.

**Fix (ready-to-use):**
```json
{
  "@type": "ProfessionalService",
  "@id": "https://www.digitalmenue.com/#business",
  "name": "Digital QR Menue",
  "telephone": "+92-314-6325823",
  "email": "support@digitalmenue.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Faisalabad",
    "addressRegion": "Punjab",
    "addressCountry": "PK"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 31.4504, "longitude": 73.1350 },
  "priceRange": "PKR 0 — 4,500",
  "areaServed": [ { "@type": "City", "name": "Lahore" }, { "@type": "City", "name": "Karachi" }, { "@type": "City", "name": "Islamabad" }, { "@type": "City", "name": "Faisalabad" } ]
}
```
(Use a `Service`/`ProfessionalService` subtype rather than bare `LocalBusiness` — cleaner for a software service SAB. Add Faisalabad to the `areaServed` city list; it is currently missing from the schema's list even though it's the founding city.)

### H2 — No `aggregateRating` on the offer catalog
`LocalBusinessJsonLd` has `hasOfferCatalog` (good) but **no `aggregateRating`** anywhere. Reviews feed 20% of local ranking weight and are a top AI-citation factor.

**Fix:** Add `aggregateRating` (ratingValue, reviewCount, bestRating) backed by a *real* review source (Google reviews / Trustpilot). Do NOT fabricate — Google penalizes fake rating markup. If you have Google reviews, pull the live count into the schema.

### H3 — No Faisalabad landing page (founding city)
Faisalabad is the **founding city** (About page, schema foundingLocation) and the address root — yet there is **no `/digital-menu-faisalabad` page**, while smaller-threat pages exist for Karachi/Islamabad/Lahore. The homepage links `/restaurants?city=faisalabad` but there's no SEO landing page for it.

**Fix:** Create `/digital-menu-faisalabad` using the same structure as Lahore/Karachi/Islamabad — but with **unique** Faisalabad content (D-ground, People's Colony, Sitara Mall food courts, the local food street scene). This also consolidates link equity for the city where you have the strongest claim.

### H4 — No Rawalpindi/Peshawar/Multan pages, but homepage links them
Homepage deeplinks to `/restaurants?city=rawalpindi|peshawar|multan`, and `areaServed` lists them — but no dedicated landing pages. These are lower priority than Faisalabad but are natural tier-2 expansions.

---

## 6. GBP Signals (25% — scored Low)

- **No GBP embed or reference** detectable in codebase (no Maps iframe, no place ID, no reviews widget on any page).
- **Primary category** cannot be verified from code. For a national SAB the GBP primary category should be the software/service category, with secondary categories aligned to restaurant-adjacent services.
- **Business hours** ARE published on `/contact` (`COMPANY_INFO.hours`) — good, this is local factor #5. Consider adding `openingHoursSpecification` to schema.

**Action (off-site, you must do manually):** Verify the GBP listing at google.com/business exists for "Digital QR Menue", set the primary category correctly, add the WhatsApp number, publish weekly posts, and add 10+ real photos (founder, product screenshots, QR prints, café placements). Photos drive 45% more direction requests.

---

## 7. Reviews & Reputation (20% — scored Low)

- **No review signals** in schema or on-page (no rating count, no star display, no third-party review links).
- **No review velocity mechanism** detectable (no "review us on Google" flow after signup/orders).
- **18-day rule:** rankings cliff if no new reviews for 3 weeks. With no visible review system, this is a major gap.

**Action:**
- Add an automated review request (WhatsApp message to owners after their 2nd/3rd order or after onboarding — "Rate your experience with Digital QR Menue").
- Display live Google review count + rating on homepage and `/pricing` (feeds schema `aggregateRating`).
- Ensure every review gets a public owner response (88% of consumers use a business that responds).

---

## 8. NAP Consistency Audit

| Source | Name | Phone | Email | Address |
|---|---|---|---|---|
| Footer (`COMPANY_INFO`) | Digital QR Menue | +92-314-6325823 | **maki2@gmail.com** | Faisalabad, Punjab, Pakistan |
| Contact page fallback | Digital QR Menue | +92-314-6325823 | **support@digitalmenue.com** | (via COMPANY_INFO) |
| OrganizationJsonLd | Digital QR Menue | +92-314-6325823 | **support@digitalmenue.com** | Faisalabad, Punjab, PK |
| LocalBusinessJsonLd | Digital QR Menue | +92-314-6325823 | **dmenue@gmail.com** | (country only) |
| About page | Digital QR Menue | — | — | Faisalabad, Punjab, PK |

- **Name:** consistent ✓
- **Phone:** consistent ✓
- **Email:** **INCONSISTENT — 3 values** ✗ (Critical C1)
- **Address:** Locality consistent (Faisalabad/Punjab/PK), but LocalBusiness schema omits locality entirely ✗

---

## 9. Citation Presence Check (Tier 1)

**Not verifiable from codebase** (requires live lookups). The `sameAs` array references Facebook, Instagram, LinkedIn, TikTok, YouTube, X — strong social profile consistency. Recommended off-site actions:
- **Google Business Profile** — verify/claim (primary).
- **Bing Places** — claim (critical: powers ChatGPT, Copilot, Alexa; 27% usage growth).
- **Apple Business Connect** — claim.
- **Data aggregators:** Data Axle, Foursquare, Neustar/TransUnion for downstream distribution.

---

## 10. Local Schema Status

| Element | Status | Notes |
|---|---|---|
| `LocalBusiness` (root) | ⚠️ Present but generic | Missing `geo`, locality, street; email mismatch; no rating |
| `Organization` (root) | ✓ Strong | Full address, contactPoint, founder, sameAs |
| `SoftwareApplication` (root) | ✓ Strong | Offer catalog, PKR pricing |
| `ContactPage` | ✓ Good | ContactPoint with telephone/email |
| `AboutPage` | ✓ Good | foundingLocation, areaServed |
| City pages | ⚠️ `Article` only | No LocalBusiness/areaServed on the pages that actually rank for city queries |
| City page breadcrumbs | ✓ Good | Pakistan hub → city hierarchy |
| FAQPage on city pages | ⚠️ Info-level only | FAQ rich results retired May 2026; keep for AI/LLM citation, not SERP feature |

---

## 11. Location Page Quality (Multi-Location Assessment)

- **Count:** 5 location pages (pakistan, lahore, karachi, islamabad + qr-menu-pakistan). Under the 30-page warning threshold. ✓
- **Uniqueness:** **FAIL** — identical 434-line templates, verbatim benefit blocks (swap test fails). Critical C2.
- **Store locator:** `app/(customer)/restaurants/page.tsx` supports `?city=` filters (real restaurant directory, SSR) — a genuine, crawlable store-locator equivalent. This is a genuine differentiator vs. doorway pages. ✓
- **Schema per location:** All city pages emit generic `Article` schema; **no per-location LocalBusiness with unique `@id` + `branchOf`**. Location pages should each carry their own location-scoped schema.

---

## 12. Top 10 Prioritized Actions

### Critical (fix now)
1. **Fix NAP email conflict** — standardize on `support@digitalmenue.com` across `company-info.ts`, `LocalBusinessJsonLd`, footer, contact. (C1)
2. **De-duplicate city pages** — rewrite Lahore/Karachi/Islamabad with >60% unique, city-specific content. (C2)

### High (this week)
3. **Add Faisalabad landing page** (founding city, currently absent). (H3)
4. **Upgrade LocalBusiness schema** — add `geo`, locality, Faisalabad to areaServed, `openingHoursSpecification`. (H1)
5. **Verify & optimize Google Business Profile** — category, photos, posts, WhatsApp number. (GBP)
6. **Add `aggregateRating`** from real Google review data. (H2)

### Medium (this month)
7. **Claim Bing Places + Apple Business Connect** (AI search sources). 
8. **Build a review-generation flow** (WhatsApp ask after onboarding/orders) + display reviews on homepage. 
9. **Give each city page its own location-scoped schema** (LocalBusiness `@id` per city) instead of generic Article.

### Low (backlog)
10. **Tier-2 city pages** (Rawalpindi, Peshawar, Multan) — only after Faisalabad + dedup work is done; build the unique-content template first or the doorway problem scales.

---

## 13. Limitations

This audit was performed against the **source code** (authoritative for on-page NAP, schema, and page structure) because live-network tools were unavailable this session. The following could NOT be assessed and require live tools:
- **Real-time local pack positions** (geo-grid / proximity ranking) — needs DataForSEO local pack SERP.
- **GBP listing contents** (category, posts, photos, Q&A, verified badge) — needs dashboard access.
- **Backlink profile / DA** — needs Moz/Bing/Ahrefs/DataForSEO.
- **Citation completeness** across directories (Yelp, BBB, Pakistan directories) — needs live lookup.
- **Google review count & rating** — needs live data to populate `aggregateRating` honestly.
- **Bing Places / Apple Business Connect** status.

Recommended tools to fill gaps: DataForSEO (local pack SERP, business listings), BrightLocal (citation audit), Ahrefs/Moz (links).

---

*Generated from the `/seo local` skill. For full AI-search visibility analysis (llms.txt, citability, brand mentions), run `/seo geo https://www.digitalmenue.com`.*
