// Service Worker for Budget Baba PWA
const CACHE_NAME = 'budget-baba-v1.0.0'
const STATIC_CACHE = 'budget-baba-static-v1.0.0'
const DYNAMIC_CACHE = 'budget-baba-dynamic-v1.0.0'

// Cache different types of resources
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/expenses',
  '/budget',
  '/analytics',
  '/goals',
  '/manifest.json',
  '/favicon.ico',
  '/logo.svg',
  '/offline.html'
]

const API_CACHE_PATTERNS = [
  /^https:\/\/api\.exchangerate-api\.com/,
  /\/api\/expenses/,
  /\/api\/dashboard/,
  /\/api\/budgets/,
  /\/api\/goals/
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[SW] Static assets cached')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Service worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle different types of requests
  if (request.url.includes('/api/')) {
    // API requests - Network First with cache fallback
    event.respondWith(networkFirstStrategy(request))
  } else if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
    // Static assets - Cache First
    event.respondWith(cacheFirstStrategy(request))
  } else if (request.destination === 'image') {
    // Images - Cache First with network fallback
    event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE))
  } else {
    // Other requests - Stale While Revalidate
    event.respondWith(staleWhileRevalidateStrategy(request))
  }
})

// Caching Strategies

// Network First - Try network, fallback to cache
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url)
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for API calls
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This feature requires an internet connection'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Cache First - Try cache, fallback to network
async function cacheFirstStrategy(request, cacheName = STATIC_CACHE) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Cache and network failed for:', request.url)
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html')
    }
    
    return new Response('Offline', { status: 503 })
  }
}

// Stale While Revalidate - Return cache immediately, update in background
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  })
  
  return cachedResponse || networkPromise
}

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'expense-sync') {
    event.waitUntil(syncExpenses())
  } else if (event.tag === 'budget-sync') {
    event.waitUntil(syncBudgets())
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event)
  
  let data = {}
  
  if (event.data) {
    try {
      data = event.data.json()
    } catch (error) {
      data = { title: 'Budget Baba', body: event.data.text() }
    }
  }
  
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    image: data.image,
    data: data.data,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss.png'
      }
    ],
    tag: data.tag || 'general',
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    vibrate: data.vibrate || [200, 100, 200]
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Budget Baba', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event)
  
  event.notification.close()
  
  if (event.action === 'view') {
    const urlToOpen = event.notification.data?.url || '/dashboard'
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes(urlToOpen) && 'focus' in client) {
              return client.focus()
            }
          }
          
          // Open new window
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen)
          }
        })
    )
  }
})

// Sync functions
async function syncExpenses() {
  try {
    // Get pending expenses from IndexedDB
    const pendingExpenses = await getPendingExpenses()
    
    for (const expense of pendingExpenses) {
      try {
        const response = await fetch('/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${expense.token}`
          },
          body: JSON.stringify(expense.data)
        })
        
        if (response.ok) {
          await removePendingExpense(expense.id)
          console.log('[SW] Synced expense:', expense.id)
        }
      } catch (error) {
        console.error('[SW] Failed to sync expense:', error)
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

async function syncBudgets() {
  // Similar implementation for budgets
  console.log('[SW] Syncing budgets...')
}

// IndexedDB helpers for offline storage
async function getPendingExpenses() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BudgetBabaOffline', 1)
    
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['expenses'], 'readonly')
      const store = transaction.objectStore('expenses')
      const getAllRequest = store.getAll()
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result || [])
      }
      
      getAllRequest.onerror = () => {
        reject(getAllRequest.error)
      }
    }
    
    request.onerror = () => {
      reject(request.error)
    }
  })
}

async function removePendingExpense(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BudgetBabaOffline', 1)
    
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['expenses'], 'readwrite')
      const store = transaction.objectStore('expenses')
      const deleteRequest = store.delete(id)
      
      deleteRequest.onsuccess = () => {
        resolve()
      }
      
      deleteRequest.onerror = () => {
        reject(deleteRequest.error)
      }
    }
    
    request.onerror = () => {
      reject(request.error)
    }
  })
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})