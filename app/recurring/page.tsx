'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import RecurringTransactions from '@/components/RecurringTransactions'
import { PageHero, SoftBadge, FeatureTile, TipBanner } from '@/components/dashboard/PageSections'
import {
  RotateCcw,
  Calendar,
  Clock,
  Repeat,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  Zap,
  CreditCard,
  DollarSign,
  TrendingUp,
  Settings,
} from 'lucide-react'

const schedules = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Semi-annually', 'Annually', 'Custom']

export default function RecurringPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PageHero
          icon={RotateCcw}
          title="Recurring Transactions"
          subtitle="Automate and manage your repeating income and expenses"
          accent="blue"
          badges={
            <>
              <SoftBadge icon={RotateCcw} tone="emerald">Auto-Processing</SoftBadge>
              <SoftBadge icon={Calendar} tone="blue">Smart Scheduling</SoftBadge>
              <SoftBadge icon={Zap} tone="purple">Never Miss a Payment</SoftBadge>
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <FeatureTile icon={TrendingUp} title="Income" description="Salary, freelance, investments" tone="green" />
          <FeatureTile icon={CreditCard} title="Bills & Utilities" description="Rent, electricity, internet" tone="red" />
          <FeatureTile icon={DollarSign} title="Subscriptions" description="Netflix, Spotify, gym memberships" tone="blue" />
          <FeatureTile icon={Repeat} title="Custom Schedule" description="Flexible recurring patterns" tone="purple" />
        </div>

        <div className="info-panel mb-8">
          <div className="flex gap-4">
            <div className="p-2 rounded-lg bg-violet-500/15 shrink-0">
              <Clock className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Scheduling Options</h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {schedules.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <FeatureTile icon={PlayCircle} title="Active Transactions" description="Currently processing automatically" tone="green" />
          <FeatureTile icon={PauseCircle} title="Paused Transactions" description="Temporarily disabled scheduling" tone="amber" />
          <FeatureTile icon={Settings} title="Schedule Management" description="Modify timing and frequency" tone="blue" />
        </div>

        <TipBanner title="Benefits of Automation" icon={Zap}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" /> Never miss payments</span>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0" /> Save time</span>
            <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 shrink-0" /> Better budgeting</span>
            <span className="flex items-center gap-2"><DollarSign className="h-4 w-4 shrink-0" /> Avoid late fees</span>
          </div>
        </TipBanner>

        <RecurringTransactions />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
