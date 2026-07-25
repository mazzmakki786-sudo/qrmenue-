"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

const GA_ID = "G-DH740HGMFX"

// Extend Window interface for gtag
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Load GA script after page is interactive — not blocking initial render
    const script = document.createElement("script")
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    script.async = true
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    gtag("js", new Date())
    gtag("config", GA_ID, {
      send_page_view: true,
      anonymize_ip: true,
    })

    // Register Service Worker after page fully loads
    if ("serviceWorker" in navigator) {
      const registerSW = async () => {
        try {
          const reg = await navigator.serviceWorker.register("/sw.js")
          if (reg.waiting) {
            reg.waiting.postMessage({ type: "SKIP_WAITING" })
          }
          reg.addEventListener("updatefound", () => {
            const sw = reg.installing
            if (sw) {
              sw.addEventListener("statechange", () => {
                if (sw.state === "activated") {
                  window.location.reload()
                }
              })
            }
          })
        } catch (err) {
          console.warn("SW registration failed:", err)
        }
      }
      window.addEventListener("load", registerSW, { once: true })
    }

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  // Track page views on navigation
  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
    if (window.gtag) {
      window.gtag("config", GA_ID, {
        page_path: url,
        anonymize_ip: true,
      })
    }
  }, [pathname, searchParams])

  return null
}
