"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { Mail, CheckCircle, Clock } from "lucide-react"

interface Inquiry {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  is_read: boolean
  created_at: string
}

export function ContactInquiriesPanel() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchInquiries = useCallback(async () => {
    try {
      const res = await fetch("/api/superadmin/contact-inquiries")
      if (res.ok) {
        const json = await res.json()
        setInquiries(json.inquiries || [])
      }
    } catch (e) {
      console.error("Failed to fetch inquiries", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInquiries()
  }, [fetchInquiries])

  useEffect(() => {
    const channel = supabase
      .channel(uid("contact-inquiries-changes"))
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_inquiries" }, () => {
        fetchInquiries()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchInquiries])

  const markAsRead = async (id: string) => {
    const res = await fetch("/api/superadmin/contact-inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, is_read: true } : i))
      )
    }
  }

  if (loading) {
    return <div className="h-64 bg-white rounded-[14px] border border-[#E8E8E8] animate-pulse" />
  }

  const unread = inquiries.filter((i) => !i.is_read)
  const read = inquiries.filter((i) => i.is_read)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Mail className="w-4 h-4" />
        <span className="text-sm font-semibold">
          Contact Inquiries
          {unread.length > 0 && (
            <span className="ml-2 text-xs bg-red-50 text-[#DC2626] px-2 py-0.5 rounded-full">
              {unread.length} unread
            </span>
          )}
        </span>
      </div>

      {inquiries.length === 0 && (
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-10 text-center">
          <Mail className="w-8 h-8 text-[#CCC] mx-auto mb-3" />
          <p className="text-sm text-[#999]">No inquiries yet.</p>
        </div>
      )}

      {(unread.length > 0 || read.length > 0) && (
        <div className="space-y-2">
          {unread.map((inq) => (
            <div
              key={inq.id}
              className="bg-white rounded-[14px] border border-[#E8E8E8] p-4 space-y-2 cursor-pointer hover:bg-[#FAFAFA] transition-colors"
              onClick={() => markAsRead(inq.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#DC2626] shrink-0" />
                    <span className="text-sm font-semibold truncate">{inq.name}</span>
                  </div>
                  <p className="text-xs text-[#555] truncate">{inq.email}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-[#999]">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px]">{new Date(inq.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="text-sm text-[#555] line-clamp-2">{inq.message}</p>
            </div>
          ))}
          {read.map((inq) => (
            <div
              key={inq.id}
              className="bg-white rounded-[14px] border border-[#E8E8E8] p-4 space-y-2 opacity-60"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-3 h-3 text-[#999]" />
                    <span className="text-sm font-medium truncate">{inq.name}</span>
                  </div>
                  <p className="text-xs text-[#555] truncate">{inq.email}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-[#999]">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px]">{new Date(inq.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="text-sm text-[#555] line-clamp-2">{inq.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
