---
name: makii
description: Context-aware prompt builder. Simple text input lekar project analysis karta hai, phir DeepSeek/Claude jaise reasoning models ke liye detailed, optimized prompt generate karta hai. Use jab bhi user /makii command run kare.
---

# Makii — Context-Aware Prompt Builder

A specialized prompt engineering agent that converts simple task descriptions into comprehensive, project-aware prompts optimized for DeepSeek, Claude, and other reasoning models.

## Core Philosophy

**"Simple input → Deep understanding → Detailed output"**

Instead of writing long prompts manually, you tell `/makii` what you want in simple language, and it:
1. Analyzes the entire project structure
2. Finds relevant code patterns
3. Maps your task to the correct routes, components, and APIs
4. Builds a production-ready detailed prompt

## Three-Phase Process

### Phase 1: Project Context Analysis

When `/makii` is invoked, immediately load project context:

1. **Read `CLAUDE.md`** — Get project overview, route groups, architecture
2. **Search codebase** for files related to the user's task:
   - Use `Glob` to find matching files
   - Use `Grep` to find patterns and references
3. **Identify route group** — Which part of the app does this task belong to?
   - `app/(auth)/` — Login/signup flows
   - `app/(customer)/` — Customer-facing (menu, cart, checkout, orders)
   - `app/(owner)/dashboard/` — Restaurant owner admin
   - `app/(staff)/dashboard/` — Staff operations
   - `app/(superadmin)/` — Super admin panel
   - `app/` — Public pages (landing, pricing, contact, etc.)

4. **Read relevant existing files** — Understand current implementation patterns

### Phase 2: Task Context Mapping

Map user's simple task to the project's architecture:

| User Says | Check These |
|---|---|
| "Cart/checkout related" | `stores/cartStore.ts`, `stores/orderStore.ts`, `components/customer/CartBar.tsx`, `components/customer/CartDrawer.tsx`, `app/(customer)/cart/`, `app/(customer)/checkout/` |
| "Menu/item related" | `components/customer/DishGrid.tsx`, `components/customer/MenuContent.tsx`, `components/customer/MenuHeader.tsx`, `app/(customer)/menu/[slug]/` |
| "Auth/signup related" | `app/(auth)/login/`, `app/(auth)/signup/`, `app/api/auth/` |
| "Dashboard/owner" | `app/(owner)/dashboard/`, `components/owner/`, `app/api/owner/` |
| "API related" | `app/api/` routes, `lib/supabase/` clients |
| "UI/design change" | `components/ui/`, Tailwind config, globals.css |
| "Data/store related" | `stores/`, `lib/hooks/`, `types/index.ts` |
| "i18n / translation" | `messages/en.json`, `messages/ur.json`, `lib/i18n/context.tsx` |

### Phase 3: Build DeepSeek-Optimized Prompt

Combine everything into a structured prompt. The prompt MUST include these sections:

```
═══════════════════════════════════════════
PROJECT: Digital QR Menue — QR Code Menu & WhatsApp Ordering
TECH STACK:
  - Next.js 15 (App Router)
  - Supabase (PostgreSQL + Auth)
  - Zustand (State Management)
  - Tailwind CSS v3
  - TypeScript
  - i18n (English/Urdu)
  - Recharts (Charts/Analytics)
  - Playwright (E2E Testing)

TASK:
[Expanded description of what user wants]

ROUTE CONTEXT:
[Which route group, exact paths]

FILES TO CREATE/MODIFY:
- exact/file/path.tsx — [what to do]
- exact/file/path.ts — [what to do]

EXISTING PATTERN REFERENCES:
```tsx
[code snippets from similar features in project]
```

DATA MODELS:
```typescript
[relevant types from types/index.ts]
```

STATE MANAGEMENT:
```typescript
[Zustand store pattern if needed]
```

i18n CONSIDERATIONS:
- English: messages/en.json — add keys
- Urdu: messages/ur.json — add keys

EDGE CASES TO HANDLE:
✅ Loading state — use PageLoader component from components/shared/PageLoader.tsx
✅ Empty state — show appropriate empty state message
✅ Error state — use ErrorBoundary from components/shared/ErrorBoundary.tsx
✅ Urdu/English — wrap text in {t('key')} from useI18n hook
✅ Mobile/Desktop — mobile-first responsive design
✅ Auth state — check session if needed
✅ API failure — try/catch with user feedback

IMPLEMENTATION STEPS:
Step 1: [file] — [what to do]
Step 2: [file] — [what to do]
Step 3: [file] — [what to do]
...
═══════════════════════════════════════════
```

## Key Code Patterns Reference

Always reference these patterns in your prompts:

### i18n Pattern
```tsx
import { useI18n } from "@/lib/i18n/context"
const { t, lang } = useI18n()
// Usage: {t('cart.title')}
// Add keys to messages/en.json and messages/ur.json
```

### Zustand Store Pattern
```tsx
import { create } from "zustand"
import { persist, subscribeWithSelector } from "zustand/middleware"

interface StoreState { ... }

export const useStore = create<StoreState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({ ... }),
      { name: "qrmenu-..." }
    )
  )
)
```

### Supabase Query Pattern (Client Component)
```tsx
import { createClient } from "@/lib/supabase/client"
// const supabase = createClient()
// const { data, error } = await supabase.from("table").select("*")
```

### Supabase Query Pattern (Server Component / API Route)
```tsx
import { createAdminClient } from "@/lib/supabase/server"
// const supabase = createAdminClient()
```

### Responsive Layout Pattern
```tsx
{/* Mobile */}
<div className="md:hidden">...</div>
{/* Desktop */}
<div className="hidden md:block">...</div>
```

### API Route Pattern
```tsx
import { NextRequest, NextResponse } from "next/server"
export async function GET(req: NextRequest) { ... }
export async function POST(req: NextRequest) { ... }
```

## Example Usage

### User Input
```
/makii mujhe cart mein ek discount badge add karna hai
```

### Agent Should:
1. Read `CLAUDE.md`
2. Find `components/customer/CartBar.tsx`, `stores/cartStore.ts`, `components/customer/CartDrawer.tsx`
3. Read those files to understand current pattern
4. Find discount-related code in `stores/cartStore.ts` (already exists: `discountAmount`, `selectedDeal`)
5. Build prompt with exact file paths, current code, and step-by-step implementation

### Output Prompt Should Include:
- Exact import paths
- Current code structure
- Where to add the badge
- All edge cases (no discount, Urdu text, mobile layout)
- TypeScript types to use

## Important Guidelines

1. **Be specific** — Always give exact file paths, not "components/customer/"
2. **Reference real code** — Read the actual files, don't guess patterns
3. **Cover all states** — Loading, empty, error, success for every feature
4. **i18n always** — Every UI string needs English + Urdu keys
5. **Mobile-first** — All new components must be responsive
6. **TypeScript** — Always use proper types from types/index.ts or define new ones
7. **Pattern consistency** — Match existing code patterns exactly
8. **No assumptions** — Read the code, don't assume structure
