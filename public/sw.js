// QRMenu.pk — Service Worker
// Handles push notifications + offline caching for menu pages

const CACHE_NAME = "qrmenu-v1"
const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/og-image.png",
  "/favicon.svg",
  "/manifest.json",
]

// Menu page URL pattern — cache these for offline reading
const MENU_PATTERN = /^\/menu\//

// ── INSTALL ──
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache static assets — failures are non-fatal
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch(() => { /* skip if unavailable */ })
        )
      )
    }).then(() => self.skipWaiting())
  )
})

// ── ACTIVATE ──
self.addEventListener("activate", (event) => {
  // Clean old caches
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => clients.claim())
  )
})

// ── FETCH — offline fallback for menu pages ──
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return

  // For menu pages: try network first, fall back to cache
  if (MENU_PATTERN.test(event.request.url)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the fresh response for offline use
          const cloned = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned))
          return response
        })
        .catch(() => {
          // Offline — serve cached version
          return caches.match(event.request).then((cached) => {
            if (cached) return cached
            // No cached version — show offline page
            return caches.match("/offline.html")
          })
        })
    )
    return
  }

  // For other pages: stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          const cloned = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned))
          return response
        })
        .catch(() => cached || new Response("Offline", { status: 503 }))

      return cached || fetchPromise
    })
  )
})

// ── PUSH ──
self.addEventListener("push", (event) => {
  let title = "Digital QR Menue"
  let body = "Your restaurant has a new update!"
  let url = "/dashboard/orders"
  let tag = "order-alert"
  let icon = "/og-image.svg"
  let notificationData = {}

  if (event.data) {
    try {
      const parsed = event.data.json()
      if (parsed.title) title = parsed.title
      if (parsed.body) body = parsed.body
      if (parsed.url) url = parsed.url
      if (parsed.tag) tag = parsed.tag
      if (parsed.icon) icon = parsed.icon
      if (parsed.data) notificationData = parsed.data
    } catch {
      body = event.data.text()
    }
  }

  const options = {
    body,
    icon,
    badge: icon,
    tag,
    data: { url, data: notificationData },
    vibrate: [200, 100, 200],
    requireInteraction: true,
    silent: false,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// ── NOTIFICATION CLICK ──
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const notificationData = event.notification.data || {}
  const url = notificationData.url || "/dashboard/orders"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.indexOf(self.location.origin) === 0 && "focus" in client) {
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})