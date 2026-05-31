# Development Roadmap & Setup Guide
## QRMenu.pk
**Version:** 1.0 | **Target Launch:** August 2026 | **Timeline:** 12 Weeks

---

## 1. WEEK-BY-WEEK ROADMAP

### PHASE 1 — SETUP & FOUNDATION (Weeks 1–2)

#### Week 1: Project Setup
| Task | Details | Done? |
|---|---|---|
| Create Next.js 14 project | `npx create-next-app@latest qrmenu --typescript --tailwind --eslint --app` | ☐ |
| Set up Supabase project | supabase.com → New Project → copy keys | ☐ |
| Configure environment variables | `.env.local` with Supabase URL + keys | ☐ |
| Set up Supabase Auth | Enable Google OAuth + Email in Supabase dashboard | ☐ |
| Create database schema | Run SQL from TRD section 4 in Supabase SQL Editor | ☐ |
| Set up Row Level Security | Run RLS policies from TRD section 4.2 | ☐ |
| Install all dependencies | npm install (see TRD section 15) | ☐ |
| Set up shadcn/ui | `npx shadcn-ui@latest init` | ☐ |
| Create folder structure | As per TRD section 3 | ☐ |
| Connect GitHub → Vercel | vercel.com → import repo → auto-deploy | ☐ |
| Set up Resend account | resend.com → free account → get API key | ☐ |

#### Week 2: Design System & Auth
| Task | Details | Done? |
|---|---|---|
| Create design tokens | Colors, fonts, spacing in tailwind.config.js | ☐ |
| Build shared components | Button, Card, Badge, Input, Dialog | ☐ |
| Build navigation layout | Bottom nav (customer), Sidebar (owner dashboard) | ☐ |
| Implement Google OAuth | Supabase Auth + callback handling | ☐ |
| Implement Email Auth | Signup + login + email verification | ☐ |
| Build middleware | Route protection for /dashboard and /superadmin | ☐ |
| Set up next-intl | EN + UR translations structure | ☐ |
| Create landing page | Simple marketing page | ☐ |

**Milestone: Auth works, DB is set up, app deploys to Vercel**

---

### PHASE 2 — MVP CORE FEATURES (Weeks 3–6)

#### Week 3: Customer Menu
| Task | Details | Done? |
|---|---|---|
| Build `/menu/[slug]` page | SSR menu page | ☐ |
| Fetch restaurant + categories + dishes | Single Supabase query (joined) | ☐ |
| Build MenuHeader component | Logo, name, city | ☐ |
| Build CategoryTabs component | Sticky horizontal tabs | ☐ |
| Build DishList component | List-based layout | ☐ |
| Build DishItem component | Name, price, description, badge | ☐ |
| Implement Add to Cart | Zustand cartStore | ☐ |
| Build CartBar component | Sticky bottom bar | ☐ |
| Build CartDrawer component | Slide-up cart review | ☐ |
| Language toggle (EN/UR) | next-intl integration | ☐ |

#### Week 4: Checkout & Orders
| Task | Details | Done? |
|---|---|---|
| Build `/checkout` page | Order type selector | ☐ |
| Build OrderTypeSelector | Dine-in / Takeaway / Delivery cards | ☐ |
| Build DineInForm | Name + phone + table number | ☐ |
| Build TakeawayForm | Name only | ☐ |
| Build DeliveryForm | Name + phone + address | ☐ |
| Build login page (checkout context) | Google + Email login | ☐ |
| Implement WhatsApp redirect | wa.me URL builder (see TRD section 6) | ☐ |
| Create POST /api/orders | Order creation API | ☐ |
| Build order confirmation page | Order details + success state | ☐ |
| Save order to Supabase | With all fields | ☐ |

#### Week 5: Owner Dashboard Core
| Task | Details | Done? |
|---|---|---|
| Build `/dashboard` page | Stats cards + recent orders | ☐ |
| Build DashboardStats component | Today orders + revenue | ☐ |
| Build OrdersChart component | Recharts line graph (7-day) | ☐ |
| 30-day toggle | Toggle between 7/30 day graph | ☐ |
| Build RecentOrders component | Last 10 orders list | ☐ |
| Build BellNotification | Supabase Realtime subscription | ☐ |
| Build `/dashboard/orders` page | Full orders list with filters | ☐ |
| Order status update | Received → Preparing → Ready → Completed | ☐ |
| Send order email (Resend) | On order creation | ☐ |

#### Week 6: Menu Management + Subscription
| Task | Details | Done? |
|---|---|---|
| Build `/dashboard/menu` page | Categories + dishes list | ☐ |
| Add/Edit/Delete categories | CRUD forms | ☐ |
| Add/Edit/Delete dishes | CRUD forms with image upload | ☐ |
| Image upload to Supabase Storage | Plan-gated (trial days 1-3 only) | ☐ |
| Available/Unavailable toggle | Instant update to menu | ☐ |
| New dish → email to customers | Resend batch email | ☐ |
| Build `/dashboard/subscription` page | Plan details + pricing | ☐ |
| Trial logic implementation | Days remaining, image lock | ☐ |
| Build `/pricing` public page | Plans + company bank details | ☐ |
| Build `/dashboard/settings` page | Restaurant info + QR download | ☐ |
| QR code generation + download | qrcode.react | ☐ |
| Restaurant owner signup flow | /signup/restaurant | ☐ |

**Milestone: Complete MVP — menu, orders, dashboard, notifications all working**

---

### PHASE 3 — SUPER ADMIN + POLISH (Weeks 7–8)

#### Week 7: Super Admin + Testing
| Task | Details | Done? |
|---|---|---|
| Build `/superadmin` page | All restaurants table | ☐ |
| Build `/superadmin/restaurants/[id]` | Restaurant detail + edit | ☐ |
| Manual plan upgrade flow | Dropdown + save + email | ☐ |
| Build `/superadmin/settings` | Company payment details editor | ☐ |
| Nearby restaurants directory | `/restaurants` page (city filter) | ☐ |
| Customer account page | `/account` — order history | ☐ |
| End-to-end testing | All user flows tested | ☐ |
| Mobile responsiveness check | Test on real Android + iPhone | ☐ |
| Performance audit | Lighthouse score > 85 | ☐ |
| Fix all critical bugs | - | ☐ |

#### Week 8: Beta Launch
| Task | Details | Done? |
|---|---|---|
| Onboard 5 beta restaurants | Personal outreach Lahore | ☐ |
| Help each owner set up menu | Onboarding support | ☐ |
| Collect feedback | WhatsApp / direct calls | ☐ |
| Fix feedback-driven bugs | - | ☐ |
| Set up error monitoring | Vercel error tracking | ☐ |
| Set up Resend email templates | HTML email templates | ☐ |
| Custom domain setup | Once domain is purchased | ☐ |

**Milestone: Beta live with 5 restaurants**

---

### PHASE 4 — PUBLIC LAUNCH & SCALE (Weeks 9–12)

| Week | Goal | Target |
|---|---|---|
| Week 9 | Public launch Lahore | 20 restaurants |
| Week 10 | Karachi expansion | 35 restaurants |
| Week 11 | Islamabad expansion | 50 restaurants ✅ |
| Week 12 | Review, optimize, plan Phase 2 | 50+ restaurants |

---

## 2. COMPLETE SETUP GUIDE (Step by Step)

### Step 1: Create Next.js Project
```bash
npx create-next-app@latest qrmenu \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd qrmenu
```

### Step 2: Install All Dependencies
```bash
# Supabase
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# State Management
npm install zustand

# UI & Design
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
npm install recharts
npm install qrcode.react

# Email
npm install resend

# Internationalization
npm install next-intl

# shadcn/ui (run after above)
npx shadcn-ui@latest init
```

### Step 3: Supabase Setup
1. Go to supabase.com → Create new project → name: "qrmenu-pk"
2. Wait for project to be ready
3. Go to: Settings → API → copy `Project URL` and `anon key`
4. Go to: Settings → API → copy `service_role key` (keep secret)
5. Go to: SQL Editor → paste the entire schema from TRD section 4
6. Run the schema
7. Go to: Authentication → Providers → Enable Google
8. Add Google OAuth credentials (from Google Cloud Console)
9. Go to: Authentication → Providers → Enable Email
10. Go to: Storage → Create bucket "food-images" (public)

### Step 4: Environment Variables
```bash
# Create .env.local in project root
touch .env.local
```

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
RESEND_API_KEY=re_your-resend-key
SUPER_ADMIN_EMAIL=your-email@gmail.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=QRMenu.pk
```

### Step 5: Tailwind Config (Design System)
```javascript
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        urdu: ['Noto Naskh Arabic', 'serif'],
      },
      colors: {
        primary: '#000000',
        accent: '#FF6B35',
        'accent-hover': '#E55A25',
        muted: '#F5F5F5',
        'muted-foreground': '#666666',
        border: '#E5E5E5',
        success: '#22C55E',
        error: '#EF4444',
      },
      borderRadius: {
        card: '12px',
        button: '8px',
      },
    },
  },
  plugins: [],
};
```

### Step 6: Vercel Deployment
1. Push code to GitHub
2. Go to vercel.com → New Project
3. Import GitHub repository
4. Add all environment variables (same as .env.local)
5. Deploy
6. Copy the Vercel URL → update `NEXT_PUBLIC_APP_URL` in Vercel env vars

### Step 7: Resend Setup
1. Go to resend.com → Create account
2. Create API key → copy to `.env.local`
3. Add your domain (when you buy it) for sending emails
4. Until domain: use `onboarding@resend.dev` for testing

### Step 8: Google OAuth Setup
1. Go to console.cloud.google.com
2. Create new project "QRMenu"
3. Enable Google+ API
4. OAuth 2.0 credentials → Web application
5. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)
6. Copy Client ID + Secret → paste in Supabase Auth → Google settings

---

## 3. PACKAGE.JSON DEPENDENCIES

```json
{
  "name": "qrmenu",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-tabs": "^1.0.4",
    "@supabase/auth-helpers-nextjs": "^0.9.0",
    "@supabase/ssr": "^0.1.0",
    "@supabase/supabase-js": "^2.39.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.363.0",
    "next": "14.2.0",
    "next-intl": "^3.9.0",
    "qrcode.react": "^3.1.0",
    "react": "^18",
    "react-dom": "^18",
    "react-hook-form": "^7.51.0",
    "recharts": "^2.12.0",
    "resend": "^3.2.0",
    "tailwind-merge": "^2.2.0",
    "zustand": "^4.5.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.2.0",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

---

## 4. BUDGET BREAKDOWN ($0 Free Tiers)

| Service | Cost | Limit | When to Upgrade |
|---|---|---|---|
| Vercel (Hosting) | $0/month | Unlimited deploys, 100GB bandwidth | At 100GB bandwidth (1000+ restaurants) |
| Supabase (DB + Auth + Storage) | $0/month | 500MB DB, 1GB Storage, 50,000 MAU | At 500MB DB (scale pe) |
| Resend (Email) | $0/month | 3,000 emails/month | At 3,000 emails/month |
| Google OAuth | $0 | Unlimited | Never (free forever) |
| WhatsApp Redirect (wa.me) | $0 | Unlimited | Never (URL redirect, no API) |
| GitHub | $0 | Unlimited public/private repos | Never |
| **Domain** | **~PKR 2,500-4,000/year** | **1 domain** | **Buy when ready to launch** |
| **TOTAL** | **~PKR 3,000/year** | | |

---

## 5. WHEN TO SCALE (Paid Tiers)

| Trigger | Action | Cost |
|---|---|---|
| 500+ restaurants | Upgrade Supabase to Pro | $25/month |
| 3,000+ emails/month | Upgrade Resend to Starter | $20/month |
| Slow performance | Upgrade Vercel to Pro | $20/month |
| Need WhatsApp API | Integrate Twilio / 360dialog | $50+/month |
| Need payment gateway | Get business registration → JazzCash API | PKR 5,000 setup |

---

## 6. PHASE 2 FEATURES (After 50 Restaurants)

| Feature | Priority | Effort | Revenue Impact |
|---|---|---|---|
| JazzCash/Easypaisa payment gateway | High | High | Enable online payments |
| Mobile app (owner — React Native) | High | High | Better owner UX |
| Customer order history | Medium | Low | Retention |
| Multi-branch support | Medium | Medium | Large chain restaurants |
| Push notifications (PWA) | Medium | Low | Re-engagement |
| SMS notifications | Low | Low | Owner backup alerts |
| Loyalty points | Low | Medium | Customer retention |
| Table reservation | Low | High | New revenue stream |

---

*End of Development Roadmap v1.0*
