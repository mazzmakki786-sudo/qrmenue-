# WhatsApp Send-Once Plan

## Problem

Currently, WhatsApp order details are sent automatically every time the customer visits the order confirmation page — including on page refresh. There's also no check on order status, so WhatsApp sends even if the restaurant has already started preparing.

**Current behavior:**
- Order placed → auto-sends WhatsApp after 1.5s on order-confirm page ✅
- Customer refreshes page → WhatsApp sends AGAIN ❌
- Restaurant starts preparing → customer refreshes → WhatsApp sends AGAIN ❌
- `whatsapp_sent` column exists in DB but is NEVER used

**Desired behavior:**
- WhatsApp sends ONLY once — at the moment the order is first placed (status: "received")
- If customer refreshes → NO WhatsApp send
- If restaurant has already started preparing → NO WhatsApp send (the food is already being made, no need to re-share)
- WhatsApp should ONLY be sent at order creation time

## Solution

### 1. API: Mark `whatsapp_sent: true` on order creation

File: [app/api/orders/route.ts](app/api/orders/route.ts)

The `whatsapp_sent` column already exists in the `orders` table (defaults `false`). When the order is created, set it to `true` because the WhatsApp URL is generated and returned to the client at that point.

**Change:** Add `whatsapp_sent: true` to the insert payload (line ~244).

### 2. Frontend: Only auto-send when order is freshly placed

File: [app/(customer)/order-confirm/[id]/page.tsx](app/(customer)/order-confirm/[id]/page.tsx)

Replace the current auto-send `useEffect` (lines 331-354) with one that checks:
- `order.order_status === "received"` (restaurant hasn't started yet)
- `!order.whatsapp_sent` (hasn't been sent already from DB)

If either condition fails, don't auto-open WhatsApp.

**Changes:**
- Remove `whatsappSuccess` local state (no longer needed for auto-send tracking — DB is the source of truth)
- New auto-send effect: only fires once when `order_status === "received"` AND `!whatsapp_sent`
- Keep the manual "Send on WhatsApp" / "Resend" button for users who want to share manually

### Edge Cases Covered

| Scenario | Behavior |
|---|---|
| First order placement | ✅ WhatsApp auto-sends (status=received, whatsapp_sent=false) |
| Customer refreshes page | ❌ No WhatsApp (whatsapp_sent=true in DB) |
| Restaurant starts preparing | ❌ No WhatsApp (status=preparing) |
| Restaurant marks ready/completed | ❌ No WhatsApp |
| Customer clicks manual "Send" | ✅ WhatsApp opens (manual action) |
| Realtime status update to preparing | ❌ Auto-send already fired, won't re-fire |
| Order cancelled | ❌ Auto-send already fired, won't re-fire |

## Files to Modify

1. **`app/api/orders/route.ts`** — Add `whatsapp_sent: true` to order insert
2. **`app/(customer)/order-confirm/[id]/page.tsx`** — Conditional auto-send logic

## Implementation Order

1. API change (1 line)
2. Frontend change (replace auto-send useEffect, remove whatsappSuccess state)
