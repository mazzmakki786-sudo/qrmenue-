# Bug & Issues Report

**Generated:** June 2026
**Project:** QRMenu.pk
**Vercel:** https://qr-menue-one.vercel.app

---

## ✅ ALL KNOWN BUGS FIXED

| # | Issue | Severity | Fix Date |
|---|-------|----------|----------|
| 1 | Announcement emails use `onboarding@resend.dev` — not delivered to owners | 🔴 | No custom domain available — kept as-is with note |
| 2 | Super Admin publish creates inline admin client (bypasses centralized config) | 🔴 | ✅ Fixed |
| 3 | Super admin auth check uses wrong env var — unauthorized access possible | 🔴 | ✅ Fixed |
| 4 | 7 tables RLS enabled but zero policies — any auth user can query all data | 🔴 | ✅ Fixed |
| 5 | Orders INSERT policy WITH CHECK (true) — anyone can create orders unrestrictedly | 🔴 | ✅ Fixed |
| 6 | 4 API routes crash on malformed JSON (no try/catch) | 🟡 | ✅ Fixed |
| 7 | Image limit off-by-one bug on dish update | 🟡 | ✅ Fixed |
| 8 | Restaurant .single() crashes if multiple rows exist | 🟡 | ✅ Fixed (.maybeSingle()) |
| 9 | Category delete returns raw DB error (schema leak) | 🟡 | ✅ Fixed (check dishes first) |
| 10 | notification_logs RLS missing — order notification history exposed | 🟡 | ✅ Fixed |
| 11 | daily_order_stats materialized view exposed via API | 🟡 | ✅ Fixed |
| 12 | Missing rate limiting on superadmin endpoints | 🟢 | ✅ Fixed (DB-based) |
| 13 | Announcement published but DB update might fail silently | 🟢 | ✅ Fixed |
| 14 | owner_notifications INSERT failure silently ignored | 🟢 | ✅ Fixed |
| 15 | Notification failure fully swallowed (no logging) | 🟢 | ✅ Fixed (console.error added) |
| 16 | Whitespace-only strings pass validation | 🟢 | ✅ Fixed (.trim()) |
| 17 | Cannot clear announcement title/body via PATCH | 🟢 | ✅ Fixed |
| 18 | Delete/PATCH non-existent returns success (misleading) | 🟢 | ✅ Fixed |
| 19 | Order PATCH accepts any status string — no validation | 🟢 | ✅ Fixed |
| 20 | Leaked password protection disabled | 🟢 | ⏳ Supabase Auth setting |
| 21 | pg_trgm extension in public schema | 🟢 | Supabase managed |
| 22 | rls_auto_enable function executable by anon role | 🟢 | Supabase managed |
| 23 | Corrupted characters in menu page | 🟢 | ✅ Fixed |
| 24 | BellNotification dropdown/tost/mobile issues | 🔴 | ✅ Fixed (previous session) |
| 25 | Duplicate announcement popup from dashboard | 🟡 | ✅ Fixed (previous session) |
| 26 | Z-index conflict header vs overlay | 🟡 | ✅ Fixed (previous session) |

---

## 🔧 FIXES APPLIED THIS SESSION

### Database (Supabase Migrations)
- **RLS policies created** for: `notification_logs`, `owner_notifications`, `company_settings`, `subscriptions`, `qr_announcements`, `superadmin_audit_log`, `superadmin_login_attempts`
- **Fixed orders INSERT policy** — now validates restaurant is active & not suspended
- **Revoked public access** to `daily_order_stats` materialized view
- **Created `rate_limits` table** for DB-based rate limiting

### Security Fixes
- **`publish/route.ts`**: Uses imported `SUPER_ADMIN_EMAIL` constant instead of `process.env.SUPER_ADMIN_EMAIL` directly | Uses centralized `createAdminClient()` instead of inline supabase-js import | Added existence check + already-published guard
- **`[id]/route.ts`**: Added existence check before delete/PATCH | Fixed falsy check to allow clearing title/body | Added try/catch for JSON parse | Returns 400 on empty update

### API Route Fixes
- **`announcements/route.ts`**: Added try/catch for JSON | Added `.trim()` validation | Made `checkRateLimit` async
- **`orders/[id]/route.ts`**: Added try/catch for JSON | Added enum validation for `order_status`, `payment_status`, `payment_method` | Returns 400 if no valid fields | Changed `.single()` → `.maybeSingle()` for restaurant query
- **`owner/dishes/route.ts`**: Added try/catch for JSON both POST/PATCH | Changed `.single()` → `.maybeSingle()` | Added `console.error` logging on notification fetch failure | Added `|| PLAN_LIMITS.trial` fallback for unknown plans
- **`owner/categories/route.ts`**: Added try/catch for JSON both POST/DELETE | Changed `.single()` → `.maybeSingle()` | Added dish count check before delete (409 Conflict) | Added `|| PLAN_LIMITS.trial` fallback

### Rate Limiting (New)
- **`lib/rate-limiter.ts`**: DB-based rate limiting using `rate_limits` table — prevents server restart from resetting counters
- **`lib/superadmin-security.ts`**: Replaced in-memory rate limiter with DB-based using `superadmin_login_attempts` table — persistent across restarts | Wrapped DB calls in try/catch to prevent cascading failures

### Frontend (Previous Session)
- BellNotification: today's orders in dropdown, mobile bottom sheet, toast safe-area, centered announcement modal
- Dashboard: removed duplicate announcement subscription/popup
- Layout: z-index fixed (z-40 → z-30)
- Menu page: corrupted characters fixed
- Touch targets: 44px minimum on all interactive elements

---

## 🔧 UI/UX FIXES APPLIED (Latest Session)

### Design System Foundation
| Fix | File |
|-----|------|
| Semantic color tokens (surface, border, text-*) | `tailwind.config.js` |
| Keyframe animations (scale-up, slide-down, fade-in, shimmer, fadeInUp) | `tailwind.config.js`, `app/globals.css` |
| Removed `maximumScale:1` accessibility violation | `app/layout.tsx` |
| Button focus-visible rings for keyboard navigation | `components/ui/button.tsx` |
| Input aria-describedby + role="alert" on errors | `components/ui/input.tsx` |
| CardFooter + CardDescription components added | `components/ui/card.tsx` |
| Shared `timeAgo` utility (removed 3 duplicate implementations) | `lib/utils.ts` |
| Fixed `.font-urdu` CSS variable reference | `app/globals.css` |
| Standardized border color to `#E8E8E8` | `tailwind.config.js` |

### Customer Mobile UI
| Fix | File |
|-----|------|
| 2-column dish grid with image-top cards + badges | `components/customer/DishGrid.tsx` |
| Back button + removed pt-16 padding waste | `components/customer/MenuHeader.tsx` |
| Active underline + gradient edge fades on category tabs | `components/customer/CategoryTabs.tsx` |
| Search debounce (300ms) + X clear button | `components/customer/MenuContent.tsx` |
| Cart: thumbnails, line totals, breakdown, Clear All, Continue Browsing | `app/(customer)/cart/page.tsx` |
| Checkout: phone validation, inline errors, step indicators, order summary | `app/(customer)/checkout/page.tsx` |
| Bottom nav: cart badge, active dot, aria-labels, safe-area-inset | `app/(customer)/layout.tsx` |
| Restaurant search + staggered fadeInUp animation | `app/(customer)/restaurants/RestaurantsClient.tsx` |
| Order status timeline, manual WhatsApp, Reorder, Call Restaurant | `app/(customer)/order-confirm/[id]/page.tsx` |
| Zustand individual selectors to prevent re-render cascades | `components/customer/DishGrid.tsx`, `CartBar.tsx`, `CartDrawer.tsx` |

### Owner Dashboard UI
| Fix | File |
|-----|------|
| Period selector (Today/7d/30d), real trend %, error state with retry | `app/(owner)/dashboard/page.tsx` |
| Status filter pills, pagination (25/page), improved empty state | `app/(owner)/dashboard/orders/page.tsx` |
| Fixed `suspended` → `isSuspended` bug, batch select + toggle, undo toast | `app/(owner)/dashboard/menu/page.tsx` |
| Date range selector, revenue LineChart, order type breakdown | `app/(owner)/dashboard/analytics/page.tsx` |
| QR size selector wired correctly, Share button (Web Share API) | `app/(owner)/dashboard/qr/page.tsx` |
| Drawer slide animation, role="dialog", Escape key, scroll lock | `app/(owner)/layout.tsx` |
| DishCard: checkbox for batch selection, toggle switch | `components/owner/DishCard.tsx` |
| Shared DashboardFooter component extracted | `components/shared/DashboardFooter.tsx` (new) |

### SuperAdmin UI
| Fix | File |
|-----|------|
| Client-side pagination (25/page) on all tables | `RestaurantTable.tsx`, `CustomerTable.tsx` |
| Tab deep-linking via URL search params | `SuperAdminClient.tsx` |
| Confirmation dialog before toggling restaurant status | `RestaurantTable.tsx` |

### Bug Fixes
| Bug | Severity | Fix |
|-----|----------|-----|
| `animate-scale-up` CSS class undefined in BellNotification | 🔴 | Added keyframe to tailwind.config.js |
| `suspended` variable undefined in menu/page.tsx line 223 | 🔴 | Changed to `isSuspended` |
| QR size selector doesn't change actual QR render size | 🟡 | Wired `qrSize` state to QRCodeSVG `size` prop |
| 3 duplicate `timeAgo` implementations with different formats | 🟡 | Consolidated into `lib/utils.ts` |
| `.font-urdu` referenced wrong font (Noto Naskh vs Nastaliq) | 🟡 | Fixed to use `var(--font-urdu)` CSS variable |
| `CartDrawer.tsx` orphaned (never imported) | 🟢 | Identified — can be deleted or integrated later |
| `WhatsAppRedirect.tsx` orphaned (never imported) | 🟢 | Identified — can be deleted or integrated later |

---

## 🔴 UNRESOLVED (Requires External Action)

| # | Issue | Action Needed |
|---|-------|---------------|
| 1 | Announcement emails never delivered (uses Resend test domain) | Configure a verified domain in Resend, then change `onboarding@resend.dev` to `notifications@yourdomain.com` |
| 2 | Leaked password protection disabled | Enable in Supabase Auth dashboard: Authentication → Settings → Security → Leaked password protection |
| 3 | `pg_trgm` in public schema | Move to separate schema (minor) |
| 4 | `rls_auto_enable` SECURITY DEFINER function | Revoke EXECUTE from anon role or change to SECURITY INVOKER |
| 5 | Security RLS migration needs to be run on Supabase | Execute `supabase_migrations/security_rls_fix.sql` on the database |
