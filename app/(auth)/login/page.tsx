"use client"

import { Suspense, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { User } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get("redirect")
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    const cb = redirectParam
      ? `${location.origin}/auth/callback?redirect=${redirectParam}`
      : `${location.origin}/auth/callback`
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: cb },
    })
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else if (data.user) {
      if (redirectParam) {
        router.push(redirectParam)
      } else {
        const { data: restaurant } = await supabase
          .from("restaurants")
          .select("id")
          .eq("owner_id", data.user.id)
          .maybeSingle()
        router.push(restaurant ? "/dashboard" : "/restaurants")
      }
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-[400px] mx-auto flex flex-col items-center">
      {/* Header Icon Box */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4">
          <User className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-black mb-1">Welcome back</h1>
        <p className="text-sm text-[#555]">Sign in to your account</p>
      </div>

      {/* Google Auth Button */}
      <Button variant="google" onClick={handleGoogleLogin} className="mb-6">
        <svg className="w-[18px] h-[18px] mr-3" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="relative w-full flex items-center justify-center mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#F0F0F0]" />
        </div>
        <span className="relative px-4 bg-white text-xs text-[#555] uppercase tracking-wider">or</span>
      </div>

      {/* Form */}
      <form onSubmit={handleEmailLogin} className="w-full space-y-4">
        <Input label="Email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
        <Input label="Password" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="xxxxxxxx" required />
        {error && <p className="text-xs text-[#DC2626]">{error}</p>}
        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="text-sm text-[#555] text-center mt-6">
        Don't have an account?{" "}
        <Link href="/signup" className="text-[#25D366] font-semibold hover:underline">Sign up</Link>
      </p>
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
