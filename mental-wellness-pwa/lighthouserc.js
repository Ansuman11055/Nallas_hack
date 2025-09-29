module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/mood',
        'http://localhost:3000/interventions',
        'http://localhost:3000/vr',
        'http://localhost:3000/chat'
      ],
      startServerCommand: 'npm run build && npx serve -s build -p 3000',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['error', { minScore: 0.9 }],
        
        // PWA specific assertions
        'service-worker': 'error',
        'installable-manifest': 'error',
        'splash-screen': 'error',
        'themed-omnibox': 'error',
        'content-width': 'error',
        'viewport': 'error',
        
        // Performance assertions
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        
        // Accessibility assertions
        'color-contrast': 'error',
        'heading-order': 'error',
        'label': 'error',
        'link-name': 'error',
        
        // Security assertions
        'is-on-https': 'error',
        'uses-http2': 'warn',
        'no-vulnerable-libraries': 'error'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    },
    server: {
      port: 3000
    }
  }
};
