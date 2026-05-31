"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const settingKeys = [
  "jazzcash_number", "easypaisa_number", "bank_name",
  "account_title", "account_number", "whatsapp_support", "company_email",
]

const labels: Record<string, string> = {
  jazzcash_number: "JazzCash Number",
  easypaisa_number: "Easypaisa Number",
  bank_name: "Bank Name",
  account_title: "Account Title",
  account_number: "Account Number",
  whatsapp_support: "WhatsApp Support",
  company_email: "Company Email",
}

export default function SuperAdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("company_settings").select("*")
      if (data) {
        const map: Record<string, string> = {}
        data.forEach((s) => { map[s.key] = s.value })
        setSettings(map)
      }
    }
    fetch()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from("company_settings").upsert({ key, value }, { onConflict: "key" })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-xl font-bold">Company Settings</h1>

      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5 space-y-4">
        {settingKeys.map((key) => (
          <Input
            key={key}
            label={labels[key]}
            id={key}
            value={settings[key] || ""}
            onChange={(e) => setSettings((p) => ({ ...p, [key]: e.target.value }))}
          />
        ))}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved!" : "Save All Settings"}
        </Button>
      </div>
    </div>
  )
}
