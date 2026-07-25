"use client"

import { MessageCircle, Phone, Check, ExternalLink } from "lucide-react"
import type { ContactButtonsProps } from "./types"

export default function ContactButtons({
  whatsappUrl,
  restaurantPhone,
  whatsappSuccess,
  onSendWhatsapp,
}: ContactButtonsProps) {
  return (
    <div className="flex gap-2.5 md:gap-3 md:justify-center">
      {whatsappUrl && (
        <div className="flex-1 min-w-0 md:flex-none">
          {whatsappSuccess && (
            <div className="flex items-center gap-1.5 mb-1 md:mb-1.5">
              <Check className="w-3 h-3 text-accent" style={{ strokeWidth: 3 }} />
              <span className="text-[11px] text-text-secondary">Opened via WhatsApp</span>
              <button
                onClick={() => {
                  window.open(whatsappUrl, "_blank")
                }}
                className="text-[11px] text-accent font-semibold ml-auto hover:underline"
              >
                Resend
              </button>
            </div>
          )}
          <button
            onClick={onSendWhatsapp}
            className="w-full md:w-auto bg-accent text-white text-[12px] font-bold h-11 px-6 rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all hover:opacity-90 shadow-[0_2px_8px_rgba(37,211,102,0.2)]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send on WhatsApp</span>
          </button>
        </div>
      )}
      {restaurantPhone && (
        <div className="shrink-0">
          {whatsappSuccess && <div className="h-4 md:h-5" />}
          <a
            href={`tel:${restaurantPhone}`}
            className="flex items-center justify-center gap-1.5 h-11 min-w-[88px] px-4 rounded-xl border border-border text-[12px] font-semibold text-text-primary active:scale-[0.95] transition-all hover:bg-[#FAFAFA] md:px-6 md:text-[14px]"
          >
            <Phone className="w-4 h-4" />
            <span>Call</span>
          </a>
        </div>
      )}
    </div>
  )
}
