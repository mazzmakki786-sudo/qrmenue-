interface JsonLdProps {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "QRMenu.pk",
        url: "https://qrmenu.pk",
        logo: "https://qrmenu.pk/favicon.svg",
        description:
          "Pakistan's leading QR-based digital menu and ordering platform for restaurants. Create a free QR code menu in under 5 minutes.",
        foundingDate: "2024",
        address: {
          "@type": "PostalAddress",
          addressCountry: "PK",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+92-300-123-4567",
          contactType: "customer service",
          availableLanguage: ["English", "Urdu"],
        },
        sameAs: [],
      }}
    />
  )
}

export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "QRMenu.pk",
        url: "https://qrmenu.pk",
        description:
          "Pakistan's #1 QR-based digital menu platform for restaurants",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://qrmenu.pk/restaurants?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      }}
    />
  )
}

export function RestaurantJsonLd({
  name,
  description,
  logoUrl,
  city,
  cuisineType,
  slug,
  categories,
}: {
  name: string
  description: string | null
  logoUrl: string | null
  city: string | null
  cuisineType: string | null
  slug: string
  categories: Array<{
    name_en: string
    dishes: Array<{
      name_en: string
      description_en: string | null
      price: number
      image_url: string | null
      is_available: boolean
    }>
  }>
}) {
  const menuItems = categories.flatMap((cat) =>
    cat.dishes.map((dish) => ({
      "@type": "MenuItem" as const,
      name: dish.name_en,
      description: dish.description_en || "",
      image: dish.image_url || undefined,
      offers: {
        "@type": "Offer" as const,
        price: dish.price,
        priceCurrency: "PKR",
        availability: dish.is_available
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      },
      menuCategory: cat.name_en,
    }))
  )

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Restaurant",
        name,
        description:
          description ||
          `${name} - ${cuisineType || "Restaurant"} in ${city || "Pakistan"}. View menu and order via WhatsApp.`,
        image: logoUrl || undefined,
        url: `https://qrmenu.pk/menu/${slug}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: city || "Pakistan",
          addressCountry: "PK",
        },
        servesCuisine: cuisineType || "Restaurant",
        hasMenu: {
          "@type": "Menu",
          hasMenuSection: categories.map((cat) => ({
            "@type": "MenuSection",
            name: cat.name_en,
            hasMenuItem: cat.dishes.map((dish) => ({
              "@type": "MenuItem",
              name: dish.name_en,
              offers: {
                "@type": "Offer",
                price: dish.price,
                priceCurrency: "PKR",
              },
            })),
          })),
        },
      }}
    />
  )
}

export function ItemListJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string; description?: string }>
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Restaurants in Pakistan — QRMenu.pk",
        description:
          "Browse restaurants across Pakistan. View menus, prices, and order via WhatsApp.",
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Restaurant",
            name: item.name,
            url: item.url,
            description: item.description || undefined,
          },
        })),
      }}
    />
  )
}

export function PricingJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: "QRMenu.pk — Digital Menu Platform",
        description:
          "QR-based digital menu and ordering platform for restaurants in Pakistan. Plans starting from free trial.",
        brand: {
          "@type": "Brand",
          name: "QRMenu.pk",
        },
        offers: [
          {
            "@type": "Offer",
            name: "Free Trial",
            price: "0",
            priceCurrency: "PKR",
            priceValidUntil: "2026-12-31",
            availability: "https://schema.org/InStock",
            url: "https://qrmenu.pk/signup",
          },
          {
            "@type": "Offer",
            name: "Starter",
            price: "1200",
            priceCurrency: "PKR",
            priceValidUntil: "2026-12-31",
            availability: "https://schema.org/InStock",
            url: "https://qrmenu.pk/signup/restaurant",
          },
          {
            "@type": "Offer",
            name: "Growth",
            price: "2500",
            priceCurrency: "PKR",
            priceValidUntil: "2026-12-31",
            availability: "https://schema.org/InStock",
            url: "https://qrmenu.pk/signup/restaurant",
          },
          {
            "@type": "Offer",
            name: "Premium",
            price: "4500",
            priceCurrency: "PKR",
            priceValidUntil: "2026-12-31",
            availability: "https://schema.org/InStock",
            url: "https://qrmenu.pk/signup/restaurant",
          },
        ],
      }}
    />
  )
}

export function FaqJsonLd({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }}
    />
  )
}
