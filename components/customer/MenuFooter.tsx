"use client"

import type { BrandingConfig } from "@/lib/branding"

interface Props {
  branding: BrandingConfig
}

export function MenuFooter({ branding }: Props) {
  return (
    <div className="px-4 py-8 text-center">
      <div className="border-t border-[#F0F0F0] pt-6">
        <a
          href="https://qrmenu.pk"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-[#999] hover:text-[#555] transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
          Powered by QRMenu.pk
        </a>
      </div>
    </div>
  )
}
