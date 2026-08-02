import { create } from "zustand"

export type ToastType = "success" | "error" | "info" | "order" | "announcement"

export interface Toast {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
  sound?: boolean
  action?: { label: string; url: string }
  data?: Record<string, unknown>
}

interface ToastState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => string
  removeToast: (id: string) => void
  clearToasts: () => void
  dedupKey?: string
}

let toastCounter = 0

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++toastCounter}-${Date.now()}`
    const existing = get().toasts
    const dedupKey = toast.data?.order_id
      ? `${toast.data.order_id}-${toast.title}`
      : null
    if (dedupKey) {
      const duplicate = existing.find(
        (t) => t.data?.order_id === toast.data?.order_id && t.title === toast.title
      )
      if (duplicate) return duplicate.id
    }
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))
    if (toast.duration !== 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, toast.duration || 4000)
    }
    return id
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  clearToasts: () => {
    set({ toasts: [] })
  },
}))
