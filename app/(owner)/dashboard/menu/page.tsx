"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { DishCard } from "@/components/owner/DishCard"
import { AddDishForm } from "@/components/owner/AddDishForm"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import type { Category, Dish } from "@/types"

export default function MenuManagementPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [dishes, setDishes] = useState<Dish[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .single()

    if (!restaurant) return
    setRestaurantId(restaurant.id)

    const [catsRes, dishesRes] = await Promise.all([
      supabase.from("categories").select("*").eq("restaurant_id", restaurant.id).order("sort_order"),
      supabase.from("dishes").select("*").eq("restaurant_id", restaurant.id).order("sort_order"),
    ])

    setCategories(catsRes.data || [])
    setDishes(dishesRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const uploadImage = async (file: File, restaurantId: string): Promise<string | null> => {
    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const path = `dish-images/${restaurantId}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from("dish-images").upload(path, file)
    if (error) return null
    const { data: urlData } = supabase.storage.from("dish-images").getPublicUrl(path)
    return urlData.publicUrl
  }

  const handleAddDish = async (formData: any) => {
    if (!restaurantId) return
    const supabase = createClient()

    let image_url: string | null = null
    if (formData.imageFile) {
      image_url = await uploadImage(formData.imageFile, restaurantId)
    }

    await supabase.from("dishes").insert({
      name_en: formData.name_en,
      name_ur: formData.name_ur || null,
      description_en: formData.description_en || null,
      description_ur: formData.description_ur || null,
      price: formData.price,
      category_id: formData.category_id,
      restaurant_id: restaurantId,
      image_url,
      is_available: true,
    })

    setShowAddForm(false)
    fetchData()
  }

  const handleEditDish = async (formData: any) => {
    if (!editingDish || !restaurantId) return
    const supabase = createClient()

    let image_url = editingDish.image_url
    if (formData.imageFile) {
      image_url = await uploadImage(formData.imageFile, restaurantId)
    }

    await supabase.from("dishes").update({
      name_en: formData.name_en,
      name_ur: formData.name_ur || null,
      description_en: formData.description_en || null,
      description_ur: formData.description_ur || null,
      price: formData.price,
      category_id: formData.category_id,
      image_url,
    }).eq("id", editingDish.id)

    setEditingDish(null)
    fetchData()
  }

  const handleDeleteDish = async (dishId: string) => {
    const supabase = createClient()
    await supabase.from("dishes").delete().eq("id", dishId)
    fetchData()
  }

  const handleToggleAvailability = async (dishId: string, is_available: boolean) => {
    const supabase = createClient()
    await supabase.from("dishes").update({ is_available }).eq("id", dishId)
    fetchData()
  }

  const handleAddCategory = async () => {
    const name = prompt("Category name (English):")
    if (!name || !restaurantId) return
    const supabase = createClient()
    await supabase.from("categories").insert({
      restaurant_id: restaurantId,
      name_en: name,
      sort_order: categories.length,
    })
    fetchData()
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category and all its dishes?")) return
    const supabase = createClient()
    await supabase.from("categories").delete().eq("id", id)
    fetchData()
  }

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Menu Management</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={handleAddCategory}>+ Category</Button>
          <Button size="sm" variant="primary" onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Dish
          </Button>
        </div>
      </div>

      {(showAddForm || editingDish) && (
        <div className="bg-[#F8F8F8] rounded-[14px] p-5 mb-6 max-w-lg">
          <h2 className="font-semibold mb-4">{editingDish ? "Edit Dish" : "Add New Dish"}</h2>
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
            } : undefined}
            onSubmit={editingDish ? handleEditDish : handleAddDish}
            onCancel={() => { setShowAddForm(false); setEditingDish(null) }}
          />
        </div>
      )}

      {categories.map((cat) => {
        const catDishes = dishes.filter((d) => d.category_id === cat.id)
        return (
          <div key={cat.id} className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#999]">
                {cat.name_en}
                {cat.name_ur && <span className="font-urdu ml-2 normal-case">{cat.name_ur}</span>}
                <span className="ml-2 text-xs font-normal">({catDishes.length})</span>
              </h2>
              <button onClick={() => handleDeleteCategory(cat.id)} className="p-1 hover:bg-[#F8F8F8] rounded">
                <Trash2 className="w-4 h-4 text-[#DC2626]" />
              </button>
            </div>
            {catDishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                onEdit={(d) => setEditingDish(d)}
                onDelete={handleDeleteDish}
                onToggleAvailability={handleToggleAvailability}
              />
            ))}
            {catDishes.length === 0 && (
              <p className="text-sm text-[#999] py-3">No dishes in this category</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
