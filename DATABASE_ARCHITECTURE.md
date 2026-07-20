# QR Menu — Database Architecture

> **Platform:** Supabase PostgreSQL (Free Plan: 500 MB)
> **Current Usage:** 21 MB / 500 MB (4.1%)
> **Tables:** 24 Public | Host: `zkwwqcopkwbzbsqqxoiq.supabase.co`

---

## 1. ENTITY RELATIONSHIP DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AUTH SCHEMA (Supabase Managed)                    │
│  ┌───────────┐    ┌──────────────┐    ┌──────────────────┐                 │
│  │  users    │───▶│  identities  │    │  sessions        │                 │
│  └─────┬─────┘    └──────────────┘    └──────────────────┘                 │
│        │                                                                   │
└────────┼───────────────────────────────────────────────────────────────────┘
         │
         │ owner_id (FK)
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PUBLIC SCHEMA (24 Tables)                         │
│                                                                             │
│  ┌─────────────────┐       ┌────────────────────┐       ┌───────────────┐  │
│  │    plans        │       │   company_settings  │       │ super_admins  │  │
│  └────────┬────────┘       └────────────────────┘       └───────┬───────┘  │
│           │                                                     │          │
│           │ plan (FK ref)                                       │ email    │
│           ▼                                                     ▼          │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                        restaurants ★                              │    │
│  │  (Core entity — everything revolves around it)                    │    │
│  └──┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬────────────┘    │
│     │   │   │   │   │   │   │   │   │   │   │   │   │   │                │
│     │   │   │   │   │   │   │   │   │   │   │   │   │   │                │
│     ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼                │
│  ┌────┐┌────┐┌────┐┌────┐┌──────┐┌──────┐┌────┐┌──────┐ ┌───────────┐   │
│  │cat-││dish││deal││ord-││subsc-││table ││noti││push_ │ │owner_audit│   │
│  │ego-││es  ││s   ││ers ││ript- ││s     ││fica-││subsc-│ │_log       │   │
│  │ries││    ││    ││    ││ions  ││(res- ││tion-││ript- │ │           │   │
│  │    ││    ││    ││    ││      ││taur- ││logs ││ions  │ │           │   │
│  │    ││    ││    ││    ││      ││ant)  ││     ││      │ │           │   │
│  └────┘└────┘└────┘└────┘└──────┘└──────┘└────┘└──────┘ └───────────┘   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     CUSTOMER DOMAIN                                   │  │
│  │  ┌───────────┐    ┌──────────────┐    ┌─────────────────────┐        │  │
│  │  │ customers │───▶│  favorites   │    │ customer_notificat- │        │  │
│  │  │ (auth ref)│    │ (restaurant) │    │ ions (order ref)    │        │  │
│  │  └─────┬─────┘    └──────────────┘    └─────────────────────┘        │  │
│  │        │                ┌────────────────────┐                        │  │
│  │        │                │ customer_audit_log │                        │  │
│  │        │                └────────────────────┘                        │  │
│  └────────┼──────────────────────────────────────────────────────────────┘  │
│           ▼                                                                 │
│     ┌──────────┐                                                            │
│     │  orders  │ ←─── order_items stored as JSONB inside                   │
│     │ ★ 23 cols│       (not a separate table)                              │
│     └────┬─────┘                                                            │
│          │ deal_id (FK)                                                     │
│          ▼                                                                  │
│     ┌──────────┐        ┌──────────────────────┐                           │
│     │  deals   │        │ notification_logs    │                           │
│     └──────────┘        │ (order_id → orders)  │                           │
│                          └──────────────────────┘                           │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │              SECURITY & RATE LIMITING                        │          │
│  │  ┌─────────────┐  ┌────────────┐  ┌──────────────────────┐  │          │
│  │  │ rate_limits │  │login_attem-│  │superadmin_login_att- │  │          │
│  │  │ (in-memory) │  │pts         │  │empts                 │  │          │
│  │  └─────────────┘  └────────────┘  └──────────────────────┘  │          │
│  │  ┌────────────────────────┐  ┌────────────────────────────┐ │          │
│  │  │ superadmin_audit_log   │  │ contact_inquiries          │ │          │
│  │  └────────────────────────┘  └────────────────────────────┘ │          │
│  └──────────────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘

  ★ = Central entity    ▶ = Foreign Key    ─── = Relationship
```

---

## 2. TABLES — DETAILED REFERENCE

### 2.1 CORE DOMAIN — Restaurants

#### `restaurants` ★ (12 rows — 128 kB)
*Central entity — everything connects here*

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | Primary key |
| `owner_id` | `uuid` FK | — | → `auth.users.id` |
| `name` | `text` | — | Restaurant name (English) |
| `name_ur` | `text?` | — | Restaurant name (Urdu) |
| `slug` | `text` UNIQUE | — | URL-friendly identifier |
| `phone` | `text?` | — | Contact number |
| `city` | `text` | — | Location city |
| `address` | `text?` | — | Full address |
| `logo_url` | `text?` | — | Logo image URL |
| `cuisine_type` | `text?` | — | Type of cuisine |
| `language` | `text?` | `'en'` | Default language |
| `plan` | `text?` | `'trial'` | Current plan slug |
| `plan_start_date` | `timestamptz?` | `now()` | Plan start |
| `plan_end_date` | `timestamptz?` | — | Plan expiry |
| `trial_start` | `timestamptz?` | `now()` | Trial start |
| `trial_end` | `timestamptz?` | `now() + 7d` | Trial expiry |
| `image_upload_allowed` | `bool?` | `true` | Can upload images |
| `is_active` | `bool?` | `true` | Active status |
| `is_suspended` | `bool?` | `false` | Suspended by admin |
| `is_open` | `bool` | `true` | Currently accepting orders |
| `opening_time` | `time?` | `09:00:00` | Opening hour |
| `closing_time` | `time?` | `23:00:00` | Closing hour |
| `opening_hours` | `jsonb?` | — | Per-day schedule (7 days) |
| `description` | `text?` | — | About the restaurant |
| `brand_primary_color` | `text?` | `'#25D366'` | Brand primary (green) |
| `brand_accent_color` | `text?` | `'#000000'` | Brand accent (black) |
| `banner_enabled` | `bool?` | `false` | Banner display toggle |
| `banner_image_url` | `text?` | — | Banner image |
| `banner_link_url` | `text?` | — | Banner click URL |
| `delivery_fee` | `int?` | `0` | Delivery charge |
| `delivery_time_min` | `int?` | `0` | Est. delivery time |
| `lat` | `numeric?` | — | Latitude |
| `lng` | `numeric?` | — | Longitude |
| `plan_limits_override` | `jsonb?` | — | Per-restaurant plan cap override |

**Indexes:** 5 (`id` PK, `slug` UNIQUE, `city`, `owner_id`, `slug`)

**FKs to this table:** categories, dishes, deals, orders, favorites, subscriptions, restaurant_tables, owner_audit_log, owner_notifications, push_subscriptions, notification_logs

---

### 2.2 MENU DOMAIN — Categories & Dishes

#### `categories` (10 rows — 48 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `restaurant_id` | `uuid` FK | — | → `restaurants.id` |
| `name_en` | `text` | — | Category name (English) |
| `name_ur` | `text?` | — | Category name (Urdu) |
| `sort_order` | `int?` | `0` | Display order |
| `created_at` | `timestamptz?` | `now()` | — |

**Indexes:** 2 | **FKs to:** dishes (category_id)

#### `dishes` (35 rows — 96 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `restaurant_id` | `uuid` FK | — | → `restaurants.id` |
| `category_id` | `uuid?` FK | — | → `categories.id` |
| `name_en` | `text` | — | Dish name (English) |
| `name_ur` | `text?` | — | Dish name (Urdu) |
| `description_en` | `text?` | — | Description (English) |
| `description_ur` | `text?` | — | Description (Urdu) |
| `price` | `int` | — | Price in PKR |
| `image_url` | `text?` | — | Dish photo URL |
| `is_available` | `bool?` | `true` | Currently available |
| `sort_order` | `int?` | `0` | Display order |
| `tags` | `jsonb?` | `'[]'` | Tags (spicy, veg, etc.) |
| `created_at` | `timestamptz?` | `now()` | — |
| `updated_at` | `timestamptz?` | `now()` | — |

**Indexes:** 3 | **FKs to:** deals (dish_id)

#### `deals` (0 rows — 96 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `restaurant_id` | `uuid` FK | — | → `restaurants.id` |
| `dish_id` | `uuid?` FK | — | → `dishes.id` |
| `title_en` | `text` | — | Deal name (English) |
| `title_ur` | `text?` | — | Deal name (Urdu) |
| `description_en` | `text?` | — | Deal description |
| `description_ur` | `text?` | — | Deal description (Urdu) |
| `deal_type` | `text` | — | `percentage` / `flat` / `bundle` |
| `deal_value` | `numeric` | — | Discount amount/% |
| `start_date` | `timestamptz?` | — | Campaign start |
| `end_date` | `timestamptz?` | — | Campaign end |
| `is_active` | `bool` | `true` | Active toggle |
| `created_at` | `timestamptz?` | `now()` | — |
| `updated_at` | `timestamptz?` | `now()` | — |

**Indexes:** 5 | **FKs to:** orders (deal_id)

---

### 2.3 ORDER DOMAIN — Orders & Tables

#### `orders` ★ (266 rows — 400 kB) *Largest table*

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `restaurant_id` | `uuid` FK | — | → `restaurants.id` |
| `customer_id` | `uuid?` FK | — | → `customers.id` |
| `order_number` | `text` UNIQUE | — | Human-readable number |
| `items` | `jsonb` | — | **Order items stored as JSON** |
| `total_price` | `int` | — | Total in PKR |
| `order_type` | `text` | — | `dine_in` / `takeaway` / `delivery` |
| `customer_name` | `text` | — | Customer name |
| `customer_phone` | `text?` | — | Customer phone |
| `table_number` | `text?` | — | Dine-in table |
| `delivery_address` | `text?` | — | Delivery address |
| `payment_method` | `text?` | `'cod'` | `cod` / `bank_transfer` / `easypaisa` |
| `payment_status` | `text?` | `'pending'` | `pending` / `paid` / `failed` |
| `order_status` | `text?` | `'received'` | `received` → `preparing` → `ready` → `completed` / `cancelled` |
| `whatsapp_sent` | `bool?` | `false` | WhatsApp notification sent |
| `email_sent` | `bool?` | `false` | Email notification sent |
| `deal_id` | `uuid?` FK | — | → `deals.id` |
| `discount_amount` | `int` | `0` | Discount applied |
| `table_id` | `uuid?` FK | — | → `restaurant_tables.id` |
| `prepared_at` | `timestamptz?` | — | When cooking started |
| `ready_at` | `timestamptz?` | — | When ready |
| `created_at` | `timestamptz?` | `now()` | Order time |
| `updated_at` | `timestamptz?` | `now()` | Last update |

**Indexes:** 13 (reduced from 16)
- `idx_orders_restaurant_status_created` ★ — primary query pattern
- `idx_orders_restaurant` — filter by restaurant
- `idx_orders_restaurant_status` — status per restaurant
- `idx_orders_customer` / `idx_orders_customer_id` — customer lookup
- `idx_orders_created_at` / `idx_orders_created_at_status` — time-based
- `idx_orders_order_number` — unique lookup
- `idx_orders_table_id`, `idx_orders_deal_id` — FK lookups
- `idx_orders_status`, `idx_orders_payment_status`, `idx_orders_order_type`

**items JSONB structure example:**
```json
[
  {
    "id": "uuid",
    "name_en": "Chicken Biryani",
    "quantity": 2,
    "price": 350,
    "subtotal": 700
  }
]
```

#### `restaurant_tables` (3 rows — 64 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `restaurant_id` | `uuid` FK | — | → `restaurants.id` |
| `table_number` | `text` | — | Table label |
| `capacity` | `int?` | `4` | Seating capacity |
| `is_active` | `bool?` | `true` | Table in use |
| `is_occupied` | `bool` | `false` | Currently occupied |
| `created_at` | `timestamptz?` | `now()` | — |
| `updated_at` | `timestamptz?` | `now()` | — |

**Indexes:** 3 | **FKs to:** orders (table_id)

---

### 2.4 CUSTOMER DOMAIN

#### `customers` (10 rows — 80 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | — | → `auth.users.id` |
| `name` | `text?` | — | Customer name |
| `phone` | `text?` | — | Phone number |
| `email` | `text?` UNIQUE | — | Email address |
| `city` | `text?` | — | City |
| `created_at` | `timestamptz?` | `now()` | — |
| `last_login` | `timestamptz?` | — | Last login time |

**Indexes:** 2 | **FKs to:** orders (customer_id)

#### `favorites` (4 rows — 56 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `user_id` | `uuid` FK | — | → `auth.users.id` |
| `restaurant_id` | `uuid` FK | — | → `restaurants.id` |
| `created_at` | `timestamptz?` | `now()` | — |

**Indexes:** 3

#### `customer_notifications` (12 rows — 64 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `customer_id` | `uuid` FK | — | → `auth.users.id` |
| `order_id` | `uuid` FK | — | → `orders.id` |
| `type` | `text` | `'status_update'` | Notification type |
| `title_en` | `text` | — | Title (English) |
| `title_ur` | `text?` | — | Title (Urdu) |
| `body_en` | `text?` | — | Body (English) |
| `body_ur` | `text?` | — | Body (Urdu) |
| `data` | `jsonb?` | `'{}'` | Extra payload |
| `is_read` | `bool?` | `false` | Read status |
| `created_at` | `timestamptz?` | `now()` | — |

**Indexes:** 3

#### `customer_audit_log` (74 rows — 112 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `customer_id` | `uuid?` | — | Customer reference |
| `action` | `text` | — | Action performed |
| `details` | `jsonb?` | `'{}'` | Audit payload |
| `ip_address` | `text?` | — | Client IP |
| `created_at` | `timestamptz?` | `now()` | — |

**Indexes:** 3

---

### 2.5 SUBSCRIPTION & BILLING DOMAIN

#### `plans` (7 rows — 96 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `slug` | `text` UNIQUE | — | `trial` / `starter` / `growth` / `premium` |
| `name` | `text` | — | Display name |
| `price_pkr` | `int` | `0` | Monthly price |
| `yearly_price_pkr` | `int?` | — | Yearly discount price |
| `max_dishes` | `int` | `20` | Dish limit (−1 = ∞) |
| `max_images` | `int` | `10` | Image limit |
| `max_orders` | `int` | `10` | Order limit (−1 = ∞) |
| `max_categories` | `int` | `20` | Category limit (−1 = ∞) |
| `analytics` | `bool` | `true` | Analytics access |
| `custom_branding` | `bool` | `false` | White-label |
| `can_have_qr` | `bool` | `true` | QR menu |
| `can_have_whatsapp` | `bool` | `true` | WhatsApp integration |
| `description` | `text?` | `''` | Plan description |
| `custom_features` | `jsonb?` | `'[]'` | Extra features list |
| `sort_order` | `int` | `0` | Display order |
| `is_active` | `bool` | `true` | Active for new signups |
| `billing_interval` | `text` | `'monthly'` | `monthly` / `yearly` |
| `offer_price_pkr` | `int?` | — | Discounted price |
| `offer_label` | `text?` | — | Discount badge text |
| `original_price_pkr` | `int?` | — | Original (strikethrough) |
| `created_at` | `timestamptz?` | `now()` | — |
| `updated_at` | `timestamptz?` | `now()` | — |

**Indexes:** 5

#### `subscriptions` (45 rows — 112 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `restaurant_id` | `uuid` FK | — | → `restaurants.id` |
| `plan` | `text` | — | Plan slug subscribed to |
| `amount_pkr` | `int` | — | Amount paid |
| `payment_method` | `text?` | — | How payment was made |
| `payment_ref` | `text?` | — | Payment reference |
| `transaction_ref` | `text?` | — | Transaction ID |
| `start_date` | `timestamptz?` | `now()` | Subscription start |
| `end_date` | `timestamptz?` | — | Expiry date |
| `status` | `text` | `'pending'` | `pending` / `active` / `expired` / `cancelled` / `refunded` |
| `billing_interval` | `text?` | — | `monthly` / `yearly` |
| `activated_by` | `uuid?` | — | Admin who activated |
| `notes` | `text?` | — | Admin notes |
| `created_at` | `timestamptz?` | `now()` | — |

**Indexes:** 4

---

### 2.6 NOTIFICATION DOMAIN

#### `owner_notifications` (53 rows — 120 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `restaurant_id` | `uuid?` FK | — | → `restaurants.id` |
| `type` | `text` | `'announcement'` | Notification type |
| `title` | `text` | — | Notification title |
| `body` | `text?` | — | Notification body |
| `link_url` | `text?` | — | Click-through URL |
| `is_read` | `bool?` | `false` | Read status |
| `created_at` | `timestamptz?` | `now()` | — |

**Indexes:** 4

#### `notification_logs` (265 rows — 160 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `restaurant_id` | `uuid?` FK | — | → `restaurants.id` |
| `order_id` | `uuid?` FK | — | → `orders.id` |
| `type` | `text` | — | `order_email` / `order_limit_alert` |
| `recipient_email` | `text?` | — | Email recipient |
| `status` | `text?` | `'sent'` | Delivery status |
| `created_at` | `timestamptz?` | `now()` | — |

**Indexes:** 3

#### `push_subscriptions` (0 rows — 64 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `restaurant_id` | `uuid` FK | — | → `restaurants.id` |
| `customer_id` | `uuid?` FK | — | → `auth.users.id` |
| `order_id` | `uuid?` FK | — | → `orders.id` |
| `endpoint` | `text` | — | Push endpoint URL |
| `p256dh_key` | `text` | — | Encryption key |
| `auth_key` | `text` | — | Auth secret |
| `user_agent` | `text?` | — | Browser info |
| `created_at` | `timestamptz?` | `now()` | — |

**Indexes:** 4

#### `qr_announcements` (2 rows — 32 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `title` | `text` | — | Announcement title |
| `body` | `text` | — | Announcement body |
| `created_by` | `uuid?` | — | Owner who created |
| `is_published` | `bool?` | `false` | Published status |
| `created_at` | `timestamptz?` | `now()` | — |
| `updated_at` | `timestamptz?` | `now()` | — |

**Indexes:** 1

---

### 2.7 SECURITY & ADMIN DOMAIN

#### `super_admins` (4 rows — 64 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `email` | `text` UNIQUE | — | Admin email (RBAC gate) |
| `created_at` | `timestamptz?` | `now()` | — |
| `created_by` | `uuid?` FK | — | → `auth.users.id` |

**Indexes:** 3

#### `superadmin_audit_log` (203 rows — 112 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `email` | `text` | — | Admin email |
| `action` | `text` | — | Action performed |
| `details` | `jsonb?` | `'{}'` | Action details |
| `ip_address` | `text` | `''` | Client IP |
| `created_at` | `timestamptz?` | `now()` | — |

**Indexes:** 3

#### `superadmin_login_attempts` (10 rows — 192 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `email` | `text` | — | Attempted email |
| `ip_address` | `text` | `''` | Client IP |
| `browser_fingerprint` | `text` | `''` | Browser fingerprint |
| `success` | `bool` | `false` | Login success |
| `attempted_at` | `timestamptz?` | `now()` | — |

**Indexes:** 4

#### `owner_audit_log` (190 rows — 192 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `restaurant_id` | `uuid` FK | — | → `restaurants.id` |
| `owner_id` | `uuid` | — | Owner user ID |
| `action` | `text` | — | Action performed |
| `details` | `jsonb?` | `'{}'` | Audit payload |
| `ip_address` | `text?` | `''` | Client IP |
| `created_at` | `timestamptz?` | `now()` | — |

**Indexes:** 5

#### `login_attempts` (0 rows — 64 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `email` | `text` | — | Login email |
| `ip_address` | `text` | `''` | Client IP |
| `success` | `bool` | `false` | Login success |
| `attempted_at` | `timestamptz?` | `now()` | — |

**Indexes:** 3

#### `rate_limits` (0 rows — 336 kB — no longer growing 🎉)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `identifier` | `text` | — | IP or user ID |
| `endpoint` | `text` | — | API endpoint path |
| `request_count` | `int` | `1` | Request count |
| `window_start` | `timestamptz?` | `now()` | Window start |
| `created_at` | `timestamptz?` | `now()` | — |

**Indexes:** 3 | **Currently inactive** — rate limiting is now in-memory

---

### 2.8 APP CONFIGURATION DOMAIN

#### `company_settings` (10 rows — 80 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `key` | `text` UNIQUE | — | Setting key (e.g. `app_name`) |
| `value` | `text` | — | Setting value |
| `updated_at` | `timestamptz?` | `now()` | Last update |

**Indexes:** 2

#### `contact_inquiries` (2 rows — 32 kB)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `uuid_generate_v4()` | — |
| `name` | `text` | — | Sender name |
| `email` | `text` | — | Sender email |
| `phone` | `text?` | — | Sender phone |
| `message` | `text` | — | Inquiry message |
| `is_read` | `bool?` | `false` | Admin read status |
| `created_at` | `timestamptz?` | `now()` | — |

**Indexes:** 1

---

## 3. DATA FLOW — ORDER LIFECYCLE

```
CUSTOMER                     API SERVER                         DATABASE
─────────                    ──────────                         ────────
    │                            │                                  │
    │  POST /api/orders          │                                  │
    │───────────────────────────▶│                                  │
    │                            │  1. Rate limit check (in-memory) │
    │                            │  2. CSRF guard                   │
    │                            │  3. Zod schema validation        │
    │                            │                                  │
    │                            │  4. Cache: restaurant lookup?    │
    │                            │───────────────────────────▶      │
    │                            │◀────────────────────────────     │
    │                            │                                  │
    │                            │  5. Cache: dish prices?         │
    │                            │───────────────────────────▶      │
    │                            │◀────────────────────────────     │
    │                            │                                  │
    │                            │  6. Enqueue per-restaurant       │
    │                            │     (serialize DB writes)        │
    │  202 Accepted              │                                  │
    │◀───────────────────────────│                                  │
    │                            │                                  │
    │                            │  ╔═══ QUEUE PROCESSOR ═══╗       │
    │                            │  ║                        ║       │
    │                            │  ║  7. Table occupancy    ║       │
    │                            │  ║     check              ║──────▶│
    │                            │  ║◀───────────────────────║       │
    │                            │  ║                        ║       │
    │                            │  ║  8. Upsert customer    ║──────▶│
    │                            │  ║                        ║       │
    │                            │  ║  9. INSERT order       ║──────▶│
    │                            │  ║                        ║       │
    │                            │  ║  10. Mark table occ.   ║──────▶│
    │                            │  ║                        ║       │
    │                            │  ║  11. INSERT notif_log  ║──────▶│
    │                            │  ║                        ║       │
    │                            │  ╚════════════════════════╝       │
    │                            │                                  │
    │                            │  Fire-and-forget (async):        │
    │                            │  ├─ push notification            │
    │                            │  ├─ order limit alert email      │
    │                            │  └─ customer audit log           │
    │                            │                                  │
    │  { order, whatsapp_url }   │                                  │
    │◀───────────────────────────│                                  │
```

---

## 4. SIZE & CAPACITY SUMMARY

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE AT A GLANCE                         │
├─────────────────────────────────────────────────────────────────┤
│  Total Size:       21 MB  ████░░░░░░░░░░░░░░░░░  4.1% of 500MB │
│  Largest Table:    orders          400 kB                        │
│  Most Rows:        orders          266 rows                      │
│  Most Indexes:     orders          13 indexes                    │
│  Most Audit Logs:  superadmin      203 entries                   │
│  Emptiest:         deals           0 rows                        │
├─────────────────────────────────────────────────────────────────┤
│  CONNECTIONS TO AUTH (auth.users):                               │
│    restaurants.owner_id                                          │
│    customers.id                                                  │
│    favorites.user_id                                             │
│    customer_notifications.customer_id                            │
│    push_subscriptions.customer_id                                │
│    super_admins.created_by                                       │
├─────────────────────────────────────────────────────────────────┤
│  CAPACITY ESTIMATES (80% of 500 MB = 400 MB usable):            │
│    ┌──────────────────────┬───────────┬──────────────────────┐   │
│    │ Entity               │ Current   │ Estimated Max        │   │
│    ├──────────────────────┼───────────┼──────────────────────┤   │
│    │ Restaurants           │ 12        │ 1,000-2,000         │   │
│    │ Orders                │ 266       │ 50,000-80,000       │   │
│    │ Dishes                │ 35        │ 20,000-40,000       │   │
│    │ Auth Users (total)    │ 15        │ 5,000-8,000         │   │
│    │ Customers             │ 10        │ 5,000-8,000         │   │
│    └──────────────────────┴───────────┴──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. INDEX STRATEGY

```
orders table — 13 indexes (optimized for query patterns):

  ★ idx_orders_restaurant_status_created    — "show me orders for this restaurant by status"
  ★ idx_orders_restaurant                   — "show me all orders for this restaurant"
  ★ idx_orders_restaurant_status            — "count active orders for limit check"
  ★ idx_orders_customer / customer_id       — "find orders by customer"
  ★ idx_orders_created_at / created_at_status — "today's orders / sort by time"
  ★ idx_orders_order_number                 — "lookup by order number"

  Other tables follow a simple pattern:
  - PK on id (always)
  - Index on FK columns (restaurant_id, customer_id, etc.)
  - Index on commonly filtered columns (city, status, created_at)
```

---

## 6. RECENT OPTIMIZATIONS

| Change | Impact |
|---|---|
| 🟢 **Rate limiter moved to memory** | `rate_limits` table stops growing — was adding 1 row/request |
| 🟢 **Connection pooling added** | `createPooledClient()` via pgBouncer (port 6543) |
| 🟢 **In-memory caching** | Restaurant data (5s) + dish prices (15s) — fewer DB reads |
| 🟢 **Per-restaurant order queue** | Serializes writes per restaurant to reduce contention |
| 🟢 **Dropped 3 redundant indexes** | `idx_orders_order_type`, `idx_orders_payment_status`, `idx_orders_created` |
| 🟢 **Customer upsert optimized** | Only queries when `customer_id` is provided |
| ❌ **5 orphan school tables removed** | Was 29 tables → now 24 clean tables |

---

## 7. FOREIGN KEY MAP

```
restaurants
  ├── owner_id ─────────────────────→ auth.users
  ├── categories.restaurant_id ────→ restaurants
  ├── dishes.restaurant_id ────────→ restaurants
  │   └── dishes.category_id ──────→ categories
  ├── deals.restaurant_id ─────────→ restaurants
  │   └── deals.dish_id ───────────→ dishes
  ├── orders.restaurant_id ────────→ restaurants
  │   ├── orders.customer_id ──────→ customers
  │   │   └── customers.id ────────→ auth.users
  │   ├── orders.deal_id ──────────→ deals
  │   └── orders.table_id ─────────→ restaurant_tables
  ├── subscriptions.restaurant_id ─→ restaurants
  ├── restaurant_tables.restaurant_id → restaurants
  ├── favorites.restaurant_id ─────→ restaurants
  │   └── favorites.user_id ───────→ auth.users
  ├── owner_audit_log.restaurant_id → restaurants
  ├── owner_notifications.restaurant_id → restaurants
  ├── notification_logs.restaurant_id → restaurants
  │   └── notification_logs.order_id → orders
  ├── push_subscriptions.restaurant_id → restaurants
  │   ├── push_subscriptions.customer_id → auth.users
  │   └── push_subscriptions.order_id → orders
  ├── customer_notifications.order_id → orders
  │   └── customer_notifications.customer_id → auth.users
  └── super_admins.created_by ─────→ auth.users
```

---

*Generated: July 2026 | Platform: Supabase Free Plan | 24 tables, 21 MB / 500 MB*
