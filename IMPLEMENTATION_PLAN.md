# QRMenu.pk — Complete Implementation & Fix Plan

> Generated: 2026-06-24
> Based on full project analysis (Frontend + Backend + Performance + Security)

---

## PHASE 0: FOUNDATION FIXES (Day 1-2)
### Critical bugs that break core user flow

### 0.1 Fix Bottom Nav "Orders" 404
**Files:** `app/(customer)/layout.tsx`, `app/(customer)/account/page.tsx`

**Problem:** Bottom nav links to `/account` but no page exists at that route.

**Fix:** Create the account/orders page:
```tsx
// app/(customer)/account/page.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { ArrowLeft, ClipboardList, ChevronRight } from "lucide-react"

export default function AccountPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) { setLoading(false); return }
      
      const { data } = await supabase
        .from("orders")
        .select("*, restaurants(name, slug)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)
      
      setOrders(data || [])
      setLoading(false)
    }
    fetchOrders()
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <ClipboardList className="w-10 h-10 text-text-muted mb-4" />
        <h2 className="text-lg font-bold text-text-primary mb-1">Sign in to view orders</h2>
        <p className="text-sm text-text-secondary mb-8">Track your order history</p>
        <Link href="/login?redirect=/account" className="bg-primary text-white px-8 py-3 rounded-xl text-sm font-semibold">
          Sign In
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-text-muted">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 h-14 max-w-[600px] mx-auto">
          <Link href="/restaurants" className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-[15px] font-bold text-text-primary">My Orders</h1>
        </div>
      </header>
      <main className="max-w-[600px] mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="w-10 h-10 text-text-muted mx-auto mb-4" />
            <p className="text-sm text-text-secondary">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order.id} href={`/order-confirm/${order.id}`}
                className="flex items-center gap-3 bg-white rounded-2xl border border-border p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">
                    #{order.order_number} — {order.restaurants?.name}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {new Date(order.created_at).toLocaleDateString()} • Rs {order.total_price} • {order.order_status}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
```

**Testing:** Click "Orders" in bottom nav → should show sign-in prompt or order list.

---

### 0.2 Add loading.tsx for menu/[slug]
**File:** `app/(customer)/menu/[slug]/loading.tsx`

**Problem:** No loading skeleton — page flashes blank during hydration.

**Fix:** Create loading skeleton:
```tsx
export default function MenuLoading() {
  return (
    <div className="max-w-[600px] mx-auto min-h-screen bg-white px-4">
      <div className="animate-pulse space-y-4 pt-4">
        <div className="h-44 bg-[#F5F5F5] rounded-2xl" />
        <div className="h-6 bg-[#F5F5F5] rounded w-1/2" />
        <div className="h-4 bg-[#F5F5F5] rounded w-1/3" />
        <div className="grid grid-cols-2 gap-3 mt-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-32 bg-[#F5F5F5] rounded-xl" />
              <div className="h-4 bg-[#F5F5F5] rounded w-3/4" />
              <div className="h-3 bg-[#F5F5F5] rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

### 0.3 Fix "Continue Browsing" — router.back() Bug
**File:** `app/(customer)/cart/page.tsx` (line 155)

**Problem:** `router.back()` breaks if user arrived via bookmark/direct link.

**Fix:** Replace with direct link to restaurant menu:
```tsx
const restaurantSlug = useCartStore((s) => s.restaurantId) // Need to store slug too

// Or better — add restaurantSlug to cartStore:
// In cartStore: restaurantSlug: string | null
<Link 
  href={restaurantSlug ? `/menu/${restaurantSlug}` : "/restaurants"}
  className="w-full py-3 rounded-xl text-[13px] text-text-secondary font-medium border border-border hover:bg-white transition-colors text-center block"
>
  Continue Browsing
</Link>
```

**Also needed:** Add `restaurantSlug` field to cartStore and set it alongside `restaurantId`.

---

### 0.4 Add Clear Cart Confirmation
**File:** `app/(customer)/cart/page.tsx` (line 59)

**Problem:** One tap clears entire cart with no warning.

**Fix:** Add confirmation via a simple state toggle:
```tsx
const [showClearConfirm, setShowClearConfirm] = useState(false)

// Button changes:
{showClearConfirm ? (
  <div className="flex gap-2">
    <button onClick={() => { clearCart(); setShowClearConfirm(false) }}
      className="text-xs text-error font-medium px-3 py-1.5 rounded-lg bg-error/10">
      Confirm Clear
    </button>
    <button onClick={() => setShowClearConfirm(false)}
      className="text-xs text-text-muted font-medium px-3 py-1.5 rounded-lg hover:bg-[#F5F5F5]">
      Cancel
    </button>
  </div>
) : (
  <button onClick={() => setShowClearConfirm(true)}
    className="text-xs text-text-muted font-medium px-3 py-1.5 rounded-lg hover:bg-[#F5F5F5]">
    Clear All
  </button>
)}
```

---

## PHASE 1: RESTAURANT LISTING OVERHAUL (Day 2-3)
### Fix the core customer entry point

### 1.1 Pass SSR Data to RestaurantsClient — Eliminate Double Fetch
**Files:** `app/(customer)/restaurants/page.tsx`, `app/(customer)/restaurants/RestaurantsClient.tsx`

**Problem:** Server fetches all restaurants but passes nothing to client. Client re-fetches everything in useEffect.

**Fix — Server Component (`page.tsx`):**
```tsx
export default async function RestaurantsPage() {
  const supabase = await createClient()
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, slug, city, cuisine_type, logo_url, description")
    .eq("is_active", true)
    .eq("is_suspended", false)
    .order("name")

  return (
    <>
      <ItemListJsonLd items={items} />
      <RestaurantsClient initialRestaurants={restaurants ?? []} initialCities={
        [...new Set((restaurants ?? []).map(r => r.city))].sort()
      } />
    </>
  )
}
```

**Fix — Client Component (`RestaurantsClient.tsx`):**
```tsx
interface Props {
  initialRestaurants: RestaurantSummary[]
  initialCities: string[]
}

export function RestaurantsClient({ initialRestaurants, initialCities }: Props) {
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>(initialRestaurants)
  const [allCities] = useState<string[]>(initialCities)  // No longer needs effect!
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)  // Start false!

  // Only re-fetch on city filter (NOT on initial mount)
  useEffect(() => {
    if (!selectedCity) {
      setRestaurants(initialRestaurants)
      return
    }
    const fetchFiltered = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from("restaurants")
        .select("id, name, slug, city, cuisine_type, logo_url")
        .eq("is_active", true)
        .eq("city", selectedCity)
        .order("name")
      setRestaurants(data || [])
      setLoading(false)
    }
    fetchFiltered()
  }, [selectedCity, initialRestaurants])

  // ... rest stays the same
}
```

**Benefits:**
- ✅ Zero loading skeleton on first render
- ✅ One fewer Supabase round-trip
- ✅ No CLS from city chips appearing late
- ✅ Server render actually does useful work

---

### 1.2 Safe Area + Bottom Padding Fixes
**File:** `app/(customer)/restaurants/RestaurantsClient.tsx`

```tsx
// HEADER — add safe-top:
<div className="fixed top-0 left-0 right-0 z-40 bg-white/80 safe-top"
     style={{ backdropFilter: "blur(12px)" }}>

// MAIN CONTENT — fix bottom padding for nav:
<main className="pt-[140px] pb-[80px] px-4 max-w-[600px] mx-auto">
```

**Also fix in `app/(customer)/restaurant/[slug]/RestaurantDetailClient.tsx`:**
```tsx
// Header:
<div className="fixed top-0 left-0 right-0 z-40 bg-white/80 safe-top"

// Content bottom padding:
<main className="pt-12 pb-[100px] px-4 max-w-[600px] mx-auto">
```

**Also fix in `app/(customer)/layout.tsx`:** Add safe-area bottom to nav:
```tsx
<nav className="fixed bottom-0 left-0 right-0 h-[60px] bg-white border-t border-border
  flex items-center justify-around z-50 pb-[env(safe-area-inset-bottom)]">
```

---

### 1.3 Add CSS Safe Area Utilities (if not existing)
**File:** `app/globals.css`

```css
@layer utilities {
  .safe-top {
    padding-top: env(safe-area-inset-top, 0px);
  }
  .safe-bottom {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
}
```

---

### 1.4 Add Horizontal Scroll Fade to City Chips
**File:** `app/(customer)/restaurants/RestaurantsClient.tsx`

Replace the city chips div with:
```tsx
<div className="relative px-4 pb-3 max-w-[600px] mx-auto">
  <div className="absolute left-4 top-0 bottom-3 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
  <div className="absolute right-4 top-0 bottom-3 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
  <div className="flex gap-2 overflow-x-auto no-scrollbar">
    {/* ... chips ... */}
  </div>
</div>
```

---

### 1.5 Upgrade Restaurant Cards with Visual Hierarchy
**File:** `app/(customer)/restaurants/RestaurantsClient.tsx`

Replace the existing card with a richer version:

```tsx
// Add these fields to the RestaurantSummary interface:
interface RestaurantSummary {
  id: string
  name: string
  slug: string
  city: string
  cuisine_type: string | null
  logo_url: string | null
  description?: string | null
  rating?: number
  delivery_time_min?: number
  delivery_fee?: number
  is_open?: boolean
}

// Updated card:
<Link key={r.id} href={`/restaurant/${r.slug}`}
  className="block bg-white rounded-2xl border border-border overflow-hidden
    hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all active:scale-[0.99]">
  
  {/* Cover Image Area */}
  <div className="relative h-28 bg-gradient-to-br from-primary/5 to-primary/10">
    {r.logo_url ? (
      <Image src={r.logo_url} alt={r.name} fill className="object-cover opacity-40" sizes="600px" />
    ) : null}
    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
    
    {/* Logo overlay */}
    {r.logo_url ? (
      <div className="absolute -bottom-6 left-4 w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm">
        <Image src={r.logo_url} alt={r.name} width={48} height={48} className="object-cover" />
      </div>
    ) : (
      <div className="absolute -bottom-6 left-4 w-12 h-12 rounded-xl bg-primary text-white 
        flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
        {r.name.charAt(0).toUpperCase()}
      </div>
    )}
  </div>

  {/* Info */}
  <div className="pt-8 p-4">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-[15px] text-text-primary truncate">{r.name}</h3>
        <p className="text-[12px] text-text-secondary mt-0.5">
          {r.cuisine_type || "Restaurant"} • {r.city}
        </p>
      </div>
      {/* Open badge */}
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2
        ${r.is_open !== false ? 'bg-accent/10 text-accent' : 'bg-error/10 text-error'}`}>
        {r.is_open !== false ? '● Open' : '● Closed'}
      </span>
    </div>

    {/* Rating + Delivery Row */}
    <div className="flex items-center gap-3 mt-2 text-[11px] text-text-secondary">
      {r.rating ? (
        <span className="flex items-center gap-1">
          <span className="text-yellow-500">★</span> {r.rating.toFixed(1)}
        </span>
      ) : null}
      {r.delivery_time_min ? (
        <span className="flex items-center gap-1">🕐 {r.delivery_time_min} min</span>
      ) : null}
      {r.delivery_fee !== undefined ? (
        <span className="flex items-center gap-1">
          {r.delivery_fee === 0 ? '🚚 Free' : `🚚 Rs ${r.delivery_fee}`}
        </span>
      ) : null}
    </div>
  </div>
</Link>
```

**Also need to update the Supabase query** in both server and client to select the additional fields:
```tsx
.select("id, name, slug, city, cuisine_type, logo_url, description, rating, delivery_time_min, delivery_fee, is_open")
```

---

### 1.6 Add Responsive Grid for Wider Screens
**File:** `app/(customer)/restaurants/RestaurantsClient.tsx`

```tsx
// Replace the single-column space-y-4 with:
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* cards */}
</div>
```

---

## PHASE 2: DEDUPLICATE & UNIFY MENU EXPERIENCES (Day 3-4)

### 2.1 Remove Inline DishCard, Use Shared DishGrid.Card
**File:** `app/(customer)/restaurant/[slug]/RestaurantDetailClient.tsx`

**Problem:** Two separate DishCard implementations — inline version in RestaurantDetailClient (missing badges, i18n, memo) and DishGrid.Card (full featured).

**Fix:** Delete the inline `DishCard` function (lines 36-106) and import the shared one:

```tsx
import { DishGrid } from "@/components/customer/DishGrid"

// Replace the DishCard usage in the categories render with:
import { Card as DishCard } from "@/components/customer/DishGrid"

// Then in the JSX where DishCard was used:
<DishCard dish={dish} />
```

**Note:** The `DishGrid.Card` component may need its `onAdd`/`onUpdateQuantity` pattern checked — it might work slightly differently from the inline version. Test cart interaction after swap.

**If direct swap is complex, create a shared wrapper:**
```tsx
// components/customer/SharedDishCard.tsx
export { Card as SharedDishCard } from "./DishGrid"
```

---

### 2.2 Deduplicate WhatsApp URL Builder
**Files:** `app/(customer)/order-confirm/[id]/page.tsx` (lines 11-42), `app/api/orders/route.ts` (lines 157-198)

**Problem:** The `buildWhatsAppUrl`/`buildWhatsAppURL` function is duplicated between the client order confirm page and the API orders route.

**Fix:** Move to a shared lib file:
```tsx
// lib/whatsapp.ts
export function buildWhatsAppUrl(order: {
  orderNumber: string
  items: Array<{ name_en: string; quantity: number; subtotal: number }>
  totalPrice: number
  paymentMethod: string
  customerName: string
  customerPhone?: string
  orderType: string
  tableNumber?: string
  deliveryAddress?: string
  restaurantPhone: string
}): string {
  // ... single implementation
}
```

Then import from both places:
```tsx
import { buildWhatsAppUrl } from "@/lib/whatsapp"
```

---

## PHASE 3: STATE MANAGEMENT FIXES (Day 4)

### 3.1 Fix orderStore — Stop Persisting Transient State
**File:** `stores/orderStore.ts`

**Problem:** `currentOrder`, `isLoading`, and `error` are persisted to localStorage. This causes stale state restoration and localStorage bloat.

**Fix:** Add `partialize` to the persist middleware:
```tsx
export const useOrderStore = create<OrderFormState>()(
  persist(
    (set) => ({
      ...initialFormState,
      currentOrder: null,
      isLoading: false,
      error: null,
      // ... setters ...
    }),
    {
      name: "order-form-storage",
      // Only persist form fields, not transient state:
      partialize: (state) => ({
        orderType: state.orderType,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        tableNumber: state.tableNumber,
        deliveryAddress: state.deliveryAddress,
        paymentMethod: state.paymentMethod,
      }),
    }
  )
)
```

---

### 3.2 Add restaurantSlug to CartStore
**File:** `stores/cartStore.ts`

**Problem:** Cart page's "Continue Browsing" can't link back to the specific restaurant menu without knowing the slug.

**Fix:**
```tsx
interface CartState {
  // ... existing fields ...
  restaurantSlug: string | null
  // ... in actions:
  setRestaurant: (id: string, name: string, slug: string, deliveryFee?: number) => void
}
```

Update all callers:
```tsx
// In RestaurantDetailClient:
setRestaurant(restaurant.id, restaurant.name, restaurant.slug, restaurant.delivery_fee ?? 0)

// In MenuContent:
setRestaurant(restaurantId, restaurantName, slug, 0)  // need slug passed as prop
```

---

## PHASE 4: PERFORMANCE OPTIMIZATIONS (Day 4-5)

### 4.1 Add Image Transformation Parameters
**Files:** All components using `next/image` with Supabase URLs

Add image transformation to Supabase Storage URLs:
```tsx
// lib/utils.ts
export function optimizeImageUrl(url: string | null, width = 200, quality = 75): string | null {
  if (!url) return null
  if (!url.includes('supabase') && !url.includes('storage')) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}width=${width}&quality=${quality}`
}

// Usage in components:
<Image src={optimizeImageUrl(dish.image_url, 96)} alt={...} ... />
```

**Target all image usage:**
- `DishGrid.tsx` — dish images (96px, 160px)
- `CartBar.tsx` — no images currently, but future
- `RestaurantDetailClient.tsx` — logo, dish images
- `RestaurantsClient.tsx` — logo images
- `MenuHeader.tsx` — logo, cover
- `cart/page.tsx` — dish images
- `checkout/page.tsx` — item images

---

### 4.2 Add blurDataURL for Images
```tsx
// Generate a tiny placeholder:
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="#F5F5F5"/>
</svg>`

const toBase64 = (str: string) => typeof window === 'undefined' 
  ? Buffer.from(str).toString('base64') 
  : window.btoa(str)

// Usage:
<Image 
  src={url} 
  placeholder="blur" 
  blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(96, 96))}`}
  ...
/>
```

---

### 4.3 Add Cart Store Selector Optimization
**File:** `stores/cartStore.ts`

**Problem:** Every `addItem` creates a new array, triggering re-renders in all subscribers.

**Fix:** Components should use granular selectors:
```tsx
// Instead of:
const items = useCartStore((s) => s.items)
const totalPrice = useCartStore((s) => s.getTotalPrice())

// Better — memoize totals:
const totalItems = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
const subtotal = useCartStore((s) => s.items.reduce((sum, i) => sum + i.dish.price * i.quantity, 0))
```

**More advanced — add selector helpers to the store:**
```tsx
// In cartStore:
getTotalItems: () => {
  const { items } = get()
  const total = items.reduce((sum, item) => sum + item.quantity, 0)
  return total
},
```

Or better, use Zustand's `useShallow`:
```tsx
import { useShallow } from "zustand/react/shallow"

const { items, addItem } = useCartStore(
  useShallow((s) => ({ items: s.items, addItem: s.addItem }))
)
```

---

### 4.4 Fix Delivery Fee Hardcode in MenuContent
**File:** `components/customer/MenuContent.tsx` (line 31)

**Problem:** Delivery fee is hardcoded as `0` instead of reading from DB.

**Fix:** Accept `deliveryFee` prop and pass it from the server component:
```tsx
// In MenuContent props:
interface Props {
  categories: ...
  restaurantId: string
  restaurantName: string
  restaurantSlug: string  // Add for cart store
  deliveryFee: number
}

// Usage:
setRestaurant(restaurantId, restaurantName, restaurantSlug, deliveryFee)
```

**In `menu/[slug]/page.tsx`:** 
```tsx
<MenuContent
  categories={categories}
  restaurantId={restaurant.id}
  restaurantName={restaurant.name}
  restaurantSlug={restaurant.slug}
  deliveryFee={restaurant.delivery_fee ?? 0}
/>
```

---

## PHASE 5: BACKEND FIXES (Day 5-7)

### 5.1 Add Zod Validation to Owner Dish PATCH
**File:** `app/api/owner/dishes/route.ts`

**Problem:** PATCH handler accepts raw body without validation.

**Fix:** Reuse existing dishSchema or create a PATCH-specific schema:
```tsx
const dishUpdateSchema = z.object({
  id: z.string().uuid(),
  name_en: z.string().min(1).optional(),
  name_ur: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  description_ur: z.string().nullable().optional(),
  price: z.number().int().positive().optional(),
  image_url: z.string().url().nullable().optional(),
  is_available: z.boolean().optional(),
  sort_order: z.number().int().nonnegative().optional(),
  tags: z.array(z.string()).optional(),
  category_id: z.string().uuid().nullable().optional(),
})

// Usage in PATCH handler:
const parsed = dishUpdateSchema.safeParse(body)
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
}
const { id, ...updates } = parsed.data
// Use `updates` for the DB update
```

---

### 5.2 Add Restaurant Ownership Check to Dish PATCH
**File:** `app/api/owner/dishes/route.ts`

**Problem:** PATCH doesn't verify the dish belongs to the owner's restaurant.

**Fix:**
```tsx
// After getting the dish ID from body:
const { data: dish } = await supabase
  .from("dishes")
  .select("restaurant_id")
  .eq("id", dishId)
  .single()

if (!dish) return NextResponse.json({ error: "Dish not found" }, { status: 404 })

// Verify restaurant belongs to this owner:
const { data: restaurant } = await supabase
  .from("restaurants")
  .select("owner_id")
  .eq("id", dish.restaurant_id)
  .single()

if (!restaurant || restaurant.owner_id !== user.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
}
```

---

### 5.3 Fix Superadmin Analytics — Use SQL Aggregation
**File:** `app/api/superadmin/analytics/route.ts`

**Problem:** Pulls ALL orders with `.limit(20000)` and aggregates in JS memory. Will OOM as data grows.

**Fix — Use SQL aggregation instead:**
```tsx
// Instead of fetching all orders:
const { data: stats } = await supabase
  .from("daily_order_stats")
  .select("*")
  .order("order_date", { ascending: false })
  .limit(365)

// For real-time totals:
const { count: totalOrders } = await supabase
  .from("orders")
  .select("id", { count: "exact", head: true })

const { data: revenueData } = await supabase
  .rpc("get_total_revenue") // Create a DB function
```

**Create a DB function for this:**
```sql
CREATE OR REPLACE FUNCTION get_total_revenue()
RETURNS TABLE(total_orders bigint, total_revenue numeric, total_customers bigint) 
LANGUAGE SQL AS $$
  SELECT 
    COUNT(*)::bigint,
    COALESCE(SUM(total_price), 0)::numeric,
    COUNT(DISTINCT customer_id)::bigint
  FROM orders
  WHERE order_status != 'cancelled';
$$;
```

---

### 5.4 Add Rate Limit Table Index + Cleanup
**File:** `lib/rate-limiter.ts` + `supabase_migration.sql`

**Add index:**
```sql
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup 
ON rate_limits(identifier, endpoint, window_start DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limits_created 
ON rate_limits(created_at);
```

**Add cleanup:**
```sql
-- Delete rows older than 24 hours (run via pg_cron or application-level cron)
DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '24 hours';
```

**Add to application startup or create a scheduled cleanup function:**
```tsx
// In rate-limiter.ts — periodic cleanup:
export async function cleanupRateLimits() {
  const supabase = createAdminClient()
  await supabase
    .from("rate_limits")
    .delete()
    .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
}
```

---

### 5.5 Switch Materialized View Refresh to Cron-Based
**File:** `supabase_migration.sql` (line 221)

**Problem:** `REFRESH MATERIALIZED VIEW CONCURRENTLY` fires on EVERY order status update.

**Fix:** Remove trigger-based refresh and use pg_cron:
```sql
-- Remove the trigger:
DROP TRIGGER IF EXISTS refresh_daily_stats_trigger ON orders;

-- Add cron job (requires pg_cron extension):
SELECT cron.schedule('refresh-daily-stats', '*/5 * * * *', 
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY daily_order_stats$$);
```

If pg_cron isn't available, use a Vercel cron job:
```tsx
// app/api/cron/refresh-stats/route.ts
import { createAdminClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  
  const supabase = createAdminClient()
  await supabase.rpc("refresh_daily_stats")
  
  return Response.json({ ok: true })
}
```

---

## PHASE 6: SECURITY HARDENING (Day 7)

### 6.1 Add Rate Limiting to Unprotected Superadmin Endpoints
**Files:** 
- `app/api/superadmin/analytics/route.ts`
- `app/api/superadmin/restaurants/route.ts`
- `app/api/superadmin/customers/route.ts`
- `app/api/superadmin/users/route.ts`

Add to each:
```tsx
import { rateLimit, getClientIp } from "@/lib/rate-limiter"

export async function GET(request: Request) {
  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 30, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }
  // ... rest
}
```

---

### 6.2 Add Image Upload Ownership Validation
**File:** `supabase_migration.sql` — Storage policies

**Fix:** Update the storage RLS policy to validate ownership:
```sql
-- Instead of allowing ALL authenticated users:
CREATE POLICY "Restaurant owners can upload dish images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'dish-images' AND
  auth.uid() IN (
    SELECT owner_id FROM restaurants WHERE id::text = (storage.foldername(name))[1]
  )
);
```

---

## PHASE 7: MISSING FEATURES (Day 8-10)

### 7.1 Add Rating/Review Display
**Files:** `RestaurantsClient.tsx`, `RestaurantDetailClient.tsx`

The `Restaurant` type already has `rating` and `review_count` fields, they're just never displayed. Add to restaurant cards and detail page.

**On restaurant list cards:**
```tsx
{r.rating ? (
  <span className="flex items-center gap-1 text-xs">
    <span className="text-yellow-500">★</span>
    {r.rating.toFixed(1)} ({r.review_count})
  </span>
) : null}
```

---

### 7.2 Add Dish-Level Search Across Restaurants
**File:** `RestaurantsClient.tsx`

Add a "Search by dish name" option that queries the dishes table:
```tsx
// In the search handler:
const searchByDish = async (query: string) => {
  const supabase = createClient()
  const { data } = await supabase
    .from("dishes")
    .select("restaurant_id, name_en, restaurants!inner(id, name, slug)")
    .ilike("name_en", `%${query}%`)
    .limit(20)
  // Group results by restaurant
}
```

---

### 7.3 Add 404/Error Pages for Missing Restaurants
The `restaurant/[slug]/error.tsx` exists but `menu/[slug]` has no error boundary. Create one:
```tsx
// app/(customer)/menu/[slug]/error.tsx
"use client"

export default function MenuError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-lg font-bold mb-2">Menu unavailable</h2>
        <p className="text-sm text-text-secondary mb-6">{error.message}</p>
        <button onClick={reset} className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-semibold">
          Try again
        </button>
      </div>
    </div>
  )
}
```

---

## IMPLEMENTATION ORDER SUMMARY

| Phase | Days | Focus | Key Deliverables |
|---|---|---|---|
| **0** | 1-2 | Foundation fixes | Fix 404, loading states, router bugs, clear cart confirm |
| **1** | 2-3 | Restaurant listing overhaul | SSR pass-through, safe areas, rich cards, responsive grid |
| **2** | 3-4 | Menu deduplication | Shared DishCard, shared WhatsApp URL builder |
| **3** | 4 | State management | orderStore partialize, cartStore slug |
| **4** | 4-5 | Performance | Image optimization, selector optimization, delivery fee fix |
| **5** | 5-7 | Backend fixes | Zod validation, ownership checks, SQL aggregation, indexes, cron |
| **6** | 7 | Security | Rate limits on superadmin, storage policies |
| **7** | 8-10 | Missing features | Rating display, dish search, error pages |

---

## TESTING CHECKLIST

After each change, verify:
- [ ] Page loads without console errors
- [ ] Loading states display correctly (skeleton → content)
- [ ] Empty states display correctly (no restaurants, no menu items, empty cart)
- [ ] Error states display correctly and retry works
- [ ] Form validation shows field-level errors
- [ ] Cart operations work (add, update, remove, clear)
- [ ] Checkout flow completes (order type → form → payment → order placed)
- [ ] WhatsApp opens with correct order details
- [ ] Mobile responsive (iPhone SE, iPhone 14, Pixel 7, tablet)
- [ ] Notched devices don't clip content (safe areas)
- [ ] Slow 3G loads without timing out
- [ ] Backend API returns proper error codes
- [ ] Rate limiting works correctly
- [ ] Database indexes are used (check with EXPLAIN ANALYZE)
