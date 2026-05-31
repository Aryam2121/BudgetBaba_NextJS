"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Logo } from "@/components/brand/Logo"
import { CheckCircle2, LucideIcon } from "lucide-react"

interface AuthFeature {
  icon: LucideIcon
  title: string
  description: string
}

interface AuthShellProps {
  title: string
  subtitle: string
  heroTitle: string
  heroSubtitle: string
  features: AuthFeature[]
  footerText: string
  footerLinkText: string
  footerHref: string
  children: ReactNode
  accent?: "violet" | "emerald"
}

export function AuthShell({
  title,
  subtitle,
  heroTitle,
  heroSubtitle,
  features,
  footerText,
  footerLinkText,
  footerHref,
  children,
  accent = "violet",
}: AuthShellProps) {
  const heroGradient =
    accent === "emerald"
      ? "from-emerald-600 via-teal-600 to-violet-700"
      : "from-violet-600 via-indigo-600 to-blue-700"

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Hero panel */}
      <div className={cnHero(heroGradient)}>
        <div className="relative z-10 flex flex-col justify-between p-8 lg:p-12 min-h-[280px] lg:min-h-screen">
          <Logo href="/" showText size="lg" variant="light" />

          <div className="space-y-8 py-8 lg:py-0">
            <div className="space-y-4 max-w-lg">
              <h1 className="text-3xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                {heroTitle}
              </h1>
              <p className="text-lg text-white/80 leading-relaxed">{heroSubtitle}</p>
            </div>

            <div className="space-y-5 hidden sm:block">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4 items-start">
                  <div className="rounded-xl bg-white/15 backdrop-blur-sm p-3 ring-1 ring-white/20">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-white/75 mt-0.5">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex flex-wrap gap-4 text-sm text-white/70">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Free forever
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Bank-grade security
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" /> INR & multi-currency
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-black/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-16 auth-panel">
        <div className="lg:hidden mb-8">
          <Logo href="/" size="md" />
        </div>

        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          <div className="glass-card rounded-2xl p-6 sm:p-8">
            {children}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {footerText}{" "}
            <Link href={footerHref} className="font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400">
              {footerLinkText}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function cnHero(gradient: string) {
  return `relative hidden lg:flex flex-col bg-gradient-to-br ${gradient} text-white overflow-hidden`
}
