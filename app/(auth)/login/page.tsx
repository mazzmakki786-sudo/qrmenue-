"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import Link from "next/link"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get("redirect")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    const supabase = (await import("@/lib/supabase/client")).createClient()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || location.origin
    const cb = redirectParam
      ? `${baseUrl}/auth/callback?redirect=${redirectParam}`
      : `${baseUrl}/auth/callback`
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: cb },
    })
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Incorrect email or password")
        setLoading(false)
        return
      }

      // Wait for Supabase session to be fully established in cookies
      // before navigating. On iOS Safari, cookies may not be immediately
      // available, and the middleware will redirect back to /login.
      const supabase = (await import("@/lib/supabase/client")).createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // Session not ready yet — retry after a short delay
        await new Promise((resolve) => setTimeout(resolve, 500))
        await supabase.auth.getSession()
      }

      if (redirectParam) {
        // Use hard navigation to ensure fresh cookies reach middleware
        window.location.href = redirectParam
      } else if (data.user) {
        const { data: restaurant } = await supabase
          .from("restaurants")
          .select("id")
          .eq("owner_id", data.user.id)
          .maybeSingle()
        window.location.href = restaurant ? "/dashboard" : "/restaurants"
      } else {
        window.location.href = "/restaurants"
      }
    } catch {
      setError("Incorrect email or password")
      setLoading(false)
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
        <h1 className="text-2xl font-bold text-black mb-1">Welcome back</h1>
        <p className="text-sm text-[#555]">Sign in to your account</p>
      </div>

      <Button variant="google" onClick={handleGoogleLogin} className="w-full mb-5 min-h-[48px]">
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

      <form onSubmit={handleEmailLogin} className="w-full space-y-4">
        <Input label="Email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
        <PasswordInput label="Password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-xs text-[#DC2626]">{error}</p>
          </div>
        )}

        <div className="text-right">
          <button
            type="button"
            onClick={() => alert("Please contact support@digitalmenue.com to reset your password")}
            className="text-sm text-[#25D366] hover:text-[#1da851] transition-colors font-medium min-h-[44px]"
          >
            Forgot Password?
          </button>
        </div>

        <Button type="submit" variant="primary" fullWidth loading={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-3 mt-6 w-full">
        <Link href="/signup" className="text-sm text-[#555] hover:text-black transition-colors">
          Don&apos;t have an account? <span className="text-[#25D366] font-semibold">Sign up</span>
        </Link>
        <Link href="/" className="text-xs text-[#999] hover:text-black transition-colors">
          Back to home
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-[#555] py-8">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
