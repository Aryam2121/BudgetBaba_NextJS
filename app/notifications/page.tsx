'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import NotificationCenter from '@/components/NotificationCenter'
import { PageHero, SoftBadge, FeatureTile, TipBanner } from '@/components/dashboard/PageSections'
import {
  Bell,
  BellRing,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Zap,
  Mail,
  Smartphone,
  Volume2,
  Eye,
  Filter
} from 'lucide-react'

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PageHero
          icon={Bell}
          title="Notification Center"
          subtitle="Stay informed about your financial activities and alerts"
          accent="indigo"
          badges={
            <>
              <SoftBadge icon={BellRing} tone="blue">Real-time Alerts</SoftBadge>
              <SoftBadge icon={CheckCircle2} tone="green">Smart Filtering</SoftBadge>
              <SoftBadge icon={Zap} tone="purple">Instant Updates</SoftBadge>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <FeatureTile icon={AlertTriangle} title="Budget Alerts" description="Overspending and limit warnings" tone="red" />
          <FeatureTile icon={Mail} title="Email Summaries" description="Weekly and monthly reports" tone="blue" />
          <FeatureTile icon={CheckCircle2} title="Goal Updates" description="Progress and achievements" tone="green" />
          <FeatureTile icon={MessageCircle} title="Split Updates" description="Group expense notifications" tone="purple" />
        </div>

        <div className="info-panel mb-8">
          <div className="flex gap-4">
            <div className="p-2 rounded-lg bg-muted/60 shrink-0">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">Notification Preferences</h3>
              <div className="grid gap-3 md:grid-cols-3 mb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Smartphone className="h-4 w-4" /> Push Notifications
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" /> Email Alerts
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Volume2 className="h-4 w-4" /> Sound Alerts
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Customize your notification settings in Settings to control how and when you receive alerts.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <FeatureTile icon={Eye} title="Mark All as Read" description="Clear all unread notifications" tone="blue" />
          <FeatureTile icon={Filter} title="Filter by Type" description="Show specific notification categories" tone="purple" />
          <FeatureTile icon={Settings} title="Manage Settings" description="Configure notification preferences" tone="green" />
        </div>

        <NotificationCenter />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
