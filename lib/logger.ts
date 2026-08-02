/**
 * Minimal structured logger.
 * Provides consistent, prefix-tagged logging for server-side code.
 * In production, these write to stdout/stderr — the container / platform
 * is responsible for collecting and forwarding them to a log aggregator.
 *
 * Usage:
 *   import { createLogger } from "@/lib/logger"
 *   const log = createLogger("orders")
 *   log.error("INSERT failed", { code, message })
 */

type LogLevel = "error" | "warn" | "info" | "debug"

const LEVEL_PREFIX: Record<LogLevel, string> = {
  error: "[ERROR]",
  warn:  "[WARN]",
  info:  "[INFO]",
  debug: "[DEBUG]",
}

function serializeMeta(meta?: Record<string, unknown>): string {
  if (!meta || Object.keys(meta).length === 0) return ""
  try {
    return " " + JSON.stringify(meta)
  } catch {
    return ""
  }
}

export function createLogger(module: string) {
  const tag = `[${module}]`

  function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const prefix = LEVEL_PREFIX[level]
    const timestamp = new Date().toISOString()
    const line = `${timestamp} ${prefix} ${tag} ${message}${serializeMeta(meta)}`

    switch (level) {
      case "error":
        console.error(line)
        break
      case "warn":
        console.warn(line)
        break
      case "info":
      case "debug":
      default:
        console.log(line)
        break
    }
  }

  return {
    error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
    warn:  (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
    info:  (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
    debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
  }
}
