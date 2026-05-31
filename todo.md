# QRMenu.pk — Development TODO

## Status Legend
☐ Not Started | 🔄 In Progress | ✅ Completed | ❌ Blocked

---

## PHASE 1: FOUNDATION (Weeks 1-2)

### Week 1 — Project Setup
☐ Create Next.js 14 project with TypeScript + Tailwind + ESLint + App Router
☐ Install all npm dependencies
☐ Initialize shadcn/ui and add components
☐ Create folder structure
☐ Configure tailwind.config.js with design tokens
☐ Configure next.config.js
☐ Create vercel.json
☐ Set up Supabase project and run database schema
☐ Enable Supabase Auth providers (Google + Email)
☐ Create Supabase Storage bucket
☐ Create .env.local with environment variables
☐ Create types/index.ts — all TypeScript interfaces
☐ Create lib/utils.ts
☐ Create lib/supabase/client.ts
☐ Create lib/supabase/server.ts
☐ Create lib/supabase/middleware.ts
☐ Create lib/subscription.ts
☐ Create lib/whatsapp.ts
☐ Create lib/qr.ts
☐ Create lib/resend.ts
☐ Create stores/cartStore.ts
☐ Create stores/orderStore.ts
☐ Create messages/en.json
☐ Create messages/ur.json
☐ Create middleware.ts for route protection
☐ Create landing page (/)
☐ Create pricing page (/pricing)

### Week 2 — Design System & Auth
☐ Build all UI components (Button, Card, Badge, Input, Dialog, Tabs)
☐ Build shared components (LanguageToggle, QRCodeDisplay, SubscriptionBanner)
☐ Build customer bottom nav layout
☐ Build owner sidebar layout
☐ Build super admin layout
☐ Build login page (/login)
☐ Build customer signup page (/signup)
☐ Build restaurant owner signup page (/signup/restaurant)
☐ Implement auth callback handler
☐ Configure Google OAuth credentials

---

## PHASE 2: MVP CORE (Weeks 3-6)

### Week 3 — Customer Menu
☐ Build /menu/[slug] SSR page
☐ Build MenuHeader component
☐ Build CategoryTabs component
☐ Build DishList component
☐ Build DishItem component
☐ Build CartBar component
☐ Build CartDrawer component
☐ Implement Add to Cart
☐ Integrate EN/UR language toggle

### Week 4 — Checkout & Orders
☐ Build /cart page
☐ Build /checkout page
☐ Build OrderTypeSelector
☐ Build DineInForm
☐ Build TakeawayForm
☐ Build DeliveryForm
☐ Build payment method selector
☐ Implement login gate at checkout
☐ Create POST /api/orders
☐ Create GET/PATCH /api/orders/[id]
☐ Create GET /api/menu/[slug]
☐ Build WhatsAppRedirect component
☐ Build /order-confirm/[id] page

### Week 5 — Owner Dashboard
☐ Build /dashboard page
☐ Build DashboardStats component
☐ Build OrdersChart component (7d/30d toggle)
☐ Build RecentOrders component
☐ Build BellNotification component (Realtime)
☐ Build /dashboard/orders page
☐ Build /dashboard/orders/[id] page
☐ Create POST /api/notifications/email

### Week 6 — Menu Management & Subscription
☐ Build /dashboard/menu page
☐ Build AddDishForm component
☐ Build DishCard component
☐ Build image upload to Supabase Storage
☐ Create POST /api/admin/dishes
☐ Create POST /api/admin/categories
☐ Create PATCH /api/admin/subscription
☐ Build /dashboard/subscription page
☐ Build /dashboard/settings page

---

## PHASE 3: SUPER ADMIN & BETA (Weeks 7-8)

### Week 7 — Super Admin Panel
☐ Build /superadmin page (all restaurants)
☐ Build /superadmin/restaurants/[id] page
☐ Build PlanEditor component
☐ Build /superadmin/settings page
☐ Build /restaurants page (directory)
☐ Build /account page (order history)
☐ Create GET /api/superadmin/restaurants
☐ Create GET/PATCH /api/superadmin/settings
☐ End-to-end testing
☐ Mobile responsiveness testing
☐ Lighthouse audit

### Week 8 — Beta Launch
☐ Onboard 5 beta restaurants
☐ Set up error monitoring
☐ Polish email templates
☐ Custom domain setup
☐ Fix beta feedback

---

## PHASE 4: SCALE (Weeks 9-12)
☐ Week 9 — Public launch Lahore (20 restaurants)
☐ Week 10 — Karachi expansion (35 restaurants)
☐ Week 11 — Islamabad expansion (50 restaurants)
☐ Week 12 — Review, optimize, plan Phase 2
