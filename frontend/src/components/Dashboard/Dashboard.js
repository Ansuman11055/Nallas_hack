import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [userName, setUserName] = useState('Friend');
  const [todayMood, setTodayMood] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Load user data from localStorage
    const savedName = localStorage.getItem('userName') || 'Friend';
    const savedMood = localStorage.getItem('todayMood');
    setUserName(savedName);
    setTodayMood(savedMood ? parseInt(savedMood) : null);
  }, []);

  const quickMoodLog = (mood) => {
    localStorage.setItem('todayMood', mood);
    setTodayMood(mood);
  };

  const getMoodEmoji = (mood) => {
    const moods = ['😢', '😕', '😐', '🙂', '😊', '😄', '🤗', '😆', '🥰', '🤩'];
    return moods[mood - 1] || '😐';
  };

  return (
    <div style={styles.dashboard}>
      <div style={styles.header}>
        <h1>Welcome back, {userName}! 🌟</h1>
        <p style={styles.subtitle}>How are you feeling today?</p>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3>Today's Mood</h3>
          {todayMood ? (
            <div style={styles.moodDisplay}>
              <span style={styles.moodEmoji}>{getMoodEmoji(todayMood)}</span>
              <span>{todayMood}/10</span>
            </div>
          ) : (
            <p>Not logged yet</p>
          )}
        </div>

        <div style={styles.statCard}>
          <h3>Streak</h3>
          <p style={styles.streakNumber}>7 days</p>
        </div>

        <div style={styles.statCard}>
          <h3>This Week</h3>
          <p>Average mood: 7.2/10</p>
        </div>
      </div>

      <div style={styles.quickActions}>
        <h2>Quick Actions</h2>
        <div style={styles.actionButtons}>
          <button style={styles.actionBtn} onClick={() => window.location.href = '/mood'}>
            📊 Track Mood
          </button>
          <button style={styles.actionBtn} onClick={() => window.location.href = '/chat'}>
            💬 Chat Support
          </button>
          <button style={styles.actionBtn} onClick={() => window.location.href = '/vr'}>
            🌅 VR Experience
          </button>
        </div>
      </div>

      <div style={styles.quickMood}>
        <h3>Quick Mood Check</h3>
        <div style={styles.moodButtons}>
          {[1,2,3,4,5,6,7,8,9,10].map(mood => (
            <button 
              key={mood}
              style={{...styles.moodBtn, ...(todayMood === mood ? styles.selectedMood : {})}}
              onClick={() => quickMoodLog(mood)}
            >
              {getMoodEmoji(mood)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  dashboard: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333'
  },
  subtitle: {
    color: '#666',
    fontSize: '1.1em'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  moodDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  moodEmoji: {
    fontSize: '2em'
  },
  streakNumber: {
    fontSize: '2em',
    color: '#4CAF50',
    margin: '10px 0'
  },
  quickActions: {
    marginBottom: '30px'
  },
  actionButtons: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  actionBtn: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '15px 25px',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'transform 0.2s'
  },
  quickMood: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  moodButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  moodBtn: {
    background: '#f5f5f5',
    border: 'none',
    padding: '10px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '1.5em',
    width: '50px',
    height: '50px'
  },
  selectedMood: {
    background: '#4CAF50',
    transform: 'scale(1.1)'
  }
};

export default Dashboard;

