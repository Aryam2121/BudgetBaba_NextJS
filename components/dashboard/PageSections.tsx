import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface PageHeroProps {
  icon: LucideIcon
  title: string
  subtitle: string
  badges?: ReactNode
  accent?: "violet" | "blue" | "indigo" | "emerald"
  className?: string
}

export function PageHero({ icon: Icon, title, subtitle, badges, accent = "violet", className }: PageHeroProps) {
  const iconGrad =
    accent === "blue"
      ? "from-blue-500 to-indigo-600"
      : accent === "indigo"
        ? "from-indigo-500 to-purple-600"
        : accent === "emerald"
          ? "from-emerald-500 to-teal-600"
          : "from-violet-500 to-indigo-600"

  return (
    <div className={cn("mb-8 relative overflow-hidden", className)}>
      <div className="absolute inset-0 page-hero-glow rounded-2xl" />
      <div className="relative page-hero p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className={cn("p-3 rounded-xl shadow-lg bg-gradient-to-br shrink-0", iconGrad)}>
                <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="page-title">{title}</h1>
                <p className="page-subtitle mt-1">{subtitle}</p>
              </div>
            </div>
            {badges && <div className="flex flex-wrap gap-2">{badges}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

interface SoftBadgeProps {
  icon?: LucideIcon
  children: ReactNode
  tone?: "green" | "blue" | "purple" | "amber" | "red" | "emerald"
  className?: string
}

export function SoftBadge({ icon: Icon, children, tone = "blue", className }: SoftBadgeProps) {
  return (
    <span className={cn(`soft-badge-${tone}`, className)}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </span>
  )
}

interface FeatureTileProps {
  icon: LucideIcon
  title: string
  description: string
  tone?: "blue" | "purple" | "green" | "red" | "amber" | "orange"
  className?: string
}

export function FeatureTile({ icon: Icon, title, description, tone = "blue", className }: FeatureTileProps) {
  return (
    <div className={cn("feature-tile group", `feature-tile-${tone}`, className)}>
      <div className={cn("feature-tile-icon", `feature-tile-icon-${tone}`)}>
        <Icon className="h-7 w-7 text-white" />
      </div>
      <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

interface TipBannerProps {
  title: string
  children: ReactNode
  icon?: LucideIcon
}

export function TipBanner({ title, children, icon: Icon }: TipBannerProps) {
  return (
    <div className="tip-banner p-5 sm:p-6 mb-8">
      <div className="flex gap-4">
        {Icon && (
          <div className="tip-banner-icon shrink-0">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h3 className="tip-banner-title mb-1.5">{title}</h3>
          <div className="tip-banner-text text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  )
}
