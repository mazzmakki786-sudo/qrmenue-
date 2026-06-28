"use client"

import { useEffect, useState, useCallback } from "react"
import { Sparkles, Search, ExternalLink, Shield, Plus, Minus, Eye } from "lucide-react"
import Image from "next/image"

interface AiRestaurant {
  id: string
  name: string
  slug: string
  plan: string
  logo_url: string | null
  is_active: boolean
  is_suspended: boolean
  monthlyLimit: number
  used: number
  remaining: number
  plan_limits_override: Record<string, number> | null
}

interface AiPost {
  id: string
  prompt: string
  image_url: string | null
  created_at: string
  language: string
  ratio: string
  restaurant: { name: string; slug: string; plan: string }
}

export default function SuperAdminAiManagement() {
  const [restaurants, setRestaurants] = useState<AiRestaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<AiRestaurant | null>(null)
  const [posts, setPosts] = useState<AiPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [overrideValue, setOverrideValue] = useState("")
  const [bonusValue, setBonusValue] = useState("")
  const [previewPost, setPreviewPost] = useState<AiPost | null>(null)

  const fetchRestaurants = useCallback(async () => {
    try {
      const res = await fetch("/api/superadmin/ai/restaurants")
      if (!res.ok) throw new Error("Failed")
      const json = await res.json()
      setRestaurants(json.restaurants || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPosts = useCallback(async (restaurantId: string) => {
    try {
      const res = await fetch(`/api/superadmin/ai/history?restaurant_id=${restaurantId}`)
      if (!res.ok) throw new Error("Failed")
      const json = await res.json()
      setPosts(json.posts || [])
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => { fetchRestaurants() }, [fetchRestaurants])

  const handleRestaurantClick = async (r: AiRestaurant) => {
    setSelectedRestaurant(r)
    setOverrideValue(r.plan_limits_override?.aiPostsPerMonth?.toString() || "")
    setBonusValue("")
    await fetchPosts(r.id)
  }

  const handleOverrideLimit = async () => {
    if (!selectedRestaurant || !overrideValue) return
    try {
      const res = await fetch("/api/superadmin/ai/restaurants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: selectedRestaurant.id,
          ai_posts_per_month: parseInt(overrideValue),
        }),
      })
      if (res.ok) {
        await fetchRestaurants()
        setSelectedRestaurant(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleGiveBonus = async () => {
    if (!selectedRestaurant || !bonusValue) return
    try {
      const res = await fetch("/api/superadmin/ai/restaurants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: selectedRestaurant.id,
          bonus_generations: parseInt(bonusValue),
        }),
      })
      if (res.ok) {
        await fetchRestaurants()
        setSelectedRestaurant(null)
        setBonusValue("")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div>
        <div className="h-8 w-64 bg-[#F0F0F0] rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-[#F0F0F0] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#111]">AI Management</h1>
          <p className="text-xs text-[#555]">
            {restaurants.length} restaurant{restaurants.length !== 1 ? "s" : ""} on Growth/Premium
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Restaurant List */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-[#F0F0F0]">
            <div className="p-4 border-b border-[#F0F0F0]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search restaurants..."
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#F9FAFB] border border-[#F0F0F0] text-sm focus:outline-none focus:border-black"
                />
              </div>
            </div>
            <div className="divide-y divide-[#F0F0F0] max-h-[600px] overflow-y-auto">
              {filtered.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRestaurantClick(r)}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-[#F9FAFB] transition-colors ${
                    selectedRestaurant?.id === r.id ? "bg-[#F0F0F0]" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#F9FAFB] flex items-center justify-center overflow-hidden shrink-0">
                    {r.logo_url ? (
                      <Image src={r.logo_url} alt="" width={32} height={32} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-[#555]">{r.name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111] truncate">{r.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        r.plan === "premium" ? "bg-[#FFF7ED] text-[#EA580C]" : "bg-[#EFF6FF] text-[#2563EB]"
                      }`}>{r.plan}</span>
                      <span className={`text-[10px] ${r.remaining > 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                        {r.used}/{r.monthlyLimit} used
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#999] shrink-0" />
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-sm text-[#999]">No restaurants found</div>
              )}
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-7 space-y-4">
          {!selectedRestaurant ? (
            <div className="bg-white rounded-2xl border border-[#F0F0F0] p-12 text-center">
              <Sparkles className="w-10 h-10 text-[#CCC] mx-auto mb-3" />
              <p className="text-sm text-[#555]">Select a restaurant to manage AI settings</p>
            </div>
          ) : (
            <>
              {/* Controls */}
              <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5 space-y-4">
                <h3 className="text-sm font-bold">{selectedRestaurant.name}</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-[#F9FAFB] rounded-xl p-3">
                    <p className="text-lg font-bold text-[#111]">{selectedRestaurant.monthlyLimit}</p>
                    <p className="text-[10px] text-[#555]">Monthly Limit</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-xl p-3">
                    <p className="text-lg font-bold text-[#2563EB]">{selectedRestaurant.used}</p>
                    <p className="text-[10px] text-[#555]">Used</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-xl p-3">
                    <p className={`text-lg font-bold ${selectedRestaurant.remaining > 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                      {selectedRestaurant.remaining}
                    </p>
                    <p className="text-[10px] text-[#555]">Remaining</p>
                  </div>
                </div>

                <div className="border-t border-[#F0F0F0] pt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#555] mb-1">Override Monthly Limit</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={overrideValue}
                        onChange={(e) => setOverrideValue(e.target.value)}
                        placeholder="New limit"
                        className="flex-1 h-10 rounded-xl bg-[#F8F8F8] border border-[#E8E8E8] px-4 text-sm focus:outline-none focus:border-black"
                      />
                      <button
                        onClick={handleOverrideLimit}
                        className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-xl hover:opacity-90"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#555] mb-1">Give Bonus Generations</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={bonusValue}
                        onChange={(e) => setBonusValue(e.target.value)}
                        placeholder="Extra count"
                        className="flex-1 h-10 rounded-xl bg-[#F8F8F8] border border-[#E8E8E8] px-4 text-sm focus:outline-none focus:border-black"
                      />
                      <button
                        onClick={handleGiveBonus}
                        className="px-4 py-2 bg-[#25D366] text-white text-sm font-semibold rounded-xl hover:opacity-90 items-center gap-1 flex"
                      >
                        <Plus className="w-4 h-4" /> Give
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts History */}
              <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5">
                <h3 className="text-sm font-bold mb-3">
                  Generation History ({posts.length})
                </h3>
                {posts.length === 0 ? (
                  <p className="text-xs text-[#999] text-center py-4">No posts generated yet</p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {posts.map((post) => (
                      <div key={post.id} className="bg-[#F9FAFB] rounded-xl p-3 flex items-center gap-3">
                        {post.image_url ? (
                          <button
                            onClick={() => setPreviewPost(post)}
                            className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[#E8E8E8]"
                          >
                            <img
                              src={post.image_url}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                            />
                          </button>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-[#E8E8E8] flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5 text-[#999]" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#555] line-clamp-1">{post.prompt}</p>
                          <p className="text-[10px] text-[#999] mt-0.5">
                            {new Date(post.created_at).toLocaleString()}
                            {post.language === "ur" && " • Urdu"}
                            {post.ratio && ` • ${post.ratio}`}
                          </p>
                        </div>
                        {post.image_url && (
                          <button
                            onClick={() => setPreviewPost(post)}
                            className="p-1.5 rounded-lg hover:bg-white"
                            title="Preview"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#555]" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewPost && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setPreviewPost(null)}
        >
          <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            {previewPost.image_url && (
              <img src={previewPost.image_url} alt="Post preview" className="w-full" />
            )}
            <div className="p-4">
              <p className="text-sm font-medium text-[#111]">{previewPost.restaurant.name}</p>
              <p className="text-xs text-[#555] mt-1">{previewPost.prompt}</p>
              <p className="text-[10px] text-[#999] mt-2">
                {new Date(previewPost.created_at).toLocaleString()}
                {previewPost.language === "ur" && " • Urdu"}
              </p>
              <button
                onClick={() => setPreviewPost(null)}
                className="mt-3 w-full py-2 bg-black text-white text-sm font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
