import { MapPin } from "lucide-react"

interface Props {
  name: string
  nameUr?: string | null
  logoUrl?: string | null
  city: string
  cuisineType?: string | null
  lang?: "en" | "ur"
}

export function MenuHeader({ name, nameUr, logoUrl, city, cuisineType, lang = "en" }: Props) {
  const displayName = lang === "ur" && nameUr ? nameUr : name

  return (
    <div className="flex items-start gap-4 pt-4 pb-3 px-4">
      {logoUrl && (
        <img
          src={logoUrl}
          alt={displayName}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <h1 className={`text-xl font-bold text-[#111] ${lang === "ur" ? "font-urdu" : ""}`}>
          {displayName}
        </h1>
        <div className="flex items-center gap-2 mt-0.5">
          <MapPin className="w-3.5 h-3.5 text-[#999]" />
          <span className="text-sm text-[#555]">
            {city}{cuisineType ? ` • ${cuisineType}` : ""}
          </span>
        </div>
      </div>
    </div>
  )
}
