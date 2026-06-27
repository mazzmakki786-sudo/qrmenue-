# Session Report — QRMenu.pk Auth & Security Overhaul

| # | Feature | Before (Problem) | After (Fix) | Advantages (Fawaid) | Critical? |
|---|---------|-----------------|-------------|-------------------|-----------|
| 1 | **Plan API 404** | `/api/superadmin/plans/starter` returned 404 — folder named `slug` instead of `[slug]` | Renamed folder to `[slug]` | API works correctly, superadmin can edit plans | ✅ **CRITICAL** — broken feature |
| 2 | **FAQs on Home Page** | Home page had no FAQ section | Added FAQ accordion below pricing | Better user info, reduced support queries | ❌ |
| 3 | **Nav Links (Pricing/Contact)** | Pricing & Contact nav links navigated to separate pages (`/pricing`, `/contact`) | Changed to anchor scroll (`#pricing`, `#contact`) on same page | Faster UX, no page reload, smooth scroll | ❌ |
| 4 | **Password Input Component** | No password visibility toggle; no live validation feedback | `PasswordInput` with eye toggle + live requirements (lowercase, uppercase, number, special char, 6+ length) | Better UX, users see requirements in real-time | ❌ |
| 5 | **Auth Error Messages (Account Enumeration)** | Supabase errors leaked: "User already registered", "Invalid login credentials", "Email not confirmed" | All auth errors return generic message: `"Something went wrong. Please try again."` (later refined to `"Incorrect email or password"` for login) | ✅ **Account enumeration prevented** — attacker cannot know if email exists | ✅ **CRITICAL SECURITY** |
| 6 | **Restaurant Timing (Open/Closed)** | No way to set restaurant hours or mark open/closed | Added `is_open`, `opening_time`, `closing_time`, `delivery_fee`, `delivery_time_min` columns in DB + UI toggle in Owner Settings | Customers see real-time open/closed status on menu & restaurant pages | ❌ |
| 7 | **Restaurants Browse Page Broken** | Browse page showed nothing — server query selected columns that didn't exist in DB | Added missing columns via migration; page now renders restaurant list | ✅ **CRITICAL** — entire browse flow was broken | ✅ **CRITICAL** |
| 8 | **Server-Side Validation (Zod)** | Auth forms validated only on client — no server-side validation | Created `lib/auth-validation.ts` with Zod schemas for login, restaurant signup, customer signup + HTML sanitization | Double validation (client + server), XSS prevention via `sanitize()` | ✅ |
| 9 | **Auth API Routes** | Login/signup called Supabase directly from browser | Created `POST /api/auth/login`, `/api/auth/signup/restaurant`, `/api/auth/signup/customer` with CSRF + rate limit + Zod | Centralized auth logic, CSRF protection, rate limiting applied | ✅ |
| 10 | **Rate Limiting on Login** | No rate limiting on login — attacker could brute-force unlimited | `rateLimit(ip, 10, 60)` — max 10 requests per IP per minute, plus Supabase's own 30/min layer | ✅ **Brute-force slowed dramatically** | ✅ **CRITICAL SECURITY** |
| 11 | **Account Lockout** | No lockout — unlimited failed attempts | 5 failed attempts in 15 min → locked for 15 min | ✅ **Brute-force blocked after 5 tries** | ✅ **CRITICAL SECURITY** |
| 12 | **Progressive Delay** | No delay — instant response per attempt | `(n-1) × 2s` delay (capped at 60s) per failed attempt | ✅ **Slows automated attacks** — even before lockout | ✅ |
| 13 | **Login Attempts DB Table** | No persistence of failed attempts | New `login_attempts` table (PostgreSQL) with `email`, `ip_address`, `success`, `attempted_at` + indexes | ✅ **Lockout persists across server restarts** (no Redis needed) | ✅ |
| 14 | **Lockout Email Notification** | No email on lockout | `sendLockoutAlert()` via Resend — sends email with IP, duration, password reset link | ✅ **User knows their account was targeted** | ✅ |
| 15 | **Password Hashing Audit** | No verification of password storage | Confirmed Supabase Auth uses **bcrypt** (GoTrue); zero instances of custom password storage or `console.log` leaks | ✅ **Passwords are secure, no plain-text exposure** | ✅ **CRITICAL SECURITY** |
| 16 | **SuperAdmin Email Leak** | "`{email}` is not authorized to access the Super Admin panel" — **confirmed account exists in Supabase** | Changed to "You do not have permission to access this panel." | ✅ **Attacker cannot confirm email is registered** | ✅ **CRITICAL SECURITY** |
| 17 | **SuperAdmin Lockout Screen Leak** | "Access Locked — Your account has been temporarily locked due to multiple failed login attempts" with recovery steps | Removed all lockout-informative text; shows generic "Access Denied — You do not have permission" | ✅ **Attacker cannot distinguish lockout vs wrong password vs unauthorized email** | ✅ **CRITICAL SECURITY** |
| 18 | **SuperAdmin Check API Leak** | API returned `{ locked: true, message: "Account temporarily locked..." }` | Removed `message` field — returns only `{ locked: true }` | ✅ **API endpoint does not reveal lockout details** | ✅ **CRITICAL SECURITY** |

---

## Summary

| Metric | Before | After |
|--------|--------|-------|
| Auth error messages leaking info | 6+ different messages revealing account existence | All return `"Incorrect email or password"` or `"Something went wrong"` |
| Rate limiting on auth | ❌ None | ✅ 10 req/min/IP + progressive delay |
| Account lockout | ❌ None | ✅ 5 fails → 15-min lock + email alert |
| Server-side validation | ❌ None | ✅ Zod schemas + HTML sanitization |
| Auth API routes | ❌ Direct Supabase calls from browser | ✅ 3 API routes with CSRF + rate limit + validation |
| Password storage audit | ❌ Never checked | ✅ Confirmed bcrypt via Supabase Auth |
| Security info leaks | 5 known leaks (email, lockout status, lockout details) | ✅ All sealed |

## New Files Created

```
lib/auth-validation.ts          — Zod schemas + sanitize + logValidationFailure
lib/account-lockout.ts          — checkLockout, getProgressiveDelay, recordLoginAttempt, clearLoginAttempts
lib/email.ts                    — sendLockoutAlert via Resend
app/api/auth/login/route.ts     — POST handler with full security stack
app/api/auth/signup/restaurant/route.ts  — POST handler
app/api/auth/signup/customer/route.ts    — POST handler
```

## DB Changes

- Added columns: `restaurants.is_open`, `restaurants.opening_time`, `restaurants.closing_time`, `restaurants.delivery_fee`, `restaurants.delivery_time_min`
- New table: `login_attempts` (email, ip_address, success, attempted_at)
