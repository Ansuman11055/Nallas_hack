import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading MindWell...', 
  progress 
}) => {
  const [dots, setDots] = useState('');
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    '🧘 Take a deep breath and relax',
    '💚 Your mental health matters',
    '🔒 Your data is encrypted and private',
    '📱 Works offline for your convenience',
    '🌟 Small steps lead to big changes',
    '💪 You are stronger than you think',
    '🎯 Focus on progress, not perfection',
    '🌈 Every day is a new opportunity'
  ];

  useEffect(() => {
    // Animate loading dots
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    // Rotate tips every 3 seconds
    const tipsInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % tips.length);
    }, 3000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(tipsInterval);
    };
  }, [tips.length]);

  return (
    <div className="loading-screen">
      <div className="loading-container">
        {/* App Logo */}
        <div className="loading-logo">
          <div className="logo-icon">🧠</div>
          <h1>MindWell</h1>
        </div>

        {/* Loading Animation */}
        <div className="loading-animation">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="loading-message">
          <h2>{message}{dots}</h2>
        </div>

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="loading-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <span className="progress-text">{Math.round(progress)}%</span>
          </div>
        )}

        {/* Loading Steps */}
        <div className="loading-steps">
          <div className="step completed">
            <span className="step-icon">✅</span>
            <span className="step-text">Initializing encryption</span>
          </div>
          <div className="step completed">
            <span className="step-icon">✅</span>
            <span className="step-text">Setting up database</span>
          </div>
          <div className="step active">
            <span className="step-icon">⏳</span>
            <span className="step-text">Loading your data</span>
          </div>
          <div className="step">
            <span className="step-icon">⏸️</span>
            <span className="step-text">Preparing interface</span>
          </div>
        </div>

        {/* Wellness Tip */}
        <div className="wellness-tip">
          <div className="tip-content">
            <span className="tip-icon">💡</span>
            <p className="tip-text">{tips[currentTip]}</p>
          </div>
        </div>

        {/* Privacy Reminder */}
        <div className="privacy-reminder">
          <div className="privacy-icon">🔒</div>
          <p>Your data is encrypted and stored locally on your device</p>
        </div>

        {/* Loading Features */}
        <div className="loading-features">
          <div className="feature">
            <span className="feature-icon">📊</span>
            <span>Mood Analytics</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🧘</span>
            <span>Guided Interventions</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🥽</span>
            <span>VR Relaxation</span>
          </div>
          <div className="feature">
            <span className="feature-icon">💬</span>
            <span>AI Support</span>
          </div>
        </div>

        {/* Version */}
        <div className="loading-version">
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
