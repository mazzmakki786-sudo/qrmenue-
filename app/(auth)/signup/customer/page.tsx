"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput, validatePassword } from "@/components/ui/password-input"
import Link from "next/link"

const LOGIN_MESSAGE = "Account created! Please sign in with your phone number."

export default function CustomerSignupPage() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const redirectTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current !== null) {
        window.clearTimeout(redirectTimerRef.current)
      }
    }
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !phone.trim() || !password.trim()) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMessage(null)

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

      setSuccessMessage("Account created successfully. Taking you to sign in...")
      setLoading(false)

      redirectTimerRef.current = window.setTimeout(() => {
        window.location.replace(`/login/customer?message=${encodeURIComponent(LOGIN_MESSAGE)}`)
      }, 700)
    } catch {
      setError("Something went wrong. Please try again.")
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
        <h1 className="text-2xl font-bold text-black mb-1">Create Account</h1>
        <p className="text-sm text-[#555]">Join as a customer to browse and order</p>
      </div>

      <form onSubmit={handleSignup} className="w-full space-y-4">
        <Input label="Full Name" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
        <Input
          label="Phone Number"
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="03XX-XXXXXXX"
          required
        />
        <PasswordInput
          label="Password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a strong password"
          required
          showRequirements
        />

        {successMessage && (
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
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-3 mt-6 w-full">
        <Link href="/login/customer" className="text-sm text-[#555] hover:text-black transition-colors">
          Already have an account? <span className="text-[#25D366] font-semibold">Sign in</span>
        </Link>
        <Link href="/" className="text-xs text-[#999] hover:text-black transition-colors">
          Back to home
        </Link>
      </div>
    </div>
  )
}
