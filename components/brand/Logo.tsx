import Link from "next/link"
import { cn } from "@/lib/utils"
import { Wallet } from "lucide-react"

interface LogoProps {
  href?: string
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "light"
}

export function Logo({ href = "/", className, showText = true, size = "md", variant = "default" }: LogoProps) {
  const isLight = variant === "light"
  const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5"
  const boxSize = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10"
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl"

  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("brand-icon flex items-center justify-center rounded-xl shadow-lg shadow-violet-500/25", boxSize)}>
        <Wallet className={cn(iconSize, "text-white")} />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn(
            "font-bold tracking-tight",
            isLight ? "text-white" : "gradient-text",
            textSize
          )}>
            Budget Baba
          </span>
          {size !== "sm" && (
            <span className={cn(
              "text-[10px] uppercase tracking-[0.2em] mt-1",
              isLight ? "text-white/70" : "text-muted-foreground"
            )}>
              Smart Finance
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex transition-opacity hover:opacity-90">
        {content}
      </Link>
    )
  }

  return content
}
