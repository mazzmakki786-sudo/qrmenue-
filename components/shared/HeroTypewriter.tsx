"use client"

import { useEffect, useState } from "react"

const PHRASES = [
  "Zero Commission",
  "WhatsApp Ordering",
  "No App Downloads",
  "Urdu & English Menus",
]

/**
 * Hero typewriter — cycles through benefit phrases.
 * Renders the first phrase in full on both server and client so the
 * initial paint matches SSR (no hydration mismatch), then starts the
 * type / delete loop once the user allows motion.
 */
export function HeroTypewriter() {
  const [text, setText] = useState(PHRASES[0])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (prefersReducedMotion) return // static first phrase for reduced-motion users

    let cancelled = false
    let phraseIndex = 0
    let charIndex = PHRASES[0].length
    let deleting = false
    let timeout: ReturnType<typeof setTimeout>

    const tick = () => {
      if (cancelled) return
      const phrase = PHRASES[phraseIndex]

      if (deleting) {
        charIndex -= 1
      } else {
        charIndex += 1
        if (charIndex > phrase.length) {
          // hold the full phrase, then start erasing
          deleting = true
          timeout = setTimeout(tick, 2000)
          return
        }
      }

      if (charIndex === 0) {
        // fully erased — move to the next phrase and start typing
        deleting = false
        phraseIndex = (phraseIndex + 1) % PHRASES.length
        timeout = setTimeout(tick, 200)
        return
      }

      setText(phrase.slice(0, charIndex))
      timeout = setTimeout(tick, deleting ? 40 : 80)
    }

    // First phrase is already rendered; hold it, then start the loop by
    // erasing it (charIndex is already its full length).
    timeout = setTimeout(() => {
      deleting = true
      tick()
    }, 3500)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [])

  return (
    <span className="text-[#25D366]">
      {text || " "}
      <span className="typing-caret inline-block w-[2px] h-[0.9em] align-middle bg-[#25D366] ml-1" aria-hidden="true" />
    </span>
  )
}