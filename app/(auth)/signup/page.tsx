"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?redirect=/` },
    })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      await supabase.from("customers").insert({
        id: authData.user.id,
        name: name || null,
        email: email || null,
      } as any)
    }

    setLoading(false)
    router.push("/login?message=Check your email to verify your account")
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Create Account</h1>
      <p className="text-sm text-[#555] mb-8">Join QRMenu.pk for a better experience</p>

      <form onSubmit={handleSignup} className="space-y-4">
        <Input label="Full Name" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
        <Input label="Email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
        <Input label="Password" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} />
        {error && <p className="text-xs text-[#DC2626]">{error}</p>}
        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

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

      <div className="mt-6">
        <p className="text-sm text-[#555] text-center mb-3">
          Own a restaurant?{" "}
          <Link href="/signup/restaurant" className="text-black font-medium underline">
            Register your restaurant
          </Link>
        </p>
        <p className="text-sm text-[#555] text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-black font-medium underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
