import { Flame, ChefHat, AlertTriangle } from "lucide-react"

const badgeConfig: Record<string, { icon: typeof Flame; label: string; className: string }> = {
  popular: {
    icon: Flame,
    label: "Popular",
    className: "text-[#FF6B35] bg-[#FF6B35]/10",
  },
  chef_special: {
    icon: ChefHat,
    label: "Chef's Special",
    className: "text-black bg-black/5",
  },
  spicy: {
    icon: AlertTriangle,
    label: "Spicy",
    className: "text-[#DC2626] bg-[#DC2626]/10",
  },
}

interface Props {
  tags: string[]
}

export function DishBadges({ tags }: Props) {
  if (!tags || tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {tags.map((tag) => {
        const config = badgeConfig[tag]
        if (!config) return null
        const Icon = config.icon
        return (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${config.className}`}
          >
            <Icon className="w-3 h-3" />
            {config.label}
          </span>
        )
      })}
    </div>
  )
}
