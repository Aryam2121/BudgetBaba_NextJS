'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import BudgetManagement from '@/components/BudgetManagement'
import { PageHero, SoftBadge, FeatureTile, TipBanner } from '@/components/dashboard/PageSections'
import { Target, TrendingUp, AlertTriangle, Award, CheckCircle2, Zap, PiggyBank } from 'lucide-react'

export default function BudgetPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PageHero
          icon={Target}
          title="Budget Management"
          subtitle="Take control of your finances with smart budgeting tools"
          accent="emerald"
          badges={
            <>
              <SoftBadge icon={CheckCircle2} tone="green">Smart Tracking</SoftBadge>
              <SoftBadge icon={Target} tone="blue">Goal-Oriented</SoftBadge>
              <SoftBadge icon={Zap} tone="purple">Auto-Alerts</SoftBadge>
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <FeatureTile icon={Target} title="Set Budget Goals" description="Create category-wise spending limits" tone="green" />
          <FeatureTile icon={TrendingUp} title="Track Progress" description="Monitor spending against budgets" tone="blue" />
          <FeatureTile icon={AlertTriangle} title="Smart Alerts" description="Get notified before overspending" tone="purple" />
          <FeatureTile icon={Award} title="Achieve Goals" description="Celebrate budget milestones" tone="orange" />
        </div>

        <TipBanner title="Budget Success Tips" icon={PiggyBank}>
          <ul className="grid gap-1 md:grid-cols-2 list-none p-0 m-0 text-sm">
            <li>• Start with the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
            <li>• Review and adjust budgets monthly based on spending patterns</li>
            <li>• Set realistic goals to avoid budget fatigue</li>
            <li>• Use envelope method for discretionary spending</li>
          </ul>
        </TipBanner>

        <BudgetManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
