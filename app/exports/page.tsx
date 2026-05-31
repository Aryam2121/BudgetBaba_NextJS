'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import ExportDashboard from '@/components/ExportDashboard'
import { PageHero, SoftBadge, FeatureTile, TipBanner } from '@/components/dashboard/PageSections'
import {
  Download,
  FileText,
  Table,
  PieChart,
  Filter,
  Cloud,
  Archive,
  Mail,
  Clock,
  CheckCircle2,
  Zap,
  Database,
} from 'lucide-react'

const exportFeatures = [
  'Date Range Filtering',
  'Category Selection',
  'Custom Fields',
  'Scheduled Exports',
]

export default function ExportsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PageHero
          icon={Download}
          title="Data Export Center"
          subtitle="Export, backup, and share your financial data in multiple formats"
          accent="emerald"
          badges={
            <>
              <SoftBadge icon={Download} tone="emerald">Multiple Formats</SoftBadge>
              <SoftBadge icon={Filter} tone="blue">Custom Filters</SoftBadge>
              <SoftBadge icon={Zap} tone="purple">Instant Export</SoftBadge>
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <FeatureTile icon={FileText} title="PDF Reports" description="Professional formatted reports" tone="red" />
          <FeatureTile icon={Table} title="Excel / CSV" description="Spreadsheet-ready data" tone="green" />
          <FeatureTile icon={Database} title="JSON Data" description="Raw data for developers" tone="blue" />
          <FeatureTile icon={PieChart} title="Visual Reports" description="Charts and graphs included" tone="purple" />
        </div>

        <div className="info-panel mb-8">
          <div className="flex gap-4">
            <div className="p-2 rounded-lg bg-blue-500/15 shrink-0">
              <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Export Features</h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {exportFeatures.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <FeatureTile icon={Clock} title="Scheduled Exports" description="Automatic weekly or monthly exports" tone="orange" />
          <FeatureTile icon={Mail} title="Email Reports" description="Send directly to your inbox" tone="green" />
          <FeatureTile icon={Archive} title="Cloud Backup" description="Secure cloud storage integration" tone="purple" />
        </div>

        <TipBanner title="Export Best Practices" icon={FileText}>
          <ul className="grid gap-1 md:grid-cols-2 list-none p-0 m-0 text-sm">
            <li>• Use PDF for presentations and reports</li>
            <li>• CSV/Excel for data analysis and accounting software</li>
            <li>• Schedule monthly exports for record keeping</li>
            <li>• Include charts for better data visualization</li>
          </ul>
        </TipBanner>

        <ExportDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
