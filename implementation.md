# QRMenu.pk — Implementation Guide

**Stack:** Next.js 14 App Router + Supabase + Vercel
**Budget:** $0/month (free tiers only)
**Target Launch:** August 2026

---

## TECH STACK

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 14.2+ |
| Styling | Tailwind CSS | 3.4+ |
| UI Components | shadcn/ui (Radix) | Latest |
| State Management | Zustand | 4.5+ |
| Forms | React Hook Form + Zod | 7.51+ / 3.22+ |
| Charts | Recharts | 2.12+ |
| QR Generation | qrcode.react | 3.1+ |
| Internationalization | next-intl | 3.9+ |
| Database | Supabase (PostgreSQL) | Latest |
| Authentication | Supabase Auth (Google + Email) | Built-in |
| File Storage | Supabase Storage | Free tier |
| Email | Resend | Free (3,000/mo) |
| Hosting | Vercel | Free hobby |
| WhatsApp | wa.me redirect (free) | Unlimited |

---

## PROJECT STRUCTURE

```
qrmenu/
├── app/
│   ├── (customer)/       → Menu, Cart, Checkout, Confirm, Restaurants, Account
│   ├── (auth)/           → Login, Signup, Signup/Restaurant
│   ├── (owner)/          → Dashboard/* (home, menu, orders, analytics, settings, subscription)
│   ├── (superadmin)/     → Superadmin/* (list, detail, settings)
│   ├── pricing/          → Public pricing page
│   ├── api/              → API routes (orders, menu, admin, superadmin, notifications)
│   ├── layout.tsx        → Root layout
│   └── globals.css       → Global styles
├── components/
│   ├── ui/               → Button, Card, Dialog, Tabs, Badge, Input
│   ├── customer/         → MenuHeader, CategoryTabs, DishList, DishItem, CartBar, CartDrawer
│   ├── checkout/         → OrderTypeSelector, DineInForm, TakeawayForm, DeliveryForm, WhatsAppRedirect
│   ├── owner/            → DashboardStats, OrdersChart, RecentOrders, BellNotification, DishCard, AddDishForm
│   ├── superadmin/       → RestaurantTable, PlanEditor
│   └── shared/           → LanguageToggle, QRCodeDisplay, SubscriptionBanner
├── lib/
│   ├── supabase/         → client.ts, server.ts, middleware.ts
│   ├── resend.ts         → Email helper
│   ├── whatsapp.ts       → WhatsApp URL builder
│   ├── subscription.ts   → Trial/plan logic
│   ├── qr.ts             → QR helpers
│   └── utils.ts          → General helpers
├── stores/               → cartStore.ts, orderStore.ts
├── types/                → index.ts
├── messages/             → en.json, ur.json
├── middleware.ts          → Route protection
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── postcss.config.js
├── .env.local
├── vercel.json
├── .opencode.json
├── package.json
├── todo.md
└── implementation.md
```

---

## DATABASE (8 Tables)

1. **restaurants** — Profiles, subscription, trial, status
2. **categories** — Menu categories per restaurant
3. **dishes** — Menu items with pricing, images, availability
4. **customers** — Extended profiles (links to auth.users)
5. **orders** — All orders with items (JSONB), customer info, status
6. **subscriptions** — Manual billing payment log
7. **company_settings** — Super admin editable payment details
8. **notification_logs** — Email notification audit trail

Plus: materialized view `daily_order_stats`, 3 triggers, 10 indexes, 6 RLS policies.

---

## API ROUTES (11)

| Route | Method | Purpose |
|-------|--------|---------|
| /api/menu/[slug] | GET | Public menu for restaurant |
| /api/orders | POST | Create new order |
| /api/orders/[id] | GET/PATCH | Get/update order |
| /api/notifications/email | POST | Send order email |
| /api/notifications/new-dish | POST | New dish alert |
| /api/admin/dishes | POST | Add dish |
| /api/admin/categories | POST | Add category |
| /api/admin/subscription | PATCH | Update subscription |
| /api/superadmin/restaurants | GET | All restaurants |
| /api/superadmin/restaurants/[id] | GET/PATCH | Edit restaurant |
| /api/superadmin/settings | GET/PATCH | Company settings |

---

## ENVIRONMENT VARIABLES

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
RESEND_API_KEY=re_xxxxxxxxxxxx
SUPER_ADMIN_EMAIL=admin@qrmenu.pk
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=QRMenu.pk
```

---

## THIRD-PARTY SERVICES

| Service | What For | Free Tier Limit | Setup Required |
|---------|----------|----------------|----------------|
| Supabase | Database, Auth, Storage, Realtime | 500MB DB, 1GB Storage, 50K MAU | Create project, run SQL, enable providers |
| Google Cloud | Google OAuth credentials | Unlimited | Create OAuth 2.0 Web Client ID |
| Resend | Transactional emails | 3,000 emails/month | Create account, get API key |
| Vercel | Hosting + CDN | 100GB bandwidth | Connect GitHub repo, deploy |
| WhatsApp | Order redirect (wa.me) | Unlimited | No setup needed |
| GitHub | Source control | Unlimited | Create repo, push code |

---

## KEY CONSTRAINTS (Out of MVP Scope)

- No Kitchen Display System (KDS)
- No real-time delivery tracking
- No dark mode
- No native mobile app
- No automated payment gateway
- No SMS notifications
