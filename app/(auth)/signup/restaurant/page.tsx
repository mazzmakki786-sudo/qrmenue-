"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { slugify } from "@/lib/utils"
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

    const slug = `${slugify(form.name)}-${Date.now().toString(36)}`

    let ownerId = user?.id

    if (!ownerId) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name, role: "owner" } },
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      ownerId = authData.user?.id
    }

    if (!ownerId) {
      setLoading(false)
      return
    }

    const { error: dbError } = await (supabase.from("restaurants") as any).insert({
      owner_id: ownerId,
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
      setError(dbError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.push("/dashboard/onboarding")
  }

  const restaurantFields = [
    { id: "name", label: "Restaurant Name *", placeholder: "Al-Habib Grill", type: "text" },
    { id: "city", label: "City *", placeholder: "Lahore", type: "text" },
    { id: "phone", label: "Phone / WhatsApp *", placeholder: "0300-XXXXXXX", type: "tel" },
  ]

  const authFields = [
    { id: "email", label: "Email *", placeholder: "owner@restaurant.com", type: "email" },
    { id: "password", label: "Password *", placeholder: "At least 6 characters", type: "password" },
  ]

  if (checkingAuth) {
    return <p className="text-center text-[#999] text-sm py-8">Loading...</p>
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <Link href="/signup" className="text-sm text-[#555] hover:text-black inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          Back
        </Link>
      </div>
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#FF6B35] text-white flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Register Your Restaurant</h1>
        <p className="text-sm text-[#555] mt-1">Start your 7-day free trial today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        {!user && authFields.map((f) => (
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

        {error && <p className="text-xs text-[#DC2626]">{error}</p>}

        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? "Creating..." : "Create Restaurant & Start Trial"}
        </Button>
      </form>

      {!user && (
        <>
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#E8E8E8]" />
            <span className="text-xs text-[#999]">or</span>
            <div className="flex-1 h-px bg-[#E8E8E8]" />
          </div>

          <Button variant="google" onClick={handleGoogleSignup}>
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

      <p className="text-sm text-[#555] text-center mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[#FF6B35] font-semibold hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
