# AI Image Generation Plan

## Overview
Add AI-powered poster image generation for restaurant menu items using OpenAI-compatible API.

---

## Design Decisions

Select your preferred option for each:

### 1. Credit Purchase System
**When monthly credits run out, how should owners get more?**
- [ ] A) Redirect to **upgrade their plan** (no separate credit purchase)
- [ ] B) Request extra credits → **superadmin manually adds them** (like current subscriptions)
- [ ] C) **Bank transfer** credit pack purchase (you manually verify and add credits)
- [ ] D) **Don't build purchase yet** — just track usage, add purchase later

### 2. Guided Questions Before Generation
**Should the app ask structured questions to build a better prompt?**
- [ ] A) Yes — ask about **style** (Modern/Minimalist/Vintage/Fun/Luxury), **mood** (Warm/Fresh/Elegant/Casual), **occasion** (Menu/Special Offer/Festive), **audience** (Families/Couples/Kids/Corporate)
- [ ] B) No — just a **simple text field** where they write their own prompt
- [ ] C) **Both** — guided questions AND an advanced free-text field

### 3. Language Support
**Should generation support both English and Urdu?**
- [ ] A) **English only** for now
- [ ] B) **Both English + Urdu** — UI in their language, prompts can be in Urdu
- [ ] C) **Urdu only** for Urdu-speaking owners

### 4. Design Suggestions
**Should the AI suggest design ideas based on the dish?**
- [ ] A) **Yes** — e.g. "BBQ dish → warm colors, rustic theme" shown as suggestion before generating
- [ ] B) **No** — owner writes whatever they want

### 5. Image Type: Photo vs Poster
**What should the AI generate?**
- [ ] A) **Beautiful food photo** — clean dish image for menu use (no text overlay)
- [ ] B) **Full promotional poster** — includes text (dish name, price, decorative elements)
- [ ] C) **Both options** — let the owner choose

### 6. Reference Image Usage
**When owner uploads a reference image, how should AI use it?**
- [ ] A) **Style reference** — match the look, feel, and composition style
- [ ] B) **Content reference** — incorporate elements/objects from the reference

### 7. Batch Generation
**Generate for multiple dishes at once?**
- [ ] A) **One dish at a time** (simpler)
- [ ] B) **Batch** — select multiple dishes, generate all at once

### 8. Retry Behavior
**When retrying a failed generation:**
- [ ] A) **Same prompt** (owner can edit it before retrying)
- [ ] B) **New prompt** — write from scratch

### 9. Monthly Credit Rollover
**Unused credits at month-end:**
- [ ] A) **Expire** (reset to plan limit each month)
- [ ] B) **Roll over** to next month

### 10. Customer-Facing Badge
**Should the menu page show "AI Generated" badge on images?**
- [ ] A) **No** — shows as normal dish image with no indicator
- [ ] B) **Yes** — show a small badge

### 11. Generation UI Behavior
**During generation (takes 10-60s):**
- [ ] A) **Wait on same page** with spinner (simpler)
- [ ] B) **Background generation** — start and come back later

### 12. History Page Features
- [ ] Show **all-time** generations OR just **current month**?
- [ ] Allow **deleting** old generations?
- [ ] Show which dish the image was **applied to** vs unapplied?

### 13. Aspect Ratios
- [ ] 1:1 (square), 4:3, 16:9, 3:4, 9:16 — keep these
- [ ] Different set: ____________

### 14. Superadmin Capabilities
**Should superadmin be able to:**
- [ ] View ALL restaurants' AI generation history?
- [ ] Manually add/remove credits for any restaurant?
- [ ] Configure OpenAI API key from superadmin panel?
- [ ] Set custom generation limits per restaurant (override)?

---

## Implementation Phases

### Phase 1: Database & Infrastructure
- New `ai_generations` table (history of all generations)
- New `ai_credits` table (monthly credit tracking per restaurant)
- Add `can_ai_generate` column to `plans` table
- New `ai-images` Supabase storage bucket
- RLS policies + `increment_ai_credits()` DB function

### Phase 2: Plan Limits & Types
- Add `canAiGenerate`, `aiGenerationsPerMonth` to PlanLimits
- Growth = 7/mo, Premium = 15/mo, Trial/Starter = 0
- New TypeScript interfaces: AIGeneration, AICredit

### Phase 3: API Routes
- `POST /api/owner/ai/generate` — trigger generation (credits consumed on attempt)
- `GET /api/owner/ai/generations` — list history + credit summary
- `POST /api/owner/ai/generations/[id]/apply` — apply to dish
- `POST /api/owner/ai/generations/[id]/retry` — retry failed (no extra credit)
- `lib/ai-generator.ts` — OpenAI-compatible image generation utility

### Phase 4: UI Components
- ColorPalettePicker — color swatches + custom hex
- AIImageCard — history grid card with status/actions
- AIGenerateDialog — generate form with dish selector, prompt, palette, ratio, reference image

### Phase 5: Dashboard Page
- `app/(owner)/dashboard/ai-images/page.tsx` — credit indicator, generate button, history grid
- Nav item in layout (gated to Growth/Premium)

### Phase 6: i18n & Pricing
- New translation keys in en.json/ur.json
- Pricing page feature list update

---

## Key Decisions (Confirmed)
- **Credits consumed on attempt** (even if generation fails)
- **Manual apply** — generated images go to history, owner applies to dish
- **Retry is free** — no extra credit deduction
- **OpenAI-compatible** — configurable via OPENAI_API_KEY + OPENAI_BASE_URL env vars

## Files to Create/Modify

### New Files
- `supabase_migrations/00005_add_ai_generation.sql`
- `lib/ai-generator.ts`
- `app/api/owner/ai/generate/route.ts`
- `app/api/owner/ai/generations/route.ts`
- `app/api/owner/ai/generations/[id]/apply/route.ts`
- `app/api/owner/ai/generations/[id]/retry/route.ts`
- `components/owner/ColorPalettePicker.tsx`
- `components/owner/AIImageCard.tsx`
- `components/owner/AIGenerateDialog.tsx`
- `app/(owner)/dashboard/ai-images/page.tsx`
- `app/(owner)/dashboard/ai-images/loading.tsx`

### Modified Files
- `lib/subscription.ts`
- `lib/subscription-db.ts`
- `types/index.ts`
- `app/(owner)/layout.tsx`
- `lib/map-plans.ts`
- `messages/en.json`
- `messages/ur.json`
- `.env.example`
