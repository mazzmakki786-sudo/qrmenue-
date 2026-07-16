"use client"

import { useState } from "react"
import { Loader2, Check } from "lucide-react"

export function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Something went wrong")
        return
      }

      setDone(true)
      setName("")
      setEmail("")
      setMessage("")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSending(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4">
          <Check className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
        <p className="text-sm text-[#555]">Your message has been received. We&apos;ll get back to you shortly.</p>
        <button onClick={() => setDone(false)} className="mt-6 text-sm font-medium text-black underline underline-offset-4 hover:no-underline">
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="cf-name" className="block text-sm font-medium text-[#333] mb-1.5">Name</label>
        <input
          id="cf-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          className="w-full h-12 rounded-xl bg-white border border-[#E0E0E0] px-4 text-sm focus:outline-none focus:border-black transition-colors"
        />
      </div>
      <div>
        <label htmlFor="cf-email" className="block text-sm font-medium text-[#333] mb-1.5">Email</label>
        <input
          id="cf-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full h-12 rounded-xl bg-white border border-[#E0E0E0] px-4 text-sm focus:outline-none focus:border-black transition-colors"
        />
      </div>
      <div>
        <label htmlFor="cf-message" className="block text-sm font-medium text-[#333] mb-1.5">Message</label>
        <textarea
          id="cf-message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help you?"
          required
          className="w-full rounded-xl bg-white border border-[#E0E0E0] px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors resize-none"
        />
      </div>
      {error && <p className="text-xs text-[#DC2626] bg-red-50 rounded-lg p-3">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="flex items-center justify-center w-full h-12 rounded-xl bg-black text-white text-sm font-semibold hover:bg-[#1A1A1A] disabled:opacity-50 transition-colors"
      >
        {sending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...</> : "Send Message"}
      </button>
    </form>
  )
}
