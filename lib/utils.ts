import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return `Rs ${price.toLocaleString("en-PK")}`
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const array = new Uint8Array(2)
  crypto.getRandomValues(array)
  const random = 1000 + (array[0] * 256 + array[1]) % 9000
  return `ORD-${year}-${random}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function escapeHtml(str: string): string {
  if (!str) return ''
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

export function formatTo12Hour(time: string | null | undefined): string {
  if (!time) return ""
  const parts = time.split(":")
  if (parts.length < 2) return time
  let hours = parseInt(parts[0], 10)
  const minutes = parts[1]
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12
  if (hours === 0) hours = 12
  return `${hours}:${minutes} ${ampm}`
}

export function timeAgo(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  return `${diffDay}d ago`
}
