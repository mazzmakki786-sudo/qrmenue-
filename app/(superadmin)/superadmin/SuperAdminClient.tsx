"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils"
import { Shield, LogOut, Eye, EyeOff, Search, ChevronRight, X, Users, Building2, BarChart3, Settings as SettingsIcon } from "lucide-react"
import { RestaurantTable } from "@/components/superadmin/RestaurantTable"
import { CustomerTable } from "@/components/superadmin/CustomerTable"
import { AnalyticsView } from "@/components/superadmin/AnalyticsView"
import { CompanySettingsForm } from "@/components/superadmin/CompanySettingsForm"

const SUPER_ADMIN_EMAIL = "mazzmakki786@gmail.com"

type Tab = "restaurants" | "customers" | "analytics" | "settings"

function LoginForm({ superAdminEmail, onLogin }: { superAdminEmail: string; onLogin: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (email.toLowerCase() !== superAdminEmail.toLowerCase()) {
      setError("Only the company admin email can access this panel")
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
    } else {
      onLogin()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold">Super Admin</h1>
          <p className="text-sm text-[#555] mt-1">Company access only</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-[#E8E8E8] p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-[#555] mb-1.5">
              Company Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[#E8E8E8] bg-white text-sm outline-none focus:border-black transition-colors disabled:opacity-50"
              placeholder="admin@company.com"
              required
            />
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-xs font-medium text-[#555] mb-1.5">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[#E8E8E8] bg-white text-sm outline-none focus:border-black transition-colors disabled:opacity-50"
              placeholder="Enter password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-[#999] hover:text-black"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-[#DC2626] bg-red-50 rounded-lg p-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-xs text-[#999] text-center mt-6">
          Only authorized company administrators can access this panel
        </p>
      </div>
    </div>
  )
}

function AccessDenied({ email, onLogout }: { email: string; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#DC2626] flex items-center justify-center mx-auto mb-4">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold mb-2">Access Denied</h1>
        <p className="text-sm text-[#555] mb-6">
          <strong>{email}</strong> is not authorized to access the Super Admin panel.
          <br />Only the company admin email can log in.
        </p>
        <button
          onClick={onLogout}
          className="h-11 px-6 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Sign Out & Try Again
        </button>
      </div>
    </div>
  )
}

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "restaurants", label: "Restaurants", icon: Building2 },
  { id: "customers", label: "Customers", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: SettingsIcon },
]

export default function SuperAdminClient({
  currentUserEmail,
}: {
  currentUserEmail: string
}) {
  const [user, setUser] = useState<{ email: string } | null>(
    currentUserEmail ? { email: currentUserEmail } : null
  )
  const [checking, setChecking] = useState(!currentUserEmail)
  const [activeTab, setActiveTab] = useState<Tab>("restaurants")
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [users, setUsers] = useState<Record<string, { email: string; last_sign_in_at: string | null }>>({})
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const router = useRouter()
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!currentUserEmail) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user as { email: string } | null)
        setChecking(false)
      })
    } else {
      setChecking(false)
    }
  }, [])

  const fetchRestaurants = useCallback(async () => {
    try {
      const res = await fetch("/api/superadmin/restaurants-stats")
      if (res.ok) {
        const json = await res.json()
        const list = json.restaurants || []
        setRestaurants(
          list.map((r: any) => ({
            ...r,
            dish_count: 0,
            total_orders: r.total_orders || 0,
            last7_orders: r.last7_orders || 0,
            last30_orders: r.last30_orders || 0,
            revenue: r.revenue || 0,
          }))
        )
      }
    } catch (e) {
      console.error("Failed to fetch restaurants", e)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/superadmin/users")
      if (res.ok) {
        const json = await res.json()
        const map: Record<string, { email: string; last_sign_in_at: string | null }> = {}
        ;(json.users || []).forEach((u: any) => {
          map[u.id] = { email: u.email, last_sign_in_at: u.last_sign_in_at }
        })
        setUsers(map)
      }
    } catch (e) {
      console.error("Failed to fetch users", e)
    }
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchRestaurants(), fetchUsers()])
    setLoading(false)
  }, [fetchRestaurants, fetchUsers])

  useEffect(() => {
    if (user?.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [user])

  // Debounced 500ms real-time subscription on restaurants + company_settings
  const scheduleRefetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchRestaurants()
    }, 500)
  }, [fetchRestaurants])

  useEffect(() => {
    if (!user || user.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) return
    const channel = supabase
      .channel("restaurants-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "restaurants" },
        () => scheduleRefetch()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "company_settings" },
        () => scheduleRefetch()
      )
      .subscribe()
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      supabase.removeChannel(channel)
    }
  }, [user, scheduleRefetch])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <p className="text-[#999]">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <LoginForm superAdminEmail={SUPER_ADMIN_EMAIL} onLogin={async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user as { email: string } | null)
      router.refresh()
    }} />
  }

  if (user.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
    return <AccessDenied email={user.email} onLogout={handleLogout} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Super Admin</h1>
          <p className="text-xs text-[#999]">Live data — {new Date().toLocaleString()}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-[#555] hover:text-[#DC2626] transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-[#E8E8E8] -mx-4 px-4 md:mx-0 md:px-0">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === t.id
                  ? "border-black text-black"
                  : "border-transparent text-[#555] hover:text-black"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-8 w-40 bg-[#E8E8E8] rounded animate-pulse" />
          <div className="h-64 bg-[#E8E8E8] rounded-[14px] animate-pulse" />
        </div>
      ) : (
        <>
          {activeTab === "restaurants" && (
            <RestaurantTable
              restaurants={restaurants}
              users={users}
              setRestaurants={setRestaurants}
            />
          )}
          {activeTab === "customers" && <CustomerTable />}
          {activeTab === "analytics" && <AnalyticsView />}
          {activeTab === "settings" && <CompanySettingsForm />}
        </>
      )}
    </div>
  )
}
