"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { QRCodeDisplay } from "@/components/shared/QRCodeDisplay"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Copy, ArrowRight, Store, UtensilsCrossed, Printer, Share2, Pencil, CheckCircle2, Sparkles, Loader2, LogOut } from "lucide-react"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

type Step = "welcome" | "menu" | "qr" | "done"

export default function OnboardingPage() {
  const router = useRouter()
  const sub = useSubscription()
  const { restaurant, loading } = sub
  const [copied, setCopied] = useState(false)
  const [currentStep, setCurrentStep] = useState<Step>("welcome")

  // Editable restaurant details
  const [restaurantName, setRestaurantName] = useState("")
  const [restaurantCity, setRestaurantCity] = useState("")
  const [restaurantPhone, setRestaurantPhone] = useState("")
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (restaurant) {
      setRestaurantName(restaurant.name || "")
      setRestaurantCity(restaurant.city || "")
      setRestaurantPhone(restaurant.phone || "")
    }
  }, [restaurant])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {}
    try { await fetch("/api/auth/logout", { method: "POST" }) } catch {}
    router.replace("/login")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#FAFAFA] to-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Store className="w-8 h-8 text-black/40" />
          </div>
          <div className="text-sm text-[#999]">Setting up your restaurant...</div>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#FAFAFA] to-white px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-lg font-semibold mb-2">No restaurant found</p>
          <p className="text-sm text-[#555] mb-6">It looks like you haven&apos;t registered your restaurant yet.</p>
          <Button onClick={() => router.push("/signup/restaurant")} variant="primary" size="lg">
            Register your restaurant
          </Button>
        </div>
      </div>
    )
  }

  const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "")}/${restaurant.slug}`

  const handleCopyUrl = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(menuUrl).catch(() => {})
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveDetails = async () => {
    if (!restaurantName.trim()) return
    setSaving(true)
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient()
      await supabase
        .from("restaurants")
        .update({
          name: restaurantName.trim(),
          city: restaurantCity.trim(),
          phone: restaurantPhone.trim(),
        })
        .eq("id", restaurant.id)
      setEditing(false)
    } catch (e) {
      console.error("Failed to save details:", e)
    } finally {
      setSaving(false)
    }
  }

  const steps = [
    {
      key: "welcome" as Step,
      title: "Welcome",
      icon: Sparkles,
      done: currentStep !== "welcome",
    },
    {
      key: "menu" as Step,
      title: "Your Menu",
      icon: UtensilsCrossed,
      done: currentStep === "qr" || currentStep === "done",
    },
    {
      key: "qr" as Step,
      title: "QR Code",
      icon: Printer,
      done: currentStep === "done",
    },
  ]

  // ── STEP 1: Welcome ──
  if (currentStep === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8F7] to-white md:bg-[#FAFAFA] animate-fade-in safe-top safe-bottom">
        <div className="max-w-2xl mx-auto px-4 py-6 md:py-16">
          {/* Brand + logout (top row) */}
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
                <Sparkles className="w-[18px] h-[18px] text-white" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold text-black">Digital QR Menue</p>
                <p className="text-[11px] text-[#999]">Owner setup</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-medium text-[#888] hover:text-[#DC2626] transition-colors px-3 py-2 rounded-lg hover:bg-white min-h-[36px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>

          {/* Progress Steps - Desktop */}
          <div className="hidden md:flex items-center justify-center gap-4 mb-10">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                  s.key === currentStep
                    ? "bg-black text-white shadow-lg shadow-black/10 scale-110"
                    : s.done
                    ? "bg-[#16A34A]/10 text-[#16A34A]"
                    : "bg-[#F0F0F0] text-[#999]"
                }`}>
                  {s.done ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className={`text-sm font-medium ${
                  s.key === currentStep ? "text-black" : "text-[#999]"
                }`}>{s.title}</span>
                {i < steps.length - 1 && (
                  <div className={`w-16 h-0.5 ml-2 rounded-full ${
                    s.done ? "bg-[#16A34A]" : "bg-[#E8E8E8]"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Main Card */}
          <div className="bg-white md:rounded-3xl md:shadow-xl md:shadow-black/5 md:border md:border-[#E8E8E8] overflow-hidden">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-black via-black to-[#1a1a1a] p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
                  backgroundSize: '40px 40px'
                }} />
              </div>
              <div className="relative">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-white/20">
                  <Store className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-3">
                  Welcome to Digital QR Menue!
                </h1>
                <p className="text-white/70 md:text-lg max-w-md mx-auto">
                  Your restaurant <span className="text-white font-semibold">{restaurant.name}</span> is all set up and ready to go digital.
                </p>
              </div>
            </div>

            {/* Restaurant Details Section */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Restaurant Details</h2>
                <button
                  onClick={() => editing ? handleSaveDetails() : setEditing(true)}
                  className="flex items-center gap-1.5 text-sm font-medium text-black hover:text-black/70 transition-colors px-3 py-1.5 rounded-lg hover:bg-[#F5F5F5]"
                >
                  {editing ? (
                    saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  ) : (
                    <Pencil className="w-4 h-4" />
                  )}
                  {editing ? (saving ? "Saving..." : "Save") : "Edit"}
                </button>
              </div>

              <div className={`grid md:grid-cols-2 gap-4 ${!editing ? "pointer-events-none" : ""}`}>
                <div className="md:col-span-2 flex items-center gap-4 p-4 bg-[#FAFAFA] rounded-xl">
                  {restaurant.logo_url ? (
                    <Image src={restaurant.logo_url} alt="" width={56} height={56} className="w-14 h-14 rounded-xl object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-black text-white flex items-center justify-center text-xl font-bold shrink-0">
                      {restaurantName[0] || restaurant.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {editing ? (
                      <>
                        <Input
                          value={restaurantName}
                          onChange={(e) => setRestaurantName(e.target.value)}
                          placeholder="Restaurant Name"
                          className="text-base font-semibold"
                        />
                        {!restaurantName.trim() && (
                          <p className="text-[11px] text-red-500 mt-1">Restaurant name is required</p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="font-semibold truncate">{restaurant.name}</p>
                        <p className="text-xs text-[#888]">Restaurant Name</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-[#FAFAFA] rounded-xl">
                  {editing ? (
                    <Input
                      label="City"
                      value={restaurantCity}
                      onChange={(e) => setRestaurantCity(e.target.value)}
                      placeholder="e.g. Faisalabad"
                    />
                  ) : (
                    <div>
                      <p className="font-medium text-sm truncate">{restaurant.city || "Not set"}</p>
                      <p className="text-xs text-[#888]">City</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-[#FAFAFA] rounded-xl">
                  {editing ? (
                    <Input
                      label="Phone"
                      value={restaurantPhone}
                      onChange={(e) => setRestaurantPhone(e.target.value)}
                      placeholder="03XX-XXXXXXX"
                    />
                  ) : (
                    <div>
                      <p className="font-medium text-sm truncate">{restaurant.phone || "Not set"}</p>
                      <p className="text-xs text-[#888]">Phone / WhatsApp</p>
                    </div>
                  )}
                </div>
              </div>

              {editing && (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setEditing(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveDetails}
                    disabled={!restaurantName.trim() || saving}
                    className="flex-1"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-[#F0F0F0]" />

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-[#FAFAFA]">
                  <p className="text-2xl font-bold text-black">0</p>
                  <p className="text-[11px] text-[#888] mt-1">Dishes Added</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-[#FAFAFA]">
                  <p className="text-2xl font-bold text-black">0</p>
                  <p className="text-[11px] text-[#888] mt-1">Categories</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-[#FAFAFA]">
                  <p className="text-2xl font-bold text-black">0</p>
                  <p className="text-[11px] text-[#888] mt-1">Orders</p>
                </div>
              </div>

              {/* Mobile step indicator */}
              <div className="md:hidden">
                <div className="flex items-center justify-center gap-1.5">
                  {steps.map((s, i) => (
                    <div key={s.key} className={`h-1.5 rounded-full transition-all ${
                      i === 0 ? "w-8 bg-black" : "w-2 bg-[#E8E8E8]"
                    }`} />
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => setCurrentStep("menu")}
                className="h-14 text-base"
              >
                Let&apos;s Set Up Your Menu <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── STEP 2: Menu Setup ──
  if (currentStep === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8F7] to-white md:bg-[#FAFAFA] animate-fade-in safe-top safe-bottom">
        <div className="max-w-2xl mx-auto px-4 py-6 md:py-16">
          {/* Brand + logout */}
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
                <Sparkles className="w-[18px] h-[18px] text-white" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold text-black">Digital QR Menue</p>
                <p className="text-[11px] text-[#999]">Owner setup</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-medium text-[#888] hover:text-[#DC2626] transition-colors px-3 py-2 rounded-lg hover:bg-white min-h-[36px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>

          {/* Desktop progress */}
          <div className="hidden md:flex items-center justify-center gap-4 mb-10">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                  s.key === currentStep
                    ? "bg-black text-white shadow-lg shadow-black/10 scale-110"
                    : s.done
                    ? "bg-[#16A34A]/10 text-[#16A34A]"
                    : "bg-[#FAFAFA] text-[#999] border border-[#E8E8E8]"
                }`}>
                  {s.done ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className={`text-sm font-medium ${
                  s.key === currentStep ? "text-black" : "text-[#999]"
                }`}>{s.title}</span>
                {i < steps.length - 1 && (
                  <div className={`w-16 h-0.5 ml-2 rounded-full ${
                    s.done ? "bg-[#16A34A]" : "bg-[#E8E8E8]"
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white md:rounded-3xl md:shadow-xl md:shadow-black/5 md:border md:border-[#E8E8E8] overflow-hidden">
            <div className="p-6 md:p-8 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FFF8E7] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UtensilsCrossed className="w-8 h-8 text-[#F59E0B]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Add Your Menu</h2>
                <p className="text-sm text-[#555] mt-2 max-w-sm mx-auto">
                  Start by adding categories and dishes so your customers can browse and order.
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl border border-[#E8E8E8] hover:border-black/20 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">Add Categories</h3>
                    <p className="text-xs text-[#666] mt-1">Create categories like &quot;Main Course&quot;, &quot;Drinks&quot;, &quot;Desserts&quot;</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl border border-[#E8E8E8] hover:border-black/20 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-black/10 text-black flex items-center justify-center text-sm font-bold shrink-0">2</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">Add Dishes</h3>
                    <p className="text-xs text-[#666] mt-1">Add dish names, prices, descriptions, and photos</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl border border-[#E8E8E8] hover:border-black/20 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-black/10 text-black flex items-center justify-center text-sm font-bold shrink-0">3</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">View Your Menu</h3>
                    <p className="text-xs text-[#666] mt-1">Preview how it looks for customers before going live</p>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-[#FAFAFA] rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#888]">💡 Quick Tips</p>
                <ul className="text-xs text-[#666] space-y-1">
                  <li>• Start with your most popular dishes first</li>
                  <li>• Add clear photos to increase orders by up to 30%</li>
                  <li>• Set accurate prices — customers will see real-time totals</li>
                </ul>
              </div>

              {/* Mobile step indicator */}
              <div className="md:hidden">
                <div className="flex items-center justify-center gap-1.5">
                  <div className="h-1.5 w-2 rounded-full bg-[#16A34A]" />
                  <div className="h-1.5 w-8 rounded-full bg-black" />
                  <div className="h-1.5 w-2 rounded-full bg-[#E8E8E8]" />
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={() => router.push("/dashboard/menu")}
                  className="h-14 text-base"
                >
                  Add Menu Items <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setCurrentStep("qr")}
                >
                  Skip — I&apos;ll do it later
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── STEP 3: QR & Share ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8F7] to-white md:bg-[#FAFAFA] animate-fade-in safe-top safe-bottom">
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-16">
        {/* Brand + logout */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
              <Sparkles className="w-[18px] h-[18px] text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-black">Digital QR Menue</p>
              <p className="text-[11px] text-[#999]">Owner setup</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-medium text-[#888] hover:text-[#DC2626] transition-colors px-3 py-2 rounded-lg hover:bg-white min-h-[36px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>

        {/* Desktop progress */}
        <div className="hidden md:flex items-center justify-center gap-4 mb-10">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                s.done ? "bg-[#16A34A]/10 text-[#16A34A]" : s.key === "qr"
                  ? "bg-black text-white shadow-lg shadow-black/10 scale-110"
                  : "bg-[#FAFAFA] text-[#999] border border-[#E8E8E8]"
              }`}>
                {s.done ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className={`text-sm font-medium ${s.done || s.key === "qr" ? "text-black" : "text-[#999]"}`}>{s.title}</span>
              {i < steps.length - 1 && (
                <div className={`w-16 h-0.5 ml-2 rounded-full ${s.done ? "bg-[#16A34A]" : "bg-[#E8E8E8]"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white md:rounded-3xl md:shadow-xl md:shadow-black/5 md:border md:border-[#E8E8E8] overflow-hidden">
          {/* QR Code Section */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E8F5FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Printer className="w-8 h-8 text-[#0284C7]" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold">Share Your Menu</h2>
              <p className="text-sm text-[#555] mt-2 max-w-sm mx-auto">
                Print the QR code or share the link so customers can access your digital menu.
              </p>
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-2xl border-2 border-[#E8E8E8] p-6 md:p-8 max-w-sm mx-auto">
              <QRCodeDisplay restaurantSlug={restaurant.slug} restaurantName={restaurant.name} />
            </div>

            {/* Menu URL */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#555]">Or share the link directly:</p>
              <div className="flex items-center gap-2 p-3 bg-[#FAFAFA] rounded-xl border border-[#E8E8E8]">
                <Share2 className="w-4 h-4 text-[#888] shrink-0" />
                <code className="text-xs md:text-sm flex-1 break-all text-[#555]">{menuUrl}</code>
                <button
                  onClick={handleCopyUrl}
                  className="shrink-0 w-9 h-9 flex items-center justify-center hover:bg-[#E8E8E8] rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4 text-[#555]" />}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#F0F0F0]" />

            {/* Final Checklist */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">✅ You&apos;re all set!</h3>
              <div className="space-y-2 text-sm text-[#555]">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F0FFF4] border border-[#D4EDDA]">
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                  <span>Restaurant profile created</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAFAFA]">
                  <div className="w-5 h-5 rounded-full border-2 border-[#D0D0D0] shrink-0" />
                  <span className="text-[#999]">Menu items added</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAFAFA]">
                  <div className="w-5 h-5 rounded-full border-2 border-[#D0D0D0] shrink-0" />
                  <span className="text-[#999]">QR code printed & placed</span>
                </div>
              </div>
            </div>

            {/* Mobile step indicator */}
            <div className="md:hidden">
              <div className="flex items-center justify-center gap-1.5">
                <div className="h-1.5 w-2 rounded-full bg-[#16A34A]" />
                <div className="h-1.5 w-2 rounded-full bg-[#16A34A]" />
                <div className="h-1.5 w-8 rounded-full bg-black" />
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => router.push("/dashboard")}
                className="h-14 text-base"
              >
                Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => router.push("/dashboard/menu")}
              >
                Add Menu Items First
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
