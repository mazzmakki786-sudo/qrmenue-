"use client"

let audioContext: AudioContext | null = null
let lastOrderIds = new Set<string>()

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

export function playBeepSound() {
  try {
    const ctx = getAudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = "sine"
    osc.frequency.value = 880
    gain.gain.value = 0.3
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  } catch {
    // Audio not available
  }
}

export function showOrderToast(
  title: string,
  body: string,
  onClickUrl?: string
) {
  const toast = document.createElement("div")
  toast.className = "fixed top-4 right-4 z-[100] bg-black text-white rounded-xl p-4 shadow-2xl max-w-sm animate-slide-up cursor-pointer"
  toast.innerHTML = `
    <p class="font-semibold text-sm">${title}</p>
    <p class="text-xs text-gray-300 mt-0.5">${body}</p>
  `
  toast.onclick = () => {
    if (onClickUrl) window.location.href = onClickUrl
  }
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.transition = "opacity 0.3s, transform 0.3s"
    toast.style.opacity = "0"
    toast.style.transform = "translateY(-20px)"
    setTimeout(() => toast.remove(), 300)
  }, 4000)
}

export function sendStaffPushNotification(title: string, body: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: "/og-image.png",
        tag: "staff-order",
        vibrate: [200, 100, 200],
      } as any)
    } catch {
      // silent
    }
  }
}

export function checkForNewOrders(
  orders: any[],
  enabled: { sound: boolean; push: boolean }
) {
  const currentIds = new Set(orders.map((o) => o.id))
  const isNew = (order: any) => !lastOrderIds.has(order.id) && lastOrderIds.size > 0

  for (const order of orders) {
    if (isNew(order) && order.order_status === "received") {
      const title = `New Order #${order.order_number}`
      const body = `${order.customer_name} — Table ${order.restaurant_tables?.table_number || order.table_number || "N/A"}`
      if (enabled.sound) playBeepSound()
      showOrderToast(title, body, `/staff/dashboard/orders/${order.id}`)
      if (enabled.push) sendStaffPushNotification(title, body)
    }
  }

  lastOrderIds = currentIds
}
