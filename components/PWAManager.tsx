"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Smartphone, Download, Bell, Wifi, WifiOff, RefreshCw, CheckCircle,
  X, Settings, Home, Share, Camera, Zap
} from 'lucide-react'

interface PWAInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface OfflineQueueItem {
  id: string
  type: 'expense' | 'budget' | 'goal'
  data: any
  timestamp: number
  retries: number
}

export function PWAManager() {
  const [isOnline, setIsOnline] = useState(true)
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>([])
  const [syncingData, setSyncingData] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    // Check if app is already installed
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches)

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as any)
    }

    // Listen for online/offline status
    const handleOnline = () => {
      setIsOnline(true)
      syncOfflineData()
    }
    const handleOffline = () => setIsOnline(false)

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Check current online status
    setIsOnline(navigator.onLine)

    // Load offline queue from localStorage
    loadOfflineQueue()

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const installPWA = async () => {
    if (!installPrompt) return

    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setInstallPrompt(null)
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      
      if (permission === 'granted') {
        // Register for push notifications
        registerForPushNotifications()
      }
    }
  }

  const registerForPushNotifications = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        })

        // Send subscription to server
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(subscription)
        })
      } catch (error) {
        console.error('Push notification registration failed:', error)
      }
    }
  }

  const loadOfflineQueue = () => {
    try {
      const queue = localStorage.getItem('offlineQueue')
      if (queue) {
        setOfflineQueue(JSON.parse(queue))
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error)
    }
  }

  const saveOfflineQueue = (queue: OfflineQueueItem[]) => {
    try {
      localStorage.setItem('offlineQueue', JSON.stringify(queue))
      setOfflineQueue(queue)
    } catch (error) {
      console.error('Failed to save offline queue:', error)
    }
  }

  const addToOfflineQueue = (type: 'expense' | 'budget' | 'goal', data: any) => {
    const item: OfflineQueueItem = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: Date.now(),
      retries: 0
    }
    
    const newQueue = [...offlineQueue, item]
    saveOfflineQueue(newQueue)
  }

  const syncOfflineData = async () => {
    if (!isOnline || offlineQueue.length === 0) return

    setSyncingData(true)
    const successfulSyncs: string[] = []

    for (const item of offlineQueue) {
      try {
        let endpoint = ''
        switch (item.type) {
          case 'expense':
            endpoint = '/api/expenses'
            break
          case 'budget':
            endpoint = '/api/budgets'
            break
          case 'goal':
            endpoint = '/api/goals'
            break
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(item.data)
        })

        if (response.ok) {
          successfulSyncs.push(item.id)
        } else {
          // Increment retry count
          item.retries++
          if (item.retries >= 3) {
            // Remove after 3 failed attempts
            successfulSyncs.push(item.id)
          }
        }
      } catch (error) {
        console.error('Sync failed for item:', item.id, error)
        item.retries++
        if (item.retries >= 3) {
          successfulSyncs.push(item.id)
        }
      }
    }

    // Remove successfully synced items
    const remainingQueue = offlineQueue.filter(item => !successfulSyncs.includes(item.id))
    saveOfflineQueue(remainingQueue)
    setSyncingData(false)

    if (successfulSyncs.length > 0) {
      showNotification('Sync Complete', `${successfulSyncs.length} items synced successfully`)
    }
  }

  const showNotification = (title: string, body: string) => {
    if (notificationPermission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge.png'
      })
    }
  }

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Budget Baba - Smart Expense Tracker',
          text: 'Check out this amazing expense tracking app!',
          url: window.location.origin
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.origin)
      alert('App URL copied to clipboard!')
    }
  }

  const addToHomeScreen = () => {
    if (installPrompt) {
      installPWA()
    } else {
      // Show manual instructions
      alert('To add this app to your home screen:\n\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm')
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* PWA Status Card */}
      <Card className={`border-l-4 ${isOnline ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-red-600" />}
            App Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              <span className="text-sm text-gray-600">
                {isOnline ? 'All features available' : 'Limited functionality'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={isInstalled ? "default" : "secondary"}>
                {isInstalled ? 'Installed' : 'Not Installed'}
              </Badge>
              <span className="text-sm text-gray-600">
                {isInstalled ? 'Running as app' : 'Running in browser'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={offlineQueue.length > 0 ? "secondary" : "default"}>
                {offlineQueue.length} Pending
              </Badge>
              <span className="text-sm text-gray-600">
                {offlineQueue.length > 0 ? 'Items to sync' : 'All synced'}
              </span>
            </div>
          </div>

          {/* Sync Status */}
          {offlineQueue.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 text-yellow-600 ${syncingData ? 'animate-spin' : ''}`} />
                  <span className="text-sm text-yellow-800">
                    {syncingData ? 'Syncing data...' : `${offlineQueue.length} items waiting to sync`}
                  </span>
                </div>
                {isOnline && !syncingData && (
                  <Button size="sm" onClick={syncOfflineData}>
                    Sync Now
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Installation Card */}
      {!isInstalled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              Install App
            </CardTitle>
            <CardDescription>
              Install Budget Baba on your device for the best experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Benefits of Installing:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Works offline</li>
                    <li>• Faster loading</li>
                    <li>• Push notifications</li>
                    <li>• Full screen experience</li>
                    <li>• Home screen access</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Features Available:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Add expenses offline</li>
                    <li>• View cached data</li>
                    <li>• Auto-sync when online</li>
                    <li>• Background notifications</li>
                    <li>• Quick actions</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-2">
                {installPrompt ? (
                  <Button onClick={installPWA} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Install App
                  </Button>
                ) : (
                  <Button onClick={addToHomeScreen} variant="outline" className="flex-1">
                    <Home className="w-4 h-4 mr-2" />
                    Add to Home Screen
                  </Button>
                )}
                <Button onClick={shareApp} variant="outline">
                  <Share className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" />
            Notifications
          </CardTitle>
          <CardDescription>
            Stay updated with budget alerts and reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Push Notifications</div>
                <div className="text-sm text-gray-600">
                  {notificationPermission === 'granted' 
                    ? 'Enabled - You\'ll receive budget alerts and reminders'
                    : notificationPermission === 'denied'
                    ? 'Blocked - Enable in browser settings to receive notifications'
                    : 'Not enabled - Click to enable notifications'
                  }
                </div>
              </div>
              <Badge variant={notificationPermission === 'granted' ? 'default' : 'secondary'}>
                {notificationPermission === 'granted' ? 'Enabled' : 
                 notificationPermission === 'denied' ? 'Blocked' : 'Disabled'}
              </Badge>
            </div>

            {notificationPermission !== 'granted' && notificationPermission !== 'denied' && (
              <Button onClick={requestNotificationPermission} className="w-full">
                <Bell className="w-4 h-4 mr-2" />
                Enable Notifications
              </Button>
            )}

            {notificationPermission === 'denied' && (
              <Alert>
                <AlertDescription>
                  Notifications are blocked. To enable them:
                  <br />1. Click the lock icon in your browser's address bar
                  <br />2. Set notifications to "Allow"
                  <br />3. Refresh the page
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Offline Features Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Offline Features
          </CardTitle>
          <CardDescription>
            What you can do when offline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">✓ Available Offline:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Add new expenses</li>
                <li>• View recent transactions</li>
                <li>• Check budget status</li>
                <li>• View cached analytics</li>
                <li>• Access saved receipts</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-orange-600">⚠ Requires Internet:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Sync data across devices</li>
                <li>• Real-time notifications</li>
                <li>• Currency conversion</li>
                <li>• Export reports</li>
                <li>• AI categorization</li>
              </ul>
            </div>
          </div>

          {!isOnline && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  You're currently offline. Your data will sync automatically when you reconnect.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions for Mobile */}
      {isInstalled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Shortcuts available from your home screen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" size="sm" className="flex flex-col h-16">
                <Download className="w-4 h-4 mb-1" />
                <span className="text-xs">Add Expense</span>
              </Button>
              <Button variant="outline" size="sm" className="flex flex-col h-16">
                <Camera className="w-4 h-4 mb-1" />
                <span className="text-xs">Scan Receipt</span>
              </Button>
              <Button variant="outline" size="sm" className="flex flex-col h-16">
                <CheckCircle className="w-4 h-4 mb-1" />
                <span className="text-xs">View Budget</span>
              </Button>
              <Button variant="outline" size="sm" className="flex flex-col h-16">
                <Settings className="w-4 h-4 mb-1" />
                <span className="text-xs">Quick Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Hook for using PWA features in other components
export function usePWA() {
  const [isOnline, setIsOnline] = useState(true)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches)
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const addToOfflineQueue = (type: 'expense' | 'budget' | 'goal', data: any) => {
    if (!isOnline) {
      const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]')
      const item = {
        id: Date.now().toString(),
        type,
        data,
        timestamp: Date.now(),
        retries: 0
      }
      queue.push(item)
      localStorage.setItem('offlineQueue', JSON.stringify(queue))
      return true
    }
    return false
  }

  return {
    isOnline,
    isInstalled,
    addToOfflineQueue
  }
}