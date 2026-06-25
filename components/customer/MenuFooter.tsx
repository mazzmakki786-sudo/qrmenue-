"use client"

import type { BrandingConfig } from "@/lib/branding"

interface Props {
  branding: BrandingConfig
}

export function MenuFooter({ branding }: Props) {
  return (
    <div className="px-4 py-8 text-center">
      <div className="border-t border-border pt-6">
        <a
          href="https://qrmenu.pk"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[12px] text-text-muted hover:text-text-secondary transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Powered by QRMenu.pk
        </a>
      </div>
    </div>
  )
}
