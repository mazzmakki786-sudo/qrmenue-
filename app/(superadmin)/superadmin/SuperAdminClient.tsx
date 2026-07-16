"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { Shield, Eye, EyeOff, Users, BarChart3, Settings as SettingsIcon, Store, Megaphone, Clock, CreditCard, Sparkles, Loader2, Mail } from "lucide-react"
import { RestaurantTable } from "@/components/superadmin/RestaurantTable"
import { CustomerTable } from "@/components/superadmin/CustomerTable"
import { AnalyticsView } from "@/components/superadmin/AnalyticsView"
import { CompanySettingsForm } from "@/components/superadmin/CompanySettingsForm"
import { TrialLimitsEditor } from "@/components/superadmin/TrialLimitsEditor"
import { AnnouncementsPanel } from "@/components/superadmin/AnnouncementsPanel"
import { ActivityLogView } from "@/components/superadmin/ActivityLogView"
import { PlanManager } from "@/components/superadmin/PlanManager"
import { AiControls } from "@/components/superadmin/AiControls"
import { ContactInquiriesPanel } from "@/components/superadmin/ContactInquiriesPanel"

type Tab = "restaurants" | "customers" | "analytics" | "announcements" | "plans" | "settings" | "ai" | "inquiries"

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

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      setError("Incorrect email or password")
      setLoading(false)
      return
    }
    onLogin()
  }

  if (locked) {
    return (
      <div className="fixed inset-0 z-[60] bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold mb-2">Access Denied</h1>
          <p className="text-sm text-[#555] mb-6">
            You do not have permission to access this panel.
          </p>
          <div className="bg-[#F9FAFB] rounded-xl p-4 text-left space-y-2 mb-6">
            <p className="text-xs font-medium text-[#555]">To request access:</p>
            <p className="text-xs text-[#555]">
              Contact your system administrator for assistance.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] bg-white flex items-center justify-center px-4">
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
          <button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : "Sign In"}
          </button>
        </form>

        <p className="text-xs text-[#999] text-center mt-6">Only authorized company administrators can access this panel</p>
      </div>
    </div>
  )
}

function AccessDenied({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center mx-auto mb-4">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold mb-2">Access Denied</h1>
        <p className="text-sm text-[#555] mb-6">
          You do not have permission to access this panel.
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
  { id: "plans", label: "Plans", icon: CreditCard },
  { id: "inquiries", label: "Inquiries", icon: Mail },
  { id: "ai", label: "AI Management", icon: Sparkles },
  { id: "settings", label: "Settings", icon: SettingsIcon },
]

export default function SuperAdminClient({ currentUserEmail }: { currentUserEmail: string }) {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [checking, setChecking] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get("tab") as Tab) || "restaurants"
  const [activeTab, setActiveTab] = useState<Tab>(TABS.find((t) => t.id === initialTab) ? initialTab : "restaurants")
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [users, setUsers] = useState<Record<string, { email: string; last_sign_in_at: string | null }>>({})
  const [loading, setLoading] = useState(true)
  const [showActivityLog, setShowActivityLog] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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

  const resetInactivityTimer = useCallback(() => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current)
    if (isSuperAdmin) {
      inactivityRef.current = setTimeout(async () => {
        try { await fetch("/api/auth/logout", { method: "POST" }) } catch {}
        setUser(null)
        setIsSuperAdmin(false)
        window.location.href = "/superadmin"
      }, SESSION_TIMEOUT_MS)
    }
  }, [isSuperAdmin, supabase])

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

  // Auth handled by LoginForm — no auto-detection

  const fetchRestaurants = useCallback(async () => {
    try {
      const res = await fetch("/api/superadmin/restaurants-stats")
      if (res.ok) {
        const json = await res.json()
        const list = json.data || []
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
      .on("postgres_changes", { event: "*", schema: "public", table: "plans" }, () => scheduleRefetch())
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
    try { await fetch("/api/auth/logout", { method: "POST" }) } catch {}
    window.location.href = "/superadmin"
  }

  const handleLoginSuccess = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const u = session?.user as { email: string } | null
    if (u?.email) {
      setUser(u)
      await verifyAdmin(u.email)
    }
  }

  if (checking) return <div className="fixed inset-0 z-[60] bg-white flex items-center justify-center"><p className="text-[#999]">Loading...</p></div>
  if (!user) return <LoginForm onLogin={handleLoginSuccess} locked={isLocked} />
  if (isLocked) return <LoginForm onLogin={async () => {}} locked={true} />
  if (!isSuperAdmin) return <AccessDenied onLogout={handleLogout} />

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="max-w-6xl mx-auto px-3 md:px-10 pt-4 md:pt-6">
        <div className="mb-4 md:mb-6 flex items-end justify-between gap-4 border-b border-[#F0F0F0]">
          <nav className="flex items-center gap-2 md:gap-4 overflow-x-auto scrollbar-hide flex-1">
          {TABS.map((t) => {
            const Icon = t.icon
            const isActive = activeTab === t.id
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id)
                  setMenuOpen(false)
                  router.replace(`/superadmin?tab=${t.id}`, { scroll: false })
                }}
                className={`flex items-center gap-1.5 py-2.5 md:py-4 text-[10px] md:text-xs font-semibold transition-all whitespace-nowrap border-b-2 flex-shrink-0 ${
                  isActive ? "text-black border-black" : "text-[#555] border-transparent hover:text-black"
                }`}
              >
                  <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" /> {t.label}
                </button>
              )
            })}
          </nav>
          <button onClick={() => setShowActivityLog(true)} className="shrink-0 text-[10px] md:text-xs text-black hover:opacity-70 transition-opacity flex items-center gap-1.5 pb-2">
            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Activity Log</span>
          </button>
        </div>

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
            {activeTab === "inquiries" && <ContactInquiriesPanel />}
            {activeTab === "announcements" && <AnnouncementsPanel />}
            {activeTab === "plans" && <PlanManager />}
            {activeTab === "ai" && <AiControls />}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <TrialLimitsEditor />
                <CompanySettingsForm />
              </div>
            )}
          </>
        )}
      </div>
      <ActivityLogView open={showActivityLog} onClose={() => setShowActivityLog(false)} />
    </div>
  )
}
