import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { JsonLd } from "@/components/JsonLd"
import { BlogRichText } from "@/components/blog/BlogRichText"
import { articles } from "../articles"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = articles[slug]
  if (!article) return { title: "Article Not Found" }

  return {
    title: `${article.title}`,
    description: article.content[0].slice(0, 155) + "...",
    alternates: {
      canonical: `https://www.digitalmenue.com/blog/${slug}`,
    },
    authors: [{ name: article.author }],
  }
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params
  const article = articles[slug]
  if (!article) notFound()

  // Extract first 170 chars of first paragraph for the "standout" citable block
  const firstParaCitable = article.content[0].length > 170
    ? article.content[0].slice(0, 170) + "..."
    : article.content[0]

  // Count paragraphs starting with ## as headings for sections
  const sections = article.content.filter((p) => p.startsWith("## "))

  // Related guides: group the "Digital Menu Guides" SEO articles so they cross-link to each other
  const relatedSlugs: Record<string, string[]> = {
    "what-is-digital-menu-for-restaurants": [
      "free-digital-menu-vs-paid-comparison",
      "digital-menu-app-vs-native-app",
      "qr-menu-vs-digital-menu-difference",
    ],
    "free-digital-menu-vs-paid-comparison": [
      "what-is-digital-menu-for-restaurants",
      "best-digital-menu-platform-pakistan",
      "digital-menu-qr-code-setup-guide",
    ],
    "best-digital-menu-platform-pakistan": [
      "free-digital-menu-vs-paid-comparison",
      "what-is-digital-menu-for-restaurants",
      "digital-menu-app-vs-native-app",
    ],
    "digital-menu-qr-code-setup-guide": [
      "create-qr-code-menu-restaurant-pakistan",
      "how-to-make-qr-code-menu-for-restaurant",
      "digital-menu-design-tips-restaurants",
    ],
    "digital-menu-design-tips-restaurants": [
      "what-is-digital-menu-for-restaurants",
      "qr-menu-vs-digital-menu-difference",
      "digital-menu-qr-code-setup-guide",
    ],
    "digital-menu-app-vs-native-app": [
      "qr-menu-vs-digital-menu-difference",
      "what-is-digital-menu-for-restaurants",
      "best-digital-menu-platform-pakistan",
    ],
    "qr-menu-vs-digital-menu-difference": [
      "what-is-digital-menu-for-restaurants",
      "digital-menu-app-vs-native-app",
      "free-digital-menu-vs-paid-comparison",
    ],
    // Pakistan SEO cluster articles — cross-link to each other + existing guides
    "menu-printing-islamabad": [
      "digital-vs-printed-menu-pakistan",
      "how-to-create-digital-menu-restaurant",
      "what-is-digital-menu-for-restaurants",
    ],
    "digital-vs-printed-menu-pakistan": [
      "menu-printing-islamabad",
      "how-to-create-digital-menu-restaurant",
      "create-qr-code-menu-restaurant-pakistan",
    ],
    "how-to-create-digital-menu-restaurant": [
      "digital-vs-printed-menu-pakistan",
      "menu-printing-islamabad",
      "what-is-digital-menu-for-restaurants",
    ],
    // Digital Menu cluster (Aug 2026) — pillar ↔ spokes cross-linking
    "digital-menu-complete-guide-restaurants": [
      "what-is-digital-menu-for-restaurants",
      "digital-menu-qr-code-setup-guide",
      "digital-menu-board-cost-pakistan",
      "how-to-scan-qr-code-menu",
    ],
  }
  const related = (relatedSlugs[slug] || [])
    .map((s) => ({ slug: s, title: articles[s]?.title }))
    .filter((r): r is { slug: string; title: string } => Boolean(r.title))

  return (
    <>
      {/* BlogPosting + Author Person Schema */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: article.title,
          description: article.content[0].slice(0, 155) + "...",
          image: "https://www.digitalmenue.com/og-image.png",
          datePublished: article.date,
          dateModified: article.date,
          author: {
            "@type": "Person",
            name: article.author,
            jobTitle: "Digital Marketing Lead, Digital QR Menue",
            url: "https://www.digitalmenue.com/blog",
            sameAs: ["https://www.linkedin.com/in/muazmaki2"],
          },
          publisher: {
            "@type": "Organization",
            name: "Digital QR Menue",
            logo: {
              "@type": "ImageObject",
              url: "https://www.digitalmenue.com/logo.png",
            },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://www.digitalmenue.com/blog/${slug}`,
          },
          about: {
            "@type": "Thing",
            name: sections[0]?.replace("## ", "") || "QR Code Menu",
          },
        }}
      />
      <div className="min-h-screen bg-white">
        <header className="border-b border-[#F0F0F0]">
          <div className="max-w-3xl mx-auto px-5 h-14 flex items-center">
            <Link href="/blog" className="text-sm text-[#555] hover:text-black transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Blog
            </Link>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-5 py-12 md:py-16">
          <div className="text-xs text-[#999] mb-4 flex items-center gap-3">
            <time dateTime={article.date}>
              {new Date(article.date).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
            </time>
            <span className="text-[#DDD]">|</span>
            <span className="text-[#888]">By {article.author}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-8 leading-tight">{article.title}</h1>
          <div className="space-y-5 text-sm md:text-base text-[#444] leading-relaxed">
            {article.content.map((paragraph, i) => (
              <BlogRichText key={i} content={paragraph} />
            ))}
          </div>
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-bold mb-4">Related Guides</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    className="group p-4 rounded-xl border border-[#F0F0F0] hover:border-[#CCC] hover:shadow-sm transition-all"
                  >
                    <span className="text-sm font-semibold text-black group-hover:underline">
                      {r.title}
                    </span>
                    <span className="block text-xs text-[#888] mt-1.5">Read guide &rarr;</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="mt-12 pt-8 border-t border-[#F0F0F0]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold uppercase">
                {article.author.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-semibold">{article.author}</p>
                <p className="text-xs text-[#888]">Digital Marketing Lead, Digital QR Menue</p>
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold mb-2">Ready to create your digital menu?</h2>
              <p className="text-sm text-[#555] mb-6">Start your free trial today — no credit card required.</p>
              <Link
                href="/signup/restaurant"
                className="inline-block px-8 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-[#1A1A1A] transition-all"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
