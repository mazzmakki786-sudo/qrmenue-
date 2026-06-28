"use client"

import { useState, useCallback } from "react"
import type { AiPost, AiUsage } from "@/types"

interface AiLimitResponse {
  allowed: boolean
  remaining: number
  limit: number
  used: number
  month: string
  message?: string
}

export function useAiPosts() {
  const [posts, setPosts] = useState<AiPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [limit, setLimit] = useState<AiLimitResponse | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/owner/ai/history")
      if (!res.ok) throw new Error("Failed to fetch posts")
      const json = await res.json()
      setPosts(json.posts || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLimit = useCallback(async () => {
    try {
      const res = await fetch("/api/owner/ai/check-limit")
      if (!res.ok) return
      const json = await res.json()
      setLimit(json)
    } catch {}
  }, [])

  const deletePost = useCallback(async (postId: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/owner/ai/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postId }),
      })
      if (!res.ok) return false
      await fetchPosts()
      return true
    } catch {
      return false
    }
  }, [fetchPosts])

  const refresh = useCallback(async () => {
    await Promise.all([fetchPosts(), fetchLimit()])
  }, [fetchPosts, fetchLimit])

  return {
    posts, loading, error, limit,
    fetchPosts, fetchLimit, deletePost, refresh,
  }
}
