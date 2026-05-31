"use client"

import { ReactNode, useState } from 'react'
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen app-shell">
      {/* Sidebar */}
      {showSidebar && (
        <ModernSidebar 
          isCollapsed={isSidebarCollapsed}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onMobileMenuToggle={() => setIsMobileMenuOpen((open) => !open)}
          onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Main Content Area - Adjusts based on sidebar state */}
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
        showSidebar && !isSidebarCollapsed && "md:pl-64", // Full sidebar width
        showSidebar && isSidebarCollapsed && "md:pl-16",  // Collapsed sidebar width
        !showSidebar && "pl-0" // No sidebar
      )}>
        {/* Top Bar */}
        {showTopBar && (
          <ModernTopBar 
            isSidebarCollapsed={isSidebarCollapsed}
            onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        )}
        
        {/* Page Content - Full width when sidebar collapsed */}
        <main className={cn("flex-1 p-4 sm:p-6", className)}>
          <div className={cn(
            "mx-auto transition-all duration-300 ease-in-out",
            isSidebarCollapsed ? "max-w-none" : "max-w-7xl"
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}