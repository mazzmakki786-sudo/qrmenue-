"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Check } from "lucide-react"

const settingKeys = [
  { key: "jazzcash_number", label: "JazzCash Number", placeholder: "03001234567" },
  { key: "easypaisa_number", label: "Easypaisa Number", placeholder: "03001234567" },
  { key: "bank_name", label: "Bank Name", placeholder: "Meezan Bank" },
  { key: "account_title", label: "Account Title", placeholder: "QRMenu Pakistan" },
  { key: "account_number", label: "Account Number", placeholder: "01234567890123" },
  { key: "whatsapp_support", label: "WhatsApp Support", placeholder: "923001234567" },
  { key: "company_email", label: "Company Email", placeholder: "support@qrmenu.pk", type: "email" },
]

export function CompanySettingsForm() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createClient()

  const fetchSettings = useCallback(async () => {
    const { data, error } = await supabase.from("company_settings").select("*")
    if (data) {
      const map: Record<string, string> = {}
      data.forEach((s: any) => { map[s.key] = s.value })
      setSettings(map)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Real-time subscription on company_settings
  useEffect(() => {
    const channel = supabase
      .channel("settings-changes")
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
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-11 px-5 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
        >
          {saving ? "Saving..." : saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save All Settings"}
        </button>
      </div>
      <p className="text-xs text-[#999]">
        Settings update in real-time across the website. Changes appear on pricing, contact, and payment pages within seconds.
      </p>
    </div>
  )
}
