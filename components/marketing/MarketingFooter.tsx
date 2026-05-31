import Link from "next/link"
import { Logo } from "@/components/brand/Logo"

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/50 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4 md:col-span-2">
            <Logo href="/" size="md" />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Your wise financial companion for smart budgeting, expense tracking, and achieving financial freedom.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Product</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/auth/register" className="transition-colors hover:text-violet-600">
                  Get Started
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="transition-colors hover:text-violet-600">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Features</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>Expense Tracking</li>
              <li>Budget Goals</li>
              <li>AI Insights</li>
              <li>Receipt Scanner</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-border/50 pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Budget Baba. All rights reserved.</p>
          <p>Made with care for smarter money decisions.</p>
        </div>
      </div>
    </footer>
  )
}
