"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { Megaphone, Plus, Send, Trash2, X, Loader2 } from "lucide-react"

export function AnnouncementsPanel() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch("/api/superadmin/announcements")
      if (res.ok) {
        const json = await res.json()
        setAnnouncements(json.announcements || [])
      }
    } catch (e) {
      console.error("Failed to fetch announcements", e)
    }
  }, [])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  useEffect(() => {
    const channel = supabase
      .channel(uid("qr-announcements"))
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "qr_announcements" },
        () => {
          if (debounceRef.current) clearTimeout(debounceRef.current)
          debounceRef.current = setTimeout(fetchAnnouncements, 500)
        }
      )
      .subscribe()
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchAnnouncements])

  // Polling fallback
  useEffect(() => {
    const interval = setInterval(fetchAnnouncements, 15000)
    return () => clearInterval(interval)
  }, [fetchAnnouncements])

  const handleCreate = async () => {
    if (!title.trim() || !body.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/superadmin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      })
      if (res.ok) {
        setTitle("")
        setBody("")
        setShowForm(false)
        fetchAnnouncements()
      }
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async (id: string) => {
    setPublishing(id)
    try {
      const res = await fetch(`/api/superadmin/announcements/${id}/publish`, { method: "POST" })
      if (res.ok) {
        const json = await res.json()
        alert(`Published! Notified ${json.notified} of ${json.total} restaurant owners.`)
        fetchAnnouncements()
      }
    } finally {
      setPublishing(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return
    setDeleting(id)
    try {
      await fetch(`/api/superadmin/announcements/${id}`, { method: "DELETE" })
      fetchAnnouncements()
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Announcements</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-xs font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          {showForm ? "Cancel" : "New"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-[#F0F0F0] p-4 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
            className="w-full h-10 px-3 rounded-xl border border-[#F0F0F0] text-sm outline-none focus:border-black"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your announcement..."
            rows={4}
            className="w-full px-3 py-2 rounded-xl border border-[#F0F0F0] text-sm outline-none focus:border-black resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handleCreate}
              disabled={saving || !title.trim() || !body.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Save Draft
            </button>
          </div>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="text-center py-12 text-[#555] text-sm">
          <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
          No announcements yet
        </div>
      ) : (
        <div className="space-y-2">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl border border-[#F0F0F0] p-4 flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold truncate">{a.title}</h3>
                  {a.is_published ? (
                    <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      Published
                    </span>
                  ) : (
                    <span className="text-[10px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#555] line-clamp-2 whitespace-pre-wrap">{a.body}</p>
                <p className="text-[10px] text-[#555] mt-1">
                  {new Date(a.created_at).toLocaleDateString("en-PK", {
                    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!a.is_published && (
                  <button
                    onClick={() => handlePublish(a.id)}
                    disabled={publishing === a.id}
                    className="p-2 hover:bg-green-50 rounded-xl text-green-700 transition-colors"
                    title="Publish & notify all restaurant owners"
                  >
                    {publishing === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={deleting === a.id}
                  className="p-2 hover:bg-red-50 rounded-xl text-[#DC2626] transition-colors"
                  title="Delete"
                >
                  {deleting === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
