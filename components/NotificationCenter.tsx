import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, Check, Trash2, Settings, Filter } from 'lucide-react'
import { api } from '@/lib/api'
import { getListFromResponse } from '@/lib/api-utils'
import { useToast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  isRead: boolean
  createdAt: string
  expiresAt?: string
  data?: any
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const { toast } = useToast()

  useEffect(() => {
    fetchNotifications()
  }, [filter, priorityFilter])

  const fetchNotifications = async () => {
    try {
      const filters: any = {}
      if (filter !== 'all') {
        if (filter === 'unread') filters.isRead = false
        else filters.type = filter
      }
      if (priorityFilter !== 'all') filters.priority = priorityFilter

      const response = await api.getNotifications(filters)
      if (response.data) {
        setNotifications(getListFromResponse(response.data, ['notifications']))
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await api.markNotificationAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      )
      toast({
        title: 'Success',
        description: 'Notification marked as read'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      toast({
        title: 'Success',
        description: 'All notifications marked as read'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive'
      })
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await api.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n._id !== notificationId))
      toast({
        title: 'Success',
        description: 'Notification deleted'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive'
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'budget_alert': return '💰'
      case 'goal_milestone': return '🎯'
      case 'split_created': return '💸'
      case 'recurring_processed': return '🔄'
      case 'weekly_summary': return '📊'
      default: return '🔔'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={markAllAsRead}
            variant="outline"
            size="sm"
            disabled={unreadCount === 0}
          >
            <Check className="h-4 w-4 mr-1" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
        <Filter className="h-4 w-4" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Notifications</SelectItem>
            <SelectItem value="unread">Unread Only</SelectItem>
            <SelectItem value="budget_alert">Budget Alerts</SelectItem>
            <SelectItem value="goal_milestone">Goal Updates</SelectItem>
            <SelectItem value="split_created">Split Expenses</SelectItem>
            <SelectItem value="recurring_processed">Recurring</SelectItem>
            <SelectItem value="weekly_summary">Summaries</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No notifications found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification._id} 
              className={`transition-all duration-200 hover:shadow-md ${
                !notification.isRead ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl">{getTypeIcon(notification.type)}</div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <Badge 
                          variant="outline" 
                          className={`${getPriorityColor(notification.priority)} text-white border-0`}
                        >
                          {notification.priority}
                        </Badge>
                        {!notification.isRead && (
                          <Badge variant="secondary">New</Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground text-sm">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatTimeAgo(notification.createdAt)}</span>
                        {notification.expiresAt && (
                          <span>Expires: {new Date(notification.expiresAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <Button
                        onClick={() => markAsRead(notification._id)}
                        variant="outline"
                        size="sm"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => deleteNotification(notification._id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default NotificationCenter