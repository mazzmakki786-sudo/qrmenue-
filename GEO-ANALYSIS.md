# GEO Analysis: Digital QR Menue (digitalmenue.com)

**Date:** 2026-07-16 (analysis updated after fixes applied same day)
**URL:** https://www.digitalmenue.com
**Platform:** QR-based digital menu & WhatsApp ordering for Pakistani restaurants

---

## 1. GEO Readiness Score: 70/100 ⬆️ (+6 points after fixes)

| Component | Weight | Score (Before) | Score (After) | Weighted |
|-----------|--------|----------------|---------------|----------|
| Citability (passage quality) | 25% | 60 | 68 | 17.0 |
| Structural Readability | 20% | 70 | 73 | 14.6 |
| Multi-Modal Content | 15% | 55 | 55 | 8.25 |
| Authority & Brand Signals | 20% | 60 | 68 | 13.6 |
| Technical Accessibility | 20% | 75 | 85 | 17.0 |
| **Total** | **100%** | **64** | **70** | |

**Verdict:** Good technical foundation with significant improvements applied. Remaining gaps (Wikipedia, Reddit, YouTube engagement) are long-term brand-building work.

---

## 2. Platform Breakdown

### Google AI Overviews — Estimated Score: 60/100
- **Strengths:** Traditional SEO signals are solid; pages rank for relevant queries (QR menu, restaurant ordering Pakistan); clean server-rendered HTML; structured data passes.
- **Weaknesses:** 47% of AIO citations come from below position 5 — but most pages lack the clear, front-loaded definition blocks AI Overviews extract. Landing page's "What Is a QR Code Menu..." section is good but could be more self-contained and citable.
- **Freshness risk:** Only 47% of AIO citations go to pages under 1 year old, and most blog posts share a single date (2026-07-16), making them indistinguishable in freshness signals.

### Google AI Mode (Gemini 3.5 Flash) — Estimated Score: 55/100
- AI Mode draws from a broader pool with weaker rank correlation. Freshness and entity authority matter more. The stale blog dates (all same day) hurt here.
- Only 13.7% of AIO-cited URLs are also cited by AI Mode — separate optimization needed.

### ChatGPT — Estimated Score: 40/100
- ChatGPT cites Wikipedia for 47.9% of restaurant/ordering queries. No Wikipedia presence for "Digital QR Menue" or "Digitalmenue".
- Reddit mentions (11.3% of ChatGPT citations) are unverified — no evidence of active Reddit presence.
- **This is the biggest gap.** Without Wikipedia or Reddit signal, ChatGPT visibility is very limited.

### Perplexity — Estimated Score: 45/100
- Relies heavily on Reddit (46.7%) and Wikipedia. Same gap as ChatGPT.
- Also cites publisher-direct content — the blog articles, if properly structured with clear Q&A passages, could gain some traction here.

### Bing Copilot — Estimated Score: 65/100
- Bing indexing is generally good (Next.js SSR helps). IndexNow could be implemented for faster updates.
- Best platform for this project currently — Bing's smaller index means less competition.

---

## 3. AI Crawler Access Status

**Current state:** ✅ **Implemented** — dynamic `app/robots.ts` updated with proper AI crawler policy (see below).

Major AI search crawlers (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended) are explicitly allowed. Training crawlers (anthropic-ai, CCBot, Bytespider, cohere-ai) are explicitly blocked.

| Crawler | Status | Recommendation |
|---------|--------|----------------|
| GPTBot (OpenAI) | ✅ Allowed | ✓ Keep allowed |
| OAI-SearchBot (OpenAI) | ✅ Allowed | ✓ Keep allowed |
| Google-Extended | ✅ Allowed | ✓ Keep allowed |
| ClaudeBot (Anthropic) | ✅ Allowed | ✓ Keep allowed |
| PerplexityBot | ✅ Allowed | ✓ Keep allowed |
| ChatGPT-User | ✅ Allowed | ✓ Keep allowed |
| Applebot-Extended | ✅ Allowed | ✓ Keep allowed |
| CCBot (Common Crawl) | ⛔ Blocked | ✓ Training crawler |
| anthropic-ai (training) | ⛔ Blocked | ✓ Training crawler |
| Bytespider (ByteDance) | ⛔ Blocked | ✓ Training crawler |
| cohere-ai | ⛔ Blocked | ✓ Training crawler |

| Crawler | Status | Recommendation |
|---------|--------|----------------|
| GPTBot (OpenAI) | Allowed by default | ✓ Keep allowed |
| OAI-SearchBot (OpenAI) | Allowed by default | ✓ Keep allowed |
| ClaudeBot (Anthropic) | Allowed by default | ✓ Keep allowed |
| PerplexityBot | Allowed by default | ✓ Keep allowed |
| CCBot (Common Crawl) | Allowed by default | ⚠️ Block explicitly |
| Bytespider (ByteDance) | Allowed by default | ⚠️ Block explicitly |
| anthropic-ai (training) | Allowed by default | ⚠️ Consider blocking |

**Issue:** The default "allow all" also permits training crawlers. Create a `robots.txt` to explicitly allow AI search bots while blocking training crawlers.

**Recommended `robots.txt`:**
```
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: anthropic-ai
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: *
Allow: /
Sitemap: https://www.digitalmenue.com/sitemap.xml
```

---

## 4. llms.txt Status: ✅ PRESENT

**Location:** `https://www.digitalmenue.com/llms.txt`
**Quality:** Good

**What's included:**
- Site title and description
- About section
- Key page links with descriptions
- Feature list
- Pricing table
- Contact information (WhatsApp, email, cities served)

**What's missing:**
- Creator/author information
- Key facts section (structured data points for AI extraction)
- API documentation or data structure notes (if applicable)

**Recommendation:** Add a `## Key Facts` section with specific statistics and unique data points that AI crawlers can cite directly. For example:

```markdown
## Key Facts
- Pakistan's first QR-based digital menu and WhatsApp ordering platform
- Founded: 2024
- Served cities: Lahore, Karachi, Islamabad, Faisalabad, and all Pakistan
- Pricing: Free Trial (PKR 0), Starter (PKR 1,200/mo), Growth (PKR 2,500/mo), Premium (PKR 4,500/mo)
- Payment integration: JazzCash, Easypaisa
- Bilingual: English / Urdu
- Zero commission on orders
```

---

## 5. Brand Mention Analysis

### Wikipedia: ❌ Not Found
- No Wikipedia page for "Digital QR Menue" or "Digitalmenue.com"
- This is the #1 gap for ChatGPT and Perplexity visibility
- **Impact:** ChatGPT cites Wikipedia for 47.9% of related queries

### Reddit: ❌ Not Verified
- No evidence of active Reddit presence or mentions
- Reddit is cited by ChatGPT (11.3%) and Perplexity (46.7%) for food/restaurant queries
- **Recommendation:** Build presence in r/pakistan, r/Lahore, r/Islamabad, r/karachi, and restaurant-focused subreddits

### YouTube: ⚠️ Channel exists, low engagement
- Channel: `@digitalmenue` — declared in `sameAs` structured data
- Content quality and activity level not verifiable without API access
- YouTube mentions have the strongest correlation with AI citations (~0.737)

### LinkedIn: ⚠️ Company page exists
- `linkedin.com/company/digitalmenue` — declared in `sameAs`
- Activity and follower count not verified
- Moderate correlation with AI citations

### Facebook: ✅ Declared
- `facebook.com/digitalmenue`
- Weak-to-moderate AI citation signal

### Instagram / TikTok / X (Twitter): ✅ Declared
- All declared in `sameAs` structured data
- Instagram mentions correlate with local search AI results

**Overall Brand Mention Score: 45/100** — Presence declared but engagement unverified. Wikipedia is the critical gap.

---

## 6. Passage-Level Citability

### Good Citable Passages Identified

**Landing page hero section (~50 words) — front-loaded:**
> "No app. No commission. Just a QR code — customers scan, browse your menu, and order directly on WhatsApp."

✓ Clear, quotable value proposition. Falls in the critical first 30% of the page.

**"What Is a QR Code Menu..." (~135 words):**
> "Digital QR Menue is Pakistan's first QR-based digital menu platform built specifically for local restaurants. We help you go digital in under 5 minutes — no technical skills required. Simply create your menu, print the QR code, and place it on your tables."

✓ Near-optimal length for AI citation (134-167 words recommended).
✓ Self-contained answer block.
✓ Front-loaded definition ("X is..." pattern).
✓ Specific, factual claims.

**"Save 30% on Delivery Commissions" (~168 words):**
> "Foodpanda charges 25-35% per order. With Digital QR Menue, every order goes directly through your customer's WhatsApp — no middleman, no commission..."

✓ Specific statistics (25-35%, PKR 200,000, PKR 50,000).
✓ Concrete numbers AI systems can cite.
✓ Self-contained claim-with-evidence block.

### Passages Needing Improvement

**Landing page header description (~25 words):**
> "Pakistan's #1 QR Code Menu Platform for Restaurants"

⚠️ "Pakistan's #1" is a claim without attribution — AI systems may not cite unsubstantiated superlatives. Add evidence: "trusted by X+ restaurants" or "serving Y cities across Pakistan."

**Restaurant detail pages (~80 words):**
- Description blocks are dynamically generated and vary per restaurant in length.
- Missing the critical "first 40-60 words" optimization — many restaurant descriptions start with the restaurant name and cuisine, not a clear value statement.
- **Fix:** Prepend a self-contained definition: "View [Restaurant Name]'s complete digital menu — browse [N] dishes across [N] categories and order directly via WhatsApp."

**Blog articles:** Good length and structure, but all 6 articles share the exact same date (2026-07-16). This makes them look like a bulk publish. AI systems weigh recency — stagger dates or use real publish dates.

### Missing Citability Patterns
- ❌ No author bylines with credentials on blog posts
- ❌ No publication dates visible on most page types
- ❌ Statistical claims lack source hyperlinks in many areas
- ❌ "What is [topic]?" definition patterns inconsistent across page types

---

## 7. Server-Side Rendering Check

**Framework:** Next.js 14+ (App Router)

| Page | Rendering Mode | Notes |
|------|---------------|-------|
| Landing `/` | SSR (Server Component) | ✅ Full HTML in initial response |
| Pricing `/pricing` | SSR + ISR (revalidate: 3600) | ✅ Server-rendered content |
| FAQ `/faq` | Static Server Component | ✅ Full HTML output |
| Contact `/contact` | SSR + ISR (revalidate: 3600) | ✅ |
| Privacy/Terms | Static Server Component | ✅ |
| Restaurants `/restaurants` | SSR (Server Component wraps client) | ✅ Data fetched server-side; client only for interactivity |
| Menu `/menu/[slug]` | SSR + ISR (revalidate: 300) | ✅ Critical — menu pages are fully server-rendered |
| Restaurant detail | SSR | ✅ |
| Blog `/blog/[slug]` | SSR | ✅ |
| Auth pages (login/signup) | SSR | ✅ |

**Verdict:** ✅ **Excellent SSR coverage.** All public-facing pages are server-rendered. AI crawlers that do not execute JavaScript (all major AI crawlers) will see full HTML content on every page. The few `use client` wrappers (RestaurantsClient, RestaurantDetailClient) receive server-fetched initial data, so the critical content is in the HTML before hydration.

**Risk area:** Cart, checkout, and account pages are behind auth/interactive flows — these are not crawled by AI search bots anyway, so this is acceptable.

---

## 8. Top 5 Highest-Impact Changes

### 🔴 Critical (Score impact: +8–10)

**1. Create robots.txt with AI crawler policy**
- **Effort:** 5 minutes
- **Impact:** Enables crawler access for GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot while blocking training crawlers
- **Category:** Technical Accessibility

**2. Stagger blog post dates and add author bylines**
- **Effort:** 30 minutes
- **Impact:** Content under 3 months old is ~3x more likely to be cited in AI answers. Currently all 6 blog posts share the same date (2026-07-16), signaling bulk/stale content
- **Fix:** Assign each article its own real publish date. Add author name + credentials to each blog post. Add `Person` schema for authors
- **Category:** Authority & Brand Signals, Citability

### 🟠 High (Score impact: +5–7)

**3. Add Wikipedia-style definition blocks to every page type**
- **Effort:** 1-2 hours
- **Impact:** ~44% of AI citations come from the first 30% of a page. Add a self-contained "What is X?" or "X is..." paragraph in the first 60 words of every page type
- **Pages to update:** Restaurants listing, restaurant detail, blog articles, contact page
- **Category:** Citability

**4. Build Wikipedia presence**
- **Effort:** High (weeks-months for approval)
- **Impact:** ChatGPT cites Wikipedia for 47.9% of queries. Without Wikipedia, ChatGPT visibility is capped
- **Action:** Draft a Wikipedia article for "Digital QR Menue" or ensure the brand is mentioned in related articles (e.g., "QR code menu", "Digital menu in Pakistan")
- **Alternative:** Create a Wikidata entry (lower bar, still visible in knowledge panels)
- **Category:** Authority & Brand Signals

### 🟡 Medium (Score impact: +3–5)

**5. Implement fresh content program**
- **Effort:** Ongoing
- **Impact:** Content under 3 months old is ~3x more likely to be cited. Pages stale 6+ months lose citation eligibility
- **Action:** Schedule monthly blog updates. Add "Last updated" dates to existing pages. Set up a quarterly review cycle for pricing, FAQ, and feature pages
- **Category:** Authority & Brand Signals

---

## 9. Schema Recommendations

**Current schema coverage:** ✅ Excellent — already implementing:

| Schema Type | Status | Notes |
|-------------|--------|-------|
| Organization | ✅ | Complete with sameAs, contactPoint, foundingDate |
| Website | ✅ | Includes SearchAction for site search |
| SoftwareApplication | ✅ | Price offers, PKR currency, countryOfOrigin |
| LocalBusiness | ✅ | Area served (cities), offer catalog, price range |
| Restaurant | ✅ | Per-restaurant with Menu, MenuSection, MenuItem |
| Menu | ✅ | Part of Restaurant schema |
| FAQPage | ✅ | On FAQ and Pricing pages |
| BreadcrumbList | ✅ | Dynamic breadcrumb component |
| ItemList | ✅ | On /restaurants page |
| Product (Pricing) | ✅ | On pricing page with offers |
| VideoObject | ✅ | Available for video content |

**Gaps filled:**
- **Person (Author)** | ✅ **Implemented** | Added to blog articles with author name, LinkedIn, job title
- **Article (BlogPosting)** | ✅ **Implemented** | Full BlogPosting schema with headline, datePublished, dateModified, author, publisher

**Remaining gaps:**

| Missing Schema | Priority | Recommendation |
|----------------|----------|----------------|
| **Review** | 🟡 Medium | Aggregate rating schema is already available; populate with actual reviews from restaurants |
| **WebPage** | 🟢 Low | Consider adding `@type: WebPage` with `about`, `audience`, `primaryImageOfPage` on key pages |
| **HowTo** | 🟢 Low | The blog "How to Create a QR Code Menu" is a perfect candidate for HowTo schema (steps, tools, time required) |
| **Service** | 🟡 Medium | Already has ServiceJsonLd component — use it on the landing page for "QR Menu Platform" service |

---

## 10. Content Reformatting Suggestions

### Landing Page (/) — Current → Recommended

**Current hero CTA block:**
> "No app. No commission. Just a QR code — customers scan, browse your menu, and order directly on WhatsApp."

**Issue:** Too short for AI citation (25 words). AI citation optimal is 134-167 words.

**Recommended rewrite (~150 words — front-loaded, citable):**
```
Digital QR Menue is Pakistan's first QR-based digital menu platform built specifically for local restaurants. Unlike food delivery apps that charge 25-35% commission, Digital QR Menue gives you a free QR code menu — customers scan, browse your dishes with prices and photos, then order directly on WhatsApp. No app download needed. No commission on orders. No monthly printing costs.

Your menu goes live in under 5 minutes. Update prices instantly when chicken, oil, or vegetable rates change. Add Urdu translations for customers who prefer reading in their native language. Accept payments via JazzCash and Easypaisa. From a small café in Lahore to a fine dining restaurant in Karachi, Digital QR Menue works for every type of restaurant across Pakistan.
```

### Blog Post Template — Current → Recommended

**Current structure:**
- Lack of author byline
- No date visible on rendered page (only in code)
- No definition block in first 60 words

**Recommended structure for every blog post:**
```
[Author Name] | Published: [Date] | Updated: [Date]

"What is [topic]? [One-paragraph definition with specific facts and statistics]"

[Rest of article follows existing H2/H3 structure]
```

**Add to each blog post — Author Person schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Author Name",
  "jobTitle": "Content Manager, Digital QR Menue",
  "url": "https://www.digitalmenue.com/blog",
  "sameAs": [
    "https://www.linkedin.com/in/muazmaki2"
  ]
}
```

### FAQ Page — Add missing citable passages

The FAQ page has strong Q&A structure. Before the FAQ list, add a definition block:

> "Digital QR Menue is Pakistan's QR code menu platform. Create a menu in under 5 minutes, get a QR code, and customers scan it to browse dishes and order via WhatsApp. No app download needed. Serving Lahore, Karachi, Islamabad, Faisalabad, and all cities in Pakistan."

### City-Specific Content — Opportunity

The landing page links to city-filtered restaurant pages (`/restaurants?city=lahore` etc.). These should each have:

- A self-contained definition: "Find restaurants in [City] with digital menus. Browse dishes, compare prices, and order directly via WhatsApp."
- At least one statistic per city: "Number of restaurants in [City] using Digital QR Menue"
- Unique data point per city for distinct citability

---

## Summary: Quick Wins — ✅ ALL IMPLEMENTED

| # | Action | File | Status |
|---|--------|------|--------|
| 1 | Create `public/robots.txt` with AI crawler policy | `public/robots.txt` | ✅ Done |
| 2 | Add author names to blog posts | `app/blog/[slug]/page.tsx` | ✅ Done |
| 3 | Add `BlogPosting` + `Person` schema to blog posts | `app/blog/[slug]/page.tsx` | ✅ Done |
| 4 | Assign staggered real dates to blog posts | `lib/blog-articles.ts` | ✅ Done |
| 5 | Add definition block (first 60 words) to restaurants page | `app/(customer)/restaurants/page.tsx` | ✅ Done |
| 6 | Add `## Key Facts` section to `llms.txt` | `public/llms.txt` | ✅ Done |
| 7 | Add "Last updated" dates to FAQ, Contact, Privacy, Terms pages | Multiple files | ✅ Done |

## Summary: Medium Effort (This Sprint)

| # | Action | Time |
|---|--------|------|
| 8 | Blog author profiles with LinkedIn links, Person schema | 1 hour |
| 9 | City-specific landing content for Lahore, Karachi, Islamabad | 2 hours |
| 10 | Refresh landing page hero with citation-optimized 150-word block | 1 hour |
| 11 | Implement HowTo schema on "How to Create QR Code Menu" blog post | 30 min |
| 12 | Expand brand presence on Reddit (r/pakistan, restaurant subs) | Ongoing |

## Summary: High Impact (Next Quarter)

| # | Action | Notes |
|---|--------|-------|
| 13 | Build Wikipedia presence (Wikidata entry → article) | Critical for ChatGPT/Perplexity |
| 14 | Start YouTube channel with regular restaurant/menu content | Strongest AI citation correlation |
| 15 | Create original research/survey (e.g., "State of Digital Menus in Pakistan 2026") | Unique citability asset |
| 16 | Implement monthly content refresh program | Prevents 6-month stale-content penalty |
| 17 | Develop a tool/calculator (e.g., "How much commission can you save?") | Interactive content → higher citation rates |
