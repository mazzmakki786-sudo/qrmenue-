"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput, validatePassword } from "@/components/ui/password-input"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"

function CustomerLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get("redirect")

  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const redirectTo = redirectParam || "/restaurants"

  const handleGoogleAuth = async () => {
    const supabase = (await import("@/lib/supabase/client")).createClient()
    const cb = `${location.origin}/auth/callback?redirect=${redirectTo}`
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: cb },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields")
      return
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name")
      return
    }

    setLoading(true)
    setError(null)

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
          body: JSON.stringify({ name, email, password }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Something went wrong. Please try again.")
          setLoading(false)
          return
        }

        // Sign in after signup
        const supabase = (await import("@/lib/supabase/client")).createClient()
        await supabase.auth.signInWithPassword({ email, password })

        setLoading(false)
        router.push(redirectTo)
      } catch {
        setError("Something went wrong. Please try again.")
        setLoading(false)
      }
    } else {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Incorrect email or password")
          setLoading(false)
          return
        }

        setLoading(false)
        router.push(redirectTo)
      } catch {
        setError("Incorrect email or password")
        setLoading(false)
      }
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-[#555] hover:text-black transition-colors min-h-[44px]"
        >
          <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back
        </button>
      </div>

      <div className="flex flex-col items-center text-center mb-6">
        <Image src="/icon.svg" alt="Digital QR Menue" width={48} height={48} className="w-12 h-12 mb-4" />
        <h1 className="text-2xl font-bold text-black mb-1">
          {mode === "signin" ? "Welcome back" : "Create an Account"}
        </h1>
        <p className="text-sm text-[#555]">
          {mode === "signin" ? "Sign in to your customer account" : "Sign up to save favorites and track orders"}
        </p>
      </div>

      <Button variant="google" onClick={handleGoogleAuth} className="w-full mb-5 min-h-[48px]">
        <svg className="w-[18px] h-[18px] mr-3 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </Button>

      <div className="relative w-full flex items-center justify-center mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#F0F0F0]" />
        </div>
        <span className="relative px-4 bg-white text-xs text-[#999] uppercase tracking-wider">or</span>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {mode === "signup" && (
          <Input label="Full Name *" id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
        )}
        <Input label="Email *" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
        <PasswordInput label="Password *" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signup" ? "Create a password" : "Enter your password"} required showRequirements={mode === "signup"} />

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
          <button onClick={() => { setMode("signup"); setError(null) }} className="text-sm text-[#555] hover:text-black transition-colors">
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
