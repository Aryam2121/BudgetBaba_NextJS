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
} from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: Zap,
    title: "Smart AI Categorization",
    description: "Automatically categorize expenses with high accuracy using advanced AI that learns your habits.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: TrendingUp,
    title: "Predictive Budget Insights",
    description: "Real-time alerts and spending predictions so you stay ahead of your budget every month.",
    color: "from-violet-500 to-indigo-600",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Personalized email summaries and alerts for every transaction and budget milestone.",
    color: "from-fuchsia-500 to-violet-600",
  },
  {
    icon: Receipt,
    title: "Receipt Scanner",
    description: "Snap a photo and let AI extract amounts, merchants, and categories instantly.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: Target,
    title: "Goals & Budgets",
    description: "Set savings goals and category budgets with visual progress tracking.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Users,
    title: "Split Expenses",
    description: "Split bills with friends and track who owes what — no awkward math.",
    color: "from-rose-500 to-pink-600",
  },
]

const stats = [
  { value: "10K+", label: "Active users" },
  { value: "₹50Cr+", label: "Tracked monthly" },
  { value: "95%", label: "AI accuracy" },
  { value: "4.9★", label: "User rating" },
]

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) router.push("/dashboard")
  }, [user, router])

  if (user) return null

  return (
    <div className="min-h-screen landing-mesh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo href="/" size="md" />
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="font-medium">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="brand-btn">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto px-4 pt-16 pb-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/60 dashboard-panel px-4 py-1.5 mb-8 text-sm font-medium text-violet-700">
            <Sparkles className="h-4 w-4" />
            Your wise financial companion
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1] max-w-4xl mx-auto">
            Take control of your{" "}
            <span className="gradient-text">financial future</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Track expenses, manage budgets, and get AI-powered insights.
            Make every rupee count with intelligent financial tracking built for India.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link href="/auth/register">
              <Button size="lg" className="brand-btn h-14 px-8 text-base w-full sm:w-auto">
                Start Tracking Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base w-full sm:w-auto dashboard-panel">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            {["100% Free", "Bank-grade Security", "INR & Multi-currency", "No Ads"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="container mx-auto px-4 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card rounded-xl p-5 text-center">
                <p className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 pb-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything you need to{" "}
              <span className="gradient-text">master your money</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Powerful tools designed to simplify expense tracking, budgeting, and financial planning.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="feature-card group">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust */}
        <section className="container mx-auto px-4 pb-24">
          <div className="glass-card rounded-3xl p-8 sm:p-12 grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="inline-flex p-3 rounded-xl bg-violet-100 dark:bg-violet-950">
                <Shield className="h-6 w-6 text-violet-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">Your data stays yours</h2>
              <p className="text-muted-foreground leading-relaxed">
                Encrypted storage, secure Google sign-in, and privacy-first design.
                We never sell your financial data.
              </p>
            </div>
            <div className="space-y-4">
              {[
                "End-to-end encrypted credentials",
                "OAuth 2.0 secure authentication",
                "Export your data anytime",
                "Dark mode & multi-currency support",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 pb-24">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-800 p-10 sm:p-16 text-center text-white">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-black/10 blur-3xl" />
            </div>
            <div className="relative z-10 space-y-6">
              <BarChart3 className="h-12 w-12 mx-auto text-white/80" />
              <h2 className="text-3xl sm:text-4xl font-bold">Ready to transform your finances?</h2>
              <p className="text-lg text-white/80 max-w-lg mx-auto">
                Join thousands of users who have already taken control of their money with Budget Baba.
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="h-14 px-8 bg-white text-violet-700 hover:bg-white/90 shadow-xl">
                  Get Started — It&apos;s Free
                  <ArrowRight className="ml-2 h-5 w-5" />
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
