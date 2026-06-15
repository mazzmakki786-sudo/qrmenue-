"use client"

import { useEffect, useState } from "react"
import { X, Shield } from "lucide-react"

interface LogEntry {
  id: string
  email: string
  action: string
  details: Record<string, any>
  ip_address: string
  created_at: string
}

interface Props {
  open: boolean
  onClose: () => void
}

export function ActivityLogView({ open, onClose }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch("/api/superadmin/audit-log")
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [open])

  const actionLabel = (action: string) => {
    const map: Record<string, string> = {
      login_success: "Login Success",
      login_failed: "Login Failed",
      login_blocked_locked_out: "Login Blocked (Locked)",
      settings_updated: "Settings Updated",
      subscription_created: "Subscription Created",
    }
    return map[action] || action
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[#F0F0F0]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold">Activity Log</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F0F0F0] rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(80vh-70px)]">
          {loading ? (
            <div className="p-8 text-center"><p className="text-xs text-[#999]">Loading...</p></div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center"><p className="text-xs text-[#999]">No activity yet</p></div>
          ) : (
            <div className="divide-y divide-[#F0F0F0]">
              {logs.map((log) => (
                <div key={log.id} className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      log.action === "login_success" || log.action === "subscription_created"
                        ? "bg-[#25D366]/10 text-[#25D366]"
                        : "bg-red-50 text-[#DC2626]"
                    }`}>{actionLabel(log.action)}</span>
                    <span className="text-[10px] text-[#999]">
                      {new Date(log.created_at).toLocaleDateString("en-PK", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-[#555]">{log.email}</p>
                  {log.details?.ip && (
                    <p className="text-[10px] text-[#999]">IP: {log.details.ip}</p>
                  )}
                  {log.details?.keys && (
                    <p className="text-[10px] text-[#999]">Keys: {log.details.keys.join(", ")}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
