"use client"

import { useEffect, useRef, useState } from "react"
import { useToastStore, type Toast } from "@/stores/toastStore"
import { X, CheckCircle, AlertCircle, Info, BellRing } from "lucide-react"

const TYPE_STYLES: Record<string, { bg: string; icon: typeof CheckCircle }> = {
  success: { bg: "bg-black", icon: CheckCircle },
  error: { bg: "bg-[#DC2626]", icon: AlertCircle },
  info: { bg: "bg-[#2563EB]", icon: Info },
  order: { bg: "bg-[#25D366]", icon: BellRing },
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [progress, setProgress] = useState(100)
  const [exiting, setExiting] = useState(false)
  const startRef = useRef(Date.now())
  const duration = toast.duration || 4000
  const rafRef = useRef<number>(0)

  useEffect(() => {
    startRef.current = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startRef.current
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [duration])

  const handleDismiss = () => {
    setExiting(true)
    setTimeout(() => onDismiss(toast.id), 200)
  }

  const style = TYPE_STYLES[toast.type] || TYPE_STYLES.info
  const Icon = style.icon

  return (
    <div
      className={`
        pointer-events-auto w-full sm:w-[360px] rounded-2xl p-4 shadow-2xl
        text-white animate-slide-up cursor-pointer select-none
        active:scale-[0.98] transition-all duration-200
        ${exiting ? "opacity-0 translate-x-full" : "opacity-100"}
        ${style.bg}
      `}
      style={{ touchAction: "pan-y" }}
      onClick={handleDismiss}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleDismiss() } }}
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
          onClick={(e) => { e.stopPropagation(); handleDismiss() }}
          className="p-1 hover:bg-white/10 rounded-lg shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-2 h-0.5 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white/60 rounded-full transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
