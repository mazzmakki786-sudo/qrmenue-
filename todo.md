# QRMenu.pk — Development TODO

## Status Legend
☐ Not Started | 🔄 In Progress | ✅ Completed | ❌ Blocked

---

## ✅ COMPLETED (Build Phase)

### Phase 1: Critical Bug Fixes
✅ B1-B2: Fix customer upsert email in orders API route
     - app/api/orders/route.ts: Changed `email: customer_name` to use actual phone field

### Phase 2: Category CRUD Consistency
✅ Create POST /api/owner/categories route (app/api/owner/categories/route.ts)
✅ Create DELETE /api/owner/categories route
✅ Update menu page to use API routes instead of direct DB calls
✅ Remove legacy app/api/admin/categories/route.ts

### Phase 3: Bell Notification + Owner Email Alerts
✅ Wire BellNotification in owner layout (desktop + mobile header)
✅ Real-time new order alerts with sound + toast in dashboard header

### Phase 4: i18n + LanguageToggle
✅ Create messages/en.json (all English strings)
✅ Create messages/ur.json (all Urdu strings)
✅ Create lib/i18n/context.tsx (language provider with useI18n hook)
✅ Create lib/i18n/useTranslation.ts (re-export for convenience)
✅ Fix LanguageToggle to use i18n context (removed local state)
✅ Integrate LanguageToggle in customer menu (replaced inline toggle)
✅ Update CategoryTabs to use i18n context directly
✅ Update DishGrid to use i18n context directly
✅ Wrap root layout with I18nProvider

### Phase 5: Cleanup
✅ Delete CategorySidebar.tsx (unused)
✅ Delete DishList.tsx (unused)
✅ Delete DishItem.tsx (unused — only DishList imported it)
✅ Clean up todo.md with current status

---

## 📋 PENDING TASKS

### Phase 6: Owner Email Alert System
✅ Create lib/email/orderLimitAlert.ts — Daily order limit (10/day) notification
✅ Create lib/email/planEndingAlert.ts — Plan expiration notification
✅ Create POST /api/owner/alerts/check — Combined alert trigger endpoint
✅ Integrate triggers in dashboard page load + order creation API

### Phase 7: Performance & Polish
✅ Add ISR (revalidate: 60) for menu pages
✅ Add loading="lazy" on CartDrawer dish images
✅ Add React ErrorBoundary component
✅ Wrap layouts with error boundaries (customer, owner, superadmin)

### Phase 8: Low Priority Bug Fixes
✅ Fix window.confirm → custom Dialog component for category delete
✅ Fix 8-second timeout fallbacks with proper try/catch/finally in all pages
✅ Add loading="lazy" on below-fold images

---

## ORIGINAL SPECS (For Reference)

### Phase 1: Foundation (Weeks 1-2) — ✅ All Done
### Phase 2: MVP Core (Weeks 3-6) — ✅ All Done
### Phase 3: Super Admin & Beta (Weeks 7-8) — ✅ All Done
### Phase 4: Scale (Weeks 9-12) — 📅 Future
