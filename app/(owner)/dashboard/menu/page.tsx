"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { DishCard } from "@/components/owner/DishCard"
import { AddDishForm } from "@/components/owner/AddDishForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Store, UtensilsCrossed, Eye, EyeOff, Pencil, Search, FolderPlus, Image as ImageIcon, AlertTriangle, ArrowRight } from "lucide-react"
import type { Category, Dish } from "@/types"
import { useSubscription } from "@/lib/hooks/useSubscription"
import Link from "next/link"

export default function MenuManagementPage() {
  const sub = useSubscription()
  const { restaurant, dishCount, imageCount, canAddDish, canUploadImage, planLimits, status, refresh } = sub
  const [categories, setCategories] = useState<Category[]>([])
  const [dishes, setDishes] = useState<Dish[]>([])
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [categoryNameEn, setCategoryNameEn] = useState("")
  const [categoryNameUr, setCategoryNameUr] = useState("")
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState("")
  const [limitError, setLimitError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!restaurant?.id) return
    const supabase = createClient()
    try {
      const [catsRes, dishesRes] = await Promise.all([
        supabase.from("categories").select("*").eq("restaurant_id", restaurant.id).order("sort_order"),
        supabase.from("dishes").select("*").eq("restaurant_id", restaurant.id).order("sort_order"),
      ])
      setCategories(catsRes.data || [])
      setDishes(dishesRes.data || [])
    } catch (err) {
      console.error("Menu fetch error:", err)
    }
    setLoading(false)
  }, [restaurant?.id])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 8000)
    fetchData()
    return () => clearTimeout(timer)
  }, [fetchData])

  const compressImage = (file: File, maxW = 600): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ratio = Math.min(maxW / img.width, 1)
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        const ctx = canvas.getContext("2d")!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error("Compression failed")), "image/webp", 0.8)
      }
      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = URL.createObjectURL(file)
    })

  const uploadImage = async (file: File, restaurantId: string): Promise<string | null> => {
    const supabase = createClient()
    const ext = "webp"
    const path = `${restaurantId}-${Date.now()}.${ext}`
    const compressed = await compressImage(file).catch(() => file)
    const { error } = await supabase.storage.from("dish-images").upload(path, compressed)
    if (error) {
      console.error("Image upload error:", error.message)
      return null
    }
    const { data: urlData } = supabase.storage.from("dish-images").getPublicUrl(path)
    return urlData.publicUrl
  }

  const handleAddDish = async (formData: any) => {
    if (!restaurant?.id) return
    setLimitError(null)

    if (!canAddDish) {
      setLimitError(
        `You've reached your plan's limit of ${planLimits.maxDishes} dishes. Upgrade to add more.`
      )
      return
    }

    if (formData.imageFile && !canUploadImage) {
      setLimitError(
        `You've reached your plan's limit of ${planLimits.maxImages} images. Upgrade to add more.`
      )
      return
    }

    setSubmitting(true)

    try {
      const supabase = createClient()
      let image_url: string | null = null

      if (formData.imageFile) {
        image_url = await uploadImage(formData.imageFile, restaurant.id)
      }

      const res = await fetch("/api/owner/dishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_en: formData.name_en,
          name_ur: formData.name_ur || null,
          description_en: formData.description_en || null,
          description_ur: formData.description_ur || null,
          price: formData.price,
          category_id: formData.category_id,
          image_url,
          tags: formData.tags || [],
        }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        if (json.error === "DISH_LIMIT_REACHED" || json.error === "IMAGE_LIMIT_REACHED") {
          setLimitError(json.message)
          return
        }
        throw new Error(json.error || "Failed to add dish")
      }

      setShowAddModal(false)
      await refresh()
      fetchData()
    } catch (err: any) {
      console.error("Add dish error:", err)
      setLimitError(err?.message || "Failed to add dish")
    }

    setSubmitting(false)
  }

  const handleEditDish = async (formData: any) => {
    if (!editingDish || !restaurant?.id) return
    setLimitError(null)

    if (formData.imageFile && !canUploadImage && !editingDish.image_url) {
      setLimitError(
        `You've reached your plan's limit of ${planLimits.maxImages} images. Upgrade to add more.`
      )
      return
    }

    setSubmitting(true)

    try {
      const supabase = createClient()
      let image_url = editingDish.image_url

      if (formData.imageFile) {
        image_url = await uploadImage(formData.imageFile, restaurant.id)
      }

      const res = await fetch("/api/owner/dishes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingDish.id,
          name_en: formData.name_en,
          name_ur: formData.name_ur || null,
          description_en: formData.description_en || null,
          description_ur: formData.description_ur || null,
          price: formData.price,
          category_id: formData.category_id,
          image_url,
          tags: formData.tags || [],
        }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        if (json.error === "IMAGE_LIMIT_REACHED" || json.error === "DISH_LIMIT_REACHED") {
          setLimitError(json.message)
          return
        }
        throw new Error(json.error || "Failed to update dish")
      }

      setEditingDish(null)
      await refresh()
      fetchData()
    } catch (err: any) {
      console.error("Edit dish error:", err)
      setLimitError(err?.message || "Failed to update dish")
    }

    setSubmitting(false)
  }

  const handleDeleteDish = async (dishId: string) => {
    const supabase = createClient()
    await supabase.from("dishes").delete().eq("id", dishId)
    await refresh()
    fetchData()
  }

  const handleToggleAvailability = async (dishId: string, is_available: boolean) => {
    const supabase = createClient()
    await supabase.from("dishes").update({ is_available }).eq("id", dishId)
    fetchData()
  }

  const handleAddCategory = () => {
    setCategoryNameEn("")
    setCategoryNameUr("")
    setCategoryError(null)
    setShowAddCategoryModal(true)
  }

  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = categoryNameEn.trim()
    if (!name) {
      setCategoryError("Name is required")
      return
    }
    if (!restaurant?.id) return
    setSubmitting(true)
    try {
      const supabase = createClient()
      await supabase.from("categories").insert({
        restaurant_id: restaurant.id,
        name_en: name,
        name_ur: categoryNameUr.trim() || null,
        sort_order: categories.length,
      })
      setShowAddCategoryModal(false)
      fetchData()
    } catch (err) {
      console.error("Add category error:", err)
      setCategoryError("Failed to add category")
    }
    setSubmitting(false)
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category and all its dishes?")) return
    const supabase = createClient()
    await supabase.from("categories").delete().eq("id", id)
    fetchData()
  }

  const closeModal = () => {
    setShowAddModal(false)
    setEditingDish(null)
    setLimitError(null)
  }

  const totalDishes = dishes.length
  const activeDishes = dishes.filter((d) => d.is_available).length
  const hiddenDishes = totalDishes - activeDishes
  const filteredDishes = search
    ? dishes.filter((d) =>
        d.name_en.toLowerCase().includes(search.toLowerCase()) ||
        (d.name_ur || "").toLowerCase().includes(search.toLowerCase())
      )
    : dishes

  const filteredCategories = activeCategory
    ? categories.filter((c) => c.id === activeCategory)
    : categories

  const trialExpired = status?.isExpired === true
  const graceActive = status?.isInGracePeriod === true

  if (loading) {
    return (
      <div>
        <div className="h-8 w-48 bg-[#E8E8E8] rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-[#E8E8E8] rounded-[10px] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-[14px] border border-[#E8E8E8]">
        <div className="w-14 h-14 rounded-full bg-[#F8F8F8] flex items-center justify-center overflow-hidden flex-shrink-0">
          {restaurant?.logo_url ? (
            <img
              src={restaurant.logo_url}
              alt={restaurant.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = "none"
                const parent = target.parentElement
                if (parent) {
                  const fallback = document.createElement("span")
                  fallback.className = "text-2xl font-bold text-[#555]"
                  fallback.textContent = restaurant.name[0]
                  parent.appendChild(fallback)
                }
              }}
            />
          ) : (
            <span className="text-2xl font-bold text-[#555]">
              {restaurant?.name ? restaurant.name[0] : <Store className="w-6 h-6 text-[#999]" />}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-[#111] truncate">{restaurant?.name || "Menu Management"}</h1>
          <p className="text-sm text-[#555]">{restaurant?.city}{restaurant?.cuisine_type ? ` • ${restaurant.cuisine_type}` : ""}</p>
        </div>
      </div>

      {(trialExpired || graceActive) && (
        <div className={`mb-4 rounded-[14px] p-4 flex items-start gap-3 ${
          trialExpired
            ? "bg-[#DC2626]/10 border border-[#DC2626]/30"
            : "bg-[#D97706]/10 border border-[#D97706]/30"
        }`}>
          <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${trialExpired ? "text-[#DC2626]" : "text-[#D97706]"}`} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${trialExpired ? "text-[#DC2626]" : "text-[#D97706]"}`}>
              {trialExpired ? "Trial expired — upgrade to continue" : "Trial ended — grace period active"}
            </p>
            <p className="text-xs text-[#555] mt-0.5">
              Your data is saved. Upgrade to add new dishes and accept new orders.
            </p>
            <Link
              href="/dashboard/subscription"
              className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-[#FF6B35] hover:underline"
            >
              Choose a plan <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-3 md:p-4">
          <div className="flex items-center gap-1.5 text-xs text-[#999] mb-1">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            Dishes
          </div>
          <p className="text-xl md:text-2xl font-bold text-[#111]">
            {totalDishes}
            <span className="text-xs font-normal text-[#999] ml-1">
              / {planLimits.maxDishes === Infinity ? "∞" : planLimits.maxDishes}
            </span>
          </p>
        </div>
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-3 md:p-4">
          <div className="flex items-center gap-1.5 text-xs text-[#16A34A] mb-1">
            <Eye className="w-3.5 h-3.5" />
            Active
          </div>
          <p className="text-xl md:text-2xl font-bold text-[#16A34A]">{activeDishes}</p>
        </div>
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-3 md:p-4">
          <div className="flex items-center gap-1.5 text-xs text-[#555] mb-1">
            <ImageIcon className="w-3.5 h-3.5" />
            Images
          </div>
          <p className="text-xl md:text-2xl font-bold text-[#111]">
            {imageCount}
            <span className="text-xs font-normal text-[#999] ml-1">
              / {planLimits.maxImages === Infinity ? "∞" : planLimits.maxImages}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes..."
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-[#E8E8E8] text-sm placeholder:text-[#999] focus:outline-none focus:border-black transition-colors"
          />
        </div>
        <Button size="sm" variant="ghost" onClick={handleAddCategory}>
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline ml-1">Category</span>
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            if (trialExpired) {
              setLimitError("Trial expired. Upgrade to add new dishes.")
              return
            }
            if (!canAddDish) {
              setLimitError(
                `You've reached your plan's limit of ${planLimits.maxDishes} dishes.`
              )
              return
            }
            setShowAddModal(true)
          }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline ml-1">Add Dish</span>
        </Button>
      </div>

      {limitError && (
        <div className="bg-[#FEF3C7] border border-[#D97706]/30 rounded-[10px] p-3 mb-4 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-[#92400E] font-medium">{limitError}</p>
            <Link
              href="/dashboard/subscription"
              className="text-xs text-[#FF6B35] font-semibold hover:underline"
            >
              Upgrade plan →
            </Link>
          </div>
          <button onClick={() => setLimitError(null)} className="text-[#92400E] text-xs">×</button>
        </div>
      )}

      {categories.length > 0 && (
        <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setActiveCategory(null)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !activeCategory
                ? "bg-black text-white"
                : "bg-white text-[#555] border border-[#E8E8E8] hover:bg-[#F8F8F8]"
            }`}
          >
            All ({dishes.length})
          </button>
          {categories.map((cat) => {
            const count = dishes.filter((d) => d.category_id === cat.id).length
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(isActive ? null : cat.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-black text-white"
                    : "bg-white text-[#555] border border-[#E8E8E8] hover:bg-[#F8F8F8]"
                }`}
              >
                {cat.name_en} ({count})
              </button>
            )
          })}
        </div>
      )}

      <div className="space-y-4">
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#F8F8F8] flex items-center justify-center mx-auto mb-3">
              <UtensilsCrossed className="w-6 h-6 text-[#999]" />
            </div>
            <p className="text-sm text-[#555] mb-3">No categories yet</p>
            <Button size="sm" variant="primary" onClick={handleAddCategory}>
              <Plus className="w-4 h-4 mr-1" /> Create your first category
            </Button>
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const catDishes = search
              ? filteredDishes.filter((d) => d.category_id === cat.id)
              : dishes.filter((d) => d.category_id === cat.id)
            if (catDishes.length === 0 && search) return null
            return (
              <div key={cat.id} className="bg-white rounded-[14px] border border-[#E8E8E8] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-[#F8F8F8] border-b border-[#E8E8E8]">
                  <div className="flex items-center gap-2 min-w-0">
                    <h2 className="text-sm font-semibold text-[#111] truncate">{cat.name_en}</h2>
                    {cat.name_ur && <span className="text-xs text-[#999] font-urdu flex-shrink-0">{cat.name_ur}</span>}
                    <span className="text-xs text-[#BBB] flex-shrink-0">({catDishes.length})</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-xs text-[#DC2626] hover:underline flex-shrink-0"
                  >
                    Delete
                  </button>
                </div>
                {catDishes.length === 0 ? (
                  <p className="text-sm text-[#999] py-6 text-center">No dishes in this category</p>
                ) : (
                  <div>
                    {catDishes.map((dish) => (
                      <DishCard
                        key={dish.id}
                        dish={dish}
                        onEdit={(d) => setEditingDish(d)}
                        onDelete={handleDeleteDish}
                        onToggleAvailability={handleToggleAvailability}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <Dialog open={showAddModal || !!editingDish} onOpenChange={(open) => { if (!open) closeModal() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingDish ? <><Pencil className="w-4 h-4" /> Edit Dish</> : <><Plus className="w-4 h-4" /> Add New Dish</>}
            </DialogTitle>
          </DialogHeader>
          {limitError && (
            <div className="bg-[#FEF3C7] border border-[#D97706]/30 rounded-[10px] p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-[#92400E]">{limitError}</p>
                <Link
                  href="/dashboard/subscription"
                  className="text-xs text-[#FF6B35] font-semibold hover:underline"
                >
                  Upgrade plan →
                </Link>
              </div>
            </div>
          )}
          <AddDishForm
            categories={categories}
            initialData={editingDish ? {
              name_en: editingDish.name_en,
              name_ur: editingDish.name_ur ?? undefined,
              description_en: editingDish.description_en ?? undefined,
              description_ur: editingDish.description_ur ?? undefined,
              price: editingDish.price,
              category_id: editingDish.category_id ?? "",
              image_url: editingDish.image_url,
              tags: editingDish.tags || [],
            } : undefined}
            submitting={submitting}
            onSubmit={editingDish ? handleEditDish : handleAddDish}
            onCancel={closeModal}
            imageUploadAllowed={canUploadImage}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showAddCategoryModal} onOpenChange={(open) => { if (!open) setShowAddCategoryModal(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="w-4 h-4" /> Add New Category
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitCategory} className="space-y-4">
            <Input
              label="Name (English) *"
              id="category_name_en"
              value={categoryNameEn}
              onChange={(e) => { setCategoryNameEn(e.target.value); if (categoryError) setCategoryError(null) }}
              placeholder="e.g. Starters"
              error={categoryError || undefined}
              autoFocus
            />
            <div className="space-y-1.5">
              <label htmlFor="category_name_ur" className="block text-sm font-medium text-[#111] font-urdu">
                Name (Urdu)
              </label>
              <input
                id="category_name_ur"
                value={categoryNameUr}
                onChange={(e) => setCategoryNameUr(e.target.value)}
                placeholder="مثلاً سٹارٹرز"
                className="flex h-12 w-full rounded-[10px] bg-[#F8F8F8] border border-[#E8E8E8] px-4 py-3 text-base placeholder:text-[#999] focus:outline-none focus:border-black transition-colors font-urdu"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowAddCategoryModal(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
