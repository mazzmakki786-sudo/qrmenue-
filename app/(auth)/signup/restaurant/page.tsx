"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput, validatePassword } from "@/components/ui/password-input"
import CityAutocomplete from "@/components/shared/CityAutocomplete"
import { Sparkles } from "lucide-react"
import type { User } from "@supabase/supabase-js"

export default function RestaurantSignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedPlan = searchParams.get("plan")
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
    }).catch(() => setCheckingAuth(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGoogleSignup = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || location.origin
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${baseUrl}/auth/callback?redirect=/signup/restaurant` },
    })
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name.trim() || !form.city.trim() || !form.phone.trim()) {
      setError("Please fill in all required fields")
      setLoading(false)
      return
    }

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

    const hasPaidPlan = preselectedPlan && ["starter", "growth", "premium"].includes(preselectedPlan)

    if (user) {
      // User already signed in via Google — create restaurant directly
      const slugRes = await fetch("/api/auth/signup/slug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, city: form.city }),
      })
      const slugData = await slugRes.json()
      if (!slugRes.ok) {
        setError(slugData.error || "Failed to generate slug. Please try again.")
        setLoading(false)
        return
      }
      const slug = slugData.slug
      const insertData: Record<string, unknown> = {
        owner_id: user.id,
        name: form.name,
        slug,
        phone: form.phone,
        city: form.city,
        plan: hasPaidPlan ? preselectedPlan : "trial",
        trial_start: hasPaidPlan ? null : new Date().toISOString(),
        trial_end: hasPaidPlan ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        image_upload_allowed: true,
        is_active: true,
        is_suspended: !!hasPaidPlan,
      }

      if (hasPaidPlan) {
        insertData.plan_start_date = new Date().toISOString()
        insertData.plan_end_date = new Date(Date.now() + 30 * 86400000).toISOString()
      }

      const { error: dbError } = await (supabase.from("restaurants") as any).insert(insertData)

      if (dbError) {
        setError("Something went wrong. Please try again.")
        setLoading(false)
        return
      }

      setLoading(false)

      if (hasPaidPlan) {
        router.replace("/dashboard/subscription")
      } else {
        router.replace("/dashboard/onboarding")
      }
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
          plan: hasPaidPlan ? preselectedPlan : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.")
        setLoading(false)
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (signInError) {
        console.error("[Signup] Post-signin failed:", signInError)
        // If immediate signin fails, wait a bit and retry
        await new Promise((resolve) => setTimeout(resolve, 1500))
        await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
      }

      // Verify session is established before navigating
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      setLoading(false)

      const dest = hasPaidPlan ? "/dashboard/subscription" : "/dashboard/onboarding"
      // Use hard navigation for reliable cookie delivery
      window.location.href = dest
      return
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  const restaurantFields = [
    { id: "name", label: "Restaurant Name *", placeholder: "Al-Habib Grill", type: "text" },
    { id: "city", label: "City *", placeholder: "Faisalabad", type: "text" },
    { id: "phone", label: "Phone / WhatsApp *", placeholder: "0300-XXXXXXX", type: "tel" },
  ]

  if (checkingAuth) {
    return <div className="flex items-center justify-center py-12"><p className="text-sm text-[#999]">Loading...</p></div>
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-6">
        <svg className="w-12 h-12 mb-4" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="28" height="28" rx="6" fill="#22C55E" />
          <rect x="4" y="4" width="5" height="5" rx="1" fill="#fff" />
          <rect x="13" y="4" width="5" height="5" rx="1" fill="#fff" />
          <rect x="4" y="13" width="5" height="5" rx="1" fill="#fff" />
          <rect x="13" y="13" width="5" height="5" rx="1" fill="#fff" />
          <rect x="18" y="18" width="6" height="6" rx="1" fill="#fff" opacity="0.9" />
          <rect x="4" y="20" width="3" height="4" rx="0.8" fill="#fff" opacity="0.7" />
          <rect x="20" y="4" width="4" height="3" rx="0.8" fill="#fff" opacity="0.7" />
        </svg>
        <h1 className="text-2xl font-bold text-black mb-1">Register Your Restaurant</h1>
        <p className="text-sm text-[#555]">{preselectedPlan ? "Set up your account to continue" : "Start your 30-day free trial today"}</p>
      </div>

      {preselectedPlan && (
        <div className="bg-black/5 border border-black/10 rounded-xl p-4 flex items-center gap-3 mb-6">
          <Sparkles className="w-5 h-5 text-black shrink-0" />
          <div>
            <p className="text-sm font-bold text-black">
              {preselectedPlan.charAt(0).toUpperCase() + preselectedPlan.slice(1)} Plan
            </p>
            <p className="text-xs text-[#555]">You&apos;ll be redirected to payment after signup</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {restaurantFields.map((f) =>
          f.id === "city" ? (
            <CityAutocomplete
              key={f.id}
              label={f.label}
              id={f.id}
              value={form.city}
              onChange={(val) => setForm((prev) => ({ ...prev, city: val }))}
              placeholder={f.placeholder}
              required
            />
          ) : (
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
          )
        )}

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

        <Button type="submit" variant="primary" fullWidth loading={loading}>
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

          <Button variant="google" onClick={handleGoogleSignup} className="w-full min-h-[48px]">
            <svg className="w-[18px] h-[18px] mr-3 shrink-0" viewBox="0 0 24 24">
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
