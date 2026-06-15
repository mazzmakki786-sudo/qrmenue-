"use client"

import Image from "next/image"

interface Props {
  imageUrl: string
  linkUrl: string | null
}

export function PremiumBanner({ imageUrl, linkUrl }: Props) {
  const content = (
    <div className="relative w-full aspect-[3/1] rounded-xl overflow-hidden mb-4 mx-4">
      <Image
        src={imageUrl}
        alt="Promotional banner"
        fill
        className="object-cover"
        sizes="(max-width: 600px) 100vw, 600px"
      />
    </div>
  )

  if (linkUrl) {
    return (
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    )
  }

  return content
}
