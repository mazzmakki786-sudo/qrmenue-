"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { Check, Loader2 } from "lucide-react"

const settingKeys = [
  { key: "jazzcash_number", label: "JazzCash Number", placeholder: "03001234567" },
  { key: "easypaisa_number", label: "Easypaisa Number", placeholder: "03001234567" },
  { key: "bank_name", label: "Bank Name", placeholder: "Meezan Bank" },
  { key: "account_title", label: "Account Title", placeholder: "QRMenu Pakistan" },
  { key: "account_number", label: "Account Number", placeholder: "01234567890123" },
  { key: "whatsapp_support", label: "WhatsApp Support", placeholder: "923001234567" },
  { key: "company_email", label: "Company Email", placeholder: "support@digitalmenue.com", type: "email" },
]

const socialKeys = [
  { key: "social_facebook", label: "Facebook URL", placeholder: "https://facebook.com/yourpage" },
  { key: "social_instagram", label: "Instagram URL", placeholder: "https://instagram.com/yourpage" },
  { key: "social_linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/company/yourpage" },
  { key: "social_tiktok", label: "TikTok URL", placeholder: "https://tiktok.com/@yourpage" },
  { key: "social_youtube", label: "YouTube URL", placeholder: "https://youtube.com/@yourchannel" },
  { key: "social_twitter", label: "Twitter / X URL", placeholder: "https://x.com/yourhandle" },
]

export function CompanySettingsForm() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createClient()

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/superadmin/settings")
    if (res.ok) {
      const json = await res.json()
      setSettings(json.settings || {})
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Real-time subscription on company_settings
  useEffect(() => {
    const channel = supabase
      .channel(uid("settings-changes"))
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "company_settings" },
        () => fetchSettings()
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    const res = await fetch("/api/superadmin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="h-64 bg-white rounded-[14px] border border-[#E8E8E8] animate-pulse" />
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5 space-y-4">
        <h3 className="text-sm font-semibold mb-3">Payment & Support</h3>
        {settingKeys.map(({ key, label, placeholder, type }) => (
          <div key={key}>
            <label htmlFor={key} className="block text-xs font-medium text-[#555] mb-1.5">
              {label}
            </label>
            <input
              id={key}
              type={type || "text"}
              value={settings[key] || ""}
              onChange={(e) => setSettings((p) => ({ ...p, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full h-11 px-3.5 rounded-xl border border-[#E8E8E8] bg-white text-sm outline-none focus:border-black transition-colors"
            />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5 space-y-4">
        <h3 className="text-sm font-semibold mb-3">Social Media Links</h3>
        <p className="text-xs text-[#999] mb-2">Leave a field empty to hide that icon from the contact page.</p>
        {socialKeys.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label htmlFor={key} className="block text-xs font-medium text-[#555] mb-1.5">
              {label}
            </label>
            <input
              id={key}
              type="url"
              value={settings[key] || ""}
              onChange={(e) => setSettings((p) => ({ ...p, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full h-11 px-3.5 rounded-xl border border-[#E8E8E8] bg-white text-sm outline-none focus:border-black transition-colors"
            />
          </div>
        ))}
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-11 px-5 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save All Settings"}
        </button>
      </div>
      <p className="text-xs text-[#999]">
        Settings update in real-time across the website. Changes appear on pricing, contact, and payment pages within seconds.
      </p>
    </div>
  )
}
