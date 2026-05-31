'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import { PageHero, SoftBadge, FeatureTile, TipBanner } from '@/components/dashboard/PageSections'
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  AlertCircle
} from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PageHero
          icon={BarChart3}
          title="Analytics Dashboard"
          subtitle="Comprehensive insights into your financial patterns and trends"
          accent="blue"
          badges={
            <>
              <SoftBadge icon={Activity} tone="green">Real-time Data</SoftBadge>
              <SoftBadge icon={Target} tone="blue">Smart Insights</SoftBadge>
              <SoftBadge icon={Zap} tone="purple">AI-Powered</SoftBadge>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <FeatureTile
            icon={BarChart3}
            title="Expense Trends"
            description="Track spending patterns over time with interactive charts"
            tone="blue"
          />
          <FeatureTile
            icon={PieChart}
            title="Category Analysis"
            description="Detailed breakdown of spending by categories"
            tone="purple"
          />
          <FeatureTile
            icon={Target}
            title="Budget Performance"
            description="Monitor budget utilization and savings goals"
            tone="green"
          />
        </div>

        <TipBanner title="Pro Tip" icon={AlertCircle}>
          Use the time range selector to compare different periods and identify spending patterns.
          The AI insights will help you optimize your budget based on historical data.
        </TipBanner>

        <AnalyticsDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
