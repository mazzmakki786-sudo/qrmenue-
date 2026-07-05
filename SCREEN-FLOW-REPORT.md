# 📱 QRMenu.pk — Complete Screen Flow Report

**Date**: July 4, 2026
**Version**: 1.0

---

## 📊 App Overview

| Role | Screens | Route Group |
|------|---------|-------------|
| Customer | 9 | `app/(customer)/` |
| Owner | 11 | `app/(owner)/dashboard/` |
| Super Admin | 1 (tabbed) | `app/(superadmin)/superadmin/` |
| Auth | 3 | `app/(auth)/` |
| **Total** | **24** | |

---

## 🔐 AUTH FLOW

### Login Screen (`/login`)

**Purpose**: Email/password sign-in + Google OAuth

**Flow**:
```
Email + Password → POST /api/auth/login
    ↓
CSRF Guard → Rate Limit (10/min) → Zod Validation
    ↓
Account Lockout Check (5 failures = 15 min block)
    ↓
Progressive Delay ((n-1)×2s, max 60s)
    ↓
Supabase signInWithPassword
    ↓
Success → Clear attempts → Redirect (owner→/dashboard, customer→/restaurants)
Failure → Record attempt → If locked: send lockout email via Resend
```

**Error Messages**: Always generic "Incorrect email or password" (never reveals if account exists)

---

### Restaurant Signup (`/signup/restaurant`)

**Purpose**: Register new restaurant owner with 7-day trial

**Flow**:
```
Form (name, city, phone, email, password)
    ↓
POST /api/auth/signup/restaurant
    ↓
CSRF Guard → Zod Validation → Sanitize inputs
    ↓
createAdminClient → auth.admin.createUser (auto-confirm email)
    ↓
Insert into restaurants table (plan: "trial", trial_end: +7 days)
    ↓
Success → Redirect to /dashboard/onboarding
```

**Google OAuth**: Alternative path, creates user directly via client-side

---

### Customer Signup (`/signup/customer`)

**Purpose**: Register browsing/ordering customers

**Flow**:
```
Form (name, email, password with live requirements)
    ↓
POST /api/auth/signup/customer
    ↓
CSRF Guard → Zod Validation
    ↓
createAdminClient → auth.admin.createUser + insert into customers table
    ↓
Success → Redirect to /login with verification message
```

---

## 🍽️ CUSTOMER FLOW

### Complete Journey
```
Restaurants List → Restaurant Detail → Menu → Cart → Checkout → Order Confirm → Account/History
```

---

### 1. Restaurants List (`/restaurants`)

**Purpose**: Browse and filter restaurants

**Data Source**: Supabase `restaurants` table (is_active=true, is_suspended=false)

**Features**:
- Search by name/cuisine/city
- Filter by city (pill buttons)
- Realtime subscription for `is_open` status updates
- Favorite toggle (heart icon)

**User Actions**:
- Search restaurants
- Filter by city
- Toggle favorites
- Click "View Menu" → `/menu/{slug}`

---

### 2. Restaurant Detail (`/restaurant/[slug]`)

**Purpose**: Show full restaurant with categories and dishes (SEO-friendly SSR)

**Data Source**: `supabase.from("restaurants").select("*, categories(*, dishes(*))")`

**Checks**:
- Is restaurant active?
- Is restaurant suspended?
- Is plan/trial expired? → Shows `RestaurantUnavailable` if expired

**Features**:
- Categories with dish listing
- Add items to cart
- Plan expiry banner

---

### 3. Menu Page (`/menu/[slug]`)

**Purpose**: Alternative menu entry (QR codes link here, ISR revalidates every 300s)

**Same as Restaurant Detail** — reuses `RestaurantDetailClient`

**Data Source**: Same Supabase query, same plan/expiry checks

---

### 4. Cart Page (`/cart`)

**Purpose**: Review/edit cart items before checkout

**Data Source**: `useCartStore` (Zustand + localStorage persist)

**Features**:
- Item list with +/- quantity controls
- Remove individual items
- Clear entire cart
- Restaurant banner (change restaurant link)
- Order summary (subtotal, delivery fee, discount, total)
- Fixed checkout bar at bottom

**User Actions**: Adjust quantities, remove items, proceed to checkout

---

### 5. Checkout Page (`/checkout`)

**Purpose**: Collect customer info and submit order

**Data Sources**:
- Cart from `useCartStore`
- Form state from `useOrderStore`
- Restaurant validation via `GET /api/orders/validate-restaurant`
- Saved customer info from localStorage

**Flow**:
```
Order Type Selection (dine-in/takeaway/delivery)
    ↓
Conditional Form (DineInForm/TakeawayForm/DeliveryForm)
    ↓
Order Summary with deal/discount display
    ↓
POST /api/orders
    ↓
CSRF Guard → Rate Limit → Zod Validation
    ↓
Restaurant checks (active, open, plan valid, order limit)
    ↓
Insert order → Generate WhatsApp URL → Send notification
    ↓
Success → Redirect to /order-confirm/{id}
```

**Order Type Forms**:
| Type | Required Fields |
|------|----------------|
| Dine-in | Customer name, table number |
| Takeaway | Customer name, phone |
| Delivery | Customer name, phone, address |

---

### 6. Order Confirmation (`/order-confirm/[id]`)

**Purpose**: Show order status with realtime updates + WhatsApp

**Data Source**: `supabase.from("orders").select("*, restaurants(*)")` by order ID

**Features**:
- Realtime status updates (received → preparing → ready → completed)
- Status timeline visualization
- Order items and details
- Auto-sends to WhatsApp
- Reorder button

**User Actions**: Track status, reorder, view on WhatsApp

---

### 7. Account Page (`/account`)

**Purpose**: View past orders grouped by restaurant (requires auth)

**Data Source**: `supabase.from("orders").select("*, restaurants(name, slug)").eq("customer_id", user.id)`

**Features**:
- Restaurant-grouped collapsible order list
- Status badges
- Realtime subscription for INSERT/UPDATE
- Sign out button

**User Actions**: Expand/collapse groups, tap order → `/order-confirm/{id}`, sign out

---

### 8. Favorites Page (`/favorites`)

**Purpose**: Quick access to favorited restaurants

**Data Source**: localStorage-based `useFavorites` hook

**User Actions**: View favorites, navigate to menu

---

### 9. Customer Layout (`/` wrapper)

**Purpose**: Shell with navigation

**Components**:
- Desktop top navbar
- Mobile bottom tab bar (Home, Favorites, Cart, Orders)
- Cart badge (live item count from `useCartStore`)

---

### Data Flow Diagram
```
Restaurants (server SSR)
    → RestaurantsClient (realtime is_open)
        → /menu/{slug} (server SSR, ISR 300s)
            → RestaurantDetailClient
                → addItem() → cartStore (persisted)
                    → /cart → /checkout
                        → POST /api/orders
                            → /order-confirm/{id}
                                → realtime status updates
                                    → account/order history
```

---

## 👨‍💼 OWNER DASHBOARD FLOW

### Complete Journey
```
Login → Dashboard Home → (Orders | Menu | Analytics | QR | Settings | Subscription | Branding | Announcements | AI Posts)
```

---

### 1. Dashboard Home (`/dashboard`)

**Purpose**: Main overview with live stats

**Features**:
- Today/yesterday/monthly order counts and revenue
- Recent 10 orders list
- Top 5 dishes ranking
- Category/dish counts
- Restaurant open/close toggle with editable times
- Realtime subscription on orders table

**Data Sources**: `orders`, `restaurants`, `categories`, `dishes`, `daily_order_stats`

**User Actions**: Toggle open status, update times, navigate to sub-pages

---

### 2. Orders List (`/dashboard/orders`)

**Purpose**: Paginated order list with time filtering

**Features**:
- Filter: Today / Week / Month / All
- 25 orders per page
- Realtime INSERT/UPDATE subscriptions
- Trial-blurred customer details when plan limit reached
- Order type labels (dine-in, takeaway, delivery)

**User Actions**: Filter time ranges, click order → detail page

---

### 3. Order Detail (`/dashboard/orders/[id]`)

**Purpose**: Single order view with status management

**Features**:
- Realtime UPDATE subscription
- Status buttons: received → preparing → ready → completed | cancelled
- Print receipt (opens print window)
- Download receipt as PNG (html2canvas)

**User Actions**: Update status, print receipt, download PNG

---

### 4. Menu Management (`/dashboard/menu`)

**Purpose**: Full CRUD for categories and dishes

**Features**:
- Category CRUD (add, edit, delete)
- Dish CRUD (add, edit, delete)
- Image upload with WebP compression
- Bulk selection and actions
- Search/filter by category
- Sort ordering
- Undo toast for soft-delete
- Poster generation per category
- Plan limits enforcement (canAddDish, canAddCategory, canUploadImage)

**Data Sources**: `categories`, `dishes`, `dish-images` storage

**User Actions**: Add/edit/delete dishes and categories, upload images, generate posters

---

### 5. Settings (`/dashboard/settings`)

**Purpose**: Restaurant profile editing

**Features**:
- Edit name (EN/UR), phone, city, address, cuisine type, language
- Logo upload
- Opening/closing times
- Delivery fee and time settings

**User Actions**: Update restaurant profile, upload logo, save settings

---

### 6. Analytics (`/dashboard/analytics`)

**Purpose**: Business intelligence with charts

**Features**:
- Recharts line chart (7d/30d toggle)
- Total orders/revenue
- Top 10 dishes ranked
- Order type breakdown (dine-in vs takeaway vs delivery)

**Data Sources**: `daily_order_stats`, `orders` (with fallback)

**User Actions**: Toggle date range, view charts/stats

---

### 7. QR Code (`/dashboard/qr`)

**Purpose**: Generate restaurant QR code linking to menu

**Features**:
- Dynamic QR code via `qrcode.react`
- Size selector (150-300px)
- Download as PNG
- Print
- Copy URL
- Share via Web Share API
- Info banner (dynamic = no reprint needed)

**User Actions**: Download, print, copy, share, change size

---

### 8. Subscription (`/dashboard/subscription`)

**Purpose**: Plan management and upgrade

**Features**:
- Current plan display
- Usage vs limits (dishes, images, orders, categories, AI posts)
- Trial countdown
- Upgrade plan cards with pricing
- Payment info (JazzCash, EasyPaisa, bank)
- WhatsApp support link
- Suspended plan warning

**User Actions**: Upgrade plan, view limits, contact support

---

### 9. Branding (`/dashboard/branding`)

**Purpose**: Promotional banner management (Premium only)

**Features**:
- Upload banner image
- Set clickable link URL
- Enable/disable toggle
- Premium plan gate

**User Actions**: Upload banner, set link, toggle, save

---

### 10. Announcements (`/dashboard/announcements`)

**Purpose**: Read platform announcements from super admin

**Features**:
- Filter: All / Unread / Read
- Realtime subscription for new announcements
- Mark as read / Mark all as read

**User Actions**: Read announcements, mark read

---

### 11. AI Posts (`/dashboard/ai-posts`)

**Purpose**: AI-powered social media content generation

**Features**:
- Generate captions via AI
- History management
- Monthly usage limit tracker
- Plan-gated (requires plan with aiPostsPerMonth > 0)
- Download generated images

**User Actions**: Generate posts, view history, delete, download

---

### Owner Components

| Component | Purpose |
|-----------|---------|
| DashboardStats | Today's orders count and revenue |
| RecentOrders | Last 10 orders with status badges |
| OrdersChart | Line chart with 7d/30d toggle |
| BellNotification | Audio chime + toast alerts for new orders |
| DishCard | Dish display with edit/delete |
| AddDishForm | Dish creation form with image upload |
| AddDealForm | Deal creation form |

---

## 🔴 SUPER ADMIN FLOW

### Screen (`/superadmin`)

**Purpose**: Platform administration hub (single page with tabs)

**Auth**: Middleware verifies `SUPER_ADMIN_EMAIL` env var

**Tabs**:

| Tab | Component | Purpose |
|-----|-----------|---------|
| Restaurants | RestaurantTable | List/search/toggle restaurants |
| Customers | CustomerTable | Customer management with order stats |
| Plans | PlanManager | Edit subscription plan limits/pricing |
| Analytics | AnalyticsView | Revenue, orders, customers charts |
| Settings | CompanySettingsForm | Payment details, WhatsApp, email |
| Announcements | AnnouncementsPanel | Create/publish/delete announcements |
| Trial Limits | TrialLimitsEditor | Configure trial plan caps |

**Data Flow**: Server reads authenticated user → passes `currentUserEmail` to client → client fetches from superadmin API routes

---

## 🔄 REALTIME SUBSCRIPTIONS

| Screen | Table | Events | Purpose |
|--------|-------|--------|---------|
| Restaurants List | restaurants | UPDATE | Live open/closed status |
| Restaurant Detail | restaurants | UPDATE | Live open/closed status |
| Menu Page | restaurants | UPDATE | Live open/closed status |
| Dashboard Home | orders | INSERT/UPDATE | Live order count |
| Orders List | orders | INSERT/UPDATE | Live order updates |
| Order Detail | orders | UPDATE | Live status sync |
| Order Confirm | orders | UPDATE | Live status tracking |
| Account | orders | INSERT/UPDATE | Live order history |
| Announcements | owner_notifications | INSERT | Live announcement alerts |

---

## 📊 Data Store Architecture

| Store | Type | Persistence | Purpose |
|-------|------|-------------|---------|
| cartStore | Zustand | localStorage | Cart items, restaurant binding, deals |
| orderStore | Zustand | localStorage | Checkout form fields |

---

## 🔗 API Routes Summary

| Route | Method | Purpose |
|-------|--------|---------|
| /api/auth/login | POST | User login |
| /api/auth/signup/restaurant | POST | Restaurant registration |
| /api/auth/signup/customer | POST | Customer registration |
| /api/orders | POST | Create order |
| /api/orders/[id] | GET/PATCH | Get/update order |
| /api/orders/validate-restaurant | GET | Validate restaurant |
| /api/menu/[slug] | GET | Public menu data |
| /api/favorites | GET/POST | Toggle favorites |
| /api/favorites/sync | POST | Sync favorites |
| /api/settings | GET | Public settings |
| /api/plans | GET | Public plans |
| /api/owner/* | Various | Owner CRUD operations |
| /api/superadmin/* | Various | Admin operations |
| /api/notifications/* | POST | Email notifications |
| /api/cron/* | GET | Scheduled tasks |

---

## 📈 Screen Statistics

| Metric | Count |
|--------|-------|
| Total Screens | 24 |
| Customer Screens | 9 |
| Owner Screens | 11 |
| Super Admin Tabs | 7 |
| Auth Screens | 3 |
| API Routes | 55+ |
| Realtime Subscriptions | 9 |
| Zustand Stores | 2 |

---

**Report Generated**: July 4, 2026
