import fs from "fs"
import path from "path"
import { PosterComposition } from "@/components/owner/PosterComposition"

export const dynamic = "force-static"

type Item = { file: string; templateKey: any; dishes: { name: string; price: number | null }[] }

export default function PosterPreviewPage() {
  const dir = path.join(process.cwd(), "public", "preview")
  const items: Item[] = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"))

  const render = (size: number) => (
    <div className="flex gap-8 mb-12">
      {items.map((it) => (
        <div key={`${size}-${it.file}`} data-design={it.templateKey} data-size={size}>
          <div style={{ width: size }}>
            <PosterComposition
              artworkUrl={it.file}
              restaurantName={it.templateKey === "modern" ? "Cafe Copenhagen" : "Lahore Grill"}
              ratio="1:1"
              template={it.templateKey}
              dishes={it.dishes}
              orderPhone="0300 1234567"
              qrUrl="https://digitalmenue.com/lahore-grill"
              colorScheme={
                it.templateKey === "modern"
                  ? "fresh"
                  : it.templateKey === "elegant"
                    ? "royal"
                    : "appetizing"
              }
            />
          </div>
          <p className="text-white/60 text-xs mt-2 uppercase tracking-widest">
            {it.templateKey} @ {size}px
          </p>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#111] p-8">
      {render(420)}
      {render(1024)}
    </div>
  )
}