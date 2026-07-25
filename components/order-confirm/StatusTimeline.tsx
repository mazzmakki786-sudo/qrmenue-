"use client"

import { Check, Clock, ChefHat, X, PackageCheck } from "lucide-react"
import type { StatusTimelineProps } from "./types"

function formatTime(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleTimeString("en-PK", { hour: "numeric", minute: "2-digit", hour12: true })
  } catch {
    return ""
  }
}

const STEPS = [
  { key: "received", label: "Received", icon: Clock, timeKey: "created_at" as const },
  { key: "preparing", label: "Preparing", icon: ChefHat, timeKey: "prepared_at" as const },
  { key: "ready", label: "Ready", icon: PackageCheck, timeKey: "ready_at" as const },
  { key: "completed", label: "Completed", icon: Check, timeKey: null },
]

function getStepState(
  stepKey: string,
  currentStatus: string
): "done" | "current" | "pending" | "cancelled" {
  const orderIndex = STEPS.findIndex((s) => s.key === currentStatus)
  const stepIndex = STEPS.findIndex((s) => s.key === stepKey)

  if (currentStatus === "cancelled") {
    if (stepIndex < 2) return "done"
    if (stepIndex === 2) return "cancelled"
    return "pending"
  }

  if (stepIndex < orderIndex) return "done"
  if (stepIndex === orderIndex) return "current"
  return "pending"
}

interface StepCircleProps {
  state: "done" | "current" | "pending" | "cancelled"
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
}

function StepCircle({ state, icon: Icon }: StepCircleProps) {
  if (state === "done") {
    return (
      <div className="w-9 h-9 rounded-full bg-success flex items-center justify-center shadow-[0_0_0_4px_rgba(22,163,74,0.15)] ring-2 ring-success/20">
        <Check className="w-4 h-4 text-white" style={{ strokeWidth: 3 }} />
      </div>
    )
  }
  if (state === "current") {
    return (
      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-[0_0_0_4px_rgba(0,0,0,0.08)] ring-2 ring-primary/20">
        <Icon className="w-4 h-4 text-white" />
      </div>
    )
  }
  if (state === "cancelled") {
    return (
      <div className="w-9 h-9 rounded-full bg-error flex items-center justify-center shadow-[0_0_0_4px_rgba(239,68,68,0.12)] ring-2 ring-error/20">
        <X className="w-4 h-4 text-white" />
      </div>
    )
  }
  // pending
  return (
    <div className="w-9 h-9 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center">
      <div className="w-2 h-2 bg-gray-300 rounded-full" />
    </div>
  )
}

function StepLabel({ state, label, time }: { state: string; label: string; time?: string | null }) {
  const stateColors: Record<string, string> = {
    done: "text-success",
    current: "text-text-primary",
    cancelled: "text-error",
    pending: "text-text-muted",
  }

  return (
    <div className="flex-1 min-w-0">
      <span className={`text-sm font-semibold ${stateColors[state] || "text-text-muted"}`}>
        {label}
      </span>
      {state === "current" && (
        <span className="inline-flex items-center gap-1 ml-2 text-[10px] font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          In Progress
        </span>
      )}
      {time && (
        <p className="text-[11px] text-text-muted mt-0.5">
          {formatTime(time)}
        </p>
      )}
    </div>
  )
}

export default function StatusTimeline({ currentStatus, readyAt, orderCreatedAt, preparedAt }: StatusTimelineProps) {
  const isCancelled = currentStatus === "cancelled"

  // Map order timestamps to steps
  const timelineData = STEPS.map((step) => {
    let timeValue: string | undefined
    if (step.key === "received" && orderCreatedAt) {
      timeValue = orderCreatedAt
    } else if (step.key === "preparing" && preparedAt) {
      timeValue = preparedAt
    } else if (step.key === "ready" && readyAt) {
      timeValue = readyAt
    }
    return { ...step, time: timeValue }
  })

  return (
    <div className="bg-white border border-border rounded-2xl p-5 md:p-6 animate-fade-in">
      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-start justify-center gap-0">
        {timelineData.map((step, i) => {
          const state = getStepState(step.key, currentStatus)
          return (
            <div key={step.key} className="flex items-start">
              <div className="flex flex-col items-center gap-2">
                <StepCircle state={state} icon={step.icon} />
                <StepLabel state={state} label={step.label} time={step.time} />
              </div>
              {i < timelineData.length - 1 && (
                <div className="flex items-start pt-[14px] mx-2">
                  <div
                    className={`w-12 h-0.5 rounded-full ${
                      state === "done" ? "bg-success" : "bg-border"
                    }`}
                  />
                </div>
              )}
            </div>
          )
        })}

        {isCancelled && (
          <div className="flex items-start ml-2">
            <div className="flex items-start pt-[14px] mr-2">
              <div className="w-8 h-0.5 bg-error border-dashed border-t-2 border-error" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-error flex items-center justify-center shadow-[0_0_0_4px_rgba(239,68,68,0.12)] ring-2 ring-error/20">
                <X className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-error">Cancelled</span>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden flex flex-col gap-0">
        {timelineData.map((step, i) => {
          const state = getStepState(step.key, currentStatus)
          const isActive = state === "current" || state === "done"
          return (
            <div key={step.key} className="flex items-start gap-3 relative">
              <div className="flex flex-col items-center">
                <StepCircle state={state} icon={step.icon} />
                {i < timelineData.length - 1 && (
                  <div
                    className={`w-0.5 h-10 ${
                      state === "done" ? "bg-success" : "bg-border"
                    }`}
                  />
                )}
              </div>
              <div className={`pt-1.5 flex-1 ${!isActive ? "opacity-50" : ""}`}>
                <StepLabel state={state} label={step.label} time={step.time} />
              </div>
            </div>
          )
        })}

        {isCancelled && (
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-error flex items-center justify-center shadow-[0_0_0_4px_rgba(239,68,68,0.12)] ring-2 ring-error/20">
                <X className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="pt-1.5">
              <StepLabel state="cancelled" label="Cancelled" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
