import Link from "next/link"
import { Logo } from "@/components/brand/Logo"

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2 space-y-4">
            <Logo href="/" size="md" />
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Your wise financial companion for smart budgeting, expense tracking, and achieving financial freedom.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/auth/register" className="hover:text-foreground transition-colors">Get Started</Link></li>
              <li><Link href="/auth/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Expense Tracking</li>
              <li>Budget Goals</li>
              <li>AI Insights</li>
              <li>Receipt Scanner</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Budget Baba. All rights reserved.</p>
          <p>Made with care for smarter money decisions.</p>
        </div>
      </div>
    </footer>
  )
}
