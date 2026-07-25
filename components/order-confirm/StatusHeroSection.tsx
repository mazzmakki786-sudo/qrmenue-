"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Check, X, Clock, ChefHat } from "lucide-react"
import type { StatusHeroSectionProps } from "./types"

function formatCountdown(seconds: number) {
  if (seconds <= 0) return "00:00"
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

const STATUS_CONFIG = {
  received: {
    icon: Clock,
    bg: "bg-warning/10",
    border: "border-warning/20",
    iconBg: "bg-warning",
    title: "Order Placed!",
    desc: (restaurant?: any) =>
      `Waiting for ${restaurant?.name || "the restaurant"} to confirm your order`,
    shadow: "shadow-[0_4px_12px_rgba(217,119,6,0.2)]",
  },
  preparing: {
    icon: ChefHat,
    bg: "bg-info/10",
    border: "border-info/20",
    iconBg: "bg-info",
    title: "Preparing Your Order",
    desc: (restaurant?: any) =>
      `${restaurant?.name || "The restaurant"} is preparing your order`,
    shadow: "shadow-[0_4px_12px_rgba(37,99,235,0.2)]",
  },
  ready: {
    icon: Check,
    bg: "bg-success/10",
    border: "border-success/20",
    iconBg: "bg-success",
    title: "Order Ready!",
    desc: (restaurant?: any) =>
      `Your order from ${restaurant?.name || "the restaurant"} is ready for pickup`,
    shadow: "shadow-[0_4px_12px_rgba(22,163,74,0.2)]",
  },
  completed: {
    icon: Check,
    bg: "bg-success/10",
    border: "border-success/20",
    iconBg: "bg-success",
    title: "Order Completed",
    desc: (restaurant?: any) =>
      `Your order from ${restaurant?.name || "the restaurant"} has been completed`,
    shadow: "shadow-[0_4px_12px_rgba(22,163,74,0.2)]",
  },
  cancelled: {
    icon: X,
    bg: "bg-error/10",
    border: "border-error/20",
    iconBg: "bg-error",
    title: "Order Cancelled",
    desc: (restaurant?: any) =>
      `Your order from ${restaurant?.name || "the restaurant"} has been cancelled`,
    shadow: "shadow-[0_4px_12px_rgba(239,68,68,0.2)]",
  },
} as const

function Countdown({ readyAt }: { readyAt: string | null | undefined }) {
  const [remaining, setRemaining] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const calcRemaining = useCallback(() => {
    if (!readyAt) return null
    const diff = Math.floor((new Date(readyAt).getTime() - Date.now()) / 1000)
    return Math.max(0, diff)
  }, [readyAt])

  useEffect(() => {
    if (!readyAt) {
      setRemaining(null)
      return
    }

    setRemaining(calcRemaining())
    timerRef.current = setInterval(() => {
      setRemaining(calcRemaining())
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [calcRemaining, readyAt])

  if (remaining === null) {
    return (
      <p className="text-sm text-text-secondary">
        Your order is being prepared. This should take about 30 minutes.
      </p>
    )
  }

  if (remaining <= 0) {
    return (
      <p className="text-sm font-semibold text-success">
        Almost done! Your order should be ready any moment.
      </p>
    )
  }

  return (
    <>
      <div className="text-3xl md:text-4xl font-bold text-text-primary tabular-nums">
        {formatCountdown(remaining)}
      </div>
      <p className="text-xs text-text-muted mt-1">Estimated time remaining</p>
    </>
  )
}

export default function StatusHeroSection({ order, restaurant }: StatusHeroSectionProps) {
  const status = order.order_status as keyof typeof STATUS_CONFIG
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.received
  const Icon = config.icon
  const isPreparing = status === "preparing"

  return (
    <section
      className={`${config.bg} ${config.border} border rounded-2xl p-6 md:p-10 text-center animate-slide-up`}
    >
      <div className="flex justify-center mb-4 md:mb-5">
        <div
          className={`w-16 h-16 md:w-20 md:h-20 ${config.iconBg} rounded-full md:rounded-2xl flex items-center justify-center ${config.shadow} animate-scale-up`}
        >
          <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" style={{ strokeWidth: 3 }} />
        </div>
      </div>
      <h2 className="text-lg md:text-2xl font-bold text-text-primary mb-1">
        {config.title}
      </h2>
      <p className="text-sm font-semibold text-text-secondary mb-3">
        #{order.order_number}
      </p>
      {isPreparing && (
        <div className="mb-4 md:mb-3">
          <Countdown readyAt={order.ready_at} />
        </div>
      )}
      <p className="text-sm text-text-secondary px-4">
        {config.desc(restaurant)}
      </p>
    </section>
  )
}
