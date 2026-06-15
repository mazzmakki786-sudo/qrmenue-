"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { DishCard } from "@/components/owner/DishCard"
import { AddDishForm } from "@/components/owner/AddDishForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Store, UtensilsCrossed, Eye, EyeOff, Pencil, Search, FolderPlus, Image as ImageIcon, AlertTriangle, ArrowRight, X, Undo2 } from "lucide-react"
import type { Category, Dish } from "@/types"
import { useSubscription } from "@/lib/hooks/useSubscription"
import Link from "next/link"
import Image from "next/image"

export default function MenuManagementPage() {
  const sub = useSubscription()
  const { restaurant, dishCount, imageCount, canAddDish, canAddCategory, canUploadImage, planLimits, status, refresh, isSuspended } = sub
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
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [logoError, setLogoError] = useState(false)
  const [selectedDishes, setSelectedDishes] = useState<Set<string>>(new Set())
  const [undoToast, setUndoToast] = useState<{ message: string; undo: () => void } | null>(null)

  const fetchData = useCallback(async () => {
    if (!restaurant?.id) {
      setLoading(false)
      return
    }
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
    } finally {
      setLoading(false)
    }
  }, [restaurant?.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const compressImage = (file: File, maxW = 600): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const img = new window.Image()
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
    const dishToDelete = dishes.find((d) => d.id === dishId)
    const supabase = createClient()
    await supabase.from("dishes").delete().eq("id", dishId)
    await refresh()
    fetchData()

    setUndoToast({
      message: `"${dishToDelete?.name_en || ""}" deleted`,
      undo: async () => {
        if (dishToDelete) {
          const res = await fetch("/api/owner/dishes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name_en: dishToDelete.name_en,
              name_ur: dishToDelete.name_ur,
              description_en: dishToDelete.description_en,
              description_ur: dishToDelete.description_ur,
              price: dishToDelete.price,
              category_id: dishToDelete.category_id,
              image_url: dishToDelete.image_url,
              tags: dishToDelete.tags || [],
            }),
          })
          if (res.ok) {
            await refresh()
            fetchData()
          }
        }
        setUndoToast(null)
      },
    })
    setTimeout(() => setUndoToast(null), 5000)
  }

  const handleToggleAvailability = async (dishId: string, is_available: boolean) => {
    const supabase = createClient()
    await supabase.from("dishes").update({ is_available }).eq("id", dishId)
    fetchData()
  }

  const handleBatchToggle = async () => {
    const supabase = createClient()
    const selectedArray = Array.from(selectedDishes)
    const allAvailable = selectedArray.every((id) => dishes.find((d) => d.id === id)?.is_available)
    await supabase.from("dishes").update({ is_available: !allAvailable }).in("id", selectedArray)
    setSelectedDishes(new Set())
    fetchData()
  }

  const toggleSelectDish = (dishId: string) => {
    setSelectedDishes((prev) => {
      const next = new Set(prev)
      if (next.has(dishId)) next.delete(dishId)
      else next.add(dishId)
      return next
    })
  }

  const toggleSelectAll = () => {
    const filteredIds = filteredDishes.map((d) => d.id)
    if (selectedDishes.size === filteredIds.length) {
      setSelectedDishes(new Set())
    } else {
      setSelectedDishes(new Set(filteredIds))
    }
  }

  const handleAddCategory = () => {
    if (isSuspended) {
      setLimitError("Account is suspended. Cannot add categories.")
      return
    }
    if (!canAddCategory) {
      setLimitError(
        `You've reached your plan's limit of ${planLimits.maxCategories} categories.`
      )
      return
    }
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
    setCategoryError(null)
    try {
      const res = await fetch("/api/owner/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_en: name,
          name_ur: categoryNameUr.trim() || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        if (json.error === "CATEGORY_LIMIT_REACHED") {
          setLimitError(json.message)
          return
        }
        throw new Error(json.error || "Failed to add category")
      }
      setShowAddCategoryModal(false)
      fetchData()
    } catch (err) {
      console.error("Add category error:", err)
      setCategoryError("Failed to add category")
    }
    setSubmitting(false)
  }

  const handleDeleteCategory = async (id: string) => {
    setDeleteConfirm(id)
  }

  const confirmDeleteCategory = async () => {
    const id = deleteConfirm
    if (!id) return
    setDeleteConfirm(null)

    const catToDelete = categories.find((c) => c.id === id)
    const dishesToDelete = dishes.filter((d) => d.category_id === id)

    try {
      const res = await fetch("/api/owner/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const json = await res.json()
        console.error("Delete category error:", json.error)
        return
      }
      fetchData()

      setUndoToast({
        message: `Category "${catToDelete?.name_en || ""}" deleted`,
        undo: async () => {
          await fetch("/api/owner/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name_en: catToDelete?.name_en,
              name_ur: catToDelete?.name_ur,
              id,
            }),
          })
          fetchData()
          setUndoToast(null)
        },
      })
      setTimeout(() => setUndoToast(null), 5000)
    } catch (err) {
      console.error("Delete category error:", err)
    }
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
  const suspended = isSuspended === true

  if (loading) {
    return (
      <div>
        <div className="h-8 w-48 bg-[#F0F0F0] rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-[#F0F0F0] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-xl border border-[#F0F0F0]">
        <div className="w-14 h-14 rounded-full bg-[#F9FAFB] flex items-center justify-center overflow-hidden flex-shrink-0">
          {restaurant?.logo_url && !logoError ? (
            <Image
              src={restaurant.logo_url}
              alt={restaurant.name}
              width={56}
              height={56}
              className="w-full h-full object-cover"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-2xl font-bold text-[#555]">
              {restaurant?.name ? restaurant.name[0] : <Store className="w-6 h-6 text-[#999]" />}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-[#111] truncate">{restaurant?.name || "Menu Management"}</h1>
          <p className="text-sm text-[#555]">{restaurant?.city}{restaurant?.cuisine_type ? ` \u2022 ${restaurant.cuisine_type}` : ""}</p>
        </div>
      </div>

      {suspended && (
        <div className="mb-4 rounded-xl p-4 flex items-start gap-3 bg-[#FEF3C7] border border-[#D97706]/30">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#D97706]" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#92400E]">Account Suspended</p>
            <p className="text-xs text-[#555] mt-0.5">Your account has been suspended. Contact support for details.</p>
          </div>
        </div>
      )}

      {(trialExpired || graceActive) && (
        <div className={`mb-4 rounded-xl p-4 flex items-start gap-3 ${
          trialExpired
            ? "bg-[#DC2626]/10 border border-[#DC2626]/30"
            : "bg-[#D97706]/10 border border-[#D97706]/30"
        }`}>
          <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${trialExpired ? "text-[#DC2626]" : "text-[#D97706]"}`} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${trialExpired ? "text-[#DC2626]" : "text-[#D97706]"}`}>
              {trialExpired ? "Trial expired \u2014 upgrade to continue" : "Trial ended \u2014 grace period active"}
            </p>
            <p className="text-xs text-[#555] mt-0.5">
              Your data is saved. Upgrade to add new dishes and accept new orders.
            </p>
            <Link
              href="/dashboard/subscription"
              className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-[#25D366] hover:underline"
            >
              Choose a plan <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl border border-[#F0F0F0] p-3 md:p-4">
          <div className="flex items-center gap-1.5 text-xs text-[#999] mb-1">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            Dishes
          </div>
          <p className="text-xl md:text-2xl font-bold text-[#111]">
            {totalDishes}
            <span className="text-xs font-normal text-[#999] ml-1">
              / {planLimits.maxDishes === Infinity ? "8" : planLimits.maxDishes}
            </span>
          </p>
        </div>
        <div className="bg-white rounded-xl border border-[#F0F0F0] p-3 md:p-4">
          <div className="flex items-center gap-1.5 text-xs text-[#16A34A] mb-1">
            <Eye className="w-3.5 h-3.5" />
            Active
          </div>
          <p className="text-xl md:text-2xl font-bold text-[#16A34A]">{activeDishes}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#F0F0F0] p-3 md:p-4">
          <div className="flex items-center gap-1.5 text-xs text-[#555] mb-1">
            <ImageIcon className="w-3.5 h-3.5" />
            Images
          </div>
          <p className="text-xl md:text-2xl font-bold text-[#111]">
            {imageCount}
            <span className="text-xs font-normal text-[#999] ml-1">
              / {planLimits.maxImages === Infinity ? "8" : planLimits.maxImages}
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
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-[#F0F0F0] text-sm placeholder:text-[#999] focus:outline-none focus:border-black transition-colors"
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
        <div className="bg-[#FEF3C7] border border-[#D97706]/30 rounded-xl p-3 mb-4 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-[#92400E] font-medium">{limitError}</p>
            <Link
              href="/dashboard/subscription"
              className="text-xs text-[#25D366] font-semibold hover:underline"
            >
              Upgrade plan &rarr;
            </Link>
          </div>
            <button onClick={() => setLimitError(null)} className="text-[#92400E] p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-[#D97706]/10 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
        </div>
      )}

      {selectedDishes.size > 0 && (
        <div className="bg-black text-white rounded-xl p-3 mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedDishes.size === filteredDishes.length && filteredDishes.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded accent-white"
            />
            <span className="text-sm font-medium">{selectedDishes.size} selected</span>
          </div>
          <button
            onClick={handleBatchToggle}
            className="px-4 py-1.5 bg-white text-black text-xs font-semibold rounded-full hover:bg-[#F0F0F0] transition-colors"
          >
            Toggle Availability
          </button>
        </div>
      )}

      {categories.length > 0 && (
        <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setActiveCategory(null)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !activeCategory
                ? "bg-black text-white"
                : "bg-white text-[#555] border border-[#F0F0F0] hover:bg-[#F9FAFB]"
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
                    : "bg-white text-[#555] border border-[#F0F0F0] hover:bg-[#F9FAFB]"
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
          <div className="bg-white rounded-xl border border-[#F0F0F0] p-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#F9FAFB] flex items-center justify-center mx-auto mb-3">
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
              <div key={cat.id} className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-[#F9FAFB] border-b border-[#F0F0F0]">
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
                        selected={selectedDishes.has(dish.id)}
                        onSelect={toggleSelectDish}
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
            <div className="bg-[#FEF3C7] border border-[#D97706]/30 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-[#92400E]">{limitError}</p>
                <Link
                  href="/dashboard/subscription"
                  className="text-xs text-[#25D366] font-semibold hover:underline"
                >
                  Upgrade plan ?
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
                placeholder="????? ???????"
                className="flex h-12 w-full rounded-xl bg-[#F9FAFB] border border-[#F0F0F0] px-4 py-3 text-base placeholder:text-[#999] focus:outline-none focus:border-black transition-colors font-urdu"
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

      <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#DC2626]">
              <AlertTriangle className="w-4 h-4" /> Delete Category
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-[#555]">
              Are you sure you want to delete this category and all its dishes? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <button
                onClick={confirmDeleteCategory}
                className="flex-1 px-4 py-3 rounded-xl bg-[#DC2626] text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Delete Category
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Undo Toast */}
      {undoToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-2xl animate-slide-up max-w-sm w-[calc(100%-2rem)]">
          <span className="text-sm flex-1 min-w-0 truncate">{undoToast.message}</span>
          <button
            onClick={() => { undoToast.undo(); setUndoToast(null) }}
            className="text-xs font-semibold text-[#25D366] hover:underline flex items-center gap-1 shrink-0"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Undo
          </button>
        </div>
      )}
    </div>
  )
}
