module.exports = {
  globDirectory: 'build/',
  globPatterns: [
    '**/*.{html,js,css,png,jpg,jpeg,svg,gif,webp,woff,woff2,ttf,eot,json}'
  ],
  swDest: 'build/sw.js',
  swSrc: 'public/sw.js',
  injectionPoint: 'self.__WB_MANIFEST',
  
  // Runtime caching strategies
  runtimeCaching: [
    {
      // Cache Google Fonts
      urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
        }
      }
    },
    {
      // Cache Google Fonts webfonts
      urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
        }
      }
    },
    {
      // Cache A-Frame assets
      urlPattern: /^https:\/\/cdn\.aframe\.io\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'aframe-assets',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
        }
      }
    },
    {
      // Cache images
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
        }
      }
    },
    {
      // Cache static assets
      urlPattern: /\.(?:js|css|woff|woff2|ttf|eot)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
        }
      }
    },
    {
      // Cache API responses (if any external APIs are used)
      urlPattern: /^https:\/\/api\./,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5 // 5 minutes
        }
      }
    }
  ],

  // Skip waiting and claim clients immediately
  skipWaiting: true,
  clientsClaim: true,

  // Ignore URL parameters for caching
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],

  // Navigation fallback
  navigateFallback: '/index.html',
  navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],

  // Maximum file size to precache (2MB)
  maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,

  // Exclude files from precaching
  dontCacheBustURLsMatching: /\.\w{8}\./,
  
  // Manifest transformations
  manifestTransforms: [
    (manifestEntries) => {
      // Filter out source maps and other development files
      const manifest = manifestEntries.filter(entry => {
        return !entry.url.endsWith('.map') && 
               !entry.url.includes('hot-update') &&
               !entry.url.includes('.DS_Store');
      });
      
      return { manifest };
    }
  ]
};
