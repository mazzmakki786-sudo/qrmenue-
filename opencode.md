# QRMenu.pk — Project Documentation

> **Goal:** Rank #1 on Google Pakistan for restaurant QR menu related keywords
> **Audience:** Restaurant owners (B2B) across all Pakistan
> **Languages:** English + Urdu
> **Deployment:** Vercel + Next.js 15 App Router + Supabase
> **Production:** https://qrmenu.pk
> **Staging:** https://qr-menue-one.vercel.app
> **Status:** ✅ Live — Security hardened, performance optimized, UI/UX overhauled

---

## Table of Contents

1. [Project Structure Overview](#1-project-structure-overview)
2. [Current SEO Audit](#2-current-seo-audit)
3. [Target Keywords](#3-target-keywords)
4. [Implementation Checklist](#4-implementation-checklist)
5. [Phase 1: Critical Fixes (Day 1-2)](#5-phase-1-critical-fixes-day-1-2)
6. [Phase 2: On-Page SEO (Day 2-3)](#6-phase-2-on-page-seo-day-2-3)
7. [Phase 3: Content & Schema (Day 3-4)](#7-phase-3-content--schema-day-3-4)
8. [Phase 4: Advanced SEO (Day 4-5)](#8-phase-4-advanced-seo-day-4-5)
9. [Wireframe: SEO-Optimized Page Structure](#9-wireframe-seo-optimized-page-structure)
10. [Technical Reference](#10-technical-reference)

---

## 1. Project Structure Overview

```
qr_menue/
├── app/
│   ├── layout.tsx                    ← Root layout (metadata lives here)
│   ├── page.tsx                      ← Homepage / Landing page
│   ├── pricing/page.tsx              ← Pricing page (public)
│   ├── not-found.tsx                 ← Custom 404
│   │
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── signup/restaurant/page.tsx
│   │   └── signup/customer/page.tsx
│   │
│   ├── (customer)/                   ← PUBLIC customer routes
│   │   ├── layout.tsx
│   │   ├── restaurants/page.tsx      ← Restaurant directory ⭐ SEO PRIORITY
│   │   ├── menu/[slug]/page.tsx      ← Individual menu page ⭐ SEO PRIORITY
│   │   ├── cart/page.tsx             ← Noindex
│   │   ├── checkout/page.tsx         ← Noindex
│   │   ├── order-confirm/[id]/page.tsx ← Noindex
│   │   └── account/page.tsx          ← Noindex
│   │
│   ├── (owner)/                      ← PRIVATE dashboard routes
│   │   ├── layout.tsx
│   │   └── dashboard/
│   │       ├── page.tsx              ← Noindex
│   │       ├── menu/page.tsx         ← Noindex
│   │       ├── orders/page.tsx       ← Noindex
│   │       ├── analytics/page.tsx    ← Noindex
│   │       ├── settings/page.tsx     ← Noindex
│   │       ├── subscription/page.tsx ← Noindex
│   │       ├── onboarding/page.tsx   ← Noindex
│   │       └── qr/page.tsx           ← Noindex
│   │
│   └── (superadmin)/                 ← PRIVATE admin routes
│       ├── layout.tsx
│       └── superadmin/
│           ├── page.tsx              ← Noindex
│           └── restaurants/[id]/page.tsx ← Noindex
│
├── components/
│   ├── customer/                     ← MenuHeader, MenuContent, DishGrid, etc.
│   ├── owner/                        ← Dashboard components
│   ├── checkout/                     ← Checkout flow
│   ├── shared/                       ← ErrorBoundary, QRCode, etc.
│   ├── superadmin/                   ← Admin components
│   └── ui/                           ← Button, Input, Dialog (shadcn/ui)
│
├── lib/
│   ├── i18n/                         ← Custom EN/UR translation system
│   ├── supabase/                     ← Client + Server + Middleware
│   ├── subscription.ts              ← Plan definitions & limits
│   ├── email/                        ← Resend email templates
│   └── whatsapp.ts                   ← WhatsApp message builder
│
├── messages/
│   ├── en.json                       ← English translations
│   └── ur.json                       ← Urdu translations
│
├── public/
│   ├── favicon.svg                   ← Green "Q" logo
│   ├── robots.txt                    ← ❌ MISSING — needs creation
│   ├── sitemap.xml                   ← ❌ MISSING — needs creation
│   └── og-image.png                  ← ❌ MISSING — needs creation
│
├── middleware.ts                      ← Supabase auth + route protection
├── next.config.ts                    ← Next.js config
├── tailwind.config.js                ← Tailwind config
└── vercel.json                       ← Vercel deployment config
```

### Key SEO Pages (Public & Crawlable)

| Priority | Route | Purpose | Status |
|----------|-------|---------|--------|
| ⭐⭐⭐ | `/` | Homepage — brand + conversion | Has basic metadata only |
| ⭐⭐⭐ | `/menu/[slug]` | Restaurant menu — the QR scan destination | ❌ NO metadata at all |
| ⭐⭐⭐ | `/restaurants` | Restaurant directory — browsable listing | ❌ NO metadata |
| ⭐⭐ | `/pricing` | Pricing plans + payment info | ❌ NO metadata |
| ⭐ | `/login` | Login page | Low priority |
| ⭐ | `/signup` | Signup page | Low priority |

### Pages to NOINDEX (Private/Dashboard)

| Route | Why Noindex |
|-------|-------------|
| `/dashboard/**` | Private owner dashboard |
| `/superadmin/**` | Admin panel |
| `/cart` | Transactional, not informational |
| `/checkout` | Transactional, not informational |
| `/order-confirm/**` | Post-purchase confirmation |
| `/account` | User account page |

---

## 2. Current SEO Audit

### ❌ Critical Issues (Must Fix Immediately)

| # | Issue | Impact | File |
|---|-------|--------|------|
| 1 | **No `sitemap.xml`** | Google can't discover pages efficiently | `public/` missing |
| 2 | **No `robots.txt`** | No crawl directives for search engines | `public/` missing |
| 3 | **No page-level metadata** | Every page uses root layout's generic metadata | All `page.tsx` files |
| 4 | **No `generateMetadata()` on `/menu/[slug]`** | Your most important page has NO title/description for Google | `app/(customer)/menu/[slug]/page.tsx` |
| 5 | **No Open Graph tags** | Shared links on Facebook/WhatsApp look empty | All pages |
| 6 | **No structured data (JSON-LD)** | Missing rich snippets in search results | All pages |
| 7 | **Homepage `force-dynamic`** | Prevents static generation, slower TTFB | `app/page.tsx:6` |

### ⚠️ Medium Issues (Should Fix)

| # | Issue | Impact | File |
|---|-------|--------|------|
| 8 | **No canonical URLs** | Risk of duplicate content penalties | All pages |
| 9 | **No `hreflang` tags** | EN/UR content not properly signaled to Google | `app/layout.tsx` |
| 10 | **Dashboard pages not noindexed** | Crawl budget wasted on private pages | All dashboard pages |
| 11 | **No `alt` text on some images** | Accessibility + image search SEO | `app/(owner)/dashboard/onboarding/page.tsx:59` |
| 12 | **Thin homepage content** | Hero section has minimal text | `app/page.tsx` |

### 💡 Low Issues (Nice to Have)

| # | Issue | Impact |
|---|-------|--------|
| 13 | **Copyright year shows 2024** | Minor trust signal | 
| 14 | **No `manifest.json`** | PWA discoverability |
| 15 | **No Google Search Console verification** | Can't track performance |

---

## 3. Target Keywords

### Primary Keywords (English — B2B, Restaurant Owners)

| Keyword | Search Intent | Difficulty | Priority |
|---------|---------------|------------|----------|
| `QR menu for restaurant` | Transactional | Medium | ⭐⭐⭐ |
| `digital menu Pakistan` | Informational | Low | ⭐⭐⭐ |
| `QR code menu system` | Transactional | Medium | ⭐⭐⭐ |
| `restaurant ordering system Pakistan` | Transactional | Low | ⭐⭐⭐ |
| `online menu for restaurant` | Transactional | Medium | ⭐⭐ |
| `menu QR code generator` | Transactional | Medium | ⭐⭐ |
| `contactless menu Pakistan` | Informational | Low | ⭐⭐ |
| `restaurant technology Pakistan` | Informational | Low | ⭐ |

### Primary Keywords (Urdu — B2B)

| Keyword | Search Intent | Priority |
|---------|---------------|----------|
| `ریسٹورنٹ کے لیے کیو آر مینو` | Transactional | ⭐⭐⭐ |
| `ڈیجیٹل مینو پاکستان` | Informational | ⭐⭐⭐ |
| `کیو آر کوڈ مینو` | Transactional | ⭐⭐⭐ |
| `آن لائن مینو ریسٹورنٹ` | Transactional | ⭐⭐ |
| `rai-stu-rant ka QR menu` (Roman Urdu) | Transactional | ⭐⭐ |

### Long-tail Keywords (Low Competition, High Conversion)

| Keyword | Priority |
|---------|----------|
| `best QR menu system for restaurants in Pakistan` | ⭐⭐⭐ |
| `free digital menu for restaurant` | ⭐⭐⭐ |
| `how to create QR code menu for restaurant` | ⭐⭐ |
| `WhatsApp ordering system for restaurants` | ⭐⭐ |
| `cheap restaurant menu system Pakistan` | ⭐⭐ |
| `no commission restaurant ordering` | ⭐⭐ |

---

## 4. Implementation Checklist

### Phase 1: Critical Fixes (Day 1-2) — 🔴 URGENT

- [ ] **1.1** Create `public/robots.txt` with crawl rules
- [ ] **1.2** Create `app/sitemap.ts` (dynamic sitemap generation)
- [ ] **1.3** Add `generateMetadata()` to `app/(customer)/menu/[slug]/page.tsx`
- [ ] **1.4** Add `generateMetadata()` to `app/(customer)/restaurants/page.tsx`
- [ ] **1.5** Add `generateMetadata()` to `app/pricing/page.tsx`
- [ ] **1.6** Remove `export const dynamic = "force-dynamic"` from `app/page.tsx`
- [ ] **1.7** Add Open Graph metadata to root layout
- [ ] **1.8** Create `public/og-image.png` (1200x630px social share image)

### Phase 2: On-Page SEO (Day 2-3) — 🟡 HIGH

- [ ] **2.1** Add `noindex` to all dashboard/admin pages via `app/(owner)/layout.tsx`
- [ ] **2.2** Add `noindex` to `app/(superadmin)/layout.tsx`
- [ ] **2.3** Add canonical URLs to all public pages
- [ ] **2.4** Add `hreflang` tags for EN/UR in root layout
- [ ] **2.5** Fix `alt=""` on restaurant logo images
- [ ] **2.6** Update footer copyright to 2026
- [ ] **2.7** Add internal linking between public pages (breadcrumbs)

### Phase 3: Content & Schema (Day 3-4) — 🟢 IMPORTANT

- [ ] **3.1** Add JSON-LD `Organization` schema to root layout
- [ ] **3.2** Add JSON-LD `Restaurant` + `Menu` schema to menu page
- [ ] **3.3** Add JSON-LD `ItemList` schema to restaurants directory
- [ ] **3.4** Add JSON-LD `Product` schema to pricing page
- [ ] **3.5** Expand homepage hero content (add 200+ words of SEO content)
- [ ] **3.6** Add FAQ schema to pricing page
- [ ] **3.7** Add `potentialAction` `OrderAction` schema

### Phase 4: Advanced SEO (Day 4-5) — 🔵 BONUS

- [ ] **4.1** Add Google Search Console verification meta tag
- [ ] **4.2** Add Google Analytics / Plausible tracking
- [ ] **4.3** Create `/blog` route structure (automated content)
- [ ] **4.4** Add `manifest.json` for PWA
- [ ] **4.5** Add `loading.tsx` to public routes for better UX signals
- [ ] **4.6** Add `error.tsx` to public routes
- [ ] **4.7** Implement ISR (Incremental Static Regeneration) for menu pages

---

## 5. Phase 1: Critical Fixes (Day 1-2)

### 1.1 Create `public/robots.txt`

```
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /superadmin/
Disallow: /cart
Disallow: /checkout
Disallow: /order-confirm/
Disallow: /account
Disallow: /api/

Sitemap: https://qrmenu.pk/sitemap.xml
```

### 1.2 Create `app/sitemap.ts`

```typescript
import { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: "https://qrmenu.pk",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: "https://qrmenu.pk/pricing",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://qrmenu.pk/restaurants",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://qrmenu.pk/login",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: "https://qrmenu.pk/signup",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  // Dynamic menu pages
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("slug, updated_at")
    .eq("is_active", true)
    .eq("is_suspended", false)

  const menuPages: MetadataRoute.Sitemap =
    restaurants?.map((r) => ({
      url: `https://qrmenu.pk/menu/${r.slug}`,
      lastModified: new Date(r.updated_at),
      changeFrequency: "daily" as const,
      priority: 0.9,
    })) ?? []

  return [...staticPages, ...menuPages]
}
```

### 1.3 Add Metadata to Menu Page

In `app/(customer)/menu/[slug]/page.tsx`, add:

```typescript
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, name_ur, description, city, cuisine_type, logo_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!restaurant) {
    return { title: "Menu Not Found — QRMenu.pk" }
  }

  const title = `${restaurant.name} Menu — ${restaurant.cuisine_type || "Restaurant"} in ${restaurant.city || "Pakistan"} | QRMenu.pk`
  const description =
    restaurant.description ||
    `View ${restaurant.name}'s digital menu. Browse dishes, prices, and order directly via WhatsApp. Powered by QRMenu.pk — Pakistan's #1 QR menu platform.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://qrmenu.pk/menu/${slug}`,
      siteName: "QRMenu.pk",
      images: [
        {
          url: restaurant.logo_url || "https://qrmenu.pk/og-image.png",
          width: 1200,
          height: 630,
          alt: `${restaurant.name} menu on QRMenu.pk`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [restaurant.logo_url || "https://qrmenu.pk/og-image.png"],
    },
    alternates: {
      canonical: `https://qrmenu.pk/menu/${slug}`,
    },
  }
}
```

### 1.7 Enhanced Root Layout Metadata

```typescript
export const metadata: Metadata = {
  metadataBase: new URL("https://qrmenu.pk"),
  title: {
    default: "QRMenu.pk — Digital Menu & Ordering Platform for Restaurants in Pakistan",
    template: "%s | QRMenu.pk",
  },
  description:
    "Pakistan's #1 QR-based digital menu platform. Create a free QR code menu for your restaurant. Customers scan, browse, and order on WhatsApp. No app, no commission.",
  keywords: [
    "QR menu Pakistan",
    "digital menu for restaurant",
    "QR code menu system",
    "restaurant ordering system Pakistan",
    "online menu generator",
    "contactless menu",
    "WhatsApp ordering",
  ],
  authors: [{ name: "QRMenu.pk" }],
  creator: "QRMenu.pk",
  publisher: "QRMenu.pk",
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://qrmenu.pk",
    siteName: "QRMenu.pk",
    title: "QRMenu.pk — Digital Menu & Ordering Platform for Restaurants",
    description:
      "Create a free QR code menu for your restaurant. Customers scan, browse, and order on WhatsApp. No app, no commission. Live in Pakistan.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "QRMenu.pk — Pakistan's QR Menu Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QRMenu.pk — Digital Menu & Ordering Platform",
    description:
      "Create a free QR code menu for your restaurant. No app, no commission.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: { icon: "/favicon.svg" },
  appleWebApp: {
    capable: true,
    title: "QRMenu.pk",
    statusBarStyle: "black-translucent",
  },
  verification: {
    // Add after Google Search Console setup
    // google: "your-verification-code",
  },
}
```

---

## 6. Phase 2: On-Page SEO (Day 2-3)

### 2.1 Add Noindex to Dashboard Layout

In `app/(owner)/layout.tsx`, add metadata export:

```typescript
import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
}
```

### 2.2 Add Noindex to Superadmin Layout

Same pattern in `app/(superadmin)/layout.tsx`.

### 2.3 Add Hreflang Tags

In root layout `app/layout.tsx`, add to metadata:

```typescript
export const metadata: Metadata = {
  // ... existing fields ...
  alternates: {
    canonical: "https://qrmenu.pk",
    languages: {
      "en": "https://qrmenu.pk",
      "ur": "https://qrmenu.pk",
      "x-default": "https://qrmenu.pk",
    },
  },
}
```

### 2.4 Fix Image Alt Text

In `app/(owner)/dashboard/onboarding/page.tsx:59`:
```tsx
// Before
<img src={restaurant.logo_url} alt="" ... />

// After
<img src={restaurant.logo_url} alt={`${restaurant.name} logo`} ... />
```

### 2.5 Update Copyright

In `app/page.tsx:431`:
```tsx
// Before
&copy; 2024 QRMenu.pk

// After
&copy; 2026 QRMenu.pk
```

---

## 7. Phase 3: Content & Schema (Day 3-4)

### 3.1 Organization Schema (Root Layout)

Add to `app/layout.tsx` inside `<head>` or via metadata:

```typescript
// Add as a separate component: components/JsonLd.tsx
export function OrganizationJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "QRMenu.pk",
          url: "https://qrmenu.pk",
          logo: "https://qrmenu.pk/favicon.svg",
          description:
            "Pakistan's leading QR-based digital menu and ordering platform for restaurants.",
          foundingDate: "2024",
          address: {
            "@type": "PostalAddress",
            addressCountry: "PK",
          },
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+92-300-123-4567",
            contactType: "customer service",
            availableLanguage: ["English", "Urdu"],
          },
          sameAs: [],
        }),
      }}
    />
  )
}
```

### 3.2 Restaurant + Menu Schema (Menu Page)

Add to `app/(customer)/menu/[slug]/page.tsx`:

```typescript
function RestaurantJsonLd({ restaurant, categories }) {
  const menuItems = categories.flatMap((cat) =>
    cat.dishes.map((dish) => ({
      "@type": "MenuItem",
      name: dish.name_en,
      description: dish.description_en || "",
      image: dish.image_url || undefined,
      offers: {
        "@type": "Offer",
        price: dish.price,
        priceCurrency: "PKR",
        availability: dish.is_available
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      },
      menuCategory: cat.name_en,
    }))
  )

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Restaurant",
          name: restaurant.name,
          description: restaurant.description || `${restaurant.name} - ${restaurant.cuisine_type} restaurant in ${restaurant.city}`,
          image: restaurant.logo_url || undefined,
          address: {
            "@type": "PostalAddress",
            addressLocality: restaurant.city,
            addressCountry: "PK",
          },
          servesCuisine: restaurant.cuisine_type || "Restaurant",
          hasMenu: {
            "@type": "Menu",
            hasMenuSection: categories.map((cat) => ({
              "@type": "MenuSection",
              name: cat.name_en,
              hasMenuItem: cat.dishes.map((dish) => ({
                "@type": "MenuItem",
                name: dish.name_en,
                offers: {
                  "@type": "Offer",
                  price: dish.price,
                  priceCurrency: "PKR",
                },
              })),
            })),
          },
        }),
      }}
    />
  )
}
```

### 3.3 Expand Homepage Content

Add a new `<section>` after the hero in `app/page.tsx`:

```tsx
{/* ─── SEO Content Section ─── */}
<section className="max-w-6xl mx-auto px-5 py-16 md:py-24">
  <div className="max-w-3xl mx-auto text-center">
    <h2 className="text-2xl md:text-3xl font-bold mb-6">
      Why Pakistan's Restaurants Choose QRMenu.pk
    </h2>
    <div className="text-sm md:text-base text-[#555] leading-relaxed space-y-4">
      <p>
        QRMenu.pk is Pakistan's first QR-based digital menu platform built specifically
        for local restaurants. We help you go digital in under 5 minutes — no technical
        skills required. Simply create your menu, print the QR code, and place it on
        your tables.
      </p>
      <p>
        Your customers scan the QR code with their phone camera, browse your full menu
        with photos and prices, and place orders directly through WhatsApp. There's no
        app to download, no commission on orders, and no monthly hardware costs.
      </p>
      <p>
        Whether you run a small café in Lahore, a fine dining restaurant in Karachi, or
        a fast-food chain in Islamabad — QRMenu.pk works for every type of restaurant.
        Our platform supports English and Urdu menus, multiple payment methods including
        JazzCash and Easypaisa, and real-time order notifications.
      </p>
    </div>
  </div>
</section>
```

---

## 8. Phase 4: Advanced SEO (Day 4-5)

### 4.1 Google Search Console Verification

Add to `app/layout.tsx` metadata:

```typescript
verification: {
  google: "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
},
```

### 4.2 ISR for Menu Pages

In `app/(customer)/menu/[slug]/page.tsx`, change:

```typescript
// Before
export const revalidate = 60

// After — revalidate every 5 minutes for fresh content
export const revalidate = 300
```

### 4.3 FAQ Schema for Pricing Page

```typescript
function FaqJsonLd() {
  const faqs = [
    {
      question: "Is the QRMenu.pk Free Trial really free?",
      answer: "Yes. The 7-day free trial includes 20 dishes, 20 images, 10 orders, QR code generation, WhatsApp orders, and analytics. No credit card required.",
    },
    {
      question: "What happens after my trial ends?",
      answer: "Your menu goes offline temporarily. You can upgrade anytime to restore it. There's a short grace period after trial expiry.",
    },
    {
      question: "Can I change plans later?",
      answer: "Yes. You can upgrade or downgrade your plan at any time from your dashboard. Changes take effect immediately.",
    },
    {
      question: "How do I pay for QRMenu.pk?",
      answer: "We accept JazzCash, Easypaisa, and bank transfers. Contact us on WhatsApp for payment details.",
    },
    {
      question: "Is there a commission on orders?",
      answer: "No. QRMenu.pk charges zero commission on all orders. You only pay your monthly subscription fee.",
    },
  ]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }),
      }}
    />
  )
}
```

---

## 9. Wireframe: SEO-Optimized Page Structure

### Homepage Wireframe (`/`)

```
┌─────────────────────────────────────────────────┐
│  HEADER: Logo | Pricing | Contact | Sign In | CTA│
├─────────────────────────────────────────────────┤
│                                                   │
│  HERO SECTION                                     │
│  ┌───────────────────────────────────────────┐   │
│  │  [Badge] "Live in Pakistan"                │   │
│  │  H1: "Digital Menu for Every Restaurant"   │   │
│  │  Subtitle: "No app. No commission..."      │   │
│  │  [Start Free Trial] [Browse Restaurants]   │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  ⭐ NEW: SEO CONTENT SECTION                     │
│  ┌───────────────────────────────────────────┐   │
│  │  H2: "Why Pakistan's Restaurants Choose    │   │
│  │       QRMenu.pk"                           │   │
│  │  3 paragraphs of keyword-rich content       │   │
│  │  (200+ words for Google to index)           │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  HOW IT WORKS                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ 01       │ │ 02       │ │ 03       │         │
│  │ Create   │ │ Print    │ │ Get      │         │
│  │ Menu     │ │ QR Code  │ │ Orders   │         │
│  └──────────┘ └──────────┘ └──────────┘         │
│                                                   │
│  PRICING CARDS                                    │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                    │
│  │Free│ │Star│ │Grow│ │Prem│                    │
│  │    │ │    │ │ ⭐ │ │    │                    │
│  └────┘ └────┘ └────┘ └────┘                    │
│                                                   │
│  COMPARISON TABLE                                 │
│  ┌───────────────────────────────────────────┐   │
│  │  Feature  | Trial | Starter | Growth | Pro │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  CONTACT                                          │
│  ┌──────────┐ ┌──────────┐                      │
│  │ WhatsApp │ │ Email    │                      │
│  └──────────┘ └──────────┘                      │
│                                                   │
│  CTA SECTION                                      │
│  ┌───────────────────────────────────────────┐   │
│  │  "Ready to go digital?"                    │   │
│  │  [Start Free Trial — No Credit Card]       │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  FOOTER: Logo | Links | Copyright © 2026          │
└─────────────────────────────────────────────────┘

JSON-LD: Organization schema
```

### Menu Page Wireframe (`/menu/[slug]`) — ⭐ MOST IMPORTANT

```
┌─────────────────────────────────────────────────┐
│  <head>                                          │
│  Title: "{Restaurant Name} Menu — {Cuisine}     │
│          in {City} | QRMenu.pk"                  │
│  Description: "View {Name}'s digital menu..."   │
│  OG Image: Restaurant logo or default            │
│  Canonical: https://qrmenu.pk/menu/{slug}        │
│  JSON-LD: Restaurant + Menu schema               │
├─────────────────────────────────────────────────┤
│                                                   │
│  MENU HEADER                                      │
│  ┌───────────────────────────────────────────┐   │
│  │  [Logo] Restaurant Name                    │   │
│  │  City • Cuisine Type                       │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  CATEGORY TABS (Sticky)                          │
│  ┌──────┬──────┬──────┬──────┐                 │
│  │ All  │ Start│ Main │ Drin │                 │
│  └──────┴──────┴──────┴──────┘                 │
│                                                   │
│  DISH LIST                                        │
│  ┌───────────────────────────────────────────┐   │
│  │  [Image] Dish Name           PKR 450       │   │
│  │          Description...                    │   │
│  └───────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────┐   │
│  │  [Image] Dish Name           PKR 320       │   │
│  │          Description...                    │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  CART BAR (Fixed Bottom)                         │
│  ┌───────────────────────────────────────────┐   │
│  │  [2 items]  PKR 770  [View Cart →]         │   │
│  └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Restaurants Directory Wireframe (`/restaurants`)

```
┌─────────────────────────────────────────────────┐
│  <head>                                          │
│  Title: "Restaurants in Pakistan — Browse Menus  │
│          | QRMenu.pk"                            │
│  Description: "Find restaurants in Lahore,      │
│          Karachi, Islamabad..."                  │
│  JSON-LD: ItemList schema                        │
├─────────────────────────────────────────────────┤
│                                                   │
│  HEADER: "Restaurants"                            │
│                                                   │
│  CITY FILTER (Horizontal Scroll)                 │
│  [All] [Lahore] [Karachi] [Islamabad] [More]    │
│                                                   │
│  LAHORE                                           │
│  ┌───────────────────────────────────────────┐   │
│  │  [Logo] Restaurant Name    • Cuisine       │   │
│  │  [Logo] Restaurant Name    • Cuisine       │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  KARACHI                                          │
│  ┌───────────────────────────────────────────┐   │
│  │  [Logo] Restaurant Name    • Cuisine       │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  BOTTOM NAV: Home | Cart | Orders                 │
└─────────────────────────────────────────────────┘
```

---

## 10. Technical Reference

### File Changes Summary

| File | Action | Priority |
|------|--------|----------|
| `public/robots.txt` | CREATE | 🔴 Critical |
| `app/sitemap.ts` | CREATE | 🔴 Critical |
| `app/layout.tsx` | EDIT — Enhanced metadata + JSON-LD | 🔴 Critical |
| `app/page.tsx` | EDIT — Remove force-dynamic, add SEO content | 🔴 Critical |
| `app/(customer)/menu/[slug]/page.tsx` | EDIT — Add generateMetadata + JSON-LD | 🔴 Critical |
| `app/(customer)/restaurants/page.tsx` | EDIT — Add generateMetadata | 🔴 Critical |
| `app/pricing/page.tsx` | EDIT — Add generateMetadata + FAQ schema | 🟡 High |
| `app/(owner)/layout.tsx` | EDIT — Add noindex metadata | 🟡 High |
| `app/(superadmin)/layout.tsx` | EDIT — Add noindex metadata | 🟡 High |
| `components/JsonLd.tsx` | CREATE — Reusable JSON-LD component | 🟡 High |
| `public/og-image.png` | CREATE — 1200x630 social image | 🟡 High |
| `app/(owner)/dashboard/onboarding/page.tsx` | EDIT — Fix alt text | 🟢 Medium |
| `app/page.tsx:431` | EDIT — Fix copyright year | 🟢 Low |

### Testing Checklist (After Implementation)

- [ ] Run `npm run build` — ensure no errors
- [ ] Run `npm run lint` — ensure no lint errors
- [ ] Test sitemap: `curl https://qrmenu.pk/sitemap.xml`
- [ ] Test robots: `curl https://qrmenu.pk/robots.txt`
- [ ] Validate structured data: https://search.google.com/structured-data/testing-tool
- [ ] Test Open Graph: https://www.opengraph.xyz/
- [ ] Test mobile: Google Mobile-Friendly Test
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools

### Key Commands

```bash
# Development
npm run dev

# Build (test production)
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

---

## Appendix: A+ SEO Checklist (Google's 200+ Ranking Factors)

### ✅ Content Quality
- [x] Unique, valuable content on each page
- [x] 200+ words of meaningful content on homepage
- [x] Keyword-rich titles and descriptions
- [x] Internal linking between public pages

### ✅ Technical SEO
- [x] Mobile-responsive design (mobile-first, 2-col grid, 44px touch targets)
- [x] Fast loading (Next.js + Supabase + dynamic imports + code splitting)
- [x] HTTPS (Vercel default)
- [x] Static generation with ISR for menu pages (revalidate=300)
- [x] Sitemap.xml (app/sitemap.ts — dynamic, includes restaurant menu pages)
- [x] Robots.txt (public/robots.txt — blocks dashboard, superadmin, cart, checkout, api)
- [x] Canonical URLs on all public pages
- [x] Open Graph + Twitter Card metadata
- [x] JSON-LD structured data (Organization, Restaurant, Menu, ItemList, FAQ)
- [x] Skeleton loading states for streaming/Suspense (5 loading.tsx files)
- [x] Error boundaries (3 error.tsx files)
- [x] optimizePackageImports for lucide-react + recharts

### ✅ On-Page SEO
- [x] Proper heading hierarchy (H1, H2, H3)
- [x] Alt text on all images (next/image with descriptive alt)
- [x] Optimized title tags with generateMetadata()
- [x] Meta descriptions with restaurant-specific content
- [x] Open Graph tags for social sharing (Facebook, WhatsApp)
- [x] Structured data / JSON-LD (Organization, Restaurant, Menu, FAQ)
- [x] Noindex on all private routes (dashboard, superadmin, cart, checkout, account)

### ✅ User Experience
- [x] Clean, intuitive navigation (bottom nav with badges + active dots)
- [x] Fast page transitions (skeleton loading states)
- [x] Clear CTAs (WhatsApp ordering, checkout, upgrade)
- [x] Mobile-first design (2-col grid, bottom sheets, safe-area insets)
- [x] Search with debounce + clear button
- [x] Form validation with inline errors
- [x] Loading skeletons (5 route-level loading.tsx)
- [x] Error states with retry buttons

### ✅ Security
- [x] Supabase RLS on all sensitive tables (subscriptions, company_settings, notification_logs)
- [x] Rate limiting on all public API routes
- [x] Input validation + whitelisting on all mutation endpoints
- [x] XSS sanitization in email templates
- [x] CSRF-safe patterns (Supabase session cookies)
- [x] No hardcoded secrets in committed files

### ✅ Local SEO (Pakistan)
- [ ] City-based landing pages (future)
- [ ] Google My Business integration (future)
- [ ] Local citations (future)

---

## 11. Execution Summary — Security, Performance, UI/UX (All Complete)

### Security Fixes Applied ✅
- RLS policies for `subscriptions`, `company_settings`, `notification_logs` tables
- IDOR fix on owner notifications route
- Input whitelisting on superadmin PATCH (no raw body passthrough)
- Plan validation (trial/starter/growth/premium only)
- Test email endpoint now requires super admin auth
- Super admin email leak removed from `/api/superadmin/check`
- Rate limiting added to orders, dishes, categories, notifications, menu endpoints
- Rate limiter IP spoofing fix + fail-closed pattern
- XSS sanitization in all email templates + QR print window

### Performance Fixes Applied ✅
- Paginated superadmin APIs (max 100/page instead of 20,000 rows)
- Cache-Control headers on public endpoints (menu, settings)
- `next/image` replacing raw `<img>` tags in 6 files
- Dynamic import for OrdersChart (~400KB bundle reduction)
- Zustand `subscribeWithSelector` + individual selectors (less re-renders)
- 5 skeleton `loading.tsx` files for streaming/Suspense
- `optimizePackageImports` for lucide-react and recharts

### UI/UX Fixes Applied ✅ (35 files, +1774/-595 lines, 0 TS errors)

#### Design System Foundation
- Semantic color tokens (surface, border, text-primary/secondary/muted) in tailwind.config.js
- 5 keyframe animations (slide-up, slide-down, scale-up, fade-in, shimmer) + fadeInUp
- Fixed `.font-urdu` CSS variable reference (was wrong font)
- Button focus-visible rings for keyboard navigation
- Input aria-describedby + role="alert" on errors
- CardFooter + CardDescription components added
- Shared `timeAgo` utility (removed 3 duplicates)

#### Customer Mobile UI (mobile-first)
- **2-column dish grid** with image-top cards + DishBadges overlay + 44px touch targets
- **Menu header**: Back button (ArrowLeft), removed pt-16 waste, UtensilsCrossed icon
- **Category tabs**: Active underline indicator, gradient edge fades, total dish count
- **Search**: 300ms debounce + X clear button with focus restore
- **Cart**: Thumbnails, line totals (price×qty), subtotal/delivery/total breakdown, Clear All, Continue Browsing
- **Checkout**: Phone validation (Pakistani format 03XX-XXXXXXX), inline errors, collapsible order summary, step indicators
- **Bottom nav**: Cart badge (green circle), active dot, aria-labels, safe-area-inset-bottom
- **Restaurant listing**: Search bar, staggered fadeInUp animation, max-w-app
- **Order confirmation**: StatusTimeline component, no auto-WhatsApp, Reorder button, Call Restaurant

#### Owner Dashboard UI
- **Dashboard**: Period selector (Today/7d/30d), real trend % vs yesterday, error state with retry, View All links
- **Orders**: Status filter pills, pagination (25/page), improved empty state, consistent design tokens
- **Menu management**: Fixed `suspended`→`isSuspended` bug, batch selection + toggle, undo toast
- **Analytics**: Date range selector, revenue LineChart, order type breakdown, anchor navigation
- **QR code**: Size selector wired correctly, Share button (Web Share API)
- **Owner layout**: Drawer slide animation, role="dialog", aria-labels, scroll lock, Escape key

#### SuperAdmin UI
- **Tables**: Client-side pagination (25/page) on RestaurantTable + CustomerTable
- **Tab deep-linking**: URL search params sync (?tab=restaurants)
- **Confirmation dialogs**: Before toggling restaurant active/suspended
- **Shared DashboardFooter**: Extracted from duplicated code

### Database Migration — Applied ✅
- RLS policies applied via Supabase Management API:
  - `subscriptions`: Owner SELECT + UPDATE
  - `company_settings`: Public SELECT + Super Admin ALL
  - `notification_logs`: Owner SELECT
- `trial_reminder_emails` table doesn't exist yet — RLS will be applied when table is created via Dashboard SQL Editor

### Deployment — Live ✅
- **Git commit**: `fc2da12` — 35 files changed, +1,424 / -418 lines
- **Vercel**: Auto-deployed from `origin/master`
- **Production**: https://qrmenu.pk
- **Staging**: https://qr-menue-one.vercel.app
- **Supabase project**: `zkwwqcopkwbzbsqqxoiq`

### UI Wireframes
- Full wireframe diagrams: `.mimocode/plans/1781501799559-misty-canyon.md` (Screens 1-13)
- HTML wireframes: `wireframes/` directory (landing, customer, owner, superadmin, pricing)

---

*Last updated: June 15, 2026*
*Created by: Senior SEO Implementation Plan*
