"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/brand/Logo'
import {
  LayoutDashboard,
  Receipt,
  Upload,
  Users,
  PieChart,
  Settings,
  Bell,
  CreditCard,
  Target,
  TrendingUp,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Plus,
  Mail,
  Calendar,
  RotateCcw,
  Download,
  Zap,
  Activity,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Tag,
  Sparkles,
  Scan
} from 'lucide-react'

interface SidebarProps {
  className?: string
  isCollapsed: boolean
  isMobileMenuOpen: boolean
  onToggle: () => void
  onMobileMenuToggle: () => void
  onMobileMenuClose: () => void
}

const navigationItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        badge: null
      },
      {
        title: "Analytics",
        href: "/analytics", 
        icon: TrendingUp,
        badge: null
      },
      {
        title: "Notifications",
        href: "/notifications",
        icon: Bell,
        badge: null
      }
    ]
  },
  {
    title: "Expenses",
    items: [
      {
        title: "All Expenses",
        href: "/expenses",
        icon: Receipt,
        badge: null
      },
      {
        title: "Add Expense",
        href: "/expenses/new",
        icon: Plus,
        badge: null
      },
      {
        title: "Upload Receipts",
        href: "/expenses/upload",
        icon: Upload,
        badge: null
      }
    ]
  },
  {
    title: "Financial Management",
    items: [
      {
        title: "Categories",
        href: "/categories",
        icon: Tag,
        badge: null
      },
      {
        title: "Budget Tracker",
        href: "/budget",
        icon: Target,
        badge: null
      },
      {
        title: "Subscriptions",
        href: "/subscriptions",
        icon: Repeat,
        badge: null
      },
      {
        title: "Goals Tracking",
        href: "/goals",
        icon: Zap,
        badge: null
      },
      {
        title: "Recurring Transactions",
        href: "/recurring",
        icon: RotateCcw,
        badge: null
      }
    ]
  },
  {
    title: "Collaboration",
    items: [
      {
        title: "Expense Splits",
        href: "/splits",
        icon: Users,
        badge: null
      },
      {
        title: "Groups",
        href: "/groups",
        icon: Users,
        badge: null
      }
    ]
  },
  {
    title: "Tools & Reports",
    items: [
      {
        title: "AI Insights",
        href: "/insights",
        icon: Sparkles,
        badge: "New"
      },
      {
        title: "Receipt Scanner",
        href: "/receipts",
        icon: Scan,
        badge: "AI"
      },
      {
        title: "Data Exports",
        href: "/exports",
        icon: Download,
        badge: null
      },
      {
        title: "Reports",
        href: "/reports",
        icon: Calendar,
        badge: null
      },
      {
        title: "Email Settings",
        href: "/email-settings",
        icon: Mail,
        badge: null
      }
    ]
  }
]

export function ModernSidebar({ 
  className, 
  isCollapsed, 
  isMobileMenuOpen, 
  onToggle, 
  onMobileMenuToggle,
  onMobileMenuClose 
}: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden bg-background/90 backdrop-blur-sm shadow-lg"
        onClick={onMobileMenuToggle}
      >
        {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => onMobileMenuClose()}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border shadow-xl shadow-violet-500/5 transition-all duration-300 z-50",
          isCollapsed ? "w-16" : "w-64",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-sidebar-border p-4">
            <div className="flex items-center justify-between">
              {!isCollapsed ? (
                <Logo href="/dashboard" size="sm" />
              ) : (
                <div className="mx-auto brand-icon h-8 w-8 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggle()}
                className="hidden md:flex h-8 w-8 p-0"
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* User Profile — compact */}
          <div className="border-b border-sidebar-border px-4 py-3">
            <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
              <Avatar className="h-9 w-9 ring-2 ring-violet-500/25 shrink-0">
                <AvatarFallback className="brand-icon text-white font-semibold text-sm">
                  {user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email || 'user@email.com'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4 space-y-6">
            {navigationItems.map((section, sectionIndex) => (
              <div key={section.title}>
                {!isCollapsed && (
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                    {section.title}
                  </h3>
                )}
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.href}>
                        <Link href={item.href} onClick={() => onMobileMenuClose()}>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start h-9 px-3 rounded-lg text-sm",
                              isActive 
                                ? "nav-active hover:bg-violet-500/10 dark:hover:bg-violet-500/15 font-medium" 
                                : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/80",
                              isCollapsed && "justify-center px-0"
                            )}
                          >
                            <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                            {!isCollapsed && (
                              <>
                                <span className="flex-1 text-left">{item.title}</span>
                                {item.badge && (
                                  <Badge 
                                    variant="secondary" 
                                    className="ml-2 h-5 px-1.5 text-xs bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </>
                            )}
                          </Button>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4 space-y-2">
            <Link href="/system-status">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-10 px-3 text-muted-foreground hover:text-foreground hover:bg-accent",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <Activity className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && "System Status"}
              </Button>
            </Link>
            <Link href="/help">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-10 px-3 text-muted-foreground hover:text-foreground hover:bg-accent",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <HelpCircle className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && "Help & Support"}
              </Button>
            </Link>
            <Link href="/settings">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-10 px-3 text-muted-foreground hover:text-foreground hover:bg-accent",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <Settings className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && "Settings"}
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={logout}
              className={cn(
                "w-full justify-start h-10 px-3 text-red-600 hover:text-red-500 hover:bg-red-500/10 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10",
                isCollapsed && "justify-center px-0"
              )}
            >
              <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
              {!isCollapsed && "Sign Out"}
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}