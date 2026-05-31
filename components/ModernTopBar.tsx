"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import {
  Bell,
  Search,
  Plus,
  ChevronRight,
  Home,
  Calendar,
  Filter,
  Download,
  Settings,
  Moon,
  Sun,
  Menu,
  Globe,
  CreditCard
} from 'lucide-react'

interface TopBarProps {
  className?: string
  isSidebarCollapsed: boolean
  onMobileMenuToggle: () => void
}

const pathLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/expenses': 'All Expenses',
  '/expenses/new': 'Add Expense',
  '/expenses/upload': 'Upload Receipts',
  '/expenses/categories': 'Categories',
  '/splits': 'Expense Splits',
  '/groups': 'Groups',
  '/budget': 'Budget Tracker',
  '/goals': 'Goals Tracking',
  '/recurring': 'Recurring Transactions',
  '/notifications': 'Notifications',
  '/exports': 'Data Exports',
  '/reports': 'Reports',
  '/analytics': 'Analytics',
  '/system-status': 'System Status',
  '/settings': 'Settings',
  '/help': 'Help & Support'
}

export function ModernTopBar({ className, isSidebarCollapsed, onMobileMenuToggle }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const [notifications] = useState([
    { id: 1, message: 'New expense split request from John', unread: true },
    { id: 2, message: 'Monthly budget limit reached', unread: true },
    { id: 3, message: 'Expense approved by manager', unread: false }
  ])
  
  const pathname = usePathname()
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Generate breadcrumbs from pathname
  const breadcrumbs = pathname.split('/').filter(Boolean).map((segment, index, arr) => {
    const path = '/' + arr.slice(0, index + 1).join('/')
    return {
      label: pathLabels[path] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: path,
      isLast: index === arr.length - 1
    }
  })

  // Add home breadcrumb
  if (pathname !== '/dashboard' && breadcrumbs.length > 0) {
    breadcrumbs.unshift({ label: 'Dashboard', href: '/dashboard', isLast: false })
  }

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-border/60",
      className
    )}>
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section - Breadcrumbs */}
        <div className="flex items-center space-x-4 flex-1">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2"
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-1 text-sm">
            <Link 
              href="/dashboard"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center space-x-1">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                {crumb.isLast ? (
                  <span className="font-medium text-foreground">{crumb.label}</span>
                ) : (
                  <Link 
                    href={crumb.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Center Section - Search */}
        <div className="flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search expenses, categories, splits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-muted/50 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40 transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center space-x-3">
          {/* Quick Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/expenses/new">
              <Button size="sm" className="brand-btn">
                <Plus className="h-4 w-4 mr-1" />
                Add Expense
              </Button>
            </Link>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
            
            <Link href="/exports">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </Link>
          </div>

          {/* Notifications */}
          <Link href="/notifications">
            <div className="relative">
              <Button variant="ghost" size="sm" className="relative p-2">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </div>
          </Link>

          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {mounted && theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Settings */}
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="p-2">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>

          {/* User Profile */}
          <div className="flex items-center space-x-2 pl-2 border-l border-border/60">
            <Avatar className="h-8 w-8 ring-2 ring-violet-500/20 shrink-0">
              <AvatarFallback className="brand-icon text-white font-semibold text-xs">
                {user?.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-6 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
      </div>

      {/* Page Actions Bar */}
      {pathname === '/expenses' && (
        <div className="border-t border-border px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                This Month
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                All Categories
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Link href="/expenses/upload">
                <Button variant="outline" size="sm">
                  Upload Receipt
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}