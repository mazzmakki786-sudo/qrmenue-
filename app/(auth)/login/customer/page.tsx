"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput, validatePassword } from "@/components/ui/password-input"
import Link from "next/link"

const REMEMBER_KEY = "qrmenu-remembered-phone"

function CustomerLoginForm() {
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get("redirect")
  const successMessage = searchParams.get("message")
  const modeParam = searchParams.get("mode")

  const [mode, setMode] = useState<"signin" | "signup">(modeParam === "signup" ? "signup" : "signin")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const redirectTo = redirectParam || "/restaurants"

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY)
    if (saved) {
      setPhone(saved)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phone.trim() || !password.trim()) {
      setError("Please fill in all required fields")
      return
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name")
      return
    }

    setLoading(true)
    setError(null)

    if (mode === "signin" && rememberMe) {
      localStorage.setItem(REMEMBER_KEY, phone.trim())
    } else if (mode === "signin" && !rememberMe) {
      localStorage.removeItem(REMEMBER_KEY)
    }

    if (mode === "signup") {
      const pwError = validatePassword(password)
      if (pwError) {
        setError(pwError)
        setLoading(false)
        return
      }

      try {
        const res = await fetch("/api/auth/signup/customer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, password }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Something went wrong. Please try again.")
          setLoading(false)
          return
        }

        const loginRes = await fetch("/api/auth/customer-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, password }),
        })

        const loginData = await loginRes.json()
        if (!loginRes.ok) {
          setError(loginData.error || "Account created but sign in failed. Please log in.")
          setLoading(false)
          setMode("signin")
          return
        }

        setLoading(false)
        window.location.replace(redirectTo)
      } catch {
        setError("Something went wrong. Please try again.")
        setLoading(false)
      }
    } else {
      try {
        const res = await fetch("/api/auth/customer-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, password }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Incorrect phone or password")
          setLoading(false)
          return
        }

        setLoading(false)

        const supabase = (await import("@/lib/supabase/client")).createClient()
        const { data: restaurant } = await supabase
          .from("restaurants")
          .select("id")
          .eq("owner_id", data.user?.id)
          .maybeSingle()
        const isOwner = !!restaurant

        if (isOwner && redirectTo === "/restaurants") {
          window.location.replace("/dashboard")
        } else {
          window.location.replace(redirectTo)
        }
      } catch {
        setError("Incorrect phone or password")
        setLoading(false)
      }
    }
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
        <h1 className="text-2xl font-bold text-black mb-1">
          {mode === "signin" ? "Welcome back" : "Create an Account"}
        </h1>
        <p className="text-sm text-[#555]">
          {mode === "signin" ? "Sign in to your customer account" : "Sign up to save favorites and track orders"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {mode === "signup" && (
          <Input label="Full Name *" id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
        )}
        <Input
          label="Phone Number *"
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="03XX-XXXXXXX"
          required
        />
        <PasswordInput
          label="Password *"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "signup" ? "Create a password" : "Enter your password"}
          required
          showRequirements={mode === "signup"}
        />

        {mode === "signin" && (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-[#25D366] rounded border-gray-300"
            />
            <span className="text-sm text-[#555]">Remember me</span>
          </label>
        )}

        {successMessage && mode === "signin" && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <p className="text-xs text-green-700">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-xs text-[#DC2626]">{error}</p>
          </div>
        )}

        <Button type="submit" variant="primary" fullWidth loading={loading}>
          {loading ? (mode === "signin" ? "Signing in..." : "Creating account...") : mode === "signin" ? "Sign In" : "Create Account"}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-3 mt-6 w-full">
        {mode === "signin" ? (
          <button onClick={() => { setMode("signup"); setError(null); setName("") }} className="text-sm text-[#555] hover:text-black transition-colors">
            Don&apos;t have an account? <span className="text-[#25D366] font-semibold">Sign up</span>
          </button>
        ) : (
          <button onClick={() => { setMode("signin"); setError(null) }} className="text-sm text-[#555] hover:text-black transition-colors">
            Already have an account? <span className="text-[#25D366] font-semibold">Sign in</span>
          </button>
        )}
        <Link href="/restaurants" className="text-xs text-[#999] hover:text-black transition-colors">
          Back to restaurants
        </Link>
      </div>
    </div>
  )
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-[#555] py-8">Loading...</div>}>
      <CustomerLoginForm />
    </Suspense>
  )
}
