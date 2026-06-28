"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Sparkles, ImageIcon, Trash2, Download, Loader2, Send, Zap, AlertCircle } from "lucide-react"
import type { AiPost } from "@/types"
import { useSubscription } from "@/lib/hooks/useSubscription"

interface AiLimitInfo {
  allowed: boolean; remaining: number; limit: number; used: number; month: string
}

export default function AiPostsPage() {
  const sub = useSubscription()
  const { restaurant, planLimits } = sub

  const [posts, setPosts] = useState<AiPost[]>([])
  const [loading, setLoading] = useState(true)
  const [limitInfo, setLimitInfo] = useState<AiLimitInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiGenerating, setAiGenerating] = useState(false)

  const hasPlanAccess = (planLimits?.aiPostsPerMonth ?? 0) > 0

  const fetchData = useCallback(async () => {
    try {
      const [postsRes, limitRes] = await Promise.all([
        fetch("/api/owner/ai/history"),
        fetch("/api/owner/ai/check-limit"),
      ])
      if (postsRes.ok) { const j = await postsRes.json(); setPosts(j.posts || []) }
      if (limitRes.ok) { const j = await limitRes.json(); setLimitInfo(j) }
    } catch { } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (postId: string) => {
    try {
      const res = await fetch("/api/owner/ai/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postId }),
      })
      if (res.ok) fetchData()
    } catch {}
  }

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return
    setAiGenerating(true)
    setError(null)
    try {
      const res = await fetch("/api/owner/ai/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt.trim(), language: "en", mode: "generate-caption" }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "AI generation failed"); return }
    } catch { setError("Network error. Please try again.") } finally { setAiGenerating(false) }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-[#F0F0F0] rounded animate-pulse" />
        <div className="h-32 bg-[#F0F0F0] rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-36 bg-[#F0F0F0] rounded-2xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-black">AI Posts</h1>
          <p className="text-xs text-[#999] mt-0.5">Generate restaurant posters & social posts with AI</p>
        </div>
        {hasPlanAccess && limitInfo && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0F0F0] rounded-full text-xs font-medium text-[#555]">
            <Zap className="w-3.5 h-3.5 text-[#7C3AED]" />
            {limitInfo.remaining}/{limitInfo.limit} left this month
          </div>
        )}
      </div>

      {/* No plan access */}
      {!hasPlanAccess && (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl p-6 sm:p-8 text-white">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold mb-1">AI-Powered Posters</h2>
            <p className="text-sm text-white/70 max-w-md">
              Upgrade your plan to generate stunning AI-powered restaurant posters and social media posts.
            </p>
          </div>
        </div>
      )}

      {hasPlanAccess && (
        <>
          {/* AI Prompt Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#7C3AED]/5 via-[#7C3AED]/[0.02] to-[#2563EB]/5 rounded-2xl border border-[#7C3AED]/10 p-5 sm:p-6">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#7C3AED]/10 to-[#2563EB]/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="relative flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#7C3AED]/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-sm font-bold text-[#111] block mb-2.5">
                  What do you want to promote?
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Create a poster for our weekend BBQ special with grilled chicken, seekh kebab, and cold drinks..."
                    className="flex-1 rounded-xl bg-white border border-[#E8E8E8] px-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/20 resize-none h-12 min-h-[48px] placeholder:text-[#BBB]"
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAiGenerate() } }}
                  />
                  <button
                    onClick={handleAiGenerate}
                    disabled={aiGenerating || !aiPrompt.trim() || !limitInfo?.allowed}
                    className="sm:w-auto w-full px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white text-sm font-bold hover:opacity-90 hover:shadow-lg hover:shadow-[#7C3AED]/20 transition-all disabled:opacity-40 disabled:hover:shadow-none flex items-center justify-center gap-2 flex-shrink-0 h-12"
                  >
                    {aiGenerating ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Generate</>
                    )}
                  </button>
                </div>
                <p className="text-xs text-[#999] mt-2 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#7C3AED]" />
                  Describe your dish, offer, or event — AI creates a ready-to-share poster
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span className="text-xs text-amber-800 flex-1">{error}</span>
              <button onClick={() => setError(null)} className="text-amber-500 hover:text-amber-700 text-xs font-bold p-1">X</button>
            </div>
          )}

          {/* Saved Posts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-black flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#555]" />
                Saved Posts
                <span className="text-[11px] font-normal text-[#999] bg-[#F0F0F0] px-2 py-0.5 rounded-full">{posts.length}</span>
              </h3>
            </div>
            {posts.length === 0 ? (
              <div className="bg-white border border-[#F0F0F0] rounded-2xl py-12 px-4 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-[#F0F0F0] to-[#FAFAFA] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ImageIcon className="w-7 h-7 text-[#CCC]" />
                </div>
                <p className="text-sm font-medium text-[#555]">No posts yet</p>
                <p className="text-xs text-[#BBB] mt-1">Your AI-generated posters will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {posts.map((post) => (
                  <div key={post.id} className="group bg-white border border-[#F0F0F0] rounded-xl overflow-hidden hover:shadow-md hover:border-[#DDD] transition-all">
                    {post.image_url && (
                      <div className="relative aspect-square bg-[#F9FAFB]">
                        <img
                          src={post.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors" />
                      </div>
                    )}
                    <div className="p-2.5 flex items-center justify-between gap-1">
                      <span className="text-[10px] text-[#999] font-medium">
                        {new Date(post.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                      </span>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {post.image_url && (
                          <a
                            href={post.image_url}
                            download
                            className="p-1.5 rounded-lg hover:bg-[#F0F0F0] text-[#555] hover:text-black transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-[#999] hover:text-[#DC2626] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
