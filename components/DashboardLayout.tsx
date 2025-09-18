"use client"

import { ReactNode } from 'react'
import { ModernSidebar } from '@/components/ModernSidebar'
import { ModernTopBar } from '@/components/ModernTopBar'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: ReactNode
  className?: string
  showSidebar?: boolean
  showTopBar?: boolean
}

export function DashboardLayout({ 
  children, 
  className,
  showSidebar = true,
  showTopBar = true
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Sidebar */}
      {showSidebar && <ModernSidebar />}
      
      {/* Main Content Area */}
      <div className={cn("flex flex-col min-h-screen", showSidebar && "md:pl-64")}>
        {/* Top Bar */}
        {showTopBar && <ModernTopBar />}
        
        {/* Page Content */}
        <main className={cn("flex-1 p-6", className)}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}