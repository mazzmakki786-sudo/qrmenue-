# QRMenu.pk — Project Documentation Index
**Version:** 1.0 | **Date:** May 30, 2026 | **Status:** Ready for Development

---

## PROJECT SUMMARY (1 Page)

### What We're Building
Pakistan ka pehla affordable QR-based digital menu + ordering platform.

**Core Flow:**
```
Restaurant signs up → Gets QR code → Prints it → Customer scans → 
Menu opens in browser → Adds to cart → Checkout → Login → 
WhatsApp redirect to restaurant → Order confirmed → Owner notified
```

### Tech Stack (Final)
| What | Technology | Cost |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Free |
| Database | Supabase (PostgreSQL) | Free |
| Auth | Supabase Auth (Google + Email) | Free |
| Hosting | Vercel | Free |
| Email | Resend | Free (3K/month) |
| WhatsApp | wa.me redirect (no API) | Free |
| Charts | Recharts | Free |
| UI | Tailwind + shadcn/ui | Free |
| QR | qrcode.react | Free |
| **TOTAL** | | **$0/month** |

### 3 Types of Users
1. **Customer** — Scans QR, browses menu, orders via WhatsApp
2. **Restaurant Owner** — Manages menu, sees orders + analytics, controls subscription
3. **Super Admin (You)** — Controls everything, manages all restaurants

### Revenue Model (Manual Billing)
| Plan | Price | Images |
|---|---|---|
| Free Trial | PKR 0 (7 days) | 4 dishes, first 3 days |
| Starter | PKR 800/mo | No images |
| Growth | PKR 1,800/mo | 50 images |
| Premium | PKR 2,500/mo | Unlimited |

Payment collected via JazzCash/Easypaisa (owner sends manually, you activate).

### Timeline
- **Weeks 1–2:** Setup + Auth + Design System
- **Weeks 3–6:** Core MVP (menu, orders, dashboard)
- **Weeks 7–8:** Super admin + Testing + Beta (5 restaurants)
- **Weeks 9–12:** Launch + Scale to 50 restaurants

---

## DOCUMENTS IN THIS PACKAGE

| File | Contents |
|---|---|
| `01_PRD_Product_Requirements.md` | Full product spec — features, user flows, acceptance criteria |
| `02_TRD_Technical_Requirements.md` | Tech stack, architecture, DB schema, APIs, code examples |
| `03_User_Stories_and_Flows.md` | All user stories, page map, error states |
| `04_Development_Roadmap_and_Setup.md` | Week-by-week tasks, setup guide, npm commands |
| `05_Design_System_UI_Specs.md` | Colors, fonts, spacing, screen wireframes |
| `00_INDEX.md` | This file |

---

## KEY DECISIONS LOG

| Decision | Choice | Reason |
|---|---|---|
| App vs Web | Web only (PWA) | No app install barrier, $0 cost, works on all devices |
| WhatsApp | wa.me redirect | WhatsApp Business API is paid, redirect is free |
| Payment gateway | Manual (bank/JazzCash) | Needs business registration — do manually first |
| Notifications | Email (Resend) | Free 3K/month, sufficient for MVP |
| DB | Supabase | Free tier, PostgreSQL, auth + storage built-in |
| Hosting | Vercel | Best for Next.js, free, global CDN |
| Menu layout | List-based | Fastest loading, most readable on mobile |
| Dark mode | NOT in MVP | Keep simple — light mode only |
| Native mobile app | NOT in MVP | PWA sufficient |
| Delivery tracking | NOT in MVP | Too complex |
| KDS | NOT in MVP | Owner uses phone |

---

## ROUTES MAP (Quick Reference)

```
PUBLIC ROUTES
/                          → Landing page
/pricing                   → Plans + payment details
/menu/[slug]               → Customer menu (QR destination)
/restaurants               → Nearby restaurants directory
/login                     → Login
/signup                    → Customer signup
/signup/restaurant         → Restaurant owner signup

CUSTOMER ROUTES
/cart                      → Cart review
/checkout                  → Order form
/order-confirm/[id]        → Confirmation
/account                   → Order history

OWNER ROUTES (protected)
/dashboard                 → Stats + graph
/dashboard/menu            → Menu management
/dashboard/orders          → Orders list
/dashboard/analytics       → Detailed analytics
/dashboard/settings        → Restaurant settings + QR
/dashboard/subscription    → Plan + billing

SUPER ADMIN ROUTES (protected, your email only)
/superadmin                → All restaurants
/superadmin/restaurants/[id] → Edit restaurant
/superadmin/settings       → Company payment details
```

---

## ENVIRONMENT VARIABLES NEEDED

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
SUPER_ADMIN_EMAIL=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=QRMenu.pk
```

---

## QUICK START COMMANDS

```bash
# Create project
npx create-next-app@latest qrmenu --typescript --tailwind --eslint --app

# Install deps
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr zustand react-hook-form @hookform/resolvers zod recharts lucide-react qrcode.react resend next-intl class-variance-authority clsx tailwind-merge

# shadcn/ui
npx shadcn-ui@latest init

# Run dev
npm run dev
```

---

*All documents created May 30, 2026. Ready to start development.*
