// QRMenu.pk — Service Worker v5
// Handles push notifications + offline caching for images only
// Next.js JS/CSS chunks are NOT intercepted (they have content hashes and
// browser cache already handles them). Cloning streaming responses from
// Next.js causes "Response body already used" errors.
//
// CRITICAL: ALWAYS call event.respondWith() for every intercepted request.
// On iOS Safari, not calling respondWith() in a fetch handler causes
// the request to hang indefinitely, resulting in a completely blank page.

const CACHE_NAME = "qrmenu-v5"
const IMAGE_CACHE = "qrmenu-images-v5"

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
// Only intercept images for caching. Everything else (navigation, API, JS,
// CSS) is passed through without respondWith() so the browser handles it
// natively. This avoids the "network error response: promise was rejected"
// errors that occur when fetch() inside the SW fails for auth-protected pages.
//
// iOS Safari note: NOT calling respondWith() for a non-intercepted request
// (one we return from before calling respondWith) is safe — the browser
// handles it. The iOS bug only triggers if the SW starts processing a fetch
// event (enters the handler) and then fails to call respondWith. Our pattern:
// return early for all non-image GETs to never enter the respondWith path.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Non-GET requests: let browser handle natively
  if (event.request.method !== "GET") return

  // Only intercept image requests for caching
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|avif)$/i)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached
        return fetch(event.request).then((response) => {
          if (response && response.ok) {
            const cloned = response.clone()
            caches.open(IMAGE_CACHE).then((cache) => {
              cache.put(event.request, cloned)
            }).catch(() => {})
          }
          return response
        }).catch(() => {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#f0f0f0" width="200" height="200"/></svg>',
            { headers: { "Content-Type": "image/svg+xml" } }
          )
        })
      })
    )
    return
  }

  // Everything else (navigation, API, JS, CSS): let browser handle natively.
  // DO NOT call event.respondWith() — the browser handles these directly,
  // preserving auth cookies, redirects, and normal caching behavior.
  return
})

// ── PUSH ──
self.addEventListener("push", (event) => {
  let title = "Digital QR Menue"
  let body = "Your restaurant has a new update!"
  let url = "/dashboard/orders"
  let tag = "order-alert"
  let icon = "/favicon.ico"
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
