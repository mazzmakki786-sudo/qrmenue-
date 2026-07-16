# Site Architecture — Digital QR Menue

**Site:** https://www.digitalmenue.com  
**Generated:** 2026-07-16  
**Total URLs in Sitemap:** ~16 (without menu pages) / ~25 (with menu pages)

---

## Site Map

```
https://www.digitalmenue.com/
├── Public Pages
│   ├── /                          Landing page
│   ├── /pricing                   Pricing & plans
│   ├── /restaurants               Restaurant listings (browse)
│   ├── /faq                       Frequently asked questions
│   ├── /contact                   Contact form
│   ├── /privacy                   Privacy policy
│   ├── /terms                     Terms of service
│   └── /signup/restaurant         Restaurant owner signup (conversion)
│
├── Blog
│   ├── /blog                      Blog index
│   └── /blog/{slug}               5 blog articles
│       ├── create-qr-code-menu-restaurant-pakistan
│       ├── whatsapp-ordering-restaurant-pakistan-guide
│       ├── foodpanda-commission-vs-direct-ordering-pakistan
│       ├── benefits-qr-code-menu-pakistani-restaurants
│       └── restaurant-marketing-lahore-guide
│
├── Restaurant Menu Pages (auth optional — indexed if flag is off)
│   └── /menu/{slug}               Per-restaurant menu (9 active restaurants)
│
├── Auth Pages (excluded — behind auth)
│   ├── /login                     Customer + restaurant login
│   ├── /login/customer            Customer login
│   ├── /signup/customer           Customer signup
│   └── /signup                    Redirects to /signup/restaurant
│
├── Customer Pages (excluded — behind auth or noindex)
│   ├── /cart                      Shopping cart
│   ├── /checkout                  Checkout
│   ├── /order-confirm/{id}        Order confirmation
│   ├── /account                   User account / order history
│   ├── /favorites                 Saved favorites
│   └── /restaurant/{slug}         Redirects to /menu/{slug}
│
└── Protected (excluded — noindex, behind auth)
    └── /dashboard/*               Owner dashboard (settings, menu, orders, etc.)
    └── /superadmin/*              Super admin panel
    └── /api/*                     API routes
```

---

## URL Organization by Type

| Type | Count | Pattern | Indexable |
|------|-------|---------|-----------|
| Static pages | 9 | `/` or `/{page}` | ✅ Yes |
| Blog articles | 5 | `/blog/{slug}` | ✅ Yes |
| Restaurant menus | 0–9 | `/menu/{slug}` | ✅ Configurable |
| Auth | 4 | `/login/*`, `/signup/*` | ❌ No |
| Customer | 6 | `/cart`, `/checkout`, etc. | ❌ No |
| Protected | 10+ | `/dashboard/*` | ❌ No |

---

## Route Groups (App Router)

```
app/(auth)/              # Login/signup — centered card layout
app/(customer)/          # Customer-facing — nav, footer, mobile bottom nav
app/(owner)/dashboard/   # Owner admin — sidebar, noindex
app/(superadmin)/        # Super admin — noindex
app/                     # Public pages — landing header + footer
```

---

## Sitemap Generation

- **File:** `app/sitemap.ts` — dynamic Next.js sitemap (API-driven)
- **Robots:** `app/robots.ts` — references `sitemap.xml`
- **Constant source:** `lib/blog-articles.ts` — shared slugs + public route list

### Conditional Indexing

Menu pages (`/menu/{slug}`) are controlled by:
```
NEXT_PUBLIC_NOINDEX_MENU_PAGES=true  # excludes menu pages from sitemap + noindex
```
Currently set to `true` in `.env.production` — menu pages are **not** indexed.

---

## Categorization for Future Sitemap Index

If the site grows beyond 50k URLs, split into a sitemap index:

```
sitemap.xml (index)
├── sitemap-static.xml     — Landing, pricing, restaurants, FAQ, contact, etc.
├── sitemap-blog.xml       — Blog articles
├── sitemap-menus.xml      — Restaurant menu pages (largest group)
└── sitemap-restaurants.xml — Restaurant detail pages (if added)
```
