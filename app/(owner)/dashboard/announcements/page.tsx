"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { Megaphone, Check, ChevronRight, CheckCheck } from "lucide-react"
import { DashboardFooter } from "@/components/shared/DashboardFooter"

interface Announcement {
  id: string
  title: string
  body: string
  is_read: boolean
  created_at: string
}

type Filter = "all" | "unread" | "read"

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("all")
  const [restaurantId, setRestaurantId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setRestaurantId(data.id)
        })
    })
  }, [])

  const fetchAnnouncements = async () => {
    if (!restaurantId) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filter !== "all") params.set("filter", filter)
      const res = await fetch(`/api/owner/announcements?${params}`)
      const data = await res.json()
      setAnnouncements(data.announcements || [])
    } catch {
      setAnnouncements([])
      setError("Failed to load announcements. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [restaurantId, filter])

  useEffect(() => {
    if (!restaurantId) return
    const supabase = createClient()
    const channel = supabase
      .channel(uid(`announcements-page-${restaurantId}`))
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "owner_notifications",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          fetchAnnouncements()
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [restaurantId])

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/owner/announcements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcement_id: id }),
      })
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
      )
    } catch {}
  }

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/owner/announcements", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setAnnouncements((prev) =>
          prev.map((a) => (a.is_read ? a : { ...a, is_read: true }))
        )
      }
    } catch {}
  }

  const unreadCount = announcements.filter((a) => !a.is_read).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-black">Announcements</h1>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] text-[#25D366] font-semibold hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {unreadCount > 0 && (
        <div className="bg-[#25D366]/10 border border-[#25D366]/20 rounded-2xl px-4 py-3 flex items-center gap-3">
          <Megaphone className="w-5 h-5 text-[#25D366] shrink-0" />
          <p className="text-sm text-[#333]">
            {unreadCount} unread announcement{unreadCount > 1 ? "s" : ""}
          </p>
        </div>
      )}

      <div className="flex gap-1.5">
        {(["all", "unread", "read"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === f
                ? "bg-black text-white"
                : "bg-[#F0F0F0] text-[#555] hover:bg-[#E5E5E5]"
            }`}
          >
            {f === "all" && "All"}
            {f === "unread" && "Unread"}
            {f === "read" && "Read"}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3 animate-pulse" aria-hidden="true">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-[#F0F0F0] rounded-2xl p-5">
              <div className="h-4 w-2/3 bg-[#F0F0F0] rounded-lg mb-3" />
              <div className="h-3 w-full bg-[#F0F0F0] rounded-lg mb-2" />
              <div className="h-3 w-4/5 bg-[#F0F0F0] rounded-lg" />
            </div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-[#F0F0F0] flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-6 h-6 text-[#999]" />
          </div>
          <p className="text-sm font-semibold text-[#555]">No announcements yet</p>
          <p className="text-xs text-[#999] mt-1">
            {filter === "unread" ? "You've read all announcements." : "Announcements will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div
              key={a.id}
              className={`bg-white border rounded-2xl p-5 transition-colors ${
                a.is_read ? "border-[#F0F0F0]" : "border-[#25D366]/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!a.is_read && (
                      <span className="w-2 h-2 rounded-full bg-[#25D366] shrink-0" />
                    )}
                    <h3 className={`text-sm font-bold truncate ${a.is_read ? "text-[#555]" : "text-black"}`}>
                      {a.title}
                    </h3>
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed whitespace-pre-wrap ${a.is_read ? "text-[#999]" : "text-[#555]"}`}>
                    {a.body}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] text-[#999]">
                      {new Date(a.created_at).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {a.is_read && (
                      <span className="text-[10px] text-[#25D366] font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Read
                      </span>
                    )}
                  </div>
                </div>
                {!a.is_read && (
                  <button
                    onClick={() => markAsRead(a.id)}
                    className="shrink-0 w-8 h-8 rounded-lg border border-[#F0F0F0] flex items-center justify-center hover:bg-[#F0F0F0] transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4 text-[#555]" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <DashboardFooter />
    </div>
  )
}
