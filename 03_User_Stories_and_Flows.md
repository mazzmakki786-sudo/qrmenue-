# User Stories & Complete Flow Document
## QRMenu.pk
**Version:** 1.0 | **Date:** May 30, 2026

---

## 1. CUSTOMER USER STORIES

### US-001: Menu Discovery via QR
**As a** customer visiting a restaurant  
**I want to** scan a QR code and see the full menu instantly  
**So that** I don't need to download any app or wait for a physical menu  

**Acceptance Criteria:**
- QR opens menu in browser in < 2 seconds
- Menu shows restaurant name, logo, and all categories
- No login required to browse
- Works on Android and iPhone

---

### US-002: Browse Menu by Category
**As a** customer  
**I want to** browse dishes by category (Starters, Main, Desserts)  
**So that** I can find what I want quickly  

**Acceptance Criteria:**
- Categories shown as sticky tabs at top
- Clicking tab scrolls to that section
- Each dish shows: name, price, description, availability status
- Unavailable dishes shown with "Unavailable" badge (greyed out)

---

### US-003: Add to Cart
**As a** customer  
**I want to** add dishes to my cart  
**So that** I can order multiple items at once  

**Acceptance Criteria:**
- "+ Add" button on each dish
- Cart count updates instantly
- Sticky cart bar visible at bottom showing: item count + total
- Can increase/decrease quantity from cart
- Can remove items

---

### US-004: Select Order Type
**As a** customer  
**I want to** choose how I want to receive my order  
**So that** I get the right service (dine-in, takeaway, or delivery)  

**Acceptance Criteria:**
- 3 options: Dine-in / Takeaway / Delivery
- Each option shows what info is needed
- Selection updates form fields dynamically

---

### US-005: Fill Order Info
**As a** customer  
**I want to** provide my details based on order type  
**So that** the restaurant knows who I am and where to deliver  

**Acceptance Criteria (Dine-in):** Name + Phone + Table Number required  
**Acceptance Criteria (Takeaway):** Name only required  
**Acceptance Criteria (Delivery):** Name + Phone + Full Address required  

---

### US-006: Login at Checkout
**As a** customer  
**I want to** login quickly at checkout  
**So that** my order is linked to my account  

**Acceptance Criteria:**
- Login required ONLY when "Place Order" is clicked
- If already logged in → skip login page
- Options: Google (1-tap) or Email/Password
- After login → WhatsApp redirect happens automatically

---

### US-007: Send Order via WhatsApp
**As a** customer  
**I want to** send my order to the restaurant via WhatsApp  
**So that** the restaurant receives my complete order details  

**Acceptance Criteria:**
- After login, WhatsApp opens automatically
- Restaurant's number pre-filled
- Complete order template pre-filled (items, total, address, type)
- Customer just needs to tap "Send"

---

### US-008: View Order Confirmation
**As a** customer  
**I want to** see order confirmation after sending  
**So that** I know my order was placed  

**Acceptance Criteria:**
- Confirmation page shows: Order ID, items, total, estimated time
- "WhatsApp message sent to restaurant" shown
- Option to browse more or view account

---

### US-009: Browse Nearby Restaurants
**As a** customer with an account  
**I want to** see restaurants near me  
**So that** I can order from other restaurants too  

**Acceptance Criteria:**
- City-based filter (Lahore / Karachi / Islamabad)
- Restaurant cards: name, logo, cuisine type, city
- Click → opens their menu
- Available from customer account page

---

## 2. RESTAURANT OWNER USER STORIES

### US-010: Self-Service Signup
**As a** restaurant owner  
**I want to** sign up and set up my restaurant myself  
**So that** I can start using the platform without waiting  

**Acceptance Criteria:**
- Signup form: Name, email, password, restaurant name, city, phone
- Email verification sent
- After verification → dashboard opens with setup wizard
- Trial starts automatically (7 days)

---

### US-011: Add Menu Categories
**As a** restaurant owner  
**I want to** create menu categories  
**So that** my dishes are organized  

**Acceptance Criteria:**
- Add category: name in English + Urdu (optional)
- Reorder categories (drag or up/down arrows)
- Delete category (warns if dishes exist)
- Changes reflect on customer menu instantly

---

### US-012: Add Dishes
**As a** restaurant owner  
**I want to** add dishes to my menu  
**So that** customers can see and order them  

**Acceptance Criteria:**
- Add dish: name (EN + UR), description (EN + UR), price, category
- Image upload (only if plan allows)
- Available/Unavailable toggle
- Dish appears on customer menu within 5 seconds
- Email sent to previous customers when new dish is added

---

### US-013: View Orders
**As a** restaurant owner  
**I want to** see all incoming orders  
**So that** I can prepare them  

**Acceptance Criteria:**
- Orders list with: Order #, customer name, items, total, time, type
- Real-time bell notification for new orders
- Email notification for new orders
- Update order status: Received → Preparing → Ready → Completed
- Filter orders: Today / This Week / All Time

---

### US-014: View Analytics
**As a** restaurant owner  
**I want to** see my sales analytics  
**So that** I can understand peak times and popular dishes  

**Acceptance Criteria:**
- 7-day order graph (default view)
- 30-day order graph (toggle)
- Today's stats: order count + revenue
- Top 3 popular dishes
- Peak order hour

---

### US-015: Download QR Code
**As a** restaurant owner  
**I want to** download my QR code  
**So that** I can print it and display it  

**Acceptance Criteria:**
- QR visible in settings page
- Download as PNG (300×300px minimum)
- QR links to: qrmenu.pk/menu/[my-slug]
- Can re-download anytime

---

### US-016: Toggle Language
**As a** restaurant owner  
**I want to** set my menu language to Urdu or English or both  
**So that** my customers can read in their preferred language  

**Acceptance Criteria:**
- Settings: Language → English / Urdu / Both
- If "Both" selected: EN/UR toggle appears on customer menu
- Urdu text uses Noto Naskh Arabic font
- RTL support for Urdu text

---

### US-017: View Subscription Status
**As a** restaurant owner  
**I want to** see my current plan and days remaining  
**So that** I know when to upgrade  

**Acceptance Criteria:**
- Dashboard shows: Current plan + days remaining (prominent)
- Trial: "X days remaining in your free trial"
- Paid: "Your plan renews on [date]"
- Pricing page shows upgrade options with company payment details

---

## 3. SUPER ADMIN USER STORIES

### US-018: View All Restaurants
**As a** super admin  
**I want to** see all registered restaurants  
**So that** I can manage the platform  

**Acceptance Criteria:**
- Table: Name, City, Plan, Status, Join Date, Total Orders
- Search by name or city
- Filter by plan type

---

### US-019: View & Edit Any Restaurant
**As a** super admin  
**I want to** view and edit any restaurant's details  
**So that** I can help with errors or make corrections  

**Acceptance Criteria:**
- Click restaurant → see full details + menu
- Edit: name, city, phone, WhatsApp number, plan
- Can deactivate/reactivate restaurant

---

### US-020: Manually Upgrade Plan
**As a** super admin  
**I want to** manually upgrade a restaurant's plan  
**So that** after they pay manually, I can activate their subscription  

**Acceptance Criteria:**
- Select restaurant → Change Plan dropdown
- Set plan end date
- Save → confirmation email auto-sent to owner
- Subscription log updated

---

### US-021: Update Company Payment Details
**As a** super admin  
**I want to** update company JazzCash/Easypaisa numbers shown on pricing page  
**So that** restaurant owners can send payments to correct accounts  

**Acceptance Criteria:**
- Settings page in super admin
- Edit: JazzCash number, Easypaisa number, bank details, WhatsApp support number
- Changes reflect on public pricing page immediately

---

## 4. COMPLETE PAGE MAP

### Customer Pages
```
/menu/[slug]              → Restaurant menu (public)
/menu/[slug]#[category]   → Scroll to category
/cart                     → Cart review
/checkout                 → Order type + info form
/login                    → Login (triggered at checkout)
/signup                   → Create account
/order-confirm/[id]       → Order confirmation
/restaurants              → Nearby restaurants directory
/account                  → Customer account + order history
```

### Owner Pages
```
/dashboard                → Dashboard home (stats + graph)
/dashboard/menu           → Menu management
/dashboard/menu/add       → Add new dish
/dashboard/menu/[id]/edit → Edit dish
/dashboard/orders         → Orders list
/dashboard/orders/[id]    → Order detail
/dashboard/analytics      → Detailed analytics
/dashboard/settings       → Restaurant settings + QR download
/dashboard/subscription   → Plan + billing
```

### Super Admin Pages
```
/superadmin               → All restaurants dashboard
/superadmin/restaurants/[id]  → Restaurant detail + edit
/superadmin/settings      → Company payment details
```

### Public Pages
```
/                         → Landing page (QRMenu.pk)
/pricing                  → Plans + company payment details
/signup/restaurant        → Restaurant owner signup
/login                    → Login (all users)
```

---

## 5. ERROR STATES & EDGE CASES

| Scenario | Handling |
|---|---|
| Restaurant slug not found | 404 page: "Restaurant not found" |
| Trial expired, menu accessed | "Restaurant temporarily on hold — contact them directly" |
| Image upload in trial day 4-7 | "Image upload available in paid plans. Upgrade to continue." |
| Order placed, WhatsApp not opened | "Tap here to resend your order via WhatsApp" button |
| Internet lost during checkout | Local storage saves cart, resume on reconnect |
| Owner logs in from different device | Session works on all devices |
| Super admin wrong email | 403 redirect to home |
| Dish marked unavailable | Greyed out on menu, cannot add to cart |
| Restaurant deactivated by admin | Menu shows "Currently unavailable" |

---

*End of User Stories & Flow Document v1.0*
