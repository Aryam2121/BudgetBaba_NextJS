"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/brand/Logo"
import { MarketingFooter } from "@/components/marketing/MarketingFooter"
import {
  ArrowRight,
  BarChart3,
  Shield,
  Zap,
  TrendingUp,
  Bell,
  CheckCircle2,
  Sparkles,
  Receipt,
  Target,
  Users,
  IndianRupee,
  PieChart,
} from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: Zap,
    title: "Smart AI Categorization",
    description: "Automatically categorize expenses with high accuracy using advanced AI that learns your habits.",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-500/10",
  },
  {
    icon: TrendingUp,
    title: "Predictive Budget Insights",
    description: "Real-time alerts and spending predictions so you stay ahead of your budget every month.",
    color: "from-violet-500 to-indigo-600",
    bg: "bg-violet-500/10",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Personalized email summaries and alerts for every transaction and budget milestone.",
    color: "from-fuchsia-500 to-violet-600",
    bg: "bg-fuchsia-500/10",
  },
  {
    icon: Receipt,
    title: "Receipt Scanner",
    description: "Snap a photo and let AI extract amounts, merchants, and categories instantly.",
    color: "from-blue-500 to-cyan-600",
    bg: "bg-blue-500/10",
  },
  {
    icon: Target,
    title: "Goals & Budgets",
    description: "Set savings goals and category budgets with visual progress tracking.",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-500/10",
  },
  {
    icon: Users,
    title: "Split Expenses",
    description: "Split bills with friends and track who owes what — no awkward math.",
    color: "from-rose-500 to-pink-600",
    bg: "bg-rose-500/10",
  },
]

const stats = [
  { value: "10K+", label: "Active users", accent: true },
  { value: "₹50Cr+", label: "Tracked monthly", accent: true },
  { value: "95%", label: "AI accuracy", accent: false },
  { value: "4.9★", label: "User rating", accent: true },
]

const trustItems = [
  "End-to-end encrypted credentials",
  "OAuth 2.0 secure authentication",
  "Export your data anytime",
  "Dark mode & multi-currency support",
]

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) router.push("/dashboard")
  }, [user, router])

  if (user) return null

  return (
    <div className="landing-page min-h-screen landing-mesh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50">
        <div className="container mx-auto flex items-center justify-between px-4 py-3.5 sm:px-6">
          <Logo href="/" size="md" />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="font-medium text-foreground/80 hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="brand-btn rounded-xl shadow-md shadow-violet-500/20">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="landing-grid pointer-events-none absolute inset-0" aria-hidden />
          <div className="landing-hero-glow pointer-events-none absolute inset-x-0 top-0 h-[600px]" aria-hidden />

          <div className="container relative mx-auto px-4 pt-16 pb-20 sm:px-6 sm:pt-20 sm:pb-28">
            <div className="mx-auto max-w-4xl text-center">
              <div className="landing-badge mb-8">
                <Sparkles className="h-4 w-4 text-violet-600" />
                Your wise financial companion
              </div>

              <h1 className="mb-6 text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                Take control of your{" "}
                <span className="gradient-text">financial future</span>
              </h1>

              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Track expenses, manage budgets, and get AI-powered insights.
                Make every rupee count with intelligent financial tracking built for India.
              </p>

              <div className="mb-12 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                <Link href="/auth/register">
                  <Button size="lg" className="brand-btn h-14 w-full rounded-xl px-8 text-base shadow-lg shadow-violet-500/25 sm:w-auto">
                    Start Tracking Free
                    <ArrowRight className="ml-1 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="landing-btn-outline w-full rounded-xl sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground sm:gap-x-8">
                {["100% Free", "Bank-grade Security", "INR & Multi-currency", "No Ads"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* App preview mockup */}
            <div className="mx-auto mt-16 max-w-3xl sm:mt-20">
              <div className="rounded-2xl border border-border/60 bg-white/80 p-1.5 shadow-2xl shadow-violet-500/10 backdrop-blur-sm">
                <div className="rounded-xl border border-border/40 bg-gradient-to-b from-muted/30 to-white p-5 sm:p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Dashboard preview</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-border/50 bg-white p-4 shadow-sm">
                      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <IndianRupee className="h-3.5 w-3.5" />
                        Total spent
                      </div>
                      <p className="text-xl font-bold text-foreground sm:text-2xl">₹24,850</p>
                      <p className="mt-1 text-xs text-emerald-600">↓ 12% vs last month</p>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-white p-4 shadow-sm">
                      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <PieChart className="h-3.5 w-3.5" />
                        Budget left
                      </div>
                      <p className="text-xl font-bold text-foreground sm:text-2xl">₹15,150</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
                      </div>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-white p-4 shadow-sm sm:col-span-1">
                      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <BarChart3 className="h-3.5 w-3.5" />
                        Top category
                      </div>
                      <p className="text-xl font-bold text-foreground sm:text-2xl">Food</p>
                      <p className="mt-1 text-xs text-muted-foreground">₹8,420 · 34% of spend</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="container mx-auto px-4 pb-20 sm:px-6 sm:pb-24">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="landing-stat">
                <p className={`landing-stat-value ${stat.accent ? "landing-stat-value-accent" : ""}`}>
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 pb-24 sm:px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-600">
              Features
            </p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Everything you need to{" "}
              <span className="gradient-text">master your money</span>
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Powerful tools designed to simplify expense tracking, budgeting, and financial planning.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="feature-card">
                <div className={`mb-4 inline-flex rounded-xl p-3 ${feature.bg}`}>
                  <div className={`rounded-lg bg-gradient-to-br ${feature.color} p-2`}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust */}
        <section className="container mx-auto px-4 pb-24 sm:px-6">
          <div className="landing-trust-card grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-5">
              <div className="inline-flex rounded-xl bg-violet-100 p-3">
                <Shield className="h-6 w-6 text-violet-600" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Your data stays yours
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                Encrypted storage, secure Google sign-in, and privacy-first design.
                We never sell your financial data.
              </p>
            </div>
            <div className="space-y-3.5">
              {trustItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-border/40 bg-white/50 px-4 py-3"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 pb-24 sm:px-6">
          <div className="landing-cta">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Ready to transform your finances?
              </h2>
              <p className="mx-auto max-w-lg text-lg text-white/85">
                Join thousands of users who have already taken control of their money with Budget Baba.
              </p>
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="h-14 rounded-xl bg-white px-8 text-base font-semibold text-violet-700 shadow-xl hover:bg-white/95"
                >
                  Get Started — It&apos;s Free
                  <ArrowRight className="ml-1 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
