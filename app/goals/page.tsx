'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import GoalsTracking from '@/components/GoalsTracking'
import { PageHero, SoftBadge, FeatureTile } from '@/components/dashboard/PageSections'
import {
  Target,
  Trophy,
  TrendingUp,
  Calendar,
  Rocket,
  CheckCircle2,
  Flag,
  DollarSign,
  Lightbulb,
  Award,
} from 'lucide-react'

export default function GoalsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PageHero
          icon={Target}
          title="Financial Goals"
          subtitle="Transform your dreams into achievable financial milestones"
          accent="emerald"
          badges={
            <>
              <SoftBadge icon={Trophy} tone="amber">Goal Tracking</SoftBadge>
              <SoftBadge icon={CheckCircle2} tone="green">Progress Monitoring</SoftBadge>
              <SoftBadge icon={Rocket} tone="purple">Achievement Rewards</SoftBadge>
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <FeatureTile icon={DollarSign} title="Savings Goals" description="Emergency fund, vacation, purchases" tone="blue" />
          <FeatureTile icon={TrendingUp} title="Investment Goals" description="Retirement, stocks, real estate" tone="green" />
          <FeatureTile icon={Flag} title="Debt Payoff" description="Credit cards, loans, mortgages" tone="purple" />
          <FeatureTile icon={Calendar} title="Time-based Goals" description="Monthly, quarterly, yearly targets" tone="orange" />
        </div>

        <div className="info-panel mb-8">
          <div className="flex gap-4">
            <div className="p-2 rounded-lg bg-emerald-500/15 shrink-0">
              <Lightbulb className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">SMART Goal Framework</h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {['Specific', 'Measurable', 'Achievable', 'Relevant', 'Time-bound'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="info-panel mb-8 text-center">
          <div className="w-12 h-12 brand-icon rounded-full flex items-center justify-center mx-auto mb-3">
            <Award className="h-6 w-6 text-white" />
          </div>
          <blockquote className="text-base font-medium text-foreground">
            &ldquo;A goal without a plan is just a wish.&rdquo;
          </blockquote>
          <p className="text-sm text-muted-foreground mt-1">— Antoine de Saint-Exupéry</p>
        </div>

        <GoalsTracking />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
