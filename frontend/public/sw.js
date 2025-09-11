const CACHE_NAME = 'mental-wellness-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'mood-data-sync') {
    event.waitUntil(syncMoodData());
  }
});

async function syncMoodData() {
  try {
    // Get offline data from IndexedDB or localStorage
    const offlineData = JSON.parse(localStorage.getItem('offline_moods') || '[]');
    
    if (offlineData.length > 0) {
      for (const mood of offlineData) {
        await fetch('/api/mood', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mood)
        });
      }
      // Clear offline data after sync
      localStorage.removeItem('offline_moods');
      console.log('Offline mood data synced successfully');
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

