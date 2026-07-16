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
        name: "Digital QR Menue",
        url: "https://digitalmenue.com",
        logo: "https://digitalmenue.com/favicon.svg",
        description:
          "Pakistan's leading QR-based digital menu and ordering platform for restaurants. Create a free QR code menu in under 5 minutes.",
        foundingDate: "2024",
        address: {
          "@type": "PostalAddress",
          addressCountry: "PK",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+92-314-6325823",
          contactType: "customer service",
          availableLanguage: ["English", "Urdu"],
        },
        sameAs: [
          "https://www.facebook.com/digitalmenue",
          "https://www.instagram.com/digitalmenue",
          "https://www.linkedin.com/company/digitalmenue",
          "https://www.tiktok.com/@digitalmenue",
          "https://www.youtube.com/@digitalmenue",
          "https://x.com/digitalmenue",
        ],
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
        name: "Digital QR Menue",
        url: "https://digitalmenue.com",
        description:
          "Pakistan's #1 QR-based digital menu platform for restaurants",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://digitalmenue.com/restaurants?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      }}
    />
  )
}

export function SoftwareApplicationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Digital QR Menue Platform",
        operatingSystem: "Web",
        applicationCategory: "BusinessApplication",
        description:
          "Pakistan's QR-based digital menu and WhatsApp ordering platform for restaurants. No app, no commission.",
        url: "https://digitalmenue.com",
        offers: [
          {
            "@type": "Offer",
            name: "Free Trial",
            price: 0,
            priceCurrency: "PKR",
            availability: "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            name: "Starter",
            price: 1200,
            priceCurrency: "PKR",
            availability: "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            name: "Growth",
            price: 2500,
            priceCurrency: "PKR",
            availability: "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            name: "Premium",
            price: 4500,
            priceCurrency: "PKR",
            availability: "https://schema.org/InStock",
          },
        ],
        author: {
          "@type": "Organization",
          name: "Digital QR Menue",
          url: "https://digitalmenue.com",
        },
        applicationSuite: "QRMenu",
        countryOfOrigin: "PK",
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
        url: `https://digitalmenue.com/menu/${slug}`,
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
        name: "Restaurants in Pakistan — Digital QR Menue",
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
        name: "Digital QR Menue — Digital Menu Platform",
        description:
          "QR-based digital menu and ordering platform for restaurants in Pakistan. Plans starting from free trial.",
        brand: {
          "@type": "Brand",
          name: "Digital QR Menue",
        },
        offers: [
          {
            "@type": "Offer",
            name: "Free Trial",
            price: "0",
            priceCurrency: "PKR",
            priceValidUntil: "2026-12-31",
            availability: "https://schema.org/InStock",
            url: "https://digitalmenue.com/signup",
          },
          {
            "@type": "Offer",
            name: "Starter",
            price: "1200",
            priceCurrency: "PKR",
            priceValidUntil: "2026-12-31",
            availability: "https://schema.org/InStock",
            url: "https://digitalmenue.com/signup/restaurant",
          },
          {
            "@type": "Offer",
            name: "Growth",
            price: "2500",
            priceCurrency: "PKR",
            priceValidUntil: "2026-12-31",
            availability: "https://schema.org/InStock",
            url: "https://digitalmenue.com/signup/restaurant",
          },
          {
            "@type": "Offer",
            name: "Premium",
            price: "4500",
            priceCurrency: "PKR",
            priceValidUntil: "2026-12-31",
            availability: "https://schema.org/InStock",
            url: "https://digitalmenue.com/signup/restaurant",
          },
        ],
      }}
    />
  )
}

export function BreadcrumbListJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
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

export function LocalBusinessJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Digital QR Menue",
        description:
          "Pakistan's leading QR-based digital menu and WhatsApp ordering platform for restaurants, cafes, and food businesses across Pakistan.",
        url: "https://digitalmenue.com",
        logo: "https://digitalmenue.com/favicon.svg",
        image: "https://www.digitalmenue.com/og-image.png",
        telephone: "+92-314-6325823",
        email: "dmenue@gmail.com",
        priceRange: "PKR 0 — 4,500",
        address: {
          "@type": "PostalAddress",
          addressCountry: "PK",
        },
        areaServed: [
          { "@type": "City", name: "Lahore" },
          { "@type": "City", name: "Karachi" },
          { "@type": "City", name: "Islamabad" },
          { "@type": "City", name: "Faisalabad" },
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "QR Menu Plans",
          itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Free Trial" }, price: "0", priceCurrency: "PKR" },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Starter" }, price: "1200", priceCurrency: "PKR" },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Growth" }, price: "2500", priceCurrency: "PKR" },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Premium" }, price: "4500", priceCurrency: "PKR" },
          ],
        },
        sameAs: [
          "https://www.facebook.com/digitalmenue",
          "https://www.instagram.com/digitalmenue",
          "https://www.linkedin.com/company/digitalmenue",
          "https://www.tiktok.com/@digitalmenue",
          "https://www.youtube.com/@digitalmenue",
          "https://x.com/digitalmenue",
        ],
      }}
    />
  )
}

export function ReviewJsonLd({
  reviews,
}: {
  reviews: Array<{
    authorName: string
    reviewBody: string
    ratingValue: number
    datePublished: string
  }>
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "AggregateRating",
        itemReviewed: {
          "@type": "Organization",
          name: "Digital QR Menue",
        },
        ratingValue: reviews.length > 0
          ? (reviews.reduce((sum, r) => sum + r.ratingValue, 0) / reviews.length).toFixed(1)
          : "5.0",
        bestRating: "5",
        ratingCount: reviews.length || 1,
        review: reviews.map((r) => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.authorName },
          reviewBody: r.reviewBody,
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.ratingValue,
            bestRating: "5",
          },
          datePublished: r.datePublished,
        })),
      }}
    />
  )
}

export function VideoObjectJsonLd({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  contentUrl,
}: {
  name: string
  description: string
  thumbnailUrl: string
  uploadDate: string
  contentUrl: string
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name,
        description,
        thumbnailUrl,
        uploadDate,
        contentUrl,
        publisher: {
          "@type": "Organization",
          name: "Digital QR Menue",
          url: "https://digitalmenue.com",
        },
      }}
    />
  )
}

export function ServiceJsonLd({
  name,
  description,
  providerName,
  areaServed,
}: {
  name: string
  description: string
  providerName: string
  areaServed: string[]
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name,
        description,
        provider: {
          "@type": "Organization",
          name: providerName,
          url: "https://digitalmenue.com",
        },
        areaServed: areaServed.map((city) => ({ "@type": "City", name: city })),
      }}
    />
  )
}

