"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CityAutocomplete from "@/components/shared/CityAutocomplete"
import { Sparkles, Check, X, Loader2, AlertTriangle } from "lucide-react"
import type { User } from "@supabase/supabase-js"

export default function RestaurantSignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedPlan = searchParams.get("plan")
  const errorParam = searchParams.get("error")
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [isCustomer, setIsCustomer] = useState(false)
  const [form, setForm] = useState({
    name: "", city: "", phone: "",
  })
  const [error, setError] = useState<string | null>(errorParam === "setup_failed" ? "Something went wrong creating your restaurant. Please try again." : null)
  const [loading, setLoading] = useState(false)

  // ── Custom slug state ──
  const [customSlug, setCustomSlug] = useState("")
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle")
  const [slugError, setSlugError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const slugTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.digitalmenue.com"

  // ── Real-time slug check (debounced) ──
  const checkSlug = useCallback(async (slug: string) => {
    if (!slug || slug.length < 2) {
      setSlugStatus("idle")
      setSlugError(null)
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Only allow a-z, 0-9, hyphens
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) && slug.length > 0) {
      setSlugStatus("unavailable")
      setSlugError("Only lowercase letters, numbers, and hyphens allowed")
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    if (slug.includes("--")) {
      setSlugStatus("unavailable")
      setSlugError("Cannot use consecutive hyphens")
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setSlugStatus("checking")
    setSlugError(null)

    try {
      const res = await fetch(`/api/auth/check-slug?slug=${encodeURIComponent(slug)}`)
      const data = await res.json()

      if (data.available) {
        setSlugStatus("available")
        setSlugError(null)
        setSuggestions([])
        setShowSuggestions(false)
      } else {
        setSlugStatus("unavailable")
        setSlugError(data.error || "This URL is not available")

        // Fetch suggestions
        const cityParam = form.city ? `&city=${encodeURIComponent(form.city)}` : ""
        const sugRes = await fetch(`/api/auth/suggest-slugs?desired=${encodeURIComponent(slug)}${cityParam}`)
        const sugData = await sugRes.json()
        setSuggestions(sugData.suggestions ?? [])
        setShowSuggestions(sugData.suggestions?.length > 0)
      }
    } catch {
      setSlugStatus("idle")
    }
  }, [form.city])

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-clean: lowercase, remove special chars except hyphens
    const raw = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
    setCustomSlug(raw)

    if (slugTimerRef.current) clearTimeout(slugTimerRef.current)
    slugTimerRef.current = setTimeout(() => checkSlug(raw), 400)
  }

  const handleSelectSuggestion = (sug: string) => {
    setCustomSlug(sug)
    setShowSuggestions(false)
    checkSlug(sug)
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        // A user who already has a customer account cannot become a restaurant
        // owner with the same account (blocked at RLS too — show them a clear
        // message instead of the restaurant form).
        const { data: existingCustomer } = await supabase
          .from("customers")
          .select("id")
          .eq("id", user.id)
          .maybeSingle()
        if (existingCustomer) {
          setIsCustomer(true)
          setUser(null)
          setCheckingAuth(false)
          return
        }
        setUser(user)
      }
      setCheckingAuth(false)
    }).catch(() => setCheckingAuth(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      if (slugTimerRef.current) clearTimeout(slugTimerRef.current)
    }
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

    if (!user) {
      setError("Please sign in with Google to continue")
      setLoading(false)
      return
    }

    // Validate custom slug (required for all authenticated signups)
    if (!customSlug || slugStatus !== "available") {
      setError("Please choose an available URL for your restaurant")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const hasPaidPlan = preselectedPlan && ["starter", "growth", "premium"].includes(preselectedPlan)

    // User is signed in via Google — create restaurant directly
    // ALWAYS create as trial — paid plans require superadmin activation
    const slug = customSlug
    const insertData: Record<string, unknown> = {
      owner_id: user.id,
      name: form.name,
      slug,
      phone: form.phone,
      city: form.city,
      plan: "trial",
      requested_plan: hasPaidPlan ? preselectedPlan : null,
      trial_start: new Date().toISOString(),
      trial_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      image_upload_allowed: true,
      is_active: true,
      is_suspended: false,
    }

    const { error: dbError } = await (supabase.from("restaurants") as any).insert(insertData)

    if (dbError) {
      if (dbError.message?.includes("slug")) {
        setError("This URL is already taken. Please choose another.")
      } else {
        setError("Something went wrong. Please try again.")
      }
      setLoading(false)
      return
    }

    setLoading(false)

    // Notify superadmin if a paid plan was requested
    if (hasPaidPlan) {
      // We don't have the restaurant_id from this direct insert, so call via slug
      fetch("/api/notifications/plan-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_slug: customSlug }),
      }).catch(() => {})
    }

    // Always go to onboarding (paid plans need superadmin activation)
    router.replace("/dashboard/onboarding")
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
        <div className="bg-black/5 border border-black/10 rounded-xl p-4 flex items-center gap-3 mb-6 w-full">
          <Sparkles className="w-5 h-5 text-black shrink-0" />
          <div>
            <p className="text-sm font-bold text-black">
              {preselectedPlan.charAt(0).toUpperCase() + preselectedPlan.slice(1)} Plan
            </p>
            <p className="text-xs text-[#555]">You&apos;ll be redirected to payment after signup</p>
          </div>
        </div>
      )}

      {!user && isCustomer ? (
        /* ── Already a customer — cannot become a restaurant owner ── */
        <div className="w-full flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-5">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-black mb-2">Customer account detected</h2>
          <p className="text-sm text-[#555] max-w-sm mb-6">
            This Google account is already registered as a customer. A customer
            account cannot be used to create a restaurant.
          </p>
          <p className="text-xs text-[#888] max-w-xs mb-4">
            Please sign in with a different Google account to create a restaurant.
          </p>
          <Button variant="google" onClick={handleGoogleSignup} className="w-full min-h-[48px] mb-4">
            <svg className="w-[18px] h-[18px] mr-3 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Try a different Google account
          </Button>
          <p className="text-xs text-[#999]">This won&apos;t switch you away from the customer account already in use.</p>
        </div>
      ) : !user ? (
        /* ── Not signed in — Google OAuth is the only way in ── */
        <div className="w-full flex flex-col items-center">
          <Button variant="google" onClick={handleGoogleSignup} className="w-full min-h-[48px] mb-4">
            <svg className="w-[18px] h-[18px] mr-3 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <p className="text-xs text-[#555] text-center mt-2 mb-4 max-w-[260px]">
            You&apos;ll sign in with your Google account, then set up your restaurant.
          </p>

          {error && (
            <div className="w-full bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-xs text-[#DC2626]">{error}</p>
            </div>
          )}
        </div>
      ) : (
        <>
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

            {/* ── Custom URL Section (required for Google-authenticated signups) ── */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">
                Your Restaurant URL <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <div className={`flex items-center rounded-[10px] border transition-colors ${
                  slugStatus === "unavailable"
                    ? "border-red-400 bg-red-50/50"
                    : slugStatus === "available"
                    ? "border-green-400 bg-green-50/50"
                    : "border-border bg-[#F9FAFB]"
                }`}>
                  <span className="text-sm text-[#888] pl-4 py-3 whitespace-nowrap select-none shrink-0">
                    {APP_URL}/
                  </span>
                  <input
                    id="slug"
                    value={customSlug}
                    onChange={handleSlugChange}
                    placeholder="my-restaurant-name"
                    className="flex-1 bg-transparent border-none outline-none py-3 pr-4 text-base text-text-primary placeholder:text-text-muted min-w-0"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <div className="pr-3 shrink-0">
                    {slugStatus === "checking" && (
                      <Loader2 className="w-5 h-5 animate-spin text-[#888]" />
                    )}
                    {slugStatus === "available" && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                    {slugStatus === "unavailable" && (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Status messages */}
              {slugStatus === "available" && customSlug.length >= 2 && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  <p className="text-xs text-green-600">
                    {APP_URL}/{customSlug} is available!
                  </p>
                </div>
              )}
              {slugError && slugStatus === "unavailable" && (
                <div className="flex items-start gap-1.5 mt-1">
                  <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-500">{slugError}</p>
                </div>
              )}

              {/* Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-amber-800">
                      This URL cannot be changed later. Choose carefully!
                    </p>
                  </div>
                  <p className="text-xs text-amber-700 mb-2">Available alternatives:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleSelectSuggestion(sug)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors font-medium"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* One-time warning */}
              {customSlug.length >= 2 && slugStatus !== "unavailable" && (
                <div className="flex items-start gap-1.5 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-600">
                    This URL is permanent and cannot be changed later. Your QR code will be generated for this URL.
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-xs text-[#DC2626]">{error}</p>
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              {loading ? "Creating..." : "Create Restaurant & Start Trial"}
            </Button>
          </form>

          <p className="text-xs text-[#555] text-center mt-4">
            Signed in as {user.email}
          </p>
        </>
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
