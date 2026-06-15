"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { slugify } from "@/lib/utils"
import { ChevronLeft, Store } from "lucide-react"
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
    return <p className="text-center text-[#555555] text-sm py-8">Loading...</p>
  }

  return (
    <div className="w-full max-w-[400px] mx-auto flex flex-col items-center">
      {/* Header / Back Navigation */}
      <div className="w-full flex justify-between items-center mb-8">
        <Link href="/signup" className="group flex items-center gap-1 text-[#555] hover:text-black transition-colors">
          <ChevronLeft className="w-[18px] h-[18px]" />
          <span className="text-sm font-semibold">Back</span>
        </Link>
      </div>

      {/* Identity Section */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-12 h-12 bg-[#25D366] rounded-xl flex items-center justify-center mb-4">
          <Store className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-black mb-1">Register Your Restaurant</h1>
        <p className="text-sm text-[#555]">Start your 7-day free trial today</p>
      </div>

      {/* Registration Form */}
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

      {/* Divider */}
      {!user && (
        <>
          <div className="w-full flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#F0F0F0]" />
            <span className="text-xs text-[#555] uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[#F0F0F0]" />
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
        <Link href="/login" className="text-[#25D366] font-semibold hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
