SEO Audit Findings & Recommendations
Critical Issues (Fix Immediately)
#	Issue	Location
1	/scan-menu-code-online-free 301 redirect vs existing page — next.config.ts redirects to /digital-menu-for-restaurants but the actual app/(customer)/scan-menu-code-online-free/page.tsx (392 lines) exists and has full metadata+schema + is in sitemap	next.config.ts:104-107, app/(customer)/scan-menu-code-online-free/page.tsx, sitemap.ts
2	3 other 301s in next.config.ts shadowed by existing pages — /qr-code-menu-free, /digital-menu-qr-code, /qr-code-restaurant-menu, /free-digital-menu, /best-digital-menu-for-restaurants, /qr-menu-app	next.config.ts:76-119
3	Sitemap emits 4 redirected URLs — best-digital-menu-for-restaurants, free-digital-menu, scan-menu-code-online-free, qr-menu-app listed in lib/blog-articles.ts:382-385 + sitemap.ts:9-12	lib/blog-articles.ts:382-385, sitemap.ts
4	/favicon.ico 404 referenced by layout.tsx:135, manifest.json:12, sw.js:84, 2× JSON-LD Organization/LocalBusiness logos (components/JsonLd.tsx:26,378)	public/, components/JsonLd.tsx, app/layout.tsx, public/manifest.json
5	Global canonical SITE_URL leaks to pages lacking override — app/layout.tsx:127 sets canonical: SITE_URL which propagates to any page without explicit alternates.canonical, effectively self-canonicalizing to homepage	app/layout.tsx:126-127, ~15 pages missing canonical override
6	Pricing contradiction: JSON-LD 1500 vs FAQ + llms.txt 1,200 — components/JsonLd.tsx:129 sets Starter price at PKR 1500, but app/page.tsx:380,401 FAQ says "paid plans start from PKR 1,200/month" and public/llms.txt:21 also says 1,200	components/JsonLd.tsx:129, app/page.tsx:380,401, public/llms.txt:21
High Priority Issues
#	Issue	Location
7	Invalid hreflang cluster — app/layout.tsx:128-132 declares en, ur → /?lang=ur, x-default but no /ur route, no locale segment, no next.config.ts i18n, language stored only in React useState — lost on reload	app/layout.tsx:128-132, lib/i18n/context.tsx:21, all routes
8	GA4 with no consent gate — components/shared/GoogleAnalytics.tsx loads measurement ID G-DH740HGMFX unconditionally on every page, no CMP, causes double page_view (initial send_page_view: true + manual config in useEffect)	components/shared/GoogleAnalytics.tsx, app/layout.tsx:30
9	LocalBusiness.areaServed = 20 cities on every page — components/JsonLd.tsx:387-408 emits 20 areaServed cities site-wide, including on restaurant menu pages (self-contradictory: a Faisalabad restaurant declaring 20 served cities)	components/JsonLd.tsx:387-408, app/layout.tsx:170
10	/favicon.ico 404 cascade — also components/JsonLd.tsx:26,378 use https://www.digitalmenue.com/favicon.ico as Organization/LocalBusiness logo URL → 404	components/JsonLd.tsx:26,378, public/manifest.json:12
11	18 copy-pasted city landing pages — digital-menu-{islamabad,lahore,karachi,faisalabad,rawalpindi,peshawar,multan}/page.tsx each 22-24KB with identical structure, baked-in content, revalidate=3600, not programmatic. lib/pakistan-cities.ts exists but is unused	app/(customer)/digital-menu-{city}/page.tsx, lib/pakistan-cities.ts
12	AppFooter client-only → social/sameAs absent from SSR HTML — components/shared/AppFooter.tsx is "use client", social links, sameAs profiles, contact info not in initial HTML	components/shared/AppFooter.tsx, site-wide
13	/restaurants canonical missing — confirmed in explore as a page lacking alternates.canonical override; global canonical SITE_URL may apply	app/(customer)/restaurants/page.tsx:8, app/layout.tsx:127
14	17/28 blog articles have zero internal links — app/blog/[slug]/page.tsx:41-100 relatedSlugs map only covers 11 articles; other 17 render no internal links	app/blog/[slug]/page.tsx:41-100
15	No <meta> viewport themeColor per-brand — app/layout.tsx:146-151 has themeColor: #FFFFFF (white) but brand primary is likely different; also no per-page themeColor	app/layout.tsx:146-151
16	vercel.json www→apex redirect logic appears inverted — rule matches when host is missing and forces https://www.digitalmenue.com/$1; but canonical/robots/sitemap all use www	vercel.json:2-14
17	7 unoptimized ~2 MB icon/logo files — public/icon.png (1,996 KB), public/main-logo.png (2,000 KB), never compressed, not served as WebP/AVIF, next/image not used on landing pages	public/, components/LogoIcon.tsx
18	next.config.ts invalid preconnect wildcards — layout.tsx:161-162 has https://*.supabase.co as preconnect href; wildcards are invalid in preconnect href, these are no-ops	app/layout.tsx:161-162
19	next/image NOT used on 18 SEO landing pages or homepage — public/og-image.png served raw; icon.png/main-logo.png ~2 MB never optimized	app/(customer)/digital-menu-{page}/page.tsx, app/page.tsx, public/
20	Blog has no RSS/feed route — app/feed.xml or /rss.xml do not exist	—
21	ServiceJsonLd/ReviewJsonLd/VideoObjectJsonLd dead code — defined in components/JsonLd.tsx but never rendered on any page	components/JsonLd.tsx:432,472,567
22	llms.txt not in sitemap — public/llms.txt exists (73 lines + 15KB full) but not listed in sitemap.xml; referenced in app/robots.ts:30-31 only	public/llms.txt, sitemap.xml, app/robots.ts:30-31
23	next.config.ts redirects conflict with static pages — 8 redirects defined but several target paths that have actual pages; redirects run before filesystem routing creates risk of future breakage when new pages are added	next.config.ts:76-119
Medium Priority Issues
#	Issue	Location
24	**Title lengths exceed 60 chars before `	Digital QR Menue Pakistan` suffix** — several page titles (FAQ, digital-menu-pakistan, etc.) exceed char limit before the template suffix is applied
25	icons: [{ rel: "icon", url: "/favicon.ico" }] in root layout (L134-136) broken because favicon.ico doesn't exist	app/layout.tsx:134-136
26	app/blog/articles.ts (150 KB) server module — comment says extracted from page for bundle-graph reasons; verify it's not in client bundle	app/blog/articles.ts, app/blog/[slug]/page.tsx
27	noindex by robots on /cart, /checkout, /order-confirm/[id], /account, /dashboard, /superadmin — reasonable but verify no important indexable pages accidentally caught	robots.txt, app/(customer)/favorites/page.tsx:4 (noindex meta)
28	verify_email_code / resend_code API routes — no auth/sensitivity headers beyond global CSP; could be abused if endpoints are public	app/api/auth/{verify-email-code,resend-code}/route.ts
29	indexnow/route.ts exists but no POST handler or index key file — file exists but submission handler missing; no public/indexnow-key.txt	app/api/indexnow/route.ts
30	No dataLayer custom events, no RUM, no web-vitals reporting — only basic gtag.js page_view	—
Low Priority / Cosmetic
#	Issue	Location
31	public/sw.js:1 still says "QRMenu.pk" (stale legacy domain comment)	public/sw.js:1
32	netlify.toml missing CSP/HSTS/redirects — only 2 headers vs next.config.ts/vercel.json full set	netlify.toml
33	tailwind.config.js content globs missing ./lib, ./stores, ./types — may miss some class usages	tailwind.config.js:13-14
34	app/menu/page.tsx, app/(customer)/restaurant/page.tsx, app/(customer)/menu/[slug]/page.tsx, app/(customer)/restaurant/[slug]/page.tsx — no metadata, but 308 redirect immediately (acceptable)	Multiple files
35	Blog content: string[] with "## "/"### " heading prefixes — detected and rendered by BlogRichText.tsx; in-body links are raw text "digitalmenue.com" not anchors	lib/blog-articles.ts, components/blog/BlogRichText.tsx
Summary of Top 5 Quick-Win Recommendations
1. Fix favicon — add real favicon.ico (or SVG) to public/, update all references (layout, manifest, JSON-LD, sw.js). Time: 15 min
2. Remove 301 redirects from next.config.ts that shadow existing pages (/qr-code-menu-free, /digital-menu-qr-code, /qr-code-restaurant-menu, /free-digital-menu, /best-digital-menu-for-restaurants, /qr-menu-app). Time: 10 min
3. Remove redirected URLs from sitemap (best-digital-menu-for-restaurants, free-digital-menu, scan-menu-code-online-free, qr-menu-app). Time: 10 min
4. Add canonical overrides to pages missing them: /restaurants, /cart, /checkout, /order-confirm/[id], auth signup pages. Time: 30 min
5. Align pricing JSON-LD with FAQ/llms.txt (1,200 vs 1,500). Time: 10 min
Next Steps Checklist (ordered by impact)
- Add real favicon to public/, update all 7+ references (layout, manifest, JSON-LD, sw.js)
- Remove 6 unnecessary 301 redirects from next.config.ts; keep only if intentional
- Remove 4 redirected URLs from sitemap generation (lib/blog-articles.ts, sitemap.ts)
- Add explicit canonical to: /restaurants, /cart, /checkout, /order-confirm/[id], auth signup pages
- Align pricing JSON-LD price (1,200) with FAQ/llms.txt, or update FAQ/llms.txt
- Remove decorative hreflang or implement proper locale URLs
- Implement GA4 consent gating + fix double page_view
- Make LocalBusiness.areaServed dynamic per page (or remove site-wide)
- Refactor 18 city landing pages to dynamic generation via lib/pakistan-cities.ts + generateStaticParams
- Populate relatedSlugs for all 28 blog articles
- Add real themeColor to layout metadata
- Compress icon.png/main-logo.png to <100 KB, deliver WebP/AVIF, or use next/image
- Add llms.txt/llms-full.txt to sitemap
- Add RSS/feed route
- Remove dead schema types (ServiceJsonLd, ReviewJsonLd, VideoObjectJsonLd) or integrate where applicable
Full analysis complete. All findings derived from codebase audit (app/, components/, next.config.ts, sitemap.ts, robots.txt) plus live crawl (https://www.digitalmenue.com, sitemap.xml, robots.txt). No files were modified (plan mode read-only).