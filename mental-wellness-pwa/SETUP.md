# 🚀 MindWell PWA - Quick Setup Guide

## Prerequisites ✅
- Node.js 18+ installed
- Modern web browser (Chrome, Firefox, Safari, Edge)
- HTTPS for full PWA features (or localhost for development)

## Quick Start 🏃‍♂️

### 1. Install Dependencies
```bash
cd mental-wellness-pwa
npm install
```

### 2. Start Development Server
```bash
npm start
```
The app will open at `http://localhost:3000`

### 3. First Time Setup
1. **Create Master Password**: Choose a strong password for encryption
2. **Set Privacy Preferences**: Configure data collection settings
3. **Start Tracking**: Log your first mood entry

## Production Build 🏗️

### Build for Production
```bash
npm run build
npm run build:sw
```

### Deploy to Vercel
```bash
npm run deploy
```

## Key Features to Test 🧪

### 🔒 Privacy & Security
- [ ] Create master password during onboarding
- [ ] Test app lock/unlock functionality
- [ ] Verify data encryption (check browser DevTools → Application → IndexedDB)
- [ ] Test data export/import functionality

### 📊 Mood Tracking
- [ ] Log mood entries with different emotions
- [ ] Add text notes and voice recordings
- [ ] View mood trends in dashboard charts
- [ ] Test baseline analysis over time

### 🧘 Wellness Features
- [ ] Try breathing exercises with visual guidance
- [ ] Complete grounding technique (5-4-3-2-1)
- [ ] Experience positive affirmations
- [ ] Test VR relaxation scenes

### 🤖 AI Support
- [ ] Chat with the AI assistant
- [ ] Test crisis keyword detection
- [ ] Receive intervention recommendations

### 📱 PWA Features
- [ ] Install app on mobile/desktop
- [ ] Test offline functionality
- [ ] Verify background sync
- [ ] Check push notifications (requires HTTPS)

## Troubleshooting 🔧

### Common Issues

**App won't start:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

**TypeScript errors:**
```bash
# Install missing type definitions
npm install --save-dev @types/react @types/react-dom
```

**Service Worker issues:**
```bash
# Clear browser cache and reload
# Or use incognito/private browsing mode
```

**Encryption errors:**
- Ensure you're using HTTPS or localhost
- Check browser compatibility (modern browsers only)
- Clear IndexedDB data if corrupted

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Development Tips 💡

### Hot Reload
The app supports hot reload - changes will appear automatically

### Debug Mode
Open browser DevTools to see:
- Console logs for encryption/database operations
- Network tab for service worker activity
- Application tab for PWA features

### Testing Offline
1. Open DevTools → Network tab
2. Check "Offline" checkbox
3. Reload page to test offline functionality

## Security Notes 🛡️

### Data Storage
- All data encrypted with AES-256-GCM
- Keys derived using PBKDF2 (100,000 iterations)
- No data sent to external servers
- Complete zero-knowledge architecture

### Privacy Features
- No tracking or analytics by default
- Local-only storage with IndexedDB
- User-controlled data retention policies
- Full data export/deletion capabilities

## Performance Targets 🎯

### Lighthouse Scores (Target: 90+)
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+
- PWA: 90+

### Core Web Vitals
- First Contentful Paint: < 2s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Total Blocking Time: < 300ms

## Next Steps 🎯

### For Hackathon Demo
1. **Create sample data**: Log several mood entries over different days
2. **Test all features**: Ensure everything works smoothly
3. **Prepare demo flow**: Plan your presentation walkthrough
4. **Check mobile experience**: Test on actual mobile devices

### For Production
1. **Set up monitoring**: Add error tracking and analytics
2. **Security audit**: Run penetration testing
3. **User testing**: Gather feedback from beta users
4. **Compliance review**: Ensure HIPAA/GDPR compliance if needed

## Support 📞

### Technical Issues
- Check browser console for error messages
- Verify network connectivity for online features
- Clear browser data if experiencing persistent issues

### Feature Requests
- Document desired features for future development
- Consider privacy implications of new features
- Test with accessibility tools

---

**🎉 You're all set!** MindWell is ready for your hackathon presentation. The app demonstrates cutting-edge privacy-first mental wellness technology with a complete feature set.

**Remember**: This is a wellness tool, not a replacement for professional mental health care. Include appropriate disclaimers in your presentation.
