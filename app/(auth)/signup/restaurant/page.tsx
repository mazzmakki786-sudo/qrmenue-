"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput, validatePassword } from "@/components/ui/password-input"
import { ArrowLeft, Store } from "lucide-react"
import type { User } from "@supabase/supabase-js"

export default function RestaurantSignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [form, setForm] = useState({
    name: "", city: "", phone: "", email: "", password: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
        setForm((prev) => ({ ...prev, email: user.email ?? "" }))
      }
      setCheckingAuth(false)
    })
  }, [])

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?redirect=/signup/restaurant` },
    })
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!user) {
      const pwError = validatePassword(form.password)
      if (pwError) {
        setError(pwError)
        setLoading(false)
        return
      }
    }

    if (user) {
      // User already signed in via Google — create restaurant directly
      const slug = `${form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-${Date.now().toString(36)}`
      const { error: dbError } = await (supabase.from("restaurants") as any).insert({
        owner_id: user.id,
        name: form.name,
        slug,
        phone: form.phone,
        city: form.city,
        plan: "trial",
        trial_start: new Date().toISOString(),
        trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        image_upload_allowed: true,
        is_active: true,
      })

      if (dbError) {
        setError("Something went wrong. Please try again.")
        setLoading(false)
        return
      }

      setLoading(false)
      router.push("/dashboard/onboarding")
      return
    }

    // Email/password signup via API
    try {
      const res = await fetch("/api/auth/signup/restaurant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          city: form.city,
          phone: form.phone,
          email: form.email,
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.")
        setLoading(false)
        return
      }

      setLoading(false)
      router.push("/dashboard/onboarding")
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  const restaurantFields = [
    { id: "name", label: "Restaurant Name *", placeholder: "Al-Habib Grill", type: "text" },
    { id: "city", label: "City *", placeholder: "Lahore", type: "text" },
    { id: "phone", label: "Phone / WhatsApp *", placeholder: "0300-XXXXXXX", type: "tel" },
  ]

  if (checkingAuth) {
    return <div className="flex items-center justify-center py-12"><p className="text-sm text-[#999]">Loading...</p></div>
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full mb-8">
        <Link href="/signup" className="inline-flex items-center gap-1.5 text-sm text-[#555] hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-12 h-12 bg-[#25D366] rounded-xl flex items-center justify-center mb-4">
          <Store className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-black mb-1">Register Your Restaurant</h1>
        <p className="text-sm text-[#555]">Start your 7-day free trial today</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {restaurantFields.map((f) => (
          <Input
            key={f.id}
            label={f.label}
            id={f.id}
            type={f.type}
            value={(form as any)[f.id]}
            onChange={handleChange(f.id)}
            placeholder={f.placeholder}
            required
          />
        ))}

        {!user && (
          <>
            <Input
              label="Email *"
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder="owner@restaurant.com"
              required
            />
            <PasswordInput
              label="Password *"
              id="password"
              value={form.password}
              onChange={handleChange("password")}
              placeholder="Create a strong password"
              required
              showRequirements
            />
          </>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-xs text-[#DC2626]">{error}</p>
          </div>
        )}

        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? "Creating..." : "Create Restaurant & Start Trial"}
        </Button>
      </form>

      {!user && (
        <>
          <div className="relative w-full flex items-center justify-center my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#F0F0F0]" />
            </div>
            <span className="relative px-4 bg-white text-xs text-[#999] uppercase tracking-wider">or</span>
          </div>

          <Button variant="google" onClick={handleGoogleSignup} className="w-full">
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
        </>
      )}

      {user && (
        <p className="text-xs text-[#555] text-center mt-4">
          Signed in as {user.email}
        </p>
      )}

      <div className="flex flex-col items-center gap-3 mt-6 w-full">
        <Link href="/login" className="text-sm text-[#555] hover:text-black transition-colors">
          Already have an account? <span className="text-[#25D366] font-semibold">Sign in</span>
        </Link>
        <Link href="/" className="text-xs text-[#999] hover:text-black transition-colors">
          Back to home
        </Link>
      </div>
    </div>
  )
}
