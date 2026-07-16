import type { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"
import { blogArticles } from "@/lib/blog-articles"

export const metadata: Metadata = {
  title: "Blog — Restaurant Tips & QR Menu Guides | Digital QR Menue",
  description:
    "Learn how to grow your restaurant in Pakistan with QR code menus, WhatsApp ordering, digital marketing tips, and cost-saving strategies.",
  alternates: {
    canonical: "https://www.digitalmenue.com/blog",
  },
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <section className="bg-black text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Restaurant Tips & QR Menu Guides
          </h1>
          <p className="text-sm md:text-base text-[#AAA] max-w-xl mx-auto">
            Learn how to grow your restaurant in Pakistan with digital menus, WhatsApp ordering, and smart marketing strategies.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 py-16 md:py-24">
        <div className="space-y-8">
          {blogArticles.map((article) => (
            <article
              key={article.slug}
              className="group border-b border-[#F0F0F0] pb-8 last:border-0"
            >
              <div className="flex items-center gap-3 text-xs text-[#999] mb-2">
                <span className="bg-[#F5F5F5] px-2.5 py-0.5 rounded-full font-medium">
                  {article.category}
                </span>
                <span>{article.readTime} read</span>
                <span>{new Date(article.date).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-2 group-hover:underline">
                <Link href={`/blog/${article.slug}`}>{article.title}</Link>
              </h2>
              <p className="text-sm text-[#555] leading-relaxed max-w-2xl">
                {article.excerpt}
              </p>
            </article>
          ))}
        </div>

        <div className="text-center mt-16 py-12 bg-[#F9FAFB] rounded-3xl">
          <h2 className="text-xl font-bold mb-2">More articles coming soon</h2>
          <p className="text-sm text-[#555] mb-6">
            We regularly publish guides to help Pakistani restaurants succeed with digital technology.
          </p>
        </div>
      </section>
    </div>
  )
}
