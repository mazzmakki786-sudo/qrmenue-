"use client"

import { useEffect, useState, useCallback } from "react"
import { useToastStore, type Toast } from "@/stores/toastStore"
import { X, CheckCircle, AlertCircle, Info, BellRing } from "lucide-react"
import { playNotification, playStatusChange, playOrderConfirmed } from "@/lib/sound"

const TYPE_STYLES: Record<string, { bg: string; icon: typeof CheckCircle }> = {
  success: { bg: "bg-black", icon: CheckCircle },
  error: { bg: "bg-[#DC2626]", icon: AlertCircle },
  info: { bg: "bg-[#2563EB]", icon: Info },
  order: { bg: "bg-[#25D366]", icon: BellRing },
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false)

  const handleDismiss = useCallback(() => {
    setExiting(true)
    setTimeout(() => onDismiss(toast.id), 250)
  }, [toast.id, onDismiss])

  const style = TYPE_STYLES[toast.type] || TYPE_STYLES.info
  const Icon = style.icon

  return (
    <div
      className={`
        pointer-events-auto w-full sm:w-[360px] rounded-2xl p-4 shadow-2xl
        text-white cursor-pointer select-none
        active:scale-[0.98] transition-transform duration-150
        ${exiting ? "animate-toast-exit" : "animate-toast-enter"}
        ${style.bg}
      `}
      style={{
        touchAction: "pan-y",
        willChange: "transform, opacity",
      }}
      onClick={handleDismiss}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleDismiss()
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Icon className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">{toast.title}</p>
            <p className="text-xs opacity-80 mt-0.5">{toast.message}</p>
            {toast.action && (
              <a
                href={toast.action.url}
                onClick={(e) => e.stopPropagation()}
                className="inline-block mt-2 text-xs font-semibold underline opacity-90 hover:opacity-100"
              >
                {toast.action.label}
              </a>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDismiss()
          }}
          className="p-1 hover:bg-white/10 rounded-lg shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* Pure CSS progress bar — no RAF, no React re-renders */}
      <div className="mt-2 h-0.5 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white/60 rounded-full"
          style={{
            animation: `toast-progress ${toast.duration || 4000}ms linear forwards`,
          }}
        />
      </div>
    </div>
  )
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)
  const [mounted, setMounted] = useState(false)
  const [playedIds, setPlayedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setMounted(true)
  }, [])

  // Play sound for new toasts with sound: true
  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.sound && !playedIds.has(toast.id)) {
        setPlayedIds((prev) => new Set(prev).add(toast.id))
        if (toast.type === "order") {
          playOrderConfirmed()
        } else if (toast.type === "success") {
          playStatusChange()
        } else {
          playNotification()
        }
      }
    })
  }, [toasts, playedIds])

  if (!mounted) return null

  return (
    <div
      className="fixed z-[70] pointer-events-none"
      style={{
        top: "env(safe-area-inset-top, 8px)",
        left: 0,
        right: 0,
      }}
    >
      <div className="flex flex-col items-center sm:items-end gap-3 p-4 sm:pr-6">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </div>
  )
}
