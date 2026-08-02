export interface BlogArticle {
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
  author: string
  authorTitle: string
  authorLinkedIn: string
}

export const blogSlugs = [
  "create-qr-code-menu-restaurant-pakistan",
  "whatsapp-ordering-restaurant-pakistan-guide",
  "foodpanda-commission-vs-direct-ordering-pakistan",
  "benefits-qr-code-menu-pakistani-restaurants",
  "restaurant-marketing-faisalabad-guide",
  "how-to-make-qr-code-menu-for-restaurant",
  // SEO guides that link to landing pages
  "what-is-digital-menu-for-restaurants",
  "free-digital-menu-vs-paid-comparison",
  "best-digital-menu-platform-pakistan",
  "digital-menu-qr-code-setup-guide",
  "digital-menu-design-tips-restaurants",
  "digital-menu-app-vs-native-app",
  "qr-menu-vs-digital-menu-difference",
  // Pakistan SEO cluster articles (Aug 2026) — link to new Pakistan/city landing pages
  "menu-printing-islamabad",
  "digital-vs-printed-menu-pakistan",
  "how-to-create-digital-menu-restaurant",
  // Digital Menu cluster (Aug 2026) — pillar + spokes
  "digital-menu-complete-guide-restaurants",
  "digital-menu-boards-for-restaurants",
  "what-is-a-digital-menu-board",
  "digital-menu-board-cost-pakistan",
  "how-to-design-digital-menu-board",
  "how-to-set-up-digital-menu-board",
  "coffee-shop-digital-menu",
  "how-to-scan-qr-code-menu",
  "digital-qr-menu-for-restaurants",
  "restaurant-qr-menu-free-guide",
] as const

export const blogArticles: BlogArticle[] = [
  {
    slug: "create-qr-code-menu-restaurant-pakistan",
    title: "How to Create a QR Code Menu for Your Restaurant in Pakistan (2026 Guide)",
    excerpt:
      "Step-by-step guide to create a digital QR menu for your Pakistani restaurant. No app, no commission — just scan and order via WhatsApp.",
    date: "2026-07-14",
    readTime: "8 min",
    category: "QR Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "whatsapp-ordering-restaurant-pakistan-guide",
    title: "WhatsApp Ordering for Restaurants in Pakistan: Complete Setup Guide",
    excerpt:
      "Learn how to set up WhatsApp ordering for your restaurant. Customers scan, browse, and order — all through WhatsApp without any commission.",
    date: "2026-07-11",
    readTime: "7 min",
    category: "WhatsApp Ordering",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "foodpanda-commission-vs-direct-ordering-pakistan",
    title: "Foodpanda Commission vs Direct Ordering: What Pakistani Restaurants Need to Know",
    excerpt:
      "Compare Foodpanda, Cheetay, and direct ordering costs. See how much commission you're paying and how to save 25-35% per order.",
    date: "2026-07-08",
    readTime: "6 min",
    category: "Cost Savings",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "benefits-qr-code-menu-pakistani-restaurants",
    title: "10 Benefits of QR Code Menus for Pakistani Restaurants",
    excerpt:
      "From zero commission to instant updates — discover why hundreds of restaurants in Pakistan are switching to QR code menus.",
    date: "2026-07-04",
    readTime: "5 min",
    category: "QR Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "restaurant-marketing-faisalabad-guide",
    title: "How to Get More Customers for Your Restaurant in Faisalabad",
    excerpt:
      "Practical marketing tips for Faisalabad restaurant owners. Local SEO, social media, QR menus, and word-of-mouth strategies that work.",
    date: "2026-07-01",
    readTime: "6 min",
    category: "Restaurant Marketing",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "how-to-make-qr-code-menu-for-restaurant",
    title: "How to Make a QR Code Menu for Your Restaurant: Complete Step-by-Step Guide",
    excerpt:
      "Learn how to make a QR code menu for your restaurant in Pakistan. Step-by-step guide covering QR code menu card price, WhatsApp ordering setup, and pro tips.",
    date: "2026-06-28",
    readTime: "7 min",
    category: "QR Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  // === NEW SEO GUIDE ARTICLES (linking to landing pages) ===
  {
    slug: "what-is-digital-menu-for-restaurants",
    title: "What Is a Digital Menu for Restaurants? Complete Guide (2026)",
    excerpt:
      "Learn what a digital menu for restaurants is, how QR code menus work, and why Pakistani restaurants are switching from printed menus to digital ordering systems.",
    date: "2026-07-21",
    readTime: "6 min",
    category: "Digital Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "free-digital-menu-vs-paid-comparison",
    title: "Free Digital Menu vs Paid Digital Menu: Which Is Better for Your Restaurant?",
    excerpt:
      "Compare free and paid digital menu solutions for restaurants in Pakistan. See what you get free vs paid features, and find the right option for your budget.",
    date: "2026-07-21",
    readTime: "5 min",
    category: "Digital Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "best-digital-menu-platform-pakistan",
    title: "Best Digital Menu Platform for Restaurants in Pakistan (2026)",
    excerpt:
      "Find the best digital menu platform for your restaurant in Pakistan. Compare features, pricing, and benefits of top QR menu providers.",
    date: "2026-07-21",
    readTime: "7 min",
    category: "Digital Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "digital-menu-qr-code-setup-guide",
    title: "Digital Menu QR Code Setup Guide for Restaurants",
    excerpt:
      "Step-by-step guide to set up a digital menu QR code for your restaurant. Learn how QR code restaurant menus work, costs, and best practices.",
    date: "2026-07-21",
    readTime: "6 min",
    category: "QR Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "digital-menu-design-tips-restaurants",
    title: "Digital Menu Design Tips for Restaurants: Make Your Menu Sell More",
    excerpt:
      "Learn digital menu design best practices for restaurants. Tips on food photography, layout, pricing display, and category organization to increase orders.",
    date: "2026-07-21",
    readTime: "5 min",
    category: "Digital Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "digital-menu-app-vs-native-app",
    title: "Digital Menu App vs Native Restaurant App: Which Is Better?",
    excerpt:
      "Compare digital menu apps (web-based QR menus) with native restaurant apps. See why Pakistani restaurants choose web-based digital menus over costly mobile apps.",
    date: "2026-07-21",
    readTime: "5 min",
    category: "Digital Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "qr-menu-vs-digital-menu-difference",
    title: "QR Menu vs Digital Menu: What's the Difference?",
    excerpt:
      "Understand the difference between QR menus and digital menus for restaurants. Learn about tablet menus, PDF menus, QR code ordering, and WhatsApp ordering systems.",
    date: "2026-07-21",
    readTime: "4 min",
    category: "Digital Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  // === PAKISTAN SEO CLUSTER ARTICLES (Aug 2026) — link to Pakistan/city landing pages ===
  {
    slug: "menu-printing-islamabad",
    title: "Menu Printing in Islamabad: Costs & the Digital Menu Alternative",
    excerpt:
      "How much does menu printing cost in Islamabad? See real prices, why reprints eat your profit, and how a digital QR menu saves you thousands. Local guide for Islamabad restaurants.",
    date: "2026-08-01",
    readTime: "7 min",
    category: "Menu Printing",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "digital-vs-printed-menu-pakistan",
    title: "Digital Menu vs Printed Menu: Which Is Better for Pakistani Restaurants?",
    excerpt:
      "Compare digital menus with printed menus for Pakistani restaurants: costs, price updates, photos, and ordering. See why restaurants in Pakistan are making the switch.",
    date: "2026-08-01",
    readTime: "6 min",
    category: "Menu Printing",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "how-to-create-digital-menu-restaurant",
    title: "How to Create a Digital Menu for Your Restaurant (Step-by-Step)",
    excerpt:
      "Step-by-step guide to create a digital menu for your restaurant in Pakistan. Add dishes, generate a QR code, print table cards, and start receiving WhatsApp orders.",
    date: "2026-08-01",
    readTime: "8 min",
    category: "Digital Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  // === DIGITAL MENU CLUSTER (Aug 2026) ===
  {
    slug: "digital-menu-complete-guide-restaurants",
    title: "Digital Menu for Restaurants: The Complete Guide (2026)",
    excerpt:
      "Everything you need to know about digital menus: what they are, every type, real costs in Pakistan, and how to set one up in 30 minutes. QR menus, menu boards, tablets, and more.",
    date: "2026-08-02",
    readTime: "9 min",
    category: "Digital Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "digital-menu-boards-for-restaurants",
    title: "Digital Menu Boards for Restaurants: Complete Guide (2026)",
    excerpt:
      "What digital menu boards are, the types, what they cost in Pakistan, and when a cheaper QR code menu makes more sense. Honest comparison for restaurant owners.",
    date: "2026-08-02",
    readTime: "7 min",
    category: "Digital Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "what-is-a-digital-menu-board",
    title: "What Is a Digital Menu Board and How Do They Work?",
    excerpt:
      "Plain-English explanation of digital menu boards: the screen, the player, the software, and how they compare with QR code menus for Pakistani restaurants.",
    date: "2026-08-02",
    readTime: "6 min",
    category: "Digital Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "digital-menu-board-cost-pakistan",
    title: "How Much Do Digital Menu Boards Cost in Pakistan? (2026)",
    excerpt:
      "Real prices for digital menu board screens, players, installation, and software in Pakistan — and why a QR code menu costs a fraction with WhatsApp ordering.",
    date: "2026-08-02",
    readTime: "7 min",
    category: "Digital Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "how-to-design-digital-menu-board",
    title: "How to Design a Digital Menu Board: 8 Rules That Sell More",
    excerpt:
      "Eight design rules for a digital menu board that lifts average order value — readability, photos, hierarchy, content rotation, and calls to action.",
    date: "2026-08-02",
    readTime: "5 min",
    category: "Digital Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "how-to-set-up-digital-menu-board",
    title: "How to Set Up a Digital Menu Board (Step-by-Step)",
    excerpt:
      "Complete setup guide for a digital menu board: choosing the screen, media player, mounting, software, and content scheduling — plus the cheaper alternative.",
    date: "2026-08-02",
    readTime: "6 min",
    category: "Digital Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "coffee-shop-digital-menu",
    title: "Coffee Shop Digital Menu Ideas: Boards, QR Codes & Apps",
    excerpt:
      "Every way a coffee shop in Pakistan can go digital — menu boards, QR codes, tablet menus, and web menus — and which to choose for your café.",
    date: "2026-08-02",
    readTime: "6 min",
    category: "Digital Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "how-to-scan-qr-code-menu",
    title: "How to Scan a QR Code for a Menu (iPhone, Android & Camera)",
    excerpt:
      "Step-by-step guide to scanning a QR code for a restaurant or hotel menu on iPhone, Android, and older phones — plus QR code safety tips.",
    date: "2026-08-02",
    readTime: "5 min",
    category: "QR Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "digital-qr-menu-for-restaurants",
    title: "Digital QR Menu for Restaurants: How It Works & How to Build Yours",
    excerpt:
      "How a digital QR menu works — scan, browse, order on WhatsApp — and how to build yours in 30 minutes with zero hardware and zero commission.",
    date: "2026-08-02",
    readTime: "7 min",
    category: "QR Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
  {
    slug: "restaurant-qr-menu-free-guide",
    title: "Restaurant QR Menu: How to Create One for Free (Step-by-Step)",
    excerpt:
      "Yes, you can create a restaurant QR menu for free. Step-by-step guide to a working WhatsApp-ordering QR menu in 30 minutes — no credit card required.",
    date: "2026-08-02",
    readTime: "6 min",
    category: "QR Menu Guides",
    author: "Maz Makki",
    authorTitle: "Digital Marketing Lead, Digital QR Menue",
    authorLinkedIn: "https://www.linkedin.com/in/muazmaki2",
  },
]

/** Shared list of static/public routes (not behind auth, not noindex). */
export const publicRoutes = [
  { path: "", lastModified: "2026-07-30" },
  { path: "pricing", lastModified: "2026-07-30" },
  { path: "restaurants", lastModified: "2026-07-30" },
  { path: "faq", lastModified: "2026-07-30" },
  { path: "about", lastModified: "2026-07-30" },
  { path: "contact", lastModified: "2026-07-30" },
  { path: "privacy", lastModified: "2026-04-01" },
  { path: "terms", lastModified: "2026-04-01" },
  // Auth pages — now indexable (noindex removed)
  { path: "signup/restaurant", lastModified: "2026-07-30" },
  { path: "signup/customer", lastModified: "2026-07-30" },
  { path: "login", lastModified: "2026-07-30" },
  { path: "login/customer", lastModified: "2026-07-30" },
  { path: "blog", lastModified: "2026-07-30" },
  // SEO landing pages — kept, distinct user intents
  { path: "digital-menu-for-restaurants", lastModified: "2026-07-30" },
  { path: "digital-menu-pdf", lastModified: "2026-07-30" },
  { path: "digital-menu-design", lastModified: "2026-07-30" },
  { path: "digital-menu-app", lastModified: "2026-07-30" },
  { path: "digital-menu-tablet", lastModified: "2026-07-30" },
  { path: "qr-menu-login", lastModified: "2026-07-30" },
  // Pakistan SEO cluster landing pages (Aug 2026)
  { path: "digital-menu-pakistan", lastModified: "2026-08-01" },
  { path: "qr-menu-pakistan", lastModified: "2026-08-01" },
  { path: "digital-menu-islamabad", lastModified: "2026-08-01" },
  { path: "digital-menu-lahore", lastModified: "2026-08-01" },
  { path: "digital-menu-karachi", lastModified: "2026-08-01" },
] as const

export const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.digitalmenue.com"
