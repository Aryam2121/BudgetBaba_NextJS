"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
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
  Calendar
} from 'lucide-react'

interface SidebarProps {
  className?: string
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
      },
      {
        title: "Categories",
        href: "/expenses/categories",
        icon: PieChart,
        badge: null
      }
    ]
  },
  {
    title: "Splits & Groups",
    items: [
      {
        title: "Expense Splits",
        href: "/splits",
        icon: Users,
        badge: 3 // Pending splits
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
    title: "Tools",
    items: [
      {
        title: "Budget Tracker",
        href: "/budget",
        icon: Target,
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

export function ModernSidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden bg-white/90 backdrop-blur-sm shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-white/95 backdrop-blur-xl border-r border-slate-200/60 transition-all duration-300 z-50",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-slate-200/60 p-4">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">Smart Expense</h2>
                    <p className="text-xs text-slate-500">Tracker</p>
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:flex h-8 w-8 p-0"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* User Profile */}
          <div className="border-b border-slate-200/60 p-4">
            <div className={cn("flex items-center", isCollapsed ? "justify-center" : "space-x-3")}>
              <Avatar className="h-10 w-10 ring-2 ring-blue-500/20">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                  {user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email || 'user@email.com'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {navigationItems.map((section, sectionIndex) => (
              <div key={section.title}>
                {!isCollapsed && (
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">
                    {section.title}
                  </h3>
                )}
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.href}>
                        <Link href={item.href} onClick={() => setIsMobileOpen(false)}>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start h-10 px-3",
                              isActive 
                                ? "bg-blue-50 text-blue-700 hover:bg-blue-100 border-r-2 border-blue-500" 
                                : "text-slate-600 hover:text-slate-800 hover:bg-slate-50",
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
                                    className="ml-2 h-5 px-1.5 text-xs bg-blue-100 text-blue-700"
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
          <div className="border-t border-slate-200/60 p-4 space-y-2">
            <Link href="/help">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-10 px-3 text-slate-600 hover:text-slate-800 hover:bg-slate-50",
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
                  "w-full justify-start h-10 px-3 text-slate-600 hover:text-slate-800 hover:bg-slate-50",
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
                "w-full justify-start h-10 px-3 text-red-600 hover:text-red-700 hover:bg-red-50",
                isCollapsed && "justify-center px-0"
              )}
            >
              <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
              {!isCollapsed && "Sign Out"}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Spacer */}
      <div className={cn("hidden md:block transition-all duration-300", isCollapsed ? "w-16" : "w-64")} />
    </>
  )
}