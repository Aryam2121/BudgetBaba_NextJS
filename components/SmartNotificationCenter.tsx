"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Bell, BellRing, Settings, Filter, Search, Check, X, Trash2,
  DollarSign, Target, Calendar, Users, TrendingUp, AlertTriangle,
  Info, CheckCircle, XCircle, Clock, Star, Archive, Volume2, VolumeX, Award
} from 'lucide-react'
import { useSocket } from '@/contexts/SocketContext'
import { api } from '@/lib/api'
import { getListFromResponse } from '@/lib/api-utils'
import { useCurrency } from '@/hooks/useCurrency'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: 'budget' | 'goal' | 'expense' | 'split' | 'system' | 'achievement'
  title: string
  message: string
  data?: any
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  createdAt: string
  expiresAt?: string
  actions?: NotificationAction[]
}

interface NotificationAction {
  id: string
  label: string
  type: 'primary' | 'secondary' | 'danger'
  action: string
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  soundEnabled: boolean
  budgetAlerts: boolean
  goalReminders: boolean
  expenseAlerts: boolean
  splitNotifications: boolean
  systemUpdates: boolean
  achievementBadges: boolean
  weeklyReports: boolean
  monthlyReports: boolean
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

const notificationIcons = {
  budget: Target,
  goal: Star,
  expense: DollarSign,
  split: Users,
  system: Settings,
  achievement: Award
}

const priorityColors = {
  low: 'bg-gray-100 border-gray-300',
  medium: 'bg-blue-50 border-blue-300',
  high: 'bg-orange-50 border-orange-300',
  urgent: 'bg-red-50 border-red-300'
}

export function SmartNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    budgetAlerts: true,
    goalReminders: true,
    expenseAlerts: true,
    splitNotifications: true,
    systemUpdates: true,
    achievementBadges: true,
    weeklyReports: true,
    monthlyReports: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  })
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const { socket } = useSocket()
  const { formatCurrency } = useCurrency()
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    loadNotifications()
    loadSettings()
    setupSocketListeners()
    requestNotificationPermission()

    return () => {
      if (socket) {
        socket.off('notification')
        socket.off('notificationRead')
        socket.off('notificationDeleted')
      }
    }
  }, [socket])

  useEffect(() => {
    filterNotifications()
  }, [notifications, searchQuery, filterType, activeTab])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await api.getNotifications()
      setNotifications(getListFromResponse(response.data, ['notifications']))
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await api.getNotificationSettings()
      if (response.data) {
        setSettings(response.data)
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error)
    }
  }

  const setupSocketListeners = () => {
    if (socket) {
      socket.on('notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev])
        playNotificationSound()
        showBrowserNotification(notification)
      })

      socket.on('notificationRead', (notificationId: string) => {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        )
      })

      socket.on('notificationDeleted', (notificationId: string) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
      })
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  const playNotificationSound = () => {
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error)
    }
  }

  const showBrowserNotification = (notification: Notification) => {
    if (settings.pushNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/icon-192x192.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent'
      })
    }
  }

  const filterNotifications = () => {
    let filtered = notifications

    // Filter by tab
    if (activeTab !== 'all') {
      if (activeTab === 'unread') {
        filtered = filtered.filter(n => !n.read)
      } else if (activeTab === 'priority') {
        filtered = filtered.filter(n => n.priority === 'high' || n.priority === 'urgent')
      } else {
        filtered = filtered.filter(n => n.type === activeTab)
      }
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.category.toLowerCase().includes(query)
      )
    }

    setFilteredNotifications(filtered)
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await api.markNotificationAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await api.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleNotificationAction = async (notification: Notification, actionId: string) => {
    try {
      await api.handleNotificationAction(notification.id, actionId)
      // Handle specific actions based on action type
      // This would typically trigger navigation or API calls
    } catch (error) {
      console.error('Failed to handle notification action:', error)
    }
  }

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings }
      await api.updateNotificationSettings(updatedSettings)
      setSettings(updatedSettings)
    } catch (error) {
      console.error('Failed to update notification settings:', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-8 h-8 text-blue-600" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 px-2 py-1 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Smart Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="budget">Budget</option>
              <option value="goal">Goals</option>
              <option value="expense">Expenses</option>
              <option value="split">Splits</option>
              <option value="achievement">Achievements</option>
              <option value="system">System</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Tabs and Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">
            All
            {notifications.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {notifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge className="ml-2">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="priority">Priority</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="goal">Goals</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Notifications List */}
        <TabsContent value={activeTab} className={activeTab !== 'settings' ? 'block' : 'hidden'}>
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                {filteredNotifications.length} notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications found</p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {filteredNotifications.map((notification, index) => {
                      const Icon = notificationIcons[notification.type] || Info
                      
                      return (
                        <div key={notification.id}>
                          <div
                            className={`p-4 hover:bg-muted/40 transition-colors ${
                              !notification.read ? 'bg-blue-50' : ''
                            } ${priorityColors[notification.priority]}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full ${
                                notification.priority === 'urgent' ? 'bg-red-100' :
                                notification.priority === 'high' ? 'bg-orange-100' :
                                notification.priority === 'medium' ? 'bg-blue-100' :
                                'bg-gray-100'
                              }`}>
                                <Icon className={`w-4 h-4 ${
                                  notification.priority === 'urgent' ? 'text-red-600' :
                                  notification.priority === 'high' ? 'text-orange-600' :
                                  notification.priority === 'medium' ? 'text-blue-600' :
                                  'text-gray-600'
                                }`} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                      {notification.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mt-1">
                                      {notification.message}
                                    </p>
                                    
                                    {/* Notification Data Display */}
                                    {notification.data && (
                                      <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                                        {notification.type === 'budget' && notification.data.amount && (
                                          <span>Amount: {formatCurrency(notification.data.amount)}</span>
                                        )}
                                        {notification.type === 'goal' && notification.data.progress && (
                                          <span>Progress: {notification.data.progress}%</span>
                                        )}
                                      </div>
                                    )}
                                    
                                    {/* Action Buttons */}
                                    {notification.actions && notification.actions.length > 0 && (
                                      <div className="flex gap-2 mt-3">
                                        {notification.actions.map((action) => (
                                          <Button
                                            key={action.id}
                                            size="sm"
                                            variant={action.type === 'primary' ? 'default' : 'outline'}
                                            onClick={() => handleNotificationAction(notification, action.id)}
                                          >
                                            {action.label}
                                          </Button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 ml-4">
                                    <Badge variant={notification.priority === 'urgent' ? 'destructive' : 'secondary'}>
                                      {notification.priority}
                                    </Badge>
                                    <div className="flex gap-1">
                                      {!notification.read && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => markAsRead(notification.id)}
                                        >
                                          <Check className="w-4 h-4" />
                                        </Button>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => deleteNotification(notification.id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {notification.category}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          {index < filteredNotifications.length - 1 && <Separator />}
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Customize how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* General Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium">General</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <Switch
                        id="email-notifications"
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => 
                          updateSettings({ emailNotifications: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <Switch
                        id="push-notifications"
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => 
                          updateSettings({ pushNotifications: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sound-enabled">Notification Sounds</Label>
                      <Switch
                        id="sound-enabled"
                        checked={settings.soundEnabled}
                        onCheckedChange={(checked) => 
                          updateSettings({ soundEnabled: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Category Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium">Categories</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="budget-alerts">Budget Alerts</Label>
                      <Switch
                        id="budget-alerts"
                        checked={settings.budgetAlerts}
                        onCheckedChange={(checked) => 
                          updateSettings({ budgetAlerts: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="goal-reminders">Goal Reminders</Label>
                      <Switch
                        id="goal-reminders"
                        checked={settings.goalReminders}
                        onCheckedChange={(checked) => 
                          updateSettings({ goalReminders: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="expense-alerts">Expense Alerts</Label>
                      <Switch
                        id="expense-alerts"
                        checked={settings.expenseAlerts}
                        onCheckedChange={(checked) => 
                          updateSettings({ expenseAlerts: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="split-notifications">Split Notifications</Label>
                      <Switch
                        id="split-notifications"
                        checked={settings.splitNotifications}
                        onCheckedChange={(checked) => 
                          updateSettings({ splitNotifications: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="achievement-badges">Achievement Badges</Label>
                      <Switch
                        id="achievement-badges"
                        checked={settings.achievementBadges}
                        onCheckedChange={(checked) => 
                          updateSettings({ achievementBadges: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Quiet Hours */}
                <div className="space-y-4">
                  <h3 className="font-medium">Quiet Hours</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
                      <Switch
                        id="quiet-hours"
                        checked={settings.quietHours.enabled}
                        onCheckedChange={(checked) => 
                          updateSettings({
                            quietHours: { ...settings.quietHours, enabled: checked }
                          })
                        }
                      />
                    </div>
                    {settings.quietHours.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="quiet-start">Start Time</Label>
                          <Input
                            id="quiet-start"
                            type="time"
                            value={settings.quietHours.start}
                            onChange={(e) => 
                              updateSettings({
                                quietHours: { ...settings.quietHours, start: e.target.value }
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="quiet-end">End Time</Label>
                          <Input
                            id="quiet-end"
                            type="time"
                            value={settings.quietHours.end}
                            onChange={(e) => 
                              updateSettings({
                                quietHours: { ...settings.quietHours, end: e.target.value }
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Hidden audio element for notification sounds */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
        <source src="/sounds/notification.ogg" type="audio/ogg" />
      </audio>
    </div>
  )
}