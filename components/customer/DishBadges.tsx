import { Flame, ChefHat, AlertTriangle } from "lucide-react"

const badgeConfig: Record<string, { icon: typeof Flame; label: string; className: string }> = {
  popular: {
    icon: Flame,
    label: "Popular",
    className: "bg-primary/10 text-primary",
  },
  chef_special: {
    icon: ChefHat,
    label: "Chef's Special",
    className: "bg-[#F59E0B]/10 text-[#F59E0B]",
  },
  spicy: {
    icon: AlertTriangle,
    label: "Spicy",
    className: "bg-error/10 text-error",
  },
}

interface Props {
  tags: string[]
}

export function DishBadges({ tags }: Props) {
  if (!tags || tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => {
        const config = badgeConfig[tag]
        if (!config) return null
        const Icon = config.icon
        return (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${config.className}`}
          >
            <Icon className="w-2.5 h-2.5" />
            {config.label}
          </span>
        )
      })}
    </div>
  )
}
