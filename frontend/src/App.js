import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import MoodTracker from './components/MoodTracker/MoodTracker';
import Chatbot from './components/Chatbot/Chatbot';
import VRExperience from './components/VRExperience/VRExperience';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mood" element={<MoodTracker />} />
            <Route path="/chat" element={<Chatbot />} />
            <Route path="/vr" element={<VRExperience />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
