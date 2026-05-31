# QRMenu.pk — Complete Deployment Roadmap

## Tech Stack
| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router) + TypeScript |
| **Styling** | Tailwind CSS 3 + shadcn/ui (Radix) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (Google OAuth + Email/Password) |
| **Storage** | Supabase Storage (dish images, logos) |
| **Email** | Resend (3,000 emails/month free) |
| **Hosting** | Vercel (Free Tier) |
| **Domain** | Your purchased domain (configure in Vercel) |

---

## PHASE 0 — Pre-Deployment Checks ✅ (Completed)

### Security Fixes Applied

| File | Fix |
|------|-----|
| `supabase_migration.sql` | Added missing **UPDATE RLS policy** for orders table |
| `app/api/orders/[id]/route.ts` | Added **auth + ownership check** for GET/PATCH |
| `app/api/orders/route.ts` | Added **Zod schema validation** for all fields |
| `app/api/admin/dishes/route.ts` | Added **Zod validation + ownership verification** |
| `app/api/admin/categories/route.ts` | Added **Zod validation + ownership verification** |
| `app/api/notifications/email/route.ts` | Added **auth + restaurant ownership check** |
| `app/api/notifications/new-dish/route.ts` | Added **auth + restaurant ownership check** |
| `app/api/superadmin/settings/route.ts` | Added **auth check on GET** (was missing) |
| `deploy/.env` | **Replaced real secrets** with placeholder values |

### UX/Bug Fixes Applied

| Issue | Fix |
|-------|-----|
| Menu category tabs didn't work (non-interactive) | Created `MenuContent` client component with state management |
| Cart page used `javascript:history.back()` | Replaced with `router.back()` |
| Checkout had duplicate loading states | Consolidated to single `localLoading` state |
| Missing 404 page | Added `not-found.tsx` |
| Order confirm page had no WhatsApp open button | Added prominent WhatsApp button |
| Lockfile workspace warning | Added `outputFileTracingRoot` to `next.config.ts` |

### Build Status
- **Compilation:** ✅ Passed (zero errors)
- **TypeScript:** ✅ Passed (zero errors)
- **Pages:** 31 generated (static + dynamic)
- **API Routes:** 14 (all verified)

---

## PHASE 1 — Deploy to Vercel (Free)

### Step 1: Push to GitHub

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit - QRMenu.pk"

# Create repo on GitHub.com first, then:
git remote add origin https://github.com/YOUR_USER/qrmenue.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) — Sign up with GitHub
2. Click **Add New → Project**
3. Select your `qrmenue` repository
4. Vercel auto-detects **Next.js** — keep default settings
5. Click **Deploy**

### Step 3: Set Environment Variables

In Vercel Dashboard → Project → **Settings → Environment Variables**, add:

| Variable | Value | Where to Get |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zkwwqcopkwbzbsqqxoiq.supabase.co` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_a_...` | Supabase → Project Settings → API (anon public) |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_etTh...` | Supabase → Project Settings → API (service_role) |
| `RESEND_API_KEY` | `re_your-resend-key` | Resend.com → API Keys |
| `SUPER_ADMIN_EMAIL` | `mazzmakki786@gmail.com` | Your admin email |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | Your production URL |
| `NEXT_PUBLIC_APP_NAME` | `QRMenu.pk` | Your app name |

### Step 4: Configure Custom Domain

1. Go to Vercel Dashboard → Project → **Domains**
2. Enter your purchased domain (e.g., `qrmenu.pk`)
3. Update DNS at your domain registrar:
   - **Option A** (Recommended): Point nameservers to Vercel:
     - `ns1.vercel-dns.com`
     - `ns2.vercel-dns.com`
   - **Option B**: Add CNAME record:
     - Type: `CNAME`
     - Name: `@` (or `www`)
     - Target: `cname.vercel-dns.com`

4. Wait 5–30 min for DNS propagation
5. Vercel auto-provisions **free SSL certificate** (Let's Encrypt)
6. Update `NEXT_PUBLIC_APP_URL` to your custom domain

---

## PHASE 2 — Supabase Production Setup

### 2.1 Run Database Migration

Open Supabase Dashboard → **SQL Editor** → Paste and run `supabase_migration.sql`

### 2.2 Configure Auth Providers

Supabase Dashboard → **Authentication → Providers**:

**Google OAuth:**
1. Enable Google provider
2. Go to [Google Cloud Console](https://console.cloud.google.com)
3. Create OAuth 2.0 Client ID (Web application)
4. Add authorized redirect URIs:
   - `https://[your-domain].vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`
5. Copy Client ID + Client Secret to Supabase

**Email/Password:**
1. Enable Email/Password in Supabase Auth
2. Optional: Disable "Confirm email" for frictionless sign-up

### 2.3 Configure Auth URLs

Supabase Dashboard → **Authentication → Settings**:
- **Site URL:** `https://[your-domain]`
- **Redirect URLs:**
  - `https://[your-domain]/auth/callback`
  - `https://[your-domain]/login`
  - `https://[your-domain]/signup`
  - `https://[your-domain]/signup/restaurant`

### 2.4 Create Storage Buckets

Supabase Dashboard → **Storage**:

1. Create bucket: `dish-images`
   - **Public bucket** (menus are public)
2. Add **RLS policy** for the bucket (if needed):
   ```sql
   CREATE POLICY "Public can view dish images"
     ON storage.objects FOR SELECT
     USING (bucket_id = 'dish-images');

   CREATE POLICY "Owners can upload dish images"
     ON storage.objects FOR INSERT
     WITH CHECK (
       bucket_id = 'dish-images'
       AND auth.role() = 'authenticated'
     );
   ```

---

## PHASE 3 — Post-Deployment Testing Checklist

### Auth
- [ ] Google OAuth login works end-to-end
- [ ] Email/Password sign-up works
- [ ] Email/Password login works
- [ ] Auth callback redirects correctly
- [ ] Session persists across page reloads
- [ ] Logout clears session

### Customer Flow
- [ ] Landing page loads
- [ ] Menu page loads at `/menu/[slug]`
- [ ] Category tabs filter dishes
- [ ] Add to cart works
- [ ] Cart page shows items
- [ ] Cart persists in localStorage
- [ ] Checkout form works (dine-in, takeaway, delivery)
- [ ] Order is created
- [ ] WhatsApp link opens
- [ ] Order confirmation page displays

### Owner Dashboard
- [ ] Dashboard loads with stats
- [ ] Orders list with real-time updates
- [ ] Order status updates work
- [ ] Menu management (add/edit/delete categories & dishes)
- [ ] Settings page (update profile, upload logo)
- [ ] Subscription page displays plans
- [ ] QR code page (download, print)

### Super Admin
- [ ] Restaurants list
- [ ] Edit restaurant details
- [ ] Company settings management

### Mobile Responsiveness
- [ ] Test at 375px (small phone)
- [ ] Test at 768px (tablet)
- [ ] Test at 1024px+ (desktop)
- [ ] Bottom navigation on customer layout
- [ ] Owner sidebar mobile hamburger menu
- [ ] Checkout forms usable on small screens
- [ ] QR code page responsive

---

## PHASE 4 — Post-Launch Optimizations

### SEO
- Register domain with [Google Search Console](https://search.google.com/search-console)
- Create `sitemap.xml` for better indexing

### Monitoring
- Set up [Sentry](https://sentry.io) free tier (5,000 events/month) for error tracking
- Monitor Vercel Analytics for performance

### Backup
- Enable Supabase **point-in-time recovery** (paid, optional for production)
- Export database schema: `supabase db dump`

### Performance
- Enable Vercel **Edge Caching** for static pages
- Optimize images with WebP format
- Add `<head>` meta tags for social preview

---

## Free Tier Limits Summary

| Service | Free Limit | What It Covers |
|---------|-----------|----------------|
| **Vercel** | 100 GB bandwidth, 100 GB-hours serverless, 6,000 build min/mo | Hosting + SSL + CDN |
| **Supabase** | 500 MB DB, 50k MAU, 2 GB storage, 2 GB bandwidth | Database + Auth + Storage |
| **Resend** | 3,000 emails/month | Order notifications |
| **GitHub** | Unlimited private repos | Source code |
| **Google OAuth** | Free | Authentication |

### When to Upgrade
- **Supabase:** When DB > 500 MB or MAU > 50,000 → $25/month Pro
- **Vercel:** When bandwidth > 100 GB → $20/month Pro
- **Resend:** When emails > 3,000/month → $10/month Starter

---

## Quick Reference — Useful Commands

```bash
# Development
npm run dev          # Start dev server on localhost:3000

# Build & Deploy
npm run build        # Production build
npm run start        # Start production server

# Lint Check
npx next lint        # Run linter (build already includes lint)

# Supabase Migration
# Paste supabase_migration.sql in Supabase SQL Editor
```

## Environment Variables (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://zkwwqcopkwbzbsqqxoiq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
RESEND_API_KEY=[resend-key]
SUPER_ADMIN_EMAIL=mazzmakki786@gmail.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=QRMenu.pk
```
