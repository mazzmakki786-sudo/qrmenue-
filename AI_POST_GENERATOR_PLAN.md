# 🤖 AI Post Generator — Implementation Plan

## Overview

AI-powered social media post generator for QRMenu.pk restaurants. Only Growth & Premium plan users. Generates promotional posts using restaurant menu images + AI-written captions with customizable design.

---

## Phase 1: Deals & Discounts System

### 1.1 New Database Table: `deals`

```sql
CREATE TABLE public.deals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  dish_id       UUID REFERENCES public.dishes(id) ON DELETE SET NULL,
  title_en      TEXT NOT NULL,
  title_ur      TEXT,
  description_en TEXT,
  description_ur TEXT,
  deal_type     TEXT NOT NULL CHECK (deal_type IN ('percentage', 'flat', 'bundle')),
  deal_value    NUMERIC(10,2) NOT NULL,
  start_date    TIMESTAMPTZ,
  end_date      TIMESTAMPTZ,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Owner can CRUD own deals
CREATE POLICY "Owner manages own deals"
  ON public.deals FOR ALL
  USING (restaurant_id = (SELECT restaurant_id FROM public.owner_restaurants WHERE user_id = auth.uid()))
  WITH CHECK (restaurant_id = (SELECT restaurant_id FROM public.owner_restaurants WHERE user_id = auth.uid()));
```

### 1.2 TypeScript Types (`types/index.ts`)

```typescript
export interface Deal {
  id: string
  restaurant_id: string
  dish_id: string | null
  title_en: string
  title_ur: string | null
  description_en: string | null
  description_ur: string | null
  deal_type: "percentage" | "flat" | "bundle"
  deal_value: number
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DealFormData {
  title_en: string
  title_ur?: string
  description_en?: string
  description_ur?: string
  dish_id?: string
  deal_type: "percentage" | "flat" | "bundle"
  deal_value: number
  start_date?: string
  end_date?: string
  is_active?: boolean
}
```

### 1.3 Plan Limits Update (`lib/subscription.ts`)

Add to `PlanLimits`:
```typescript
export interface PlanLimits {
  // ... existing fields
  aiPostsPerMonth: number
}
```

New limits:
| Plan | aiPostsPerMonth |
|------|----------------|
| trial | 0 |
| starter | 0 |
| growth | 6 |
| premium | 12 |

### 1.4 API Routes

- **`GET /api/owner/deals`** — List all deals for restaurant
- **`POST /api/owner/deals`** — Create a deal (validates plan)
- **`PATCH /api/owner/deals/[id]`** — Update deal
- **`DELETE /api/owner/deals/[id]`** — Delete deal
- **`GET /api/menu/[slug]/deals`** — Public: active deals for customer menu

### 1.5 Owner UI

- **Deals tab/section** in menu management page OR new page `app/(owner)/dashboard/deals/`
- Deal cards showing: title, type (%/flat), value, dates, active toggle
- Add/Edit deal form with fields from `DealFormData`
- Delete with confirmation

---

## Phase 2: AI Post Generator

### 2.1 New Database Tables

```sql
-- Generated posts history
CREATE TABLE public.ai_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  prompt          TEXT NOT NULL,
  language        TEXT NOT NULL DEFAULT 'en',
  ratio           TEXT NOT NULL DEFAULT '1:1',
  caption         TEXT,
  image_url       TEXT,
  template_used   TEXT,
  settings        JSONB, -- Stores design settings (colors, fonts, etc.)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_posts ENABLE ROW LEVEL SECURITY;

-- Junction: which dish images were used in this post
CREATE TABLE public.ai_post_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_post_id  UUID NOT NULL REFERENCES public.ai_posts(id) ON DELETE CASCADE,
  dish_id     UUID NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  position    INT NOT NULL DEFAULT 0
);

ALTER TABLE public.ai_post_images ENABLE ROW LEVEL SECURITY;

-- Monthly usage counter (for limits)
CREATE TABLE public.ai_usage (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  month           TEXT NOT NULL, -- 'YYYY-MM' format
  count           INT NOT NULL DEFAULT 0,
  UNIQUE(restaurant_id, month)
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
```

### 2.2 AI Provider Integration

**Choice: Vercel AI SDK + Google Gemini Flash**

- **Vercel AI SDK** (`ai` + `@ai-sdk/google`) — best Next.js integration, streaming support
- **Gemini Flash** — cheapest (~$0.0001-0.0005/run), excellent Urdu support
- Falls back to **GPT-4o-mini** if Gemini unavailable

**System Prompt Structure:**

```
You are a social media post writer for a Pakistani restaurant.
Generate an engaging promotional caption based on:
- Restaurant name: {name}
- Available dishes: {dishes_list}
- Active deals: {deals_list}
- User prompt: {user_prompt}
- Language: {language}
- Platform ratio: {ratio}

Return JSON:
{
  "caption": "The main post text",
  "suggestedColors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex" },
  "suggestedFont": "font-name",
  "designQuestions": ["Question 1?", "Question 2?"]
}
```

### 2.3 API Routes

- **`POST /api/owner/ai/generate-text`** — Step 1: Send prompt + menu/deal data, get AI caption + design questions
- **`POST /api/owner/ai/generate-post`** — Step 2: After user answers questions, generate final image
- **`GET /api/owner/ai/history`** — List all generated posts
- **`DELETE /api/owner/ai/history/[id]`** — Delete a post
- **`POST /api/owner/ai/check-limit`** — Check remaining AI posts for this month

### 2.4 Design/Image Composition

**Canvas-based rendering (no external design tool dependency):**

```
Step 1: Create canvas with chosen ratio (1:1 / 16:9 / 4:5)
Step 2: Apply background gradient/solid color (from AI suggestion or user choice)
Step 3: Position menu images (1-4 images with grid layout)
Step 4: Overlay text (caption + restaurant name/logo)
Step 5: Apply user customizations (text change, colors, image scaling)
Step 6: Export to PNG using canvas.toBlob()
```

**5 Pre-designed Templates:**

| Template | Style | Best For |
|----------|-------|----------|
| Minimal | White bg, clean text | New dishes |
| Bold Offer | Red/gold gradient, large text | Discounts, deals |
| Elegant | Dark bg, gold text | Premium dishes |
| Seasonal | Festive elements | Ramadan, Eid, events |
| New Arrival | Image-focused | New menu items |

### 2.5 Owner UI — `app/(owner)/dashboard/ai-posts/`

**Main Screen:**
- Clean, minimal design with sidebar layout
- Left: History of generated posts (thumbnails, dates, download buttons)
- Right: Generator panel

**Generator Flow:**
1. **Step 1: Setup**
   - Select language (EN/UR)
   - Select ratio (1:1, 16:9, 4:5)
   - Select images from menu (max: Growth=2, Premium=4)
   - Select active deals (optional)
   - Write prompt

2. **Step 2: AI Interaction**
   - AI asks 2-3 design questions
   - User answers (color theme, style preference, etc.)

3. **Step 3: Generate & Customize**
   - AI generates caption + suggested design
   - Canvas preview shown
   - User can: change text, colors, scale images, move elements
   - "Regenerate" button for AI to try again

4. **Step 4: Download**
   - Download as PNG (high quality)
   - Post saved to history automatically

**History Section:**
- Grid of thumbnail images
- Each shows: date, prompt (truncated), download button, delete button
- Click to open full preview

---

## Phase 3: Superadmin Controls

### 3.1 New DB Table

```sql
CREATE TABLE public.ai_generation_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  plan            TEXT NOT NULL,
  prompt          TEXT NOT NULL,
  image_url       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_generation_logs ENABLE ROW LEVEL SECURITY;
-- Only superadmin can read
```

### 3.2 Plan Limits Override System

Superadmin can override per-restaurant AI limits:
- Either add bonus generations (e.g., +5 extra)
- Or change monthly limit entirely
- Stored in same `plan_limits_override` JSON field on `restaurants` table

### 3.3 API Routes

- **`GET /api/superadmin/ai/restaurants`** — List all restaurants with Growth/Premium plans + usage stats
- **`PATCH /api/superadmin/ai/restaurants/[id]`** — Override limit, give bonus generations
- **`GET /api/superadmin/ai/history`** — View all generated posts across all restaurants
- **`GET /api/superadmin/ai/history/[id]/image`** — Preview specific generated image

### 3.4 Superadmin UI — `app/(superadmin)/superadmin/ai-management/`

**Restaurant Table:**
| Column | Description |
|--------|-------------|
| Restaurant Name | With logo |
| Plan | Growth / Premium |
| Used/Monthly Limit | e.g., 3/6 |
| Bonus Given | Extra generations added |
| Last Generation | Date |
| Actions | Override limit, View posts |

**Features:**
- Search by restaurant name
- Filter by plan (Growth/Premium only)
- Click restaurant → see their generation history with image previews
- Override limit modal: "Give extra N generations this month"
- View image preview in lightbox

---

## Implementation Order

```
Week 1:
  ├── Phase 1: Deals DB migration
  ├── Phase 1: Deals API routes + types
  └── Phase 1: Deals UI (owner)

Week 2:
  ├── Phase 2: AI DB migrations (ai_posts, ai_usage, ai_post_images)
  ├── Phase 2: Vercel AI SDK + Gemini integration
  ├── Phase 2: AI generation API routes
  └── Phase 2: AI Posts owner page (generator + history)

Week 3:
  ├── Phase 2: Canvas design engine (templates + customization)
  ├── Phase 2: Image download + history management
  ├── Phase 3: Superadmin AI management page
  └── Phase 3: Limit override + analytics

Week 4:
  ├── i18n translations (EN + UR messages)
  ├── Plan limit updates + revalidation
  └── Testing + bug fixes + type checks
```

---

## Cost Breakdown

| Item | Monthly Cost |
|------|-------------|
| Gemini Flash API (~$0.0003/post × 1000 posts) | ~$0.30 |
| Supabase Storage (images ~100KB × 1000) | ~$0.10 |
| Vercel Edge Functions | Included in plan |
| **Total** | **~$0.40/month** |

---

## Security & Rate Limiting

- AI generation route: rate limited to `ai:generate` tier (5/min per restaurant)
- CSRF guard on all POST/PATCH/DELETE routes
- RLS policies ensure restaurants can only access own data
- Superadmin routes gated by `SUPER_ADMIN_EMAIL` check
- Prompts sanitized before sending to AI API
- Generated images stored in Supabase Storage with private bucket, served via signed URLs

---

## Files to Create/Modify

### New Files (16 total):

```
supabase/migrations/XXXXXXXXXXXX_deals.sql
supabase/migrations/XXXXXXXXXXXX_ai_posts.sql
supabase/migrations/XXXXXXXXXXXX_ai_usage.sql
supabase/migrations/XXXXXXXXXXXX_ai_generation_logs.sql
lib/ai/index.ts          (Vercel AI SDK setup + Gemini client)
lib/ai/prompts.ts        (System prompts for AI)
lib/ai/templates.ts      (5 design templates)
lib/hooks/useAiPosts.ts  (Client hook for AI posts)
lib/hooks/useDeals.ts    (Client hook for deals)
app/api/owner/deals/route.ts
app/api/owner/ai/generate-text/route.ts
app/api/owner/ai/generate-post/route.ts
app/api/owner/ai/history/route.ts
app/api/owner/ai/check-limit/route.ts
app/(owner)/dashboard/ai-posts/page.tsx
app/(owner)/dashboard/deals/page.tsx
components/owner/AiPostGenerator.tsx
components/owner/AiPostHistory.tsx
components/owner/DealCard.tsx
components/owner/AddDealForm.tsx
app/api/superadmin/ai/restaurants/route.ts
app/api/superadmin/ai/history/route.ts
app/(superadmin)/superadmin/ai-management/page.tsx
```

### Modified Files (7 total):

```
types/index.ts          (Add Deals + AI types)
lib/subscription.ts      (Add aiPostsPerMonth to PlanLimits)
lib/subscription-db.ts   (Map aiPostsPerMonth from DB plans)
lib/rate-limiter.ts      (Add ai:generate tier)
messages/en.json         (Add AI + deals translations)
messages/ur.json         (Add AI + deals translations)
app/(owner)/dashboard/page.tsx (Add AI Posts link in nav)
```

---

*End of Plan — Review and approve to begin implementation.*
