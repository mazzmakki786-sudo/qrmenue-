/** Inline QR logo SVG — renders reliably in all browsers, unlike favicon.ico */
export function LogoIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="6" fill="#22C55E" />
      <rect x="4" y="4" width="5" height="5" rx="1" fill="#fff" />
      <rect x="13" y="4" width="5" height="5" rx="1" fill="#fff" />
      <rect x="4" y="13" width="5" height="5" rx="1" fill="#fff" />
      <rect x="13" y="13" width="5" height="5" rx="1" fill="#fff" />
      <rect x="18" y="18" width="6" height="6" rx="1" fill="#fff" opacity="0.9" />
      <rect x="4" y="20" width="3" height="4" rx="0.8" fill="#fff" opacity="0.7" />
      <rect x="20" y="4" width="4" height="3" rx="0.8" fill="#fff" opacity="0.7" />
    </svg>
  )
}

/** White-on-transparent variant for dark backgrounds */
export function LogoIconWhite({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="6" fill="white" />
      <rect x="4" y="4" width="5" height="5" rx="1" fill="#22C55E" />
      <rect x="13" y="4" width="5" height="5" rx="1" fill="#22C55E" />
      <rect x="4" y="13" width="5" height="5" rx="1" fill="#22C55E" />
      <rect x="13" y="13" width="5" height="5" rx="1" fill="#22C55E" />
      <rect x="18" y="18" width="6" height="6" rx="1" fill="#22C55E" opacity="0.9" />
      <rect x="4" y="20" width="3" height="4" rx="0.8" fill="#22C55E" opacity="0.7" />
      <rect x="20" y="4" width="4" height="3" rx="0.8" fill="#22C55E" opacity="0.7" />
    </svg>
  )
}
