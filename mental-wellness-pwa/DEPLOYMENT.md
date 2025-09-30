# 🚀 MindWell PWA - Deployment Guide

## Quick Deployment Options

### 1. 🎯 **Vercel (Recommended)**

#### Automatic Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Manual Deployment
1. Visit [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect React and deploy

### 2. 📦 **Netlify**

#### Drag & Drop
```bash
# Build the project
npm run build

# Drag the 'build' folder to netlify.com/drop
```

#### Git Integration
1. Connect your GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `build`

### 3. 🌐 **GitHub Pages**

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
"deploy": "gh-pages -d build"

# Deploy
npm run build
npm run deploy
```

## 🔧 CI/CD Setup (GitHub Actions)

### Required Secrets (Optional)

Add these to your GitHub repository secrets for automatic deployment:

#### Vercel Secrets
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

#### Lighthouse CI (Optional)
```
LHCI_GITHUB_APP_TOKEN=your_lighthouse_token
```

### Getting Vercel Secrets

1. **VERCEL_TOKEN**:
   - Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Create new token
   - Copy the token

2. **VERCEL_ORG_ID & VERCEL_PROJECT_ID**:
   ```bash
   # Run in your project directory
   vercel link
   # This creates .vercel/project.json with the IDs
   ```

## 🏗️ Build Configuration

### Environment Variables

Create `.env.production` for production builds:

```bash
# Optional: Analytics
REACT_APP_ANALYTICS_ID=your_analytics_id

# Optional: Error reporting  
REACT_APP_SENTRY_DSN=your_sentry_dsn

# App configuration
REACT_APP_VERSION=1.0.0
REACT_APP_BUILD_DATE=2024-01-01
```

### Build Commands

```bash
# Development build
npm start

# Production build
npm run build

# Build with service worker
npm run build:sw

# Test production build locally
npx serve -s build
```

## 🔒 Security Configuration

### Content Security Policy

The app includes strict CSP headers in `vercel.json`:

```json
{
  "key": "content-security-policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.aframe.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'self';"
}
```

### HTTPS Requirements

- **Required for PWA features**: Service workers, push notifications
- **Required for WebCrypto**: Encryption APIs need secure context
- **Automatic on most platforms**: Vercel, Netlify provide HTTPS by default

## 📊 Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm install -g webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

### Lighthouse Targets

The CI pipeline enforces these performance standards:

- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 90+
- **PWA**: 90+

### Core Web Vitals

- **FCP**: < 2s (First Contentful Paint)
- **LCP**: < 2.5s (Largest Contentful Paint)
- **CLS**: < 0.1 (Cumulative Layout Shift)
- **TBT**: < 300ms (Total Blocking Time)

## 🌍 Custom Domain Setup

### Vercel Custom Domain

1. Go to your Vercel project dashboard
2. Settings → Domains
3. Add your custom domain
4. Configure DNS records as shown

### DNS Configuration

```
Type: CNAME
Name: mindwell (or www)
Value: your-project.vercel.app
```

## 📱 PWA Installation

### Desktop Installation

1. Visit your deployed app in Chrome/Edge
2. Look for install icon in address bar
3. Click "Install MindWell"

### Mobile Installation

1. Visit app in mobile browser
2. Tap "Add to Home Screen" (iOS Safari)
3. Tap "Install" (Android Chrome)

## 🔍 Monitoring & Analytics

### Error Tracking (Optional)

Add Sentry for error monitoring:

```bash
npm install @sentry/react @sentry/tracing

# Add to src/index.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

### Performance Monitoring

Use Lighthouse CI for continuous monitoring:

```bash
# Local Lighthouse audit
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

## 🚨 Troubleshooting

### Common Deployment Issues

**Build Fails**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Service Worker Issues**:
- Clear browser cache
- Check HTTPS requirement
- Verify service worker registration

**PWA Not Installing**:
- Ensure HTTPS is enabled
- Check manifest.json validity
- Verify service worker is active

**Performance Issues**:
- Enable gzip compression
- Optimize images and assets
- Use code splitting for large bundles

### Debug Commands

```bash
# Check build output
npm run build -- --verbose

# Test PWA features locally
npx serve -s build -p 3000

# Validate service worker
npx workbox-cli generateSW --help
```

## 📋 Pre-Deployment Checklist

### ✅ **Code Quality**
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] ESLint warnings addressed
- [ ] Security audit clean

### ✅ **PWA Requirements**
- [ ] Manifest.json configured
- [ ] Service worker registered
- [ ] Icons in all required sizes
- [ ] Offline functionality working

### ✅ **Performance**
- [ ] Lighthouse scores 90+
- [ ] Bundle size optimized
- [ ] Images compressed
- [ ] Lazy loading implemented

### ✅ **Security**
- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] No hardcoded secrets
- [ ] Dependencies updated

### ✅ **Accessibility**
- [ ] WCAG AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader compatible
- [ ] Color contrast verified

## 🎯 Production Deployment

### Final Steps

1. **Test locally**:
   ```bash
   npm run build
   npx serve -s build
   ```

2. **Run audits**:
   ```bash
   npm run lighthouse
   npm audit
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   # or
   npm run deploy
   ```

4. **Verify deployment**:
   - Test PWA installation
   - Check offline functionality
   - Verify all features work
   - Run Lighthouse on live site

---

## 🎉 **You're Live!**

Your MindWell PWA is now deployed and ready for users. The app provides:

- ✅ **Privacy-first mental wellness tracking**
- ✅ **Offline-capable PWA experience**  
- ✅ **Clinical-grade encryption and security**
- ✅ **Immersive VR relaxation experiences**
- ✅ **AI-powered support and interventions**

**Share your deployed app and help others on their mental wellness journey!** 🧠💚
