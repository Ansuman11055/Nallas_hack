import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { EncryptionProvider, useEncryption } from './contexts/EncryptionContext';
import { ConsentProvider } from './contexts/ConsentContext';
import { DatabaseProvider } from './contexts/DatabaseContext';

// Layout Components
import Layout from './components/Layout/Layout';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import UnlockScreen from './components/UnlockScreen/UnlockScreen';

// Page Components
import Onboarding from './components/Onboarding/Onboarding';
import ConsentFlow from './components/Onboarding/ConsentFlow';
import Dashboard from './components/Dashboard/Dashboard';
import MoodTracker from './components/MoodTracker/MoodTracker';
import QuickEntry from './components/MoodTracker/QuickEntry';
import InterventionSequencer from './components/Interventions/InterventionSequencer';
import VRJourney from './components/VR/VRJourney';
import Chatbot from './components/Chatbot/Chatbot';
import Privacy from './components/Settings/Privacy';

import './App.css';

const AppContent: React.FC = () => {
  const { isUnlocked, encryptionKey, isLoading } = useEncryption();

  if (isLoading) {
    return <LoadingScreen message="Initializing MindWell..." />;
  }

  if (!encryptionKey) {
    return <Onboarding />;
  }

  if (!isUnlocked) {
    return <UnlockScreen />;
  }

  return (
    <ConsentProvider>
      <DatabaseProvider>
        <Router>
          <div className="app">
            <Routes>
              <Route path="/consent" element={<ConsentFlow />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="mood" element={<MoodTracker />} />
                <Route path="mood/quick" element={<QuickEntry />} />
                <Route path="interventions" element={<InterventionSequencer />} />
                <Route path="vr" element={<VRJourney />} />
                <Route path="chat" element={<Chatbot />} />
                <Route path="privacy" element={<Privacy />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </DatabaseProvider>
    </ConsentProvider>
  );
};

const App: React.FC = () => {
  return (
    <EncryptionProvider>
      <AppContent />
    </EncryptionProvider>
  );
};

export default App;
