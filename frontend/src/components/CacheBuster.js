import React, { useEffect, useState } from 'react';

const CacheBuster = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentVersion = '2.1.0';
    const cachedVersion = localStorage.getItem('app-version');

    if (cachedVersion && cachedVersion !== currentVersion) {
      console.log('New version detected, clearing cache...');
      
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      const userProfile = localStorage.getItem('userProfile');
      const moodHistory = localStorage.getItem('moodHistory');
      const chatMessages = localStorage.getItem('chatMessages');
      
      localStorage.clear();
      
      if (userProfile) localStorage.setItem('userProfile', userProfile);
      if (moodHistory) localStorage.setItem('moodHistory', moodHistory);
      if (chatMessages) localStorage.setItem('chatMessages', chatMessages);
      
      localStorage.setItem('app-version', currentVersion);
      window.location.reload(true);
      return;
    }

    localStorage.setItem('app-version', currentVersion);
    
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className="cache-buster-loader">
        <div className="loader-icon">🧠</div>
        <div className="loader-text">Loading latest version...</div>
        <div className="loader-spinner"></div>
        <style jsx>{`
          .cache-buster-loader {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-family: 'Inter', sans-serif;
          }
          .loader-icon {
            font-size: 3rem;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
          }
          .loader-text {
            font-size: 1.2rem;
            margin-bottom: 20px;
          }
          .loader-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s linear infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return children;
};

export default CacheBuster;
