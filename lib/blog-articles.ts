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
  "restaurant-marketing-lahore-guide",
  "how-to-make-qr-code-menu-for-restaurant",
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
    slug: "restaurant-marketing-lahore-guide",
    title: "How to Get More Customers for Your Restaurant in Lahore",
    excerpt:
      "Practical marketing tips for Lahore restaurant owners. Local SEO, social media, QR menus, and word-of-mouth strategies that work.",
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
]

/** Shared list of static/public routes (not behind auth, not noindex). */
export const publicRoutes = [
  { path: "", lastModified: "2026-07-16" },
  { path: "pricing", lastModified: "2026-07-16" },
  { path: "restaurants", lastModified: "2026-07-16" },
  { path: "faq", lastModified: "2026-07-16" },
  { path: "contact", lastModified: "2026-07-16" },
  { path: "privacy", lastModified: "2026-04-01" },
  { path: "terms", lastModified: "2026-04-01" },
  { path: "signup/restaurant", lastModified: "2026-07-16" },
  { path: "blog", lastModified: "2026-07-16" },
] as const

export const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.digitalmenue.com"
