"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, Wand2, Check, Phone } from "lucide-react"
import {
  AI_TEMPLATES,
  AI_COLOR_SCHEMES,
  type AITemplateKey,
  type AIColorSchemeKey,
} from "@/lib/ai-generator"

interface DishOption {
  id: string
  name_en: string
  price: number
  image_url: string | null
}

interface AIPosterGeneratorProps {
  onGenerated: (gen: { id: string; image_url: string; status: string }) => void
  remaining: number
  limit: number
  onUsageChange: (usage: { usage: number; limit: number }) => void
}

/** Max dishes a poster can feature — keeps the artwork exact and the design clean. */
const MAX_DISHES = 2

export function AIPosterGenerator({
  onGenerated,
  remaining,
  limit,
  onUsageChange,
}: AIPosterGeneratorProps) {
  const { restaurant } = useSubscription()
  const [dishes, setDishes] = useState<DishOption[]>([])
  const [selectedDishIds, setSelectedDishIds] = useState<Set<string>>(new Set())
  const [templateKey, setTemplateKey] = useState<AITemplateKey>("classic")
  const [colorScheme, setColorScheme] = useState<AIColorSchemeKey>("appetizing")
  const [orderPhone, setOrderPhone] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [customPrompt, setCustomPrompt] = useState("")
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDishes = useCallback(async () => {
    if (!restaurant?.id) return
    const supabase = createClient()
    const { data } = await supabase
      .from("dishes")
      .select("id, name_en, price, image_url")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order")
    const list = data || []
    setDishes(list)
    // Auto-pick top 2 dishes by default (owner can edit)
    setSelectedDishIds(new Set(list.slice(0, MAX_DISHES).map((d) => d.id)))
  }, [restaurant?.id])

  useEffect(() => {
    loadDishes()
  }, [loadDishes])

  // Default the order phone box from the restaurant profile (editable).
  useEffect(() => {
    if (restaurant?.phone) setOrderPhone(restaurant.phone)
  }, [restaurant?.phone])

  const toggleDish = (id: string) => {
    setSelectedDishIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        return next
      }
      if (next.size >= MAX_DISHES) return prev
      next.add(id)
      return next
    })
  }

  const selectedDishes = dishes.filter((d) => selectedDishIds.has(d.id))

  const handleGenerate = async () => {
    setError(null)
    if (selectedDishes.length === 0 && !customPrompt.trim()) {
      setError("Select at least one dish (or write an advanced prompt).")
      return
    }
    if (remaining <= 0) {
      setError("You've reached your monthly AI poster limit. Upgrade your plan for more.")
      return
    }
    setGenerating(true)
    try {
      const res = await fetch("/api/owner/ai/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dishes: selectedDishes.map((d) => ({ name: d.name_en, price: d.price })),
          templateKey,
          colorScheme,
          orderPhone,
          customPrompt: showAdvanced ? customPrompt.trim() : undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.message || json.error || "Generation failed. Please try again.")
        return
      }
      onUsageChange({ usage: json.usage, limit: json.limit })
      onGenerated(json.generation)
    } catch {
      setError("Network error — check your internet connection and try again.")
    } finally {
      setGenerating(false)
    }
  }

  const canGenerate = remaining > 0 && !generating

  return (
    <div>
      <div className="bg-white rounded-2xl border border-[#EDEDED] p-5 md:p-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-black" />
            <h2 className="text-lg font-bold text-[#111]">Generate a Poster</h2>
          </div>
          <p className="text-sm text-[#666] mb-5">
            Pick up to 2 signature dishes — the AI draws exactly those dishes on your poster.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ── Dish selection (max 2) ── */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-[#333]">
                Signature dishes{" "}
                <span className="text-[#999] font-normal">({selectedDishes.length}/2 selected)</span>
              </label>
              <span className="text-xs text-[#999]">Pick up to 2 — the AI draws exactly these</span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {dishes.map((d) => {
                const selected = selectedDishIds.has(d.id)
                const locked = !selected && selectedDishIds.size >= MAX_DISHES
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDish(d.id)}
                    disabled={locked}
                    title={locked ? "You can feature up to 2 dishes" : d.name_en}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors min-h-[36px] ${
                      selected
                        ? "bg-black text-white border-black"
                        : locked
                          ? "bg-white text-[#BBB] border-[#EFEFEF] cursor-not-allowed"
                          : "bg-white text-[#555] border-[#E5E5E5] hover:border-black"
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                    {d.name_en}
                  </button>
                )
              })}
              {dishes.length === 0 && (
                <p className="text-sm text-[#999] w-full py-2">
                  No dishes yet — add dishes in the Menu tab first.
                </p>
              )}
            </div>
            {selectedDishIds.size >= MAX_DISHES && (
              <p className="text-xs text-[#999] mt-1.5">
                You can feature up to 2 dishes on one poster.
              </p>
            )}
          </div>

          {/* ── Order phone box ── */}
          <div className="mb-5">
            <label className="text-sm font-semibold text-[#333] mb-2 flex items-center gap-1.5">
              <Phone className="w-4 h-4" /> Order phone number
            </label>
            <input
              type="tel"
              value={orderPhone}
              onChange={(e) => setOrderPhone(e.target.value)}
              placeholder="e.g. 0300 1234567"
              className="w-full rounded-xl border border-[#E5E5E5] p-3 text-sm focus:border-black focus:outline-none"
            />
            <p className="text-xs text-[#999] mt-1">
              Shown in a call box on the poster so customers can order by phone.
            </p>
          </div>

          {/* ── Design template (3 choices) ── */}
          <div className="mb-5">
            <label className="text-sm font-semibold text-[#333] mb-2 block">Design Template</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(AI_TEMPLATES) as AITemplateKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTemplateKey(key)}
                  className={`text-left p-3 rounded-xl border transition-colors ${
                    templateKey === key
                      ? "border-black bg-[#FAFAFA]"
                      : "border-[#E5E5E5] hover:border-black"
                  }`}
                >
                  <span className="block text-sm font-semibold text-[#111]">{AI_TEMPLATES[key].label}</span>
                  <span className="block text-xs text-[#666] mt-0.5">{AI_TEMPLATES[key].desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Color scheme (3 choices) ── */}
          <div className="mb-5">
            <label className="text-sm font-semibold text-[#333] mb-2 block">Color Scheme</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.keys(AI_COLOR_SCHEMES) as AIColorSchemeKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColorScheme(key)}
                  className={`text-left p-3 rounded-xl border transition-colors ${
                    colorScheme === key
                      ? "border-black bg-[#FAFAFA]"
                      : "border-[#E5E5E5] hover:border-black"
                  }`}
                >
                  <span className="block text-sm font-semibold text-[#111]">{AI_COLOR_SCHEMES[key].label}</span>
                  <span className="block text-xs text-[#666] mt-0.5">{AI_COLOR_SCHEMES[key].desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Advanced prompt (optional) ── */}
          <div className="mb-5">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-sm font-semibold text-[#333] hover:text-black flex items-center gap-1.5"
            >
              <Wand2 className="w-4 h-4" />
              Advanced prompt {showAdvanced ? "▲" : "▼"}
            </button>
            {showAdvanced && (
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe the poster you want — e.g. 'A Biryani festival poster with marinated chicken, kachumber salad, and mint chutney on a rustic wooden table, warm candlelight...'"
                className="mt-2 w-full rounded-xl border border-[#E5E5E5] p-3 text-sm focus:border-black focus:outline-none min-h-[100px]"
              />
            )}
          </div>

          {/* ── Generate CTA ── */}
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full sm:w-auto"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Generating artwork… (10–60s)
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Poster
              </>
            )}
          </Button>
          <p className="text-xs text-[#999] mt-2">
            {remaining} of {limit} generations left this month. Failed attempts don&apos;t count.
          </p>
      </div>
    </div>
  )
}
