# MindWell - Mental Wellness PWA

A privacy-first Progressive Web App for comprehensive mental wellness tracking, featuring end-to-end encryption, offline functionality, and immersive VR experiences.

## Features

- **Privacy-First**: All data encrypted locally using WebCrypto API
- **Offline-Capable**: Works completely without internet connection
- **Mood Tracking**: Quick emoji-based mood entry with voice notes
- **Baseline Analysis**: Statistical analysis with change point detection
- **VR Experiences**: Calming A-Frame VR scenes for relaxation
- **Micro-Interventions**: Breathing exercises, grounding techniques, affirmations
- **Crisis Support**: Automatic detection and resource provision
- **Accessibility**: WCAG AA compliant with full keyboard navigation

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Generate service worker
npm run build:sw

# Run Lighthouse audit
npm run lighthouse
```

## 🔒 Privacy & Security

- **AES-GCM 256-bit encryption** for all sensitive data
- **PBKDF2 key derivation** with 100,000 iterations
- **Local-only storage** by default (IndexedDB)
- **Complete data export** in encrypted JSON format
- **Secure delete** functionality

## 📱 PWA Features

- **Installable** on all devices
- **Offline functionality** with service worker caching
- **Background sync** for mood entries
- **Push notifications** for intervention reminders
- **Responsive design** for mobile, tablet, and desktop

## 🧠 Mental Health Features

### Mood Tracking
- 5-point emoji scale (😢 😞 😐 🙂 😄)
- Voice note recording (5 seconds)
- Text notes with 500-character limit
- Customizable tags (work, family, health, etc.)

### Baseline Analysis
- Rolling mean and standard deviation calculation
- Z-score computation for mood changes
- Change point detection (|z-score| > 1.5)
- EWMA (Exponentially Weighted Moving Average) smoothing

### Micro-Interventions
- **Breathing Exercise**: 4-7-8 technique with visual guide
- **Grounding Technique**: 5-4-3-2-1 sensory method
- **Positive Affirmations**: Evidence-based affirmations
- **Mindful Moments**: 2-5 minute guided sessions
- **VR Calming Scenes**: Forest, ocean, and mountain environments

### Crisis Support
- Automatic keyword detection
- Immediate resource display
- Local crisis hotline numbers
- Emergency contact integration

## 🛠 Technical Stack

- **Frontend**: React 18.2+ with TypeScript 4.9+
- **Router**: React Router DOM 6.8+
- **Database**: IndexedDB with Dexie.js 3.2+
- **Encryption**: WebCrypto API with AES-GCM + PBKDF2
- **Charts**: Chart.js 4.2+ with react-chartjs-2 5.2+
- **VR**: A-Frame 1.4+ with aframe-react 4.4+
- **ML**: TensorFlow.js 4.2+ for on-device inference
- **PWA**: Workbox 6.5+ for service worker and caching

## 📊 Performance

- **Bundle Size**: < 400KB gzipped
- **Time to Interactive**: < 3 seconds on mid-tier mobile
- **Lighthouse PWA Score**: ≥ 90 for all categories
- **Memory Usage**: < 50MB peak usage
- **Offline Functionality**: All core features work without internet

## 🌍 Internationalization

Currently supports:
- English (en)
- Hindi (hi)

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm test -- --coverage --watchAll=false

# Run Lighthouse CI
npm run lighthouse
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Netlify
```bash
# Build the app
npm run build
npm run build:sw

# Deploy build folder to Netlify
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, please contact [support@mindwell-pwa.com](mailto:support@mindwell-pwa.com) or create an issue on GitHub.

## 🙏 Acknowledgments

- Crisis support resources provided by various mental health organizations
- VR scenes inspired by nature therapy research
- Accessibility guidelines from WCAG 2.1 AA standards
