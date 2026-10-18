export type OrderStatus =
  | "received"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled"

// Canonical status meta used across the owner dashboard, orders list,
// kitchen board, and dashboard quick button. Colors:
//   received   -> blue   (New)
//   preparing  -> orange (Preparing)
//   ready      -> indigo (Ready)
//   completed  -> green  (Completed)
//   cancelled  -> red    (Cancelled)
export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; badge: string; dot: string }
> = {
  received: {
    label: "New",
    badge: "bg-[#EFF6FF] text-[#2563EB]",
    dot: "bg-[#2563EB]",
  },
  preparing: {
    label: "Preparing",
    badge: "bg-[#FFF7ED] text-[#EA580C]",
    dot: "bg-[#EA580C]",
  },
  ready: {
    label: "Ready",
    badge: "bg-[#EEF2FF] text-[#4F46E5]",
    dot: "bg-[#4F46E5]",
  },
  completed: {
    label: "Completed",
    badge: "bg-[#DCFCE7] text-[#16A34A]",
    dot: "bg-[#16A34A]",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-[#FEE2E2] text-[#DC2626]",
    dot: "bg-[#DC2626]",
  },
}

// Tabs shown on the orders list (top of funnel first).
export const ORDER_STATUS_TABS: { key: "all" | OrderStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "received", label: "New" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
]
