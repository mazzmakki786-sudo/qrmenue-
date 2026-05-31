"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, X } from "lucide-react"
import type { Category } from "@/types"

const dishSchema = z.object({
  name_en: z.string().min(1, "Name is required"),
  name_ur: z.string().optional(),
  description_en: z.string().optional(),
  description_ur: z.string().optional(),
  price: z.coerce.number().min(1, "Price is required"),
  category_id: z.string().min(1, "Category is required"),
})

type DishFormData = z.infer<typeof dishSchema>

interface Props {
  categories: Category[]
  onSubmit: (data: DishFormData & { imageFile?: File | null }) => void
  onCancel: () => void
  initialData?: Partial<DishFormData> & { image_url?: string | null }
}

export function AddDishForm({ categories, onSubmit, onCancel, initialData }: Props) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DishFormData>({
    resolver: zodResolver(dishSchema),
    defaultValues: initialData,
  })

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const onFormSubmit = (data: DishFormData) => {
    onSubmit({ ...data, imageFile })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-[#111] mb-2">Dish Image (optional)</label>
        {imagePreview ? (
          <div className="relative w-32 h-32 rounded-[10px] overflow-hidden border border-[#E8E8E8]">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-3 rounded-[10px] border border-dashed border-[#E8E8E8] text-sm text-[#555] hover:bg-[#F8F8F8] transition-colors"
          >
            <Camera className="w-4 h-4" />
            Upload photo
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
      </div>

      <Input label="Name (English) *" id="name_en" {...register("name_en")} error={errors.name_en?.message} />
      <Input label="Name (Urdu)" id="name_ur" {...register("name_ur")} />
      <div className="space-y-1.5">
        <label htmlFor="description_en" className="block text-sm font-medium text-[#111]">Description (English)</label>
        <textarea id="description_en" {...register("description_en")} className="flex h-20 w-full rounded-[10px] bg-[#F8F8F8] border border-[#E8E8E8] px-4 py-3 text-base placeholder:text-[#999] focus:outline-none focus:border-black transition-colors resize-none" />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="description_ur" className="block text-sm font-medium text-[#111] font-urdu">Description (Urdu)</label>
        <textarea id="description_ur" {...register("description_ur")} className="flex h-20 w-full rounded-[10px] bg-[#F8F8F8] border border-[#E8E8E8] px-4 py-3 text-base placeholder:text-[#999] focus:outline-none focus:border-black transition-colors resize-none" />
      </div>
      <Input label="Price (PKR) *" id="price" type="number" {...register("price")} error={errors.price?.message} />
      <div className="space-y-1.5">
        <label htmlFor="category_id" className="block text-sm font-medium text-[#111]">Category *</label>
        <select id="category_id" {...register("category_id")} className="flex h-12 w-full rounded-[10px] bg-[#F8F8F8] border border-[#E8E8E8] px-4 text-base focus:outline-none focus:border-black transition-colors">
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name_en}</option>
          ))}
        </select>
        {errors.category_id && <p className="text-xs text-[#DC2626]">{errors.category_id.message}</p>}
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Dish"}
        </Button>
      </div>
    </form>
  )
}
