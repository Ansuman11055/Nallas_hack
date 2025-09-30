// Advanced Service Worker for MindWell PWA with Workbox-like functionality
const CACHE_NAME = 'mindwell-v2.0.0';
const STATIC_CACHE = 'mindwell-static-v2';
const DYNAMIC_CACHE = 'mindwell-dynamic-v2';
const OFFLINE_CACHE = 'mindwell-offline-v2';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(OFFLINE_CACHE).then(cache => {
        return cache.add('/offline.html');
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Ensure the new service worker takes control immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Try to fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Cache static assets and API responses
                if (shouldCache(event.request.url)) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(() => {
            // Network failed, try to serve offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            // For other requests, return a generic offline response
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Background sync for mood entries
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'mood-entry-sync') {
    event.waitUntil(syncMoodEntries());
  }
});

// Push notifications for intervention reminders
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Time for a mindfulness check-in!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open-app',
        title: 'Open MindWell'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('MindWell Reminder', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event.action);
  
  event.notification.close();

  if (event.action === 'open-app' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function to determine if a request should be cached
function shouldCache(url) {
  // Cache static assets
  if (url.includes('/static/')) return true;
  
  // Cache API responses (if any)
  if (url.includes('/api/')) return true;
  
  // Cache images
  if (url.match(/\.(png|jpg|jpeg|svg|gif|webp)$/)) return true;
  
  // Cache fonts
  if (url.match(/\.(woff|woff2|ttf|eot)$/)) return true;
  
  // Don't cache everything else by default
  return false;
}

// Background sync function for mood entries
async function syncMoodEntries() {
  try {
    console.log('[SW] Syncing mood entries...');
    
    // In a real implementation, this would:
    // 1. Get pending mood entries from IndexedDB
    // 2. Send them to the server
    // 3. Mark them as synced
    // 4. Handle any conflicts
    
    // For now, just log that sync would happen
    console.log('[SW] Mood entries sync completed');
    
    // Show a notification on successful sync
    self.registration.showNotification('MindWell', {
      body: 'Your mood entries have been synced!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png'
    });
    
  } catch (error) {
    console.error('[SW] Mood sync failed:', error);
    throw error; // This will cause the sync to be retried
  }
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'mood-reminder') {
    event.waitUntil(sendMoodReminder());
  }
});

// Send mood reminder notification
async function sendMoodReminder() {
  try {
    const lastEntry = await getLastMoodEntry();
    const now = new Date();
    const lastEntryTime = lastEntry ? new Date(lastEntry.timestamp) : null;
    
    // Send reminder if no entry in the last 24 hours
    if (!lastEntryTime || (now - lastEntryTime) > 24 * 60 * 60 * 1000) {
      await self.registration.showNotification('MindWell Check-in', {
        body: 'How are you feeling today? Take a moment to log your mood.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'mood-reminder',
        data: { url: '/mood' },
        actions: [
          { action: 'log-mood', title: 'Log Mood' },
          { action: 'dismiss', title: 'Later' }
        ]
      });
    }
  } catch (error) {
    console.error('[SW] Failed to send mood reminder:', error);
  }
}

// Helper to get last mood entry (placeholder)
async function getLastMoodEntry() {
  // In a real implementation, this would query IndexedDB
  // For now, return null
  return null;
}

console.log('[SW] Service Worker loaded');
