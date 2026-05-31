# Product Requirements Document (PRD)
## QRMenu.pk — Pakistan's QR-Based Digital Menu & Ordering Platform
**Version:** 1.0  
**Date:** May 30, 2026  
**Author:** Founder / Product Owner  
**Status:** Final — Ready for Development  
**Target Launch:** August 2026 (12 weeks)

---

## 1. PRODUCT OVERVIEW

### 1.1 Vision Statement
QRMenu.pk ek centralized, QR-based digital menu aur ordering platform hai jo Pakistan ke restaurants, cafes, aur food kitchens ko ek modern, affordable alternative deta hai — Foodpanda ki 31–45% commission ke bajaye sirf PKR 800/month mein.

### 1.2 Problem Statement
| Problem | Impact |
|---|---|
| Foodpanda 31–45% commission leta hai | Restaurant margins khatam ho jaati hain |
| Menu printing cost PKR 15,000/quarter | Expensive, outdated, static |
| No affordable digital menu solution | Pakistani market mein gap hai |
| Customers ko app download karna padta hai | High friction, low conversion |
| Restaurant owners ko real-time orders nahi milte | Orders miss ho jaate hain |

### 1.3 Solution
- Har restaurant ko unique QR code milega
- Customer scan kare → web page directly khule (no app download)
- Order kare → Checkout → Login → WhatsApp redirect with order template
- Owner ko real-time order notification mile (email + dashboard bell)
- Owner apna menu web-based admin panel se manage kare

### 1.4 Target Market
- **Geography:** Lahore, Karachi, Islamabad (urban areas first)
- **Segment:** Restaurants, Cafes, Food Courts, Cloud Kitchens
- **Month 1 Goal:** 50 restaurants onboarded
- **Month 3 Goal:** 150 restaurants
- **Month 6 Goal:** 300 restaurants

---

## 2. USER ROLES & PERSONAS

### 2.1 Role Definitions
| Role | Access Level | Description |
|---|---|---|
| **Super Admin (Company Owner)** | Full system access | Aap — manage all restaurants, plans, pricing page |
| **Restaurant Owner** | Own restaurant only | Menu manage kare, orders dekhe, analytics dekhe |
| **Customer** | Public menu access | Browse menu, order kare, account banana optional |

### 2.2 Persona 1 — Restaurant Owner (Ahmad, 35)
- **Location:** Lahore, Pakistan
- **Tech Skills:** Intermediate (WhatsApp, Facebook daily use)
- **Pain Points:** Foodpanda 40% commission, menu print karvana expensive
- **Goals:** Cost reduce karna, modern image, real-time order tracking
- **Device:** Android phone (primary), laptop (occasional)
- **Behavior:** WhatsApp prefer karta hai, Urdu + English dono samajhta hai

### 2.3 Persona 2 — Customer (Fatima, 24)
- **Location:** Islamabad
- **Tech Skills:** Advanced smartphone user
- **Pain Points:** App download nahi karna, slow internet frustrating
- **Goals:** Quick menu browse, easy order, multiple payment options
- **Device:** iPhone 13 ya Samsung Galaxy
- **Behavior:** QR scan kare, 3 minutes mein order place kare

### 2.4 Persona 3 — Super Admin (You)
- **Access:** Everything — all restaurants, all orders, all settings
- **Key Tasks:** Restaurant list dekhna, plan change karna, pricing page update karna, menu override karna
- **Device:** Laptop (primary)

---

## 3. COMPLETE FEATURE LIST

### 3.1 Feature Priority Matrix

| Feature | Priority | Phase | Who Uses It |
|---|---|---|---|
| QR Code Generation (unique per restaurant) | 🔴 P0 MVP | MVP | Owner |
| Digital Menu — Web (mobile-responsive) | 🔴 P0 MVP | MVP | Customer |
| Dish Categories (add/edit/delete) | 🔴 P0 MVP | MVP | Owner |
| Dish Management (add/edit/delete/toggle) | 🔴 P0 MVP | MVP | Owner |
| Available/Unavailable Toggle per dish | 🔴 P0 MVP | MVP | Owner |
| Cart (add/remove/update quantity) | 🔴 P0 MVP | MVP | Customer |
| Order Type Selection (Dine-in / Takeaway / Delivery) | 🔴 P0 MVP | MVP | Customer |
| Checkout Flow (info collection per order type) | 🔴 P0 MVP | MVP | Customer |
| Login/Signup (Google + Email) — Only at Checkout | 🔴 P0 MVP | MVP | Customer |
| WhatsApp Redirect with Order Template | 🔴 P0 MVP | MVP | Customer → Owner |
| Email Notification to Owner (new order) | 🔴 P0 MVP | MVP | System → Owner |
| Email Alert to Customer (new dish added) | 🔴 P0 MVP | MVP | System → Customer |
| Order Confirmation Page | 🔴 P0 MVP | MVP | Customer |
| Owner Dashboard (orders + analytics) | 🔴 P0 MVP | MVP | Owner |
| 7-day & 30-day Order Graph | 🔴 P0 MVP | MVP | Owner |
| Dashboard Bell Notification (new order) | 🔴 P0 MVP | MVP | Owner |
| Subscription Plans Display + Manual Billing | 🔴 P0 MVP | MVP | Owner |
| Trial Logic (7 days, images 3 days) | 🔴 P0 MVP | MVP | System |
| Pricing Page (company bank details) | 🔴 P0 MVP | MVP | Owner |
| Super Admin Panel (all restaurants) | 🔴 P0 MVP | MVP | Super Admin |
| Nearby Restaurants Directory (by city) | 🟡 P1 | MVP | Customer |
| English + Urdu Language Toggle | 🟡 P1 | MVP | Owner/Customer |
| Image Upload (paid plans only) | 🟡 P1 | MVP | Owner |
| Customer Account (order history) | 🟡 P1 | MVP | Customer |
| Mobile App (Owner) | 🟢 P2 | Phase 2 | Owner |
| Loyalty Points | 🔵 P3 | Phase 3 | Customer |
| Delivery Tracking (real-time) | 🔵 P3 | Phase 3 | Customer |
| Kitchen Display System | 🔵 P3 | Phase 3 | Restaurant |

---

## 4. DETAILED FEATURE SPECIFICATIONS

### Feature 1: QR Code Generation

**User Story:** Owner signup kare → unique QR milega → print kare ya display kare

**Requirements:**
- Auto-generate on restaurant creation
- URL format: `qrmenu.pk/menu/[restaurant-slug]`
- Downloadable as PNG (300×300px minimum)
- No scan limit — unlimited scans
- QR code changes only if owner requests (not on every login)

**Acceptance Criteria:**
- ✅ QR generates within 3 seconds of signup
- ✅ Works on Android 8+ and iOS 12+
- ✅ Menu opens in < 2 seconds on 3G
- ✅ Owner can re-download QR anytime from settings

---

### Feature 2: Digital Menu — Customer Side

**User Story:** Customer QR scan kare → menu khule → categories browse kare → dish details dekhe

**Requirements:**
- No app install — opens in browser (web-based)
- Mobile-first responsive design
- List-based layout (dish name + price + description in clean rows)
- Categories as sticky horizontal tabs at top
- Available/Unavailable badge per dish
- "Add to Cart" button per dish
- Search bar (optional, filter by name)
- Light mode only (MVP)
- English + Urdu bilingual (toggle)
- Font: Inter (English), Noto Naskh Arabic (Urdu)

**Performance:**
- Load time: < 2 seconds on 3G
- Images: WebP format, lazy loaded
- Works offline partially (menu cached after first load)

---

### Feature 3: Order Type Selection & Checkout Flow

**User Story:** Customer cart mein items daal ke order type choose kare aur required info fill kare

**Order Types & Required Fields:**

| Order Type | Required Info |
|---|---|
| **Dine-in** | Name, Phone Number, Table Number |
| **Takeaway** | Name only (no address needed) |
| **Delivery** | Name, Phone Number, Complete Address |

**Checkout Flow:**
```
Cart Review 
  → Order Type Select (Dine-in / Takeaway / Delivery)
  → Info Form (based on order type)
  → Login Page (if not logged in)
  → If already logged in → skip login
  → WhatsApp Redirect (pre-filled message to restaurant)
  → Order Confirmation Page
```

**WhatsApp Message Template (auto-generated):**
```
🍽️ New Order from QRMenu.pk

📋 Order Details:
• Biryani x2 — Rs 600
• Coke x1 — Rs 60

💰 Total: Rs 660
💵 Payment: Cash on Delivery

👤 Customer: Fatima
📞 Phone: 0300-1234567
🏠 Address: Block 5, DHA Lahore
🪑 Order Type: Delivery

⏰ Time: 2:30 PM — May 30, 2026
🔖 Order ID: ORD-2026-1234
```

---

### Feature 4: Login & Authentication

**User Story:** Customer checkout pe login kare — Google ya Email se

**Requirements:**
- Browsing: NO login required
- Login ONLY triggered at checkout
- If already logged in: skip login page, go directly to WhatsApp redirect
- Login Methods: Google OAuth, Email/Password
- Session: 30 days persistent
- After login: order auto-completes, WhatsApp redirect happens

**Customer Account (optional):**
- Account banana optional hai
- Account mein: order history, saved address, name/phone
- Customer city (for nearby restaurants): puchha jaye account setup pe

---

### Feature 5: Notifications System

**5A — Order Placed → Restaurant Owner:**
| Method | Details |
|---|---|
| WhatsApp Redirect | Customer automatically WhatsApp open karega restaurant number pe, template pre-filled |
| Email (Resend API - free) | Order details email mein owner ko milein |
| Dashboard Bell | Real-time bell icon update (Supabase Realtime) |

**5B — New Dish Added → Customer (who ordered from that restaurant):**
| Method | Details |
|---|---|
| Email Alert | "Al-Habib Grill ne naya dish add kiya: Nihari Special — Rs 450" |
| Trigger | Jab bhi owner koi nayi dish add kare |

---

### Feature 6: Owner Admin Panel (Web-Based)

**Access:** `qrmenu.pk/dashboard`  
**Device:** Mobile-responsive (owner phone se bhi use kar sake)  
**Auth:** Only restaurant owner (company admin bhi override kar sakta hai)

**Sections:**

#### 6A — Dashboard (Home)
- Today's orders count
- Today's revenue (PKR)
- 7-day line graph (orders per day)
- 30-day line graph toggle
- Top 3 popular dishes
- Recent orders list (last 10)
- Bell icon — unread order notifications

#### 6B — Menu Management
- Categories (add/edit/delete/reorder)
- Dishes per category (add/edit/delete)
- Per dish: Name (EN + UR), Description (EN + UR), Price, Image (plan-based), Available toggle
- Bulk toggle (mark all unavailable)

#### 6C — Orders
- All orders list (filterable: today / this week / all)
- Order detail: customer info, items, total, order type, time
- Status update: Received → Preparing → Ready → Completed / Cancelled

#### 6D — Analytics
- 7-day graph (default)
- 30-day graph (toggle)
- Peak hour chart
- Popular dishes ranking
- Total orders, total revenue (period-based)

#### 6E — Settings
- Restaurant name, phone, city, logo
- WhatsApp number (for customer redirect)
- Language toggle (EN/UR)
- QR code download
- Change password / email

#### 6F — Subscription
- Current plan + days remaining (prominent display)
- Plan comparison table
- Company bank details (JazzCash/Easypaisa numbers)
- "Contact us on WhatsApp to upgrade" button
- Payment history (manually logged by admin)

---

### Feature 7: Subscription & Trial System

**Plans:**

| Plan | Price | Images | Analytics | Duration |
|---|---|---|---|---|
| Free Trial | PKR 0 | 3–4 dishes (first 3 days only) | Basic | 7 days |
| Starter | PKR 800/mo | ❌ No images | ✅ | Monthly |
| Growth | PKR 1,800/mo | ✅ Up to 50 images | ✅ | Monthly |
| Premium | PKR 2,500/mo | ✅ Unlimited | ✅ Priority | Monthly |

**Trial Logic:**
- Day 1–3: Images upload allowed (max 4 dishes)
- Day 4–7: No new image uploads, existing images stay
- Day 7 end: Account locked — menu still visible but "Upgrade to continue" shown
- Grace period: 3 days (menu still works, no new orders)
- After grace: Menu shows "Restaurant temporarily unavailable"

**Billing Process (Manual MVP):**
- Owner sees pricing page with company JazzCash/Easypaisa number
- Owner sends payment manually
- Owner WhatsApps proof to company number
- Super admin manually upgrades plan in admin panel
- System sends confirmation email to owner

---

### Feature 8: Super Admin Panel

**Access:** `qrmenu.pk/superadmin` (separate route, protected)  
**Who:** Only you (company owner)

**Capabilities:**
- All restaurants list (name, city, plan, status, join date)
- Search & filter restaurants
- View any restaurant's full menu
- Edit any restaurant's details
- Change any restaurant's subscription plan (manual upgrade)
- Add/edit company payment details (shown on pricing page)
- View platform-wide analytics (total orders, revenue, restaurants)
- Deactivate/reactivate any restaurant

---

### Feature 9: Nearby Restaurants Directory

**Access:** `qrmenu.pk/restaurants` or triggered from customer account

**Flow:**
- Customer account banate waqt city puchhi jaye (Lahore/Karachi/Islamabad)
- Directory page: filter by city → restaurants list (name, logo, cuisine type)
- Click restaurant → open their menu (same as QR scan)
- No GPS required — city-based only

---

## 5. USER FLOWS (Complete)

### 5.1 Customer — First Visit (QR Scan)
```
QR Scan 
→ Menu Home (restaurant name + categories)
→ Browse dishes (list view)
→ Add to cart (sticky cart bar at bottom)
→ View cart
→ Select Order Type (Dine-in / Takeaway / Delivery)
→ Fill required info
→ Click "Place Order"
→ If not logged in → Login page (Google / Email)
→ If logged in → Skip login
→ WhatsApp app opens (pre-filled message to restaurant)
→ Customer sends WhatsApp message
→ Order Confirmation page shown
→ Email sent to owner
→ Dashboard bell updates for owner
```

### 5.2 Restaurant Owner — Onboarding
```
Visit qrmenu.pk/signup
→ Fill: Restaurant name, city, phone, email, password
→ Email verification
→ Dashboard opens (trial starts)
→ Menu setup wizard (add categories + dishes)
→ QR code generated
→ Download QR → Print / Display
→ Trial day 1-3: Upload images (max 4)
→ Day 7: Upgrade prompt
```

### 5.3 Super Admin — Manual Plan Upgrade
```
Login → /superadmin
→ Find restaurant (search by name)
→ Click restaurant → Details
→ Change plan dropdown
→ Save → Email auto-sent to owner
```

---

## 6. NON-FUNCTIONAL REQUIREMENTS

### 6.1 Performance
| Metric | Target |
|---|---|
| Menu load time | < 2 seconds on 3G |
| Dashboard load | < 3 seconds |
| QR generation | < 3 seconds |
| Image load | Lazy loaded, WebP |
| Uptime | 99.5% (Vercel + Supabase SLA) |

### 6.2 Security
| Requirement | Implementation |
|---|---|
| HTTPS everywhere | Vercel auto SSL |
| Auth | Supabase Auth (JWT + OAuth 2.0) |
| Row Level Security | Supabase RLS (owner sirf apna data dekhe) |
| Rate limiting | 100 requests/minute per IP |
| Data encryption | Supabase encryption at rest |
| Admin protection | Separate route + role check |

### 6.3 Compatibility
| Device | Support |
|---|---|
| Android | 8.0+ (95% Pakistan market) |
| iOS | 12.0+ (99% iPhones) |
| Browsers | Chrome, Safari, Firefox, Edge |
| Screen sizes | 320px to 1920px (responsive) |

---

## 7. SUCCESS METRICS (KPIs)

| Metric | Month 1 | Month 3 | Month 6 |
|---|---|---|---|
| Restaurants onboarded | 50 | 150 | 300 |
| Monthly Revenue | PKR 40,000 | PKR 120,000 | PKR 240,000 |
| Orders per day (platform) | 100 | 300 | 600 |
| Avg Order Value | PKR 700 | PKR 750 | PKR 800 |
| Restaurant churn rate | < 10% | < 8% | < 5% |
| Menu load time | < 2s | < 1.5s | < 1.2s |
| Trial to paid conversion | 30% | 40% | 50% |

---

## 8. OUT OF SCOPE (MVP)

| Feature | Reason | Phase |
|---|---|---|
| Real-time delivery tracking | Too complex, needs rider app | Phase 3 |
| Kitchen Display System (KDS) | Owner can use phone | Phase 3 |
| Native Mobile App | PWA sufficient for MVP | Phase 2 |
| Loyalty Points / Rewards | Not core | Phase 3 |
| Automated payment gateway | Needs business registration | Phase 2 |
| SMS notifications | Cost — email free | Phase 2 |
| Multiple branches per account | Keep simple for MVP | Phase 2 |
| Table reservation | Not core | Phase 3 |

---

*End of PRD v1.0*
