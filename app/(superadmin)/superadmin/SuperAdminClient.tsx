"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { formatPrice } from "@/lib/utils"
import { Shield, LogOut, Eye, EyeOff, Users, Building2, BarChart3, Settings as SettingsIcon, Store, Megaphone, Clock } from "lucide-react"
import { RestaurantTable } from "@/components/superadmin/RestaurantTable"
import { CustomerTable } from "@/components/superadmin/CustomerTable"
import { AnalyticsView } from "@/components/superadmin/AnalyticsView"
import { CompanySettingsForm } from "@/components/superadmin/CompanySettingsForm"
import { TrialLimitsEditor } from "@/components/superadmin/TrialLimitsEditor"
import { AnnouncementsPanel } from "@/components/superadmin/AnnouncementsPanel"
import { ActivityLogView } from "@/components/superadmin/ActivityLogView"

type Tab = "restaurants" | "customers" | "analytics" | "announcements" | "settings"

const SESSION_TIMEOUT_MS = 15 * 60 * 1000

function LoginForm({ onLogin, locked }: { onLogin: () => void; locked: boolean }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
    } else {
      onLogin()
    }
    setLoading(false)
  }

  if (locked) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold mb-2">Access Locked</h1>
          <p className="text-sm text-[#555] mb-6">
            Your account has been temporarily locked due to multiple failed login attempts.
            For security reasons, this cannot be undone automatically.
          </p>
          <div className="bg-[#F9FAFB] rounded-xl p-4 text-left space-y-2 mb-6">
            <p className="text-xs font-medium text-[#555]">To regain access:</p>
            <p className="text-xs text-[#555]">
              1. Contact us via <strong className="text-black">WhatsApp</strong> at the support number provided during onboarding
            </p>
            <p className="text-xs text-[#555]">
              2. Verify your identity with the recovery email on file
            </p>
            <p className="text-xs text-[#555]">
              3. An administrator will reset your lockout status
            </p>
          </div>
          <p className="text-[10px] text-[#999]">This is a security measure to protect the system.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-black text-white flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold">Super Admin</h1>
          <p className="text-sm text-[#555] mt-1">Company access only</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-xl border border-[#F0F0F0] p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-[#555] mb-1.5">Company Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-11 px-3.5 rounded-xl border border-[#F0F0F0] bg-white text-sm outline-none focus:border-black transition-colors disabled:opacity-50" placeholder="admin@company.com" required />
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-xs font-medium text-[#555] mb-1.5">Password</label>
            <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-11 px-3.5 rounded-xl border border-[#F0F0F0] bg-white text-sm outline-none focus:border-black transition-colors disabled:opacity-50" placeholder="Enter password" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[34px] text-[#999] hover:text-black">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && <p className="text-xs text-[#DC2626] bg-red-50 rounded-lg p-3">{error}</p>}
          <button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-xs text-[#999] text-center mt-6">Only authorized company administrators can access this panel</p>
      </div>
    </div>
  )
}

function AccessDenied({ email, onLogout }: { email: string; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center mx-auto mb-4">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold mb-2">Access Denied</h1>
        <p className="text-sm text-[#555] mb-6">
          <strong>{email}</strong> is not authorized to access the Super Admin panel.
        </p>
        <button onClick={onLogout} className="h-11 px-6 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 transition-opacity">Sign Out & Try Again</button>
      </div>
    </div>
  )
}

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "restaurants", label: "Restaurants", icon: Store },
  { id: "customers", label: "Customers", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "settings", label: "Settings", icon: SettingsIcon },
]

export default function SuperAdminClient({ currentUserEmail }: { currentUserEmail: string }) {
  const [user, setUser] = useState<{ email: string } | null>(currentUserEmail ? { email: currentUserEmail } : null)
  const [checking, setChecking] = useState(!currentUserEmail)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get("tab") as Tab) || "restaurants"
  const [activeTab, setActiveTab] = useState<Tab>(TABS.find((t) => t.id === initialTab) ? initialTab : "restaurants")
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [users, setUsers] = useState<Record<string, { email: string; last_sign_in_at: string | null }>>({})
  const [loading, setLoading] = useState(true)
  const [showActivityLog, setShowActivityLog] = useState(false)
  const [timestamp, setTimestamp] = useState(new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }).replace(",", " •"))

  const supabase = createClient()
  const router = useRouter()
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const inactivityRef = useRef<NodeJS.Timeout | null>(null)

  const verifyAdmin = useCallback(async (email: string) => {
    try {
      const res = await fetch("/api/superadmin/check")
      if (res.ok) {
        const data = await res.json()
        if (data.locked) {
          setIsLocked(true)
          setLoading(false)
          return
        }
        setIsSuperAdmin(data.isSuperAdmin)
        if (!data.isSuperAdmin) setLoading(false)
      } else {
        setIsSuperAdmin(false)
        setLoading(false)
      }
    } catch {
      setIsSuperAdmin(false)
      setLoading(false)
    }
  }, [])

  // Session inactivity timeout
  const resetInactivityTimer = useCallback(() => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current)
    if (isSuperAdmin) {
      inactivityRef.current = setTimeout(async () => {
        await supabase.auth.signOut()
        setUser(null)
        setIsSuperAdmin(false)
        router.refresh()
      }, SESSION_TIMEOUT_MS)
    }
  }, [isSuperAdmin, supabase, router])

  useEffect(() => {
    if (!isSuperAdmin) return
    const events = ["mousedown", "keydown", "touchstart", "scroll"]
    events.forEach((e) => window.addEventListener(e, resetInactivityTimer))
    resetInactivityTimer()
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivityTimer))
      if (inactivityRef.current) clearTimeout(inactivityRef.current)
    }
  }, [isSuperAdmin, resetInactivityTimer])

  useEffect(() => {
    if (!currentUserEmail) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const u = session?.user as { email: string } | null
        setUser(u)
        setChecking(false)
        if (u?.email) verifyAdmin(u.email)
      })
    } else {
      setChecking(false)
      verifyAdmin(currentUserEmail)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }).replace(",", " •"))
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchRestaurants = useCallback(async () => {
    try {
      const res = await fetch("/api/superadmin/restaurants-stats")
      if (res.ok) {
        const json = await res.json()
        const list = json.restaurants || []
        setRestaurants(list.map((r: any) => ({ ...r, dish_count: 0, total_orders: r.total_orders || 0, last7_orders: r.last7_orders || 0, last30_orders: r.last30_orders || 0, revenue: r.revenue || 0 })))
      }
    } catch (e) { console.error("Failed to fetch restaurants", e) }
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/superadmin/users")
      if (res.ok) {
        const json = await res.json()
        const map: Record<string, { email: string; last_sign_in_at: string | null }> = {}
        ;(json.users || []).forEach((u: any) => { map[u.id] = { email: u.email, last_sign_in_at: u.last_sign_in_at } })
        setUsers(map)
      }
    } catch (e) { console.error("Failed to fetch users", e) }
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchRestaurants(), fetchUsers()])
    setLoading(false)
  }, [fetchRestaurants, fetchUsers])

  useEffect(() => {
    if (isSuperAdmin && user?.email) { loadData() }
    else if (!checking) { setLoading(false) }
  }, [isSuperAdmin, user, checking])

  const scheduleRefetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { fetchRestaurants() }, 500)
  }, [fetchRestaurants])

  useEffect(() => {
    if (!isSuperAdmin) return
    const channel = supabase
      .channel(uid("restaurants-changes"))
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurants" }, () => scheduleRefetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "company_settings" }, () => scheduleRefetch())
      .subscribe()
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      supabase.removeChannel(channel)
    }
  }, [isSuperAdmin, scheduleRefetch, supabase])

  useEffect(() => {
    if (!isSuperAdmin) return
    const interval = setInterval(() => scheduleRefetch(), 30000)
    return () => clearInterval(interval)
  }, [isSuperAdmin, scheduleRefetch])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsSuperAdmin(false)
    setIsLocked(false)
  }

  if (checking) return <div className="min-h-screen bg-white flex items-center justify-center"><p className="text-[#999]">Loading...</p></div>
  if (!user) return <LoginForm onLogin={async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const u = session?.user as { email: string } | null
    setUser(u)
    if (u?.email) verifyAdmin(u.email)
    router.refresh()
  }} locked={isLocked} />
  if (isLocked) return <LoginForm onLogin={async () => {}} locked={true} />
  if (!isSuperAdmin) return <AccessDenied email={user.email} onLogout={handleLogout} />

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <header className="bg-white/80 backdrop-blur-md fixed top-0 left-0 w-full z-50 border-b border-[#F0F0F0] safe-area-inset-top">
        <div className="max-w-6xl mx-auto px-4 md:px-10 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-black">Super Admin</h1>
            <span className="h-6 w-px bg-[#F0F0F0]" />
            <p className="text-xs text-[#555] hidden sm:block" id="live-timestamp">{timestamp}</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowActivityLog(true)} className="text-xs text-black hover:opacity-70 transition-opacity flex items-center gap-2">
              <Clock className="w-4 h-4" /> Activity Log
            </button>
            <button onClick={handleLogout} className="text-xs text-[#ba1a1a] font-bold hover:underline">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-8 max-w-6xl mx-auto px-4 md:px-10 min-h-screen">
        <nav className="flex items-center gap-4 mb-6 overflow-x-auto pb-2 border-b border-[#F0F0F0]">
          {TABS.map((t) => {
            const Icon = t.icon
            const isActive = activeTab === t.id
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id)
                  router.replace(`/superadmin?tab=${t.id}`, { scroll: false })
                }}
                className={`flex items-center gap-2 py-4 text-xs font-semibold transition-all whitespace-nowrap border-b-2 ${
                  isActive ? "text-black border-black" : "text-[#555] border-transparent hover:text-black"
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            )
          })}
        </nav>

        {loading ? (
          <div className="space-y-4">
            <div className="skeleton h-8 w-40 rounded" />
            <div className="skeleton h-64 rounded-xl" />
          </div>
        ) : (
          <>
            {activeTab === "restaurants" && <RestaurantTable restaurants={restaurants} users={users} setRestaurants={setRestaurants} />}
            {activeTab === "customers" && <CustomerTable />}
            {activeTab === "analytics" && <AnalyticsView />}
            {activeTab === "announcements" && <AnnouncementsPanel />}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <TrialLimitsEditor />
                <CompanySettingsForm />
              </div>
            )}
          </>
        )}
      </main>
      <ActivityLogView open={showActivityLog} onClose={() => setShowActivityLog(false)} />
    </div>
  )
}
