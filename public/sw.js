// QRMenu.pk — Service Worker v4
// Handles push notifications + offline caching for images only
// Next.js JS/CSS chunks are NOT intercepted (they have content hashes and
// browser cache already handles them). Cloning streaming responses from
// Next.js causes "Response body already used" errors.

const CACHE_NAME = "qrmenu-v4"
const STATIC_CACHE = "qrmenu-static-v4"
const IMAGE_CACHE = "qrmenu-images-v4"

// ── INSTALL ──
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(() => self.skipWaiting())
  )
})

// ── ACTIVATE ──
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => clients.claim())
  )
})

// ── FETCH ──
// Only intercept images. NEVER intercept JS/CSS/HTML/API — those are
// handled by Next.js built-in caching and middleware auth redirects.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return

  const url = new URL(event.request.url)

  // Images only: cache-first with network fallback
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|ico|webp)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached
        return fetch(event.request).then((response) => {
          // Only cache successful responses with a body we can clone
          if (response.ok) {
            const cloned = response.clone()
            caches.open(IMAGE_CACHE).then((cache) => {
              cache.put(event.request, cloned)
            }).catch(() => {})
          }
          return response
        }).catch(() => {
          // Offline fallback — return a transparent pixel
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#f0f0f0" width="200" height="200"/></svg>',
            { headers: { "Content-Type": "image/svg+xml" } }
          )
        })
      })
    )
    return
  }

  // Everything else (JS, CSS, HTML, API, menu pages, dashboard, etc.):
  // Let the browser handle normally. This avoids clone errors on streaming
  // responses and ensures middleware auth redirects work correctly.
})

// ── PUSH ──
self.addEventListener("push", (event) => {
  let title = "Digital QR Menue"
  let body = "Your restaurant has a new update!"
  let url = "/dashboard/orders"
  let tag = "order-alert"
  let icon = "/favicon.svg"
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
