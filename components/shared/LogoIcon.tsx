type LogoProps = {
  className?: string
  /** Override the logo source. Defaults to the main brand logo. */
  src?: string
}

export const MAIN_LOGO = "/main-logo.png"
export const ICON_LOGO = "/icon.png"

/** Main brand logo — header, sidebar, footer. */
export function LogoIcon({ className = "h-7 w-auto", src = MAIN_LOGO }: LogoProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="Digital QR Menue" className={`${className} object-contain`} />
}

/** Variant for dark backgrounds — uses the main logo by default. */
export function LogoIconWhite({ className = "h-7 w-auto", src = MAIN_LOGO }: LogoProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="Digital QR Menue" className={`${className} object-contain`} />
}
