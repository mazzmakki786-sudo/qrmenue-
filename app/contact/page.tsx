import type { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/shared/LandingHeader"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Digital QR Menue. WhatsApp support, email, or sign in to your account.",
}

export default function ContactPage() {
  const whatsappLink = "https://wa.me/923146325823"
  const companyEmail = "support@digitalmenue.com"

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <section className="bg-black text-white py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-sm md:text-base text-[#AAA] max-w-xl mx-auto">
            We&apos;re here to help you get the most out of Digital QR Menue.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-5 grid md:grid-cols-2 gap-6">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-10 md:p-12 bg-[#25D366]/5 border border-[#25D366]/20 rounded-2xl hover:bg-[#25D366] hover:text-white transition-all group"
          >
            <svg className="w-10 h-10 md:w-12 md:h-12 mb-5 text-[#25D366] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <h3 className="text-lg font-semibold mb-2">WhatsApp</h3>
            <p className="text-sm text-center opacity-80">Chat with us on WhatsApp for quick support</p>
          </a>
          <div className="flex flex-col items-center p-10 md:p-12 bg-white border border-[#F0F0F0] rounded-2xl">
            <svg className="w-10 h-10 md:w-12 md:h-12 mb-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            <h3 className="text-lg font-semibold mb-2">Email</h3>
            <p className="text-sm text-[#555] text-center">{companyEmail}</p>
          </div>
        </div>

        <div className="max-w-sm mx-auto px-5 mt-10 text-center">
          <p className="text-sm text-[#555] mb-5">Already have an account? Sign in to manage your restaurant.</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium px-5 py-2.5 rounded-xl border border-[#E0E0E0] text-[#333] hover:bg-[#F5F5F5] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium px-5 py-2.5 rounded-xl bg-black text-white hover:bg-[#1A1A1A] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
      {/* Contact Form Section */}
      <section className="py-16 md:py-24 bg-[#F9FAFB]">
        <div className="max-w-2xl mx-auto px-5">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Send Us a Message</h2>
          <p className="text-sm text-[#555] text-center mb-10 max-w-md mx-auto">
            Have a question or feedback? We&apos;d love to hear from you.
          </p>
          <form className="space-y-4">
            <div>
              <label htmlFor="cf-name" className="block text-sm font-medium text-[#333] mb-1.5">Name</label>
              <input
                id="cf-name"
                type="text"
                placeholder="Your name"
                className="w-full h-12 rounded-xl bg-white border border-[#E0E0E0] px-4 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <div>
              <label htmlFor="cf-email" className="block text-sm font-medium text-[#333] mb-1.5">Email</label>
              <input
                id="cf-email"
                type="email"
                placeholder="your@email.com"
                className="w-full h-12 rounded-xl bg-white border border-[#E0E0E0] px-4 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <div>
              <label htmlFor="cf-message" className="block text-sm font-medium text-[#333] mb-1.5">Message</label>
              <textarea
                id="cf-message"
                rows={4}
                placeholder="How can we help you?"
                className="w-full rounded-xl bg-white border border-[#E0E0E0] px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors resize-none"
              />
            </div>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full h-12 rounded-xl bg-black text-white text-sm font-semibold hover:bg-[#1A1A1A] transition-colors"
            >
              Send via WhatsApp
            </a>
            <p className="text-xs text-[#999] text-center">
              Contact form coming soon &mdash; messages are sent via WhatsApp for now.
            </p>
          </form>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Follow Us</h2>
          <p className="text-sm text-[#555] mb-10 max-w-md mx-auto">
            Stay connected on social media for updates, offers, and more.
          </p>
          <div className="flex items-center justify-center gap-4">
            {/* Facebook */}
            <a
              href="https://facebook.com/digitalmenue"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-xl bg-[#F5F5F5] flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            {/* Instagram */}
            <a
              href="https://instagram.com/digitalmenue"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-xl bg-[#F5F5F5] flex items-center justify-center hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            {/* LinkedIn */}
            <a
              href="https://linkedin.com/company/digitalmenue"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-xl bg-[#F5F5F5] flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            {/* TikTok */}
            <a
              href="https://tiktok.com/@digitalmenue"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-xl bg-[#F5F5F5] flex items-center justify-center hover:bg-black hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
            </a>
          </div>
        </div>
      </section>

      {/* Address Section */}
      <section className="py-16 md:py-24 bg-[#F9FAFB]">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Visit Us</h2>
          <p className="text-sm text-[#555] mb-6 max-w-md mx-auto">
            We are based in the heart of Pakistan.
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-white border border-[#F0F0F0] rounded-2xl">
            <svg className="w-6 h-6 text-black shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-base font-medium text-[#333]">Lahore, Pakistan</span>
          </div>
          <p className="text-xs text-[#999] mt-4">
            Serving restaurants across Pakistan with our digital menu platform.
          </p>
        </div>
      </section>
    </div>
  )
}
