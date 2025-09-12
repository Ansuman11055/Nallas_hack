import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [currentMood, setCurrentMood] = useState(5);
  const [streak, setStreak] = useState(7);
  const [averageMood, setAverageMood] = useState(7.2);
  const [showMoodCheck, setShowMoodCheck] = useState(false);

  const moodEmojis = ['😰', '😔', '😐', '🙂', '😊', '😄', '🤗', '😍', '🤩', '🥳'];
  
  useEffect(() => {
    // Load saved data
    const savedMood = localStorage.getItem('currentMood');
    const savedStreak = localStorage.getItem('streak');
    const savedAverage = localStorage.getItem('averageMood');
    
    if (savedMood) setCurrentMood(parseInt(savedMood));
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedAverage) setAverageMood(parseFloat(savedAverage));
  }, []);

  const handleMoodSelect = (mood) => {
    setCurrentMood(mood);
    localStorage.setItem('currentMood', mood.toString());
    
    // Update average mood
    const newAverage = ((averageMood * 7) + mood) / 8;
    setAverageMood(Math.round(newAverage * 10) / 10);
    localStorage.setItem('averageMood', newAverage.toString());
    
    setShowMoodCheck(false);
  };

  const trackMood = () => {
    setShowMoodCheck(true);
  };

  const chatSupport = () => {
    alert('Connecting you to support chat...');
  };

  const vrExperience = () => {
    alert('Loading VR relaxation experience...');
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>Welcome back, Friend! ☀️</h1>
        <p>How are you feeling today?</p>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <h3>Today's Mood</h3>
          <div className="mood-display">
            <span className="mood-emoji">{moodEmojis[currentMood - 1]}</span>
            <span className="mood-score">{currentMood}/10</span>
          </div>
        </div>

        <div className="stat-card">
          <h3>Streak</h3>
          <div className="streak-display">
            <span className="streak-number">{streak} days</span>
          </div>
        </div>

        <div className="stat-card">
          <h3>This Week</h3>
          <div className="week-display">
            <span className="average-text">Average mood: {averageMood}/10</span>
          </div>
        </div>
      </div>

      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn track-mood" onClick={trackMood}>
            📊 Track Mood
          </button>
          <button className="action-btn chat-support" onClick={chatSupport}>
            💬 Chat Support
          </button>
          <button className="action-btn vr-experience" onClick={vrExperience}>
            🥽 VR Experience
          </button>
        </div>
      </div>

      <div className="mood-check-section">
        <h2>Quick Mood Check</h2>
        <div className="mood-selector">
          {moodEmojis.map((emoji, index) => (
            <button
              key={index}
              className={`mood-btn ${currentMood === index + 1 ? 'selected' : ''}`}
              onClick={() => handleMoodSelect(index + 1)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {showMoodCheck && (
        <div className="modal-overlay">
          <div className="mood-modal">
            <h3>How are you feeling right now?</h3>
            <div className="mood-options">
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  className="mood-option"
                  onClick={() => handleMoodSelect(index + 1)}
                >
                  <span className="emoji">{emoji}</span>
                  <span className="number">{index + 1}</span>
                </button>
              ))}
            </div>
            <button 
              className="close-modal" 
              onClick={() => setShowMoodCheck(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
